import heroBridalImg from '../assets/images/hero_indian_bridal_1794511483037.jpg';
import designerSareesImg from '../assets/images/collection_designer_sarees_1794511483257.jpg';
import bridalLehengasImg from '../assets/images/collection_bridal_lehengas_1794511485737.jpg';
import suitsKurtisImg from '../assets/images/collection_suits_kurtis_1794511487375.jpg';
import indoWesternImg from '../assets/images/collection_indowestern_gowns_1794511485975.jpg';
import boutiqueInteriorImg from '../assets/images/atelier_boutique_interior_1794511486371.jpg';
import zariCraftImg from '../assets/images/craft_zari_embroidery_1794511487206.jpg';
import { Category, GalleryItem, Product, SiteSettings } from '../types/store';

export const BOUTIQUE_ASSETS = {
  heroBridal: heroBridalImg,
  designerSarees: designerSareesImg,
  bridalLehengas: bridalLehengasImg,
  suitsKurtis: suitsKurtisImg,
  indoWestern: indoWesternImg,
  boutiqueInterior: boutiqueInteriorImg,
  zariCraft: zariCraftImg,
};

const LEGACY_ASSET_MAP: Record<string, string> = {
  '/src/assets/images/hero_indian_bridal_1794511483037.jpg': heroBridalImg,
  '/src/assets/images/collection_designer_sarees_1794511483257.jpg': designerSareesImg,
  '/src/assets/images/collection_bridal_lehengas_1794511485737.jpg': bridalLehengasImg,
  '/src/assets/images/collection_suits_kurtis_1794511487375.jpg': suitsKurtisImg,
  '/src/assets/images/collection_indowestern_gowns_1794511485975.jpg': indoWesternImg,
  '/src/assets/images/atelier_boutique_interior_1794511486371.jpg': boutiqueInteriorImg,
  '/src/assets/images/craft_zari_embroidery_1794511487206.jpg': zariCraftImg,
};

export function resolveBoutiqueImageUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Reject unsafe protocols
  if (/^(javascript|vbscript|data:text\/html):/i.test(trimmed)) {
    return '';
  }

  // Map any legacy unbundled /src/assets/images/... paths stored in Firestore to bundled assets
  if (LEGACY_ASSET_MAP[trimmed]) {
    return LEGACY_ASSET_MAP[trimmed];
  }

  // Normalize any full URL pointing to /src/assets/images/... or /uploads/... on another domain
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const parsed = new URL(trimmed);
      if (LEGACY_ASSET_MAP[parsed.pathname]) {
        return LEGACY_ASSET_MAP[parsed.pathname];
      }
      if (
        parsed.pathname.startsWith('/uploads/') &&
        (parsed.hostname === 'localhost' ||
          parsed.hostname.endsWith('.run.app'))
      ) {
        return parsed.pathname;
      }
      return trimmed;
    }
  } catch {
    return '';
  }

  return trimmed;
}

