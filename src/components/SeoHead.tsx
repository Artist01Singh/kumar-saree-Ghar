import { useEffect } from 'react';
import { Product, SiteSettings } from '../types/store';
import { resolveBoutiqueImageUrl } from '../data/seedData';

interface SeoHeadProps {
  title: string;
  description: string;
  settings?: SiteSettings;
  product?: Product | null;
}

export function SeoHead({ title, description, settings, product }: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    const ensureMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    ensureMeta('name', 'description', description);
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', description);
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', description);

    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    ensureMeta('property', 'og:url', canonicalUrl);

    const ogImg = product?.images[0]
      ? resolveBoutiqueImageUrl(product.images[0])
      : settings?.heroImage
      ? resolveBoutiqueImageUrl(settings.heroImage)
      : '';
    if (ogImg) {
      const fullOgImg = ogImg.startsWith('http') || ogImg.startsWith('data:')
        ? ogImg
        : `${window.location.origin}${ogImg}`;
      ensureMeta('property', 'og:image', fullOgImg);
      ensureMeta('name', 'twitter:image', fullOgImg);
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    const existingScript = document.getElementById('ksg-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    const structuredData: Record<string, unknown>[] = [];

    if (settings) {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'ClothingStore',
        name: settings.businessName,
        description:
          settings.tagline ||
          'Luxury Indian Ethnic Wear Boutique in Laxmi Nagar, East Delhi featuring Designer Sarees, Bridal Lehengas, Suits & Indo-Western Couture.',
        url: window.location.origin,
        telephone: settings.primaryPhone,
        email: settings.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'H-1, Vijay Chowk, Laxmi Nagar',
          addressLocality: 'Delhi',
          postalCode: '110092',
          addressCountry: 'IN',
        },
        areaServed: ['Laxmi Nagar', 'East Delhi', 'Delhi NCR'],
      });
    }

    if (product) {
      const productSchema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        category: product.category,
        image: product.images
          .map((img) => resolveBoutiqueImageUrl(img))
          .filter(Boolean)
          .map((img) =>
            img.startsWith('http') || img.startsWith('data:') ? img : `${window.location.origin}${img}`
          ),
        brand: {
          '@type': 'Brand',
          name: 'Kumar Saree Ghar',
        },
      };

      if (product.priceVerified && product.price && product.price > 0) {
        productSchema.offers = {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: product.price,
          availability:
            product.availability === 'Out of Stock'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          url: canonicalUrl,
        };
      }
      structuredData.push(productSchema);
    }

    if (structuredData.length > 0) {
      const script = document.createElement('script');
      script.id = 'ksg-structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(
        structuredData.length === 1 ? structuredData[0] : structuredData
      );
      document.head.appendChild(script);
    }
  }, [title, description, settings, product]);

  return null;
}
