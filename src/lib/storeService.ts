import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_GALLERY,
  INITIAL_PRODUCTS,
} from '../data/seedData';
import {
  Category,
  Enquiry,
  EnquiryStatus,
  GalleryItem,
  Product,
  Review,
  SiteSettings,
} from '../types/store';

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 140) || `item-${Date.now()}`
  );
}

export async function fetchProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const q = query(collection(db, path), orderBy('displayOrder', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const path = 'categories';
  try {
    const q = query(collection(db, path), orderBy('displayOrder', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  const path = 'gallery';
  try {
    const q = query(collection(db, path), orderBy('displayOrder', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const path = 'siteSettings/main';
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'main'));
    if (!snap.exists()) return null;
    return snap.data() as SiteSettings;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchPublishedReviews(): Promise<Review[]> {
  const path = 'reviews';
  try {
    const q = query(collection(db, path), where('published', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchAllReviewsAdmin(): Promise<Review[]> {
  const path = 'reviews';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchAllEnquiriesAdmin(): Promise<Enquiry[]> {
  const path = 'enquiries';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Enquiry, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function checkIsAdmin(uid: string, email?: string | null): Promise<boolean> {
  if (!uid) return false;
  if (email === 'hraj83753@gmail.com') return true;
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists() && snap.data()?.role === 'admin';
  } catch {
    return false;
  }
}

export async function submitEnquiry(payload: {
  customerName: string;
  phone: string;
  email?: string;
  productOrCategory: string;
  message: string;
  sourcePage?: string;
}): Promise<string> {
  const id = `enq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const path = `enquiries/${id}`;
  try {
    const docData: Record<string, unknown> = {
      customerName: payload.customerName.trim().slice(0, 120),
      phone: payload.phone.trim().slice(0, 25),
      productOrCategory: payload.productOrCategory.trim().slice(0, 180),
      message: payload.message.trim().slice(0, 2000),
      status: 'New',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (payload.email && payload.email.trim()) {
      docData.email = payload.email.trim().slice(0, 140);
    }
    if (payload.sourcePage && payload.sourcePage.trim()) {
      docData.sourcePage = payload.sourcePage.trim().slice(0, 200);
    }
    await setDoc(doc(db, 'enquiries', id), docData);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<void> {
  const path = `enquiries/${id}`;
  try {
    await updateDoc(doc(db, 'enquiries', id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteEnquiry(id: string): Promise<void> {
  const path = `enquiries/${id}`;
  try {
    await deleteDoc(doc(db, 'enquiries', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveProduct(
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || `prod-${slugify(product.title)}-${Date.now().toString(36)}`;
  const path = `products/${id}`;
  const cleanImages = product.images.filter((img) => img.trim().length > 0).slice(0, 8);
  const cleanSizes = (product.sizes || []).filter((s) => s.trim().length > 0).slice(0, 12);

  const payload: Record<string, unknown> = {
    title: product.title.trim().slice(0, 160),
    slug: slugify(product.slug || product.title),
    category: product.category.trim().slice(0, 80),
    description: product.description.trim().slice(0, 3000),
    fabric: (product.fabric || '').trim().slice(0, 200),
    workDetails: (product.workDetails || '').trim().slice(0, 400),
    color: (product.color || '').trim().slice(0, 100),
    sizes: cleanSizes,
    price: product.priceVerified && typeof product.price === 'number' ? product.price : null,
    priceVerified: Boolean(
      product.priceVerified && typeof product.price === 'number' && product.price > 0
    ),
    availability: product.availability,
    images: cleanImages,
    featured: Boolean(product.featured),
    displayOrder: Number(product.displayOrder) || 0,
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingId) {
      await updateDoc(doc(db, 'products', existingId), payload);
    } else {
      await setDoc(doc(db, 'products', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeProduct(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCategory(
  category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || `cat-${slugify(category.name)}-${Date.now().toString(36)}`;
  const path = `categories/${id}`;
  const payload = {
    name: category.name.trim().slice(0, 80),
    slug: slugify(category.slug || category.name),
    description: category.description.trim().slice(0, 600),
    coverImage: category.coverImage.trim().slice(0, 600),
    featured: Boolean(category.featured),
    displayOrder: Number(category.displayOrder) || 0,
    updatedAt: serverTimestamp(),
  };
  try {
    if (existingId) {
      await updateDoc(doc(db, 'categories', existingId), payload);
    } else {
      await setDoc(doc(db, 'categories', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveGalleryItem(
  item: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || `gal-${Date.now().toString(36)}`;
  const path = `gallery/${id}`;
  const payload = {
    title: item.title.trim().slice(0, 160),
    category: item.category.trim().slice(0, 80),
    imageUrl: item.imageUrl.trim().slice(0, 600),
    caption: item.caption.trim().slice(0, 400),
    aspect: item.aspect,
    displayOrder: Number(item.displayOrder) || 0,
    updatedAt: serverTimestamp(),
  };
  try {
    if (existingId) {
      await updateDoc(doc(db, 'gallery', existingId), payload);
    } else {
      await setDoc(doc(db, 'gallery', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeGalleryItem(id: string): Promise<void> {
  const path = `gallery/${id}`;
  try {
    await deleteDoc(doc(db, 'gallery', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveReview(
  review: Omit<Review, 'id' | 'createdAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || `rev-${Date.now().toString(36)}`;
  const path = `reviews/${id}`;
  const payload = {
    reviewerName: review.reviewerName.trim().slice(0, 100),
    occasion: (review.occasion || '').trim().slice(0, 100),
    rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
    comment: review.comment.trim().slice(0, 1000),
    verifiedSource: review.verifiedSource.trim().slice(0, 120),
    published: Boolean(review.published),
  };
  try {
    if (existingId) {
      await updateDoc(doc(db, 'reviews', existingId), payload);
    } else {
      await setDoc(doc(db, 'reviews', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeReview(id: string): Promise<void> {
  const path = `reviews/${id}`;
  try {
    await deleteDoc(doc(db, 'reviews', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const path = 'siteSettings/main';
  const payload: Record<string, unknown> = {
    businessName: settings.businessName.trim().slice(0, 120),
    tagline: (settings.tagline || '').trim().slice(0, 240),
    heroHeadline: settings.heroHeadline.trim().slice(0, 160),
    heroSubtext: (settings.heroSubtext || '').trim().slice(0, 500),
    heroImage: (settings.heroImage || '').trim().slice(0, 600),
    bridalBannerTitle: (settings.bridalBannerTitle || '').trim().slice(0, 160),
    bridalBannerText: (settings.bridalBannerText || '').trim().slice(0, 600),
    bridalBannerImage: (settings.bridalBannerImage || '').trim().slice(0, 600),
    address: settings.address.trim().slice(0, 300),
    primaryPhone: settings.primaryPhone.trim().slice(0, 30),
    altPhone: (settings.altPhone || '').trim().slice(0, 40),
    altPhoneVerified: Boolean(settings.altPhoneVerified),
    whatsappNumber: settings.whatsappNumber.trim().slice(0, 30),
    whatsappConfirmed: Boolean(settings.whatsappConfirmed),
    email: settings.email.trim().slice(0, 120),
    websiteUrl: (settings.websiteUrl || '').trim().slice(0, 200),
    openingHours: settings.openingHours.trim().slice(0, 200),
    openingHoursVerified: Boolean(settings.openingHoursVerified),
    establishmentYear: (settings.establishmentYear || '').trim().slice(0, 20),
    establishmentYearVerified: Boolean(settings.establishmentYearVerified),
    googleReviewsUrl: (settings.googleReviewsUrl || '').trim().slice(0, 400),
    instagramUrl: (settings.instagramUrl || '').trim().slice(0, 400),
    facebookUrl: (settings.facebookUrl || '').trim().slice(0, 400),
    policiesNote: (settings.policiesNote || '').trim().slice(0, 600),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'siteSettings', 'main'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function seedBoutiqueDatabase(): Promise<void> {
  const batch = writeBatch(db);
  try {
    const settingsRef = doc(db, 'siteSettings', 'main');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      batch.set(settingsRef, {
        ...DEFAULT_SITE_SETTINGS,
        updatedAt: serverTimestamp(),
      });
    }

    const existingCats = await getDocs(collection(db, 'categories'));
    if (existingCats.empty) {
      for (const cat of INITIAL_CATEGORIES) {
        const { id, ...rest } = cat;
        batch.set(doc(db, 'categories', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    const existingProds = await getDocs(collection(db, 'products'));
    if (existingProds.empty) {
      for (const prod of INITIAL_PRODUCTS) {
        const { id, ...rest } = prod;
        batch.set(doc(db, 'products', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    const existingGal = await getDocs(collection(db, 'gallery'));
    if (existingGal.empty) {
      for (const item of INITIAL_GALLERY) {
        const { id, ...rest } = item;
        batch.set(doc(db, 'gallery', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedBoutiqueDatabase');
  }
}

async function compressImageFile(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Invalid image file.'));
      el.src = objectUrl;
    });

    const maxDim = 1400;
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Image processing unavailable.');
    }
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.84);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadBoutiqueImage(file: File): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in as admin to upload images.');
  }
  const idToken = await currentUser.getIdToken();
  const dataUrl = await compressImageFile(file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      filename: file.name,
      dataUrl,
    }),
  });

  if (!response.ok) {
    const errBody = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(
      errBody.error ||
        'Image upload endpoint unavailable on this host. Please paste a hosted HTTPS image URL instead.'
    );
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

export async function exportBoutiqueBackup(): Promise<string> {
  const [products, categories, gallery, settings, reviews, enquiries] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchGallery(),
    fetchSiteSettings(),
    fetchAllReviewsAdmin(),
    fetchAllEnquiriesAdmin(),
  ]);

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      business: 'Kumar Saree Ghar Pvt. Ltd.',
      settings,
      categories,
      products,
      gallery,
      reviews,
      enquiries,
    },
    null,
    2
  );
}