export function sanitizeExternalUrl(rawUrl?: string, fallback = '#'): string {
  if (!rawUrl) return fallback;
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

export const ALL_CATALOGUE_CATEGORIES = [
  'Sarees',
  'Designer Sarees',
  'Bridal Sarees',
  'Lehengas',
  'Bridal Lehengas',
  'Suits',
  'Kurtis',
  'Anarkali Suits',
  'Indo-Western',
  'Gowns',
] as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  businessName: 'Kumar Saree Ghar Pvt. Ltd.',
  tagline: 'Curated Indian Ethnic Wear & Bridal Couture in Laxmi Nagar, Delhi',
  heroHeadline: 'Discover the Art of Indian Elegance.',
  heroSubtext:
    'A destination in East Delhi for heritage sarees, bridal lehengas, tailored suits, and contemporary Indo-Western silhouettes.',
  heroImage: BOUTIQUE_ASSETS.heroBridal,
  bridalBannerTitle: 'The Bridal & Celebration Trousseau',
  bridalBannerText:
    'Visit our Vijay Chowk showroom for personalized bridal consultations, handloom silk selections, and occasion ensemble styling.',
  bridalBannerImage: BOUTIQUE_ASSETS.bridalLehengas,
  address: 'H-1, Vijay Chowk, Laxmi Nagar, Delhi – 110092, India',
  primaryPhone: '+91 99718 72666',
  altPhone: '011 2242 2441',
  altPhoneVerified: false,
  whatsappNumber: '919971872666',
  whatsappConfirmed: false,
  email: 'kumarrsarees@gmail.com',
  websiteUrl: 'https://www.kumarsarees.com',
  openingHours: 'Opening hours pending verification — please call ahead',
  openingHoursVerified: false,
  establishmentYear: '1989',
  establishmentYearVerified: false,
  googleReviewsUrl:
    'https://www.google.com/maps/search/?api=1&query=Kumar+Saree+Ghar+H-1+Vijay+Chowk+Laxmi+Nagar+Delhi+110092',
  instagramUrl: '',
  facebookUrl: '',
  policiesNote:
    'Payment methods, exchange terms, and alteration or delivery timelines are confirmed directly in-store or via enquiry prior to order placement.',
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-designer-sarees',
    name: 'Designer Sarees',
    slug: 'designer-sarees',
    description: 'Handwoven silks, Banarasi drapes, and contemporary statement borders.',
    coverImage: BOUTIQUE_ASSETS.designerSarees,
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'cat-bridal-lehengas',
    name: 'Bridal Lehengas',
    slug: 'bridal-lehengas',
    description: 'Heirloom bridal ensembles crafted with fine zardozi and rich fabrics.',
    coverImage: BOUTIQUE_ASSETS.bridalLehengas,
    featured: true,
    displayOrder: 2,
  },
  {
    id: 'cat-lehenga-choli',
    name: 'Lehengas',
    slug: 'lehengas',
    description: 'Festive lehenga cholis tailored for sangeet, mehendi, and family celebrations.',
    coverImage: BOUTIQUE_ASSETS.zariCraft,
    featured: true,
    displayOrder: 3,
  },
  {
    id: 'cat-suits-kurtis',
    name: 'Suits & Kurtis',
    slug: 'suits',
    description: 'Graceful Anarkali suits, unstitched dress materials, and festive kurtis.',
    coverImage: BOUTIQUE_ASSETS.suitsKurtis,
    featured: true,
    displayOrder: 4,
  },
  {
    id: 'cat-indo-western',
    name: 'Indo-Western',
    slug: 'indo-western',
    description: 'Modern draped silhouettes blending Indian craft with evening tailoring.',
    coverImage: BOUTIQUE_ASSETS.indoWestern,
    featured: true,
    displayOrder: 5,
  },
  {
    id: 'cat-gowns',
    name: 'Gowns',
    slug: 'gowns',
    description: 'Reception-ready ethnic and cocktail gowns for formal evening occasions.',
    coverImage: BOUTIQUE_ASSETS.heroBridal,
    featured: true,
    displayOrder: 6,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-royal-burgundy-banarasi-saree',
    title: 'Royal Burgundy Zari Brocade Saree',
    slug: 'royal-burgundy-zari-brocade-saree',
    category: 'Bridal Sarees',
    description:
      'A classic burgundy saree featuring traditional gold-toned motifs and a richly woven pallu. Designed for weddings, receptions, and auspicious ceremonies. Confirm fabric composition and stock availability with our showroom team.',
    fabric: 'Silk Blend (Confirm in-store)',
    workDetails: 'Traditional gold-toned woven motifs and bordered pallu',
    color: 'Deep Burgundy & Antique Gold',
    sizes: ['Free Size (5.5m Saree + Blouse Piece)'],
    price: null,
    priceVerified: false,
    availability: 'Enquire for Availability',
    images: [BOUTIQUE_ASSETS.heroBridal, BOUTIQUE_ASSETS.zariCraft],
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'prod-crimson-kanjivaram-designer-saree',
    title: 'Crimson Heritage Border Designer Saree',
    slug: 'crimson-heritage-border-designer-saree',
    category: 'Designer Sarees',
    description:
      'An understated crimson drape finished with broad gold-toned temple borders and delicate woven accents. Suitable for bridal trousseaus and festive gatherings.',
    fabric: 'Handloom Silk (Confirm weave in-store)',
    workDetails: 'Wide metallic woven border with subtle body motifs',
    color: 'Crimson Red & Gold',
    sizes: ['Free Size (5.5m Saree + Blouse Piece)'],
    price: null,
    priceVerified: false,
    availability: 'Enquire for Availability',
    images: [BOUTIQUE_ASSETS.designerSarees, BOUTIQUE_ASSETS.zariCraft],
    featured: true,
    displayOrder: 2,
  },
  {
    id: 'prod-wine-zardozi-bridal-lehenga',
    title: 'Maharani Wine Embroidered Bridal Lehenga',
    slug: 'maharani-wine-embroidered-bridal-lehenga',
    category: 'Bridal Lehengas',
    description:
      'A signature wine-maroon bridal lehenga featuring intricate heritage embroidery across the flared panels, paired with a matching choli and bordered dupatta. Available for showroom viewing and custom sizing consultation.',
    fabric: 'Velvet / Raw Silk (Confirm in-store)',
    workDetails: 'Detailed gold-toned artisanal embroidery across panels and border',
    color: 'Deep Wine Maroon',
    sizes: ['Custom Tailored', 'Semi-Stitched'],
    price: null,
    priceVerified: false,
    availability: 'Enquire for Availability',
    images: [BOUTIQUE_ASSETS.bridalLehengas, BOUTIQUE_ASSETS.zariCraft],
    featured: true,
    displayOrder: 3,
  },
  {
    id: 'prod-ivory-champagne-anarkali-suit',
    title: 'Ivory & Champagne Embroidered Anarkali Suit',
    slug: 'ivory-champagne-embroidered-anarkali-suit',
    category: 'Anarkali Suits',
    description:
      'A floor-length ivory Anarkali ensemble featuring fine tonal embroidery along the yoke and hemline, completed with a sheer bordered organza dupatta.',
    fabric: 'Silk & Organza Dupatta (Confirm in-store)',
    workDetails: 'Fine thread and metallic accent work on bodice and hem',
    color: 'Ivory & Champagne Gold',
    sizes: ['S', 'M', 'L', 'XL'],
    price: null,
    priceVerified: false,
    availability: 'Enquire for Availability',
    images: [BOUTIQUE_ASSETS.suitsKurtis],
    featured: true,
    displayOrder: 4,
  },
  {
    id: 'prod-rosewood-draped-indowestern-gown',
    title: 'Rosewood Sculpted Indo-Western Saree Gown',
    slug: 'rosewood-sculpted-indowestern-saree-gown',
    category: 'Indo-Western',
    description:
      'A contemporary pre-draped saree gown in muted rosewood with an embellished shoulder bodice and fluid pleated silhouette, crafted for cocktail evenings and receptions.',
    fabric: 'Metallic Tissue / Georgette Blend (Confirm in-store)',
    workDetails: 'Embellished shoulder detail with pre-stitched pleats',
    color: 'Muted Rosewood & Gold',
    sizes: ['S', 'M', 'L', 'Custom Fit'],
    price: null,
    priceVerified: false,
    availability: 'Enquire for Availability',
    images: [BOUTIQUE_ASSETS.indoWestern],
    featured: true,
    displayOrder: 5,
  },
  {
    id: 'prod-emerald-zari-occasion-lehenga',
    title: 'Emerald & Gold Heritage Occasion Lehenga',
    slug: 'emerald-gold-heritage-occasion-lehenga',
    category: 'Lehengas',
    description:
      'Rich emerald textile highlighted with ornate gold floral embroidery for sangeet nights, engagements, and festive celebrations. Enquire to view matching dupatta options in-store.',
    fabric: 'Silk Brocade (Confirm in-store)',
    workDetails: 'Floral metallic thread embroidery and woven brocade accents',
    color: 'Emerald Green & Gold',
    sizes: ['Semi-Stitched', 'Custom Tailored'],
    price: null,
    priceVerified: false,
    availability: 'Enquire for Availability',
    images: [BOUTIQUE_ASSETS.zariCraft, BOUTIQUE_ASSETS.bridalLehengas],
    featured: true,
    displayOrder: 6,
  },
  {
    id: 'prod-festive-ivory-kurti-set',
    title: 'Festive Ivory & Gold Straight Kurti Ensemble',
    slug: 'festive-ivory-gold-straight-kurti-ensemble',
    category: 'Kurtis',
    description:
      'Refined daytime-to-evening kurti ensemble tailored in soft ivory tones with subtle gold border detailing for family poojas and intimate gatherings.',
    fabric: 'Chanderi / Cotton Silk (Confirm in-store)',
    workDetails: 'Delicate yoke detailing and woven border trim',
    color: 'Ivory Cream',
    sizes: ['S', 'M', 'L', 'XL'],
    price: null,
    priceVerified: false,
    availability: 'Enquire for Availability',
    images: [BOUTIQUE_ASSETS.suitsKurtis],
    featured: false,
    displayOrder: 7,
  },
  {
    id: 'prod-reception-rosewood-evening-gown',
    title: 'Reception Draped Evening Gown',
    slug: 'reception-draped-evening-gown',
    category: 'Gowns',
    description:
      'An elongated evening gown combining structured Indian embroidery along the neckline with fluid contemporary draping for reception appearances.',
    fabric: 'Crepe Silk Blend (Confirm in-store)',
    workDetails: 'Hand-finished metallic shoulder and waist accents',
    color: 'Rosewood Bronze',
    sizes: ['S', 'M', 'L'],
    price: null,
    priceVerified: false,
    availability: 'Enquire for Availability',
    images: [BOUTIQUE_ASSETS.indoWestern],
    featured: false,
    displayOrder: 8,
  },
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Bridal Silk Drape',
    category: 'Bridal Sarees',
    imageUrl: BOUTIQUE_ASSETS.heroBridal,
    caption: 'Deep burgundy woven saree styled for daytime wedding ceremonies.',
    aspect: 'landscape',
    displayOrder: 1,
  },
  {
    id: 'gal-2',
    title: 'Zardozi Bridal Silhouette',
    category: 'Bridal Lehengas',
    imageUrl: BOUTIQUE_ASSETS.bridalLehengas,
    caption: 'Intricate wine velvet bridal lehenga with antique gold detailing.',
    aspect: 'portrait',
    displayOrder: 2,
  },
  {
    id: 'gal-3',
    title: 'Crimson Zari Border',
    category: 'Designer Sarees',
    imageUrl: BOUTIQUE_ASSETS.designerSarees,
    caption: 'Handwoven crimson drape from our designer saree archive.',
    aspect: 'portrait',
    displayOrder: 3,
  },
  {
    id: 'gal-4',
    title: 'Artisanal Embroidery Close-Up',
    category: 'Craftsmanship',
    imageUrl: BOUTIQUE_ASSETS.zariCraft,
    caption: 'Fine metallic threadwork and heritage floral motifs.',
    aspect: 'landscape',
    displayOrder: 4,
  },
  {
    id: 'gal-5',
    title: 'Ivory Anarkali Silhouette',
    category: 'Suits & Kurtis',
    imageUrl: BOUTIQUE_ASSETS.suitsKurtis,
    caption: 'Graceful ivory Anarkali paired with a sheer embroidered dupatta.',
    aspect: 'portrait',
    displayOrder: 5,
  },
  {
    id: 'gal-6',
    title: 'Laxmi Nagar Showroom',
    category: 'Boutique',
    imageUrl: BOUTIQUE_ASSETS.boutiqueInterior,
    caption: 'Our flagship showroom interior at H-1, Vijay Chowk, Laxmi Nagar.',
    aspect: 'landscape',
    displayOrder: 6,
  },
];
