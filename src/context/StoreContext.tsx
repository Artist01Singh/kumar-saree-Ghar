import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, testFirestoreConnection } from '../lib/firebase';
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_GALLERY,
  INITIAL_PRODUCTS,
} from '../data/seedData';
import {
  checkIsAdmin,
  fetchCategories,
  fetchGallery,
  fetchProducts,
  fetchPublishedReviews,
  fetchSiteSettings,
} from '../lib/storeService';
import { Category, GalleryItem, Product, Review, SiteSettings } from '../types/store';

export interface EnquiryContextInfo {
  productOrCategory: string;
  prefilledMessage?: string;
  sourcePage?: string;
  whatsappPendingNotice?: boolean;
}

interface StoreContextValue {
  products: Product[];
  categories: Category[];
  gallery: GalleryItem[];
  settings: SiteSettings;
  reviews: Review[];
  loading: boolean;
  error: string | null;
  isSeedFallback: boolean;
  refreshStoreData: () => Promise<void>;

  user: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutAdmin: () => Promise<void>;

  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistDrawerOpen: boolean;
  setWishlistDrawerOpen: (open: boolean) => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  enquiryModalOpen: boolean;
  enquiryContext: EnquiryContextInfo | null;
  openEnquiryModal: (ctx?: EnquiryContextInfo) => void;
  closeEnquiryModal: () => void;

  triggerWhatsAppEnquiry: (options: {
    subject: string;
    productUrl?: string;
    sourcePage?: string;
  }) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);
const WISHLIST_STORAGE_KEY = 'ksg_wishlist_ids_v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeedFallback, setIsSeedFallback] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryContext, setEnquiryContext] = useState<EnquiryContextInfo | null>(null);

  const refreshStoreData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dbProducts, dbCategories, dbGallery, dbSettings, dbReviews] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchGallery(),
        fetchSiteSettings(),
        fetchPublishedReviews(),
      ]);

      const hasLiveCatalog = dbProducts.length > 0 || dbCategories.length > 0 || Boolean(dbSettings);
      setIsSeedFallback(!hasLiveCatalog);

      setProducts(dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS);
      setCategories(dbCategories.length > 0 ? dbCategories : INITIAL_CATEGORIES);
      setGallery(dbGallery.length > 0 ? dbGallery : INITIAL_GALLERY);
      setSettings(dbSettings || DEFAULT_SITE_SETTINGS);
      setReviews(dbReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load store catalogue.');
      setProducts(INITIAL_PRODUCTS);
      setCategories(INITIAL_CATEGORIES);
      setGallery(INITIAL_GALLERY);
      setSettings(DEFAULT_SITE_SETTINGS);
      setIsSeedFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    testFirestoreConnection();
    refreshStoreData();
  }, [refreshStoreData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminStatus = await checkIsAdmin(currentUser.uid, currentUser.email);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [wishlistIds]);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOutAdmin = useCallback(async () => {
    await signOut(auth);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const openEnquiryModal = useCallback((ctx?: EnquiryContextInfo) => {
    setEnquiryContext(
      ctx || {
        productOrCategory: 'General Collection Enquiry',
        sourcePage: window.location.pathname,
      }
    );
    setEnquiryModalOpen(true);
  }, []);

  const closeEnquiryModal = useCallback(() => {
    setEnquiryModalOpen(false);
  }, []);

  const triggerWhatsAppEnquiry = useCallback(
    (options: { subject: string; productUrl?: string; sourcePage?: string }) => {
      const cleanDigits = settings.whatsappNumber.replace(/[^0-9]/g, '');
      const linkText = options.productUrl
        ? `Hello Kumar Saree Ghar, I would like to enquire about "${options.subject}". Product link: ${options.productUrl}`
        : `Hello Kumar Saree Ghar, I would like to enquire about ${options.subject}.`;

      if (settings.whatsappConfirmed && cleanDigits.length >= 10) {
        const waUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(linkText)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } else {
        openEnquiryModal({
          productOrCategory: options.subject,
          prefilledMessage: linkText,
          sourcePage: options.sourcePage || window.location.pathname,
          whatsappPendingNotice: true,
        });
      }
    },
    [settings.whatsappConfirmed, settings.whatsappNumber, openEnquiryModal]
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        gallery,
        settings,
        reviews,
        loading,
        error,
        isSeedFallback,
        refreshStoreData,
        user,
        isAdmin,
        authLoading,
        signInWithGoogle,
        signOutAdmin,
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        wishlistDrawerOpen,
        setWishlistDrawerOpen,
        searchOpen,
        setSearchOpen,
        enquiryModalOpen,
        enquiryContext,
        openEnquiryModal,
        closeEnquiryModal,
        triggerWhatsAppEnquiry,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return ctx;
}
