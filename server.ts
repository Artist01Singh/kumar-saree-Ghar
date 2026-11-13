import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseApiKey = '';
let firebaseProjectId = '';
let firestoreDatabaseId = '(default)';
try {
  const raw = fs.readFileSync(firebaseConfigPath, 'utf-8');
  const parsed = JSON.parse(raw) as {
    apiKey?: string;
    projectId?: string;
    firestoreDatabaseId?: string;
  };
  firebaseApiKey = parsed.apiKey || '';
  firebaseProjectId = parsed.projectId || '';
  firestoreDatabaseId = parsed.firestoreDatabaseId || '(default)';
} catch {
  firebaseApiKey = '';
}

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadRateBucket = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 40;
  const entry = uploadRateBucket.get(ip);
  if (!entry || now > entry.resetAt) {
    uploadRateBucket.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

function validateImageMagicBytes(buffer: Buffer, mime: string): boolean {
  if (buffer.byteLength < 12) return false;
  if (mime === 'image/jpeg' || mime === 'image/jpg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mime === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (mime === 'image/webp') {
    return (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  return false;
}

async function verifyAdminToken(
  idToken: string
): Promise<{ uid: string; email?: string; emailVerified?: boolean } | null> {
  if (!firebaseApiKey || !idToken) return null;
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      users?: Array<{ localId: string; email?: string; emailVerified?: boolean }>;
    };
    const user = data.users?.[0];
    if (!user || !user.emailVerified) return null;

    if (user.email === 'hraj83753@gmail.com') {
      return { uid: user.localId, email: user.email, emailVerified: user.emailVerified };
    }

    if (firebaseProjectId) {
      const adminDocRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
          firebaseProjectId
        )}/databases/${encodeURIComponent(firestoreDatabaseId)}/documents/admins/${encodeURIComponent(
          user.localId
        )}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      if (adminDocRes.ok) {
        return { uid: user.localId, email: user.email, emailVerified: user.emailVerified };
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '8mb' }));

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    next();
  });

  app.use(
    '/uploads',
    (_req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(uploadsDir, { maxAge: '7d' })
  );

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/upload', async (req, res) => {
    const clientIp = req.ip || 'unknown';
    if (!checkRateLimit(clientIp)) {
      res.status(429).json({ error: 'Too many upload requests. Please try again later.' });
      return;
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const adminUser = await verifyAdminToken(token);
    if (!adminUser) {
      res.status(401).json({ error: 'Unauthorized: Verified administrator access required.' });
      return;
    }

    const { filename, dataUrl } = req.body as { filename?: string; dataUrl?: string };
    if (!filename || !dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'Missing image payload.' });
      return;
    }

    const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) {
      res.status(400).json({ error: 'Unsupported image format. Use JPG, PNG, or WebP.' });
      return;
    }

    const mime = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.byteLength > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Image size exceeds 5MB limit.' });
      return;
    }

    if (!validateImageMagicBytes(buffer, mime)) {
      res.status(400).json({ error: 'Invalid or corrupted image file content.' });
      return;
    }

    const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
    const safeStem =
      path
        .basename(filename)
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .slice(0, 40) || 'boutique-piece';
    const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeStem}.${ext}`;
    const destPath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(destPath, buffer);

    res.json({ url: `/uploads/${uniqueName}` });
  });

  app.get('/robots.txt', (req, res) => {
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${origin}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const routes = [
      '/',
      '/collections',
      '/collections/sarees',
      '/collections/designer-sarees',
      '/collections/bridal-sarees',
      '/collections/lehengas',
      '/collections/bridal-lehengas',
      '/collections/suits',
      '/collections/kurtis',
      '/collections/anarkali-suits',
      '/collections/indo-western',
      '/collections/gowns',
      '/about',
      '/contact',
    ];
    const urlsXml = routes
      .map(
        (route) =>
          `  <url>\n    <loc>${origin}${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${
            route === '/' ? '1.0' : '0.8'
          }</priority>\n  </url>`
      )
      .join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>`;
    res.type('application/xml').send(xml);
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kumar Saree Ghar server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
