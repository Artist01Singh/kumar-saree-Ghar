export type AvailabilityStatus =
  | 'In Store'
  | 'Made to Order'
  | 'Enquire for Availability'
  | 'Out of Stock';

export type EnquiryStatus = 'New' | 'Contacted' | 'Resolved' | 'Archived';

export type GalleryAspect = 'portrait' | 'landscape' | 'square';

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  fabric?: string;
  workDetails?: string;
  color?: string;
  sizes?: string[];
  price?: number | null;
  priceVerified: boolean;
  availability: AvailabilityStatus;
  images: string[];
  featured: boolean;
  displayOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  featured: boolean;
  displayOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  caption: string;
  aspect: GalleryAspect;
  displayOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SiteSettings {
  businessName: string;
  tagline?: string;
  heroHeadline: string;
  heroSubtext?: string;
  heroImage?: string;
  bridalBannerTitle?: string;
  bridalBannerText?: string;
  bridalBannerImage?: string;
  address: string;
  primaryPhone: string;
  altPhone?: string;
  altPhoneVerified?: boolean;
  whatsappNumber: string;
  whatsappConfirmed: boolean;
  email: string;
  websiteUrl?: string;
  openingHours: string;
  openingHoursVerified: boolean;
  establishmentYear?: string;
  establishmentYearVerified: boolean;
  googleReviewsUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  policiesNote?: string;
  updatedAt?: unknown;
}

export interface Review {
  id: string;
  reviewerName: string;
  occasion?: string;
  rating: number;
  comment: string;
  verifiedSource: string;
  published: boolean;
  createdAt?: unknown;
}

export interface Enquiry {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  productOrCategory: string;
  message: string;
  sourcePage?: string;
  status: EnquiryStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}
