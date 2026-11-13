import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  Edit3,
  Globe,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ALL_CATALOGUE_CATEGORIES, BOUTIQUE_ASSETS } from '../data/seedData';
import {
  deleteEnquiry,
  exportBoutiqueBackup,
  fetchAllEnquiriesAdmin,
  fetchAllReviewsAdmin,
  removeCategory,
  removeGalleryItem,
  removeProduct,
  removeReview,
  saveCategory,
  saveGalleryItem,
  saveProduct,
  saveReview,
  saveSiteSettings,
  seedBoutiqueDatabase,
  slugify,
  updateEnquiryStatus,
  uploadBoutiqueImage,
} from '../lib/storeService';
import {
  AvailabilityStatus,
  Category,
  Enquiry,
  EnquiryStatus,
  GalleryAspect,
  GalleryItem,
  Product,
  Review,
  SiteSettings,
} from '../types/store';
import { BoutiqueImage } from '../components/BoutiqueImage';
import { formatINR } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';

type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'enquiries'
  | 'gallery'
  | 'reviews'
  | 'settings';

const PRESET_IMAGE_OPTIONS = [
  { label: 'Hero Burgundy Banarasi Saree', url: BOUTIQUE_ASSETS.heroBridal },
  { label: 'Crimson Designer Saree', url: BOUTIQUE_ASSETS.designerSarees },
  { label: 'Wine Bridal Lehenga', url: BOUTIQUE_ASSETS.bridalLehengas },
  { label: 'Ivory Anarkali Suit', url: BOUTIQUE_ASSETS.suitsKurtis },
  { label: 'Rosewood Indo-Western Gown', url: BOUTIQUE_ASSETS.indoWestern },
  { label: 'Boutique Showroom Interior', url: BOUTIQUE_ASSETS.boutiqueInterior },
  { label: 'Gold Zari Embroidery Detail', url: BOUTIQUE_ASSETS.zariCraft },
];

export function AdminPage() {
  const {
    user,
    isAdmin,
    authLoading,
    signInWithGoogle,
    signOutAdmin,
    products,
    categories,
    gallery,
    settings,
    isSeedFallback,
    refreshStoreData,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [adminDataLoading, setAdminDataLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [seeding, setSeeding] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  // Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    title: '',
    category: 'Designer Sarees',
    description: '',
    fabric: '',
    workDetails: '',
    color: '',
    sizesText: 'Free Size',
    price: '',
    priceVerified: false,
    availability: 'Enquire for Availability' as AvailabilityStatus,
    imagesText: BOUTIQUE_ASSETS.designerSarees,
    featured: true,
    displayOrder: 1,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Category Form State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    coverImage: BOUTIQUE_ASSETS.designerSarees,
    featured: true,
    displayOrder: 1,
  });

  // Gallery Form State
  const [editingGalId, setEditingGalId] = useState<string | null>(null);
  const [galForm, setGalForm] = useState({
    title: '',
    category: 'Bridal Sarees',
    imageUrl: BOUTIQUE_ASSETS.heroBridal,
    caption: '',
    aspect: 'landscape' as GalleryAspect,
    displayOrder: 1,
  });

  // Review Form State
  const [editingRevId, setEditingRevId] = useState<string | null>(null);
  const [revForm, setRevForm] = useState({
    reviewerName: '',
    occasion: '',
    rating: 5,
    comment: '',
    verifiedSource: 'Verified Google Review',
    published: true,
  });

  // Enquiry Filter State
  const [enquiryFilter, setEnquiryFilter] = useState<string>('All');

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const loadProtectedAdminData = async () => {
    if (!isAdmin) return;
    setAdminDataLoading(true);
    try {
      const [enqData, revData] = await Promise.all([
        fetchAllEnquiriesAdmin(),
        fetchAllReviewsAdmin(),
      ]);
      setEnquiries(enqData);
      setAllReviews(revData);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to fetch admin records.',
      });
    } finally {
      setAdminDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadProtectedAdminData();
    }
  }, [isAdmin]);

  const notify = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      await seedBoutiqueDatabase();
      await refreshStoreData();
      notify('success', 'Initial boutique catalogue and settings saved to Firestore.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to initialize database.');
    } finally {
      setSeeding(false);
    }
  };

  const handleExportBackup = async () => {
    setExportingBackup(true);
    try {
      const json = await exportBoutiqueBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kumar-saree-ghar-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notify('success', 'Full boutique JSON backup downloaded.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to export backup.');
    } finally {
      setExportingBackup(false);
    }
  };

  const handleImageFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUrl: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadBoutiqueImage(file);
      onUrl(url);
      notify('success', 'Image uploaded successfully.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.title.trim()) {
      notify('error', 'Product title is required.');
      return;
    }
    const imageList = prodForm.imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (imageList.length === 0) {
      notify('error', 'At least one product image URL or uploaded path is required.');
      return;
    }

    setSavingProduct(true);
    try {
      const numericPrice = prodForm.price ? Number(prodForm.price) : null;
      await saveProduct(
        {
          title: prodForm.title,
          slug: slugify(prodForm.title),
          category: prodForm.category,
          description: prodForm.description,
          fabric: prodForm.fabric,
          workDetails: prodForm.workDetails,
          color: prodForm.color,
          sizes: prodForm.sizesText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          price: numericPrice,
          priceVerified: prodForm.priceVerified && Boolean(numericPrice && numericPrice > 0),
          availability: prodForm.availability,
          images: imageList,
          featured: prodForm.featured,
          displayOrder: Number(prodForm.displayOrder) || 0,
        },
        editingProductId || undefined
      );
      setEditingProductId(null);
      setProdForm({
        title: '',
        category: 'Designer Sarees',
        description: '',
        fabric: '',
        workDetails: '',
        color: '',
        sizesText: 'Free Size',
        price: '',
        priceVerified: false,
        availability: 'Enquire for Availability',
        imagesText: BOUTIQUE_ASSETS.designerSarees,
        featured: true,
        displayOrder: products.length + 1,
      });
      await refreshStoreData();
      notify('success', 'Product saved and published to storefront.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const startEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdForm({
      title: p.title,
      category: p.category,
      description: p.description,
      fabric: p.fabric || '',
      workDetails: p.workDetails || '',
      color: p.color || '',
      sizesText: (p.sizes || []).join(', '),
      price: p.price ? String(p.price) : '',
      priceVerified: p.priceVerified,
      availability: p.availability,
      imagesText: p.images.join('\n'),
      featured: p.featured,
      displayOrder: p.displayOrder || 0,
    });
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await removeProduct(id);
      setConfirmDeleteKey(null);
      await refreshStoreData();
      notify('success', 'Product removed.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to delete product.');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCategory(
        {
          name: catForm.name,
          slug: slugify(catForm.name),
          description: catForm.description,
          coverImage: catForm.coverImage,
          featured: catForm.featured,
          displayOrder: Number(catForm.displayOrder) || 0,
        },
        editingCatId || undefined
      );
      setEditingCatId(null);
      setCatForm({
        name: '',
        description: '',
        coverImage: BOUTIQUE_ASSETS.designerSarees,
        featured: true,
        displayOrder: categories.length + 1,
      });
      await refreshStoreData();
      notify('success', 'Category saved.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save category.');
    }
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveGalleryItem(
        {
          title: galForm.title,
          category: galForm.category,
          imageUrl: galForm.imageUrl,
          caption: galForm.caption,
          aspect: galForm.aspect,
          displayOrder: Number(galForm.displayOrder) || 0,
        },
        editingGalId || undefined
      );
      setEditingGalId(null);
      setGalForm({
        title: '',
        category: 'Bridal Sarees',
        imageUrl: BOUTIQUE_ASSETS.heroBridal,
        caption: '',
        aspect: 'landscape',
        displayOrder: gallery.length + 1,
      });
      await refreshStoreData();
      notify('success', 'Gallery item saved.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save gallery item.');
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveReview(
        {
          reviewerName: revForm.reviewerName,
          occasion: revForm.occasion,
          rating: Number(revForm.rating) || 5,
          comment: revForm.comment,
          verifiedSource: revForm.verifiedSource,
          published: revForm.published,
        },
        editingRevId || undefined
      );
      setEditingRevId(null);
      setRevForm({
        reviewerName: '',
        occasion: '',
        rating: 5,
        comment: '',
        verifiedSource: 'Verified Google Review',
        published: true,
      });
      await Promise.all([loadProtectedAdminData(), refreshStoreData()]);
      notify('success', 'Verified customer review saved.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save review.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveSiteSettings(settingsForm);
      await refreshStoreData();
      notify('success', 'Storefront settings and banners updated live.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#651B32]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <SeoHead
          title="Boutique Admin Login — Kumar Saree Ghar"
          description="Authorized administrator access for Kumar Saree Ghar Pvt. Ltd."
          settings={settings}
        />
        <div className="bg-white border border-[#292326]/12 p-8 text-center">
          <ShieldCheck className="w-10 h-10 text-[#651B32] mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="font-display text-3xl font-semibold text-[#292326] mb-2">
            Boutique Admin Portal
          </h1>
          <p className="text-sm text-[#81747A] leading-relaxed mb-6">
            Sign in with an authorized Google administrator account to manage products, categories,
            gallery photography, verified reviews, customer enquiries, and business verification settings.
          </p>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full py-3.5 px-6 text-sm font-semibold bg-[#651B32] text-white hover:bg-[#872D49] transition-colors cursor-pointer"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="bg-white border border-[#651B32]/30 p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-[#651B32] mx-auto mb-4" />
          <h1 className="font-display text-3xl font-semibold text-[#292326] mb-2">
            Administrator Access Required
          </h1>
          <p className="text-sm text-[#81747A] mb-6">
            Signed in as <span className="font-medium text-[#292326]">{user.email}</span>. This
            account is not authorized to modify Kumar Saree Ghar storefront data.
          </p>
          <button
            type="button"
            onClick={() => signOutAdmin()}
            className="px-6 py-3 text-xs font-semibold border border-[#292326]/20 text-[#292326] hover:border-[#651B32]"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const filteredEnquiries =
    enquiryFilter === 'All'
      ? enquiries
      : enquiries.filter((e) => e.status === enquiryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <SeoHead
        title="Admin Dashboard — Kumar Saree Ghar"
        description="Manage products, categories, enquiries, gallery, and storefront settings."
        settings={settings}
      />

      {/* Admin Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#292326]/12">
        <div>
          <p className="text-xs font-medium text-[#81747A]">
            Signed in as {user.email}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326]">
            Kumar Saree Ghar Admin Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isSeedFallback && (
            <button
              type="button"
              disabled={seeding}
              onClick={handleSeedDatabase}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#C6A15B] text-[#292326] hover:bg-[#b5914d] cursor-pointer"
            >
              {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              <span>Initialize Storefront in Firestore</span>
            </button>
          )}
          <button
            type="button"
            disabled={exportingBackup}
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white border border-[#292326]/20 text-[#292326] hover:border-[#651B32] cursor-pointer"
          >
            {exportingBackup ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export Backup (JSON)</span>
          </button>
          <button
            type="button"
            onClick={() => signOutAdmin()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border border-[#292326]/20 text-[#292326] hover:border-[#651B32] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`mb-6 px-4 py-3 text-sm flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-white border-[#C6A15B] text-[#292326]'
              : 'bg-[#651B32]/10 border-[#651B32]/40 text-[#651B32]'
          }`}
        >
          <span className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#651B32]" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {statusMessage.text}
          </span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-[#292326]/10">
        {(
          [
            ['overview', 'Overview'],
            ['products', `Products (${products.length})`],
            ['categories', `Categories (${categories.length})`],
            ['enquiries', `Enquiries (${enquiries.length})`],
            ['gallery', `Gallery (${gallery.length})`],
            ['reviews', `Reviews (${allReviews.length})`],
            ['settings', 'Settings & Content'],
          ] as [AdminTab, string][]
        ).map(([tabKey, label]) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => {
              setActiveTab(tabKey);
              setConfirmDeleteKey(null);
            }}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeTab === tabKey
                ? 'bg-[#651B32] text-white'
                : 'bg-white border border-[#292326]/12 text-[#292326] hover:border-[#651B32]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#292326]/10 p-5">
              <p className="text-xs text-[#81747A]">Catalogue Products</p>
              <p className="font-display text-4xl font-semibold text-[#292326] mt-1 tabular-nums">
                {products.length}
              </p>
            </div>
            <div className="bg-white border border-[#292326]/10 p-5">
              <p className="text-xs text-[#81747A]">New Enquiries</p>
              <p className="font-display text-4xl font-semibold text-[#651B32] mt-1 tabular-nums">
                {enquiries.filter((e) => e.status === 'New').length}
              </p>
            </div>
            <div className="bg-white border border-[#292326]/10 p-5">
              <p className="text-xs text-[#81747A]">Gallery Photos</p>
              <p className="font-display text-4xl font-semibold text-[#292326] mt-1 tabular-nums">
                {gallery.length}
              </p>
            </div>
            <div className="bg-white border border-[#292326]/10 p-5">
              <p className="text-xs text-[#81747A]">Published Reviews</p>
              <p className="font-display text-4xl font-semibold text-[#292326] mt-1 tabular-nums">
                {allReviews.filter((r) => r.published).length}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#292326]/10 p-6">
            <h2 className="font-display text-2xl font-semibold text-[#292326] mb-4">
              Business Verification Checklist
            </h2>
            <p className="text-sm text-[#81747A] mb-5">
              Items marked pending stay clearly labelled on the public site until confirmed in
              Settings & Content.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-[#FAF6EF] border border-[#292326]/10 flex items-center justify-between">
                <span>WhatsApp Number ({settings.whatsappNumber})</span>
                <span className="text-xs font-semibold text-[#651B32]">
                  {settings.whatsappConfirmed ? 'Confirmed' : 'Pending Confirmation'}
                </span>
              </div>
              <div className="p-4 bg-[#FAF6EF] border border-[#292326]/10 flex items-center justify-between">
                <span>Opening Hours</span>
                <span className="text-xs font-semibold text-[#651B32]">
                  {settings.openingHoursVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              <div className="p-4 bg-[#FAF6EF] border border-[#292326]/10 flex items-center justify-between">
                <span>Alternative Phone ({settings.altPhone})</span>
                <span className="text-xs font-semibold text-[#651B32]">
                  {settings.altPhoneVerified ? 'Verified' : 'Pending Confirmation'}
                </span>
              </div>
              <div className="p-4 bg-[#FAF6EF] border border-[#292326]/10 flex items-center justify-between">
                <span>Establishment Year ({settings.establishmentYear || '1989'})</span>
                <span className="text-xs font-semibold text-[#651B32]">
                  {settings.establishmentYearVerified ? 'Published' : 'Hidden Until Confirmed'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="px-5 py-2.5 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] cursor-pointer"
              >
                Update Verification Flags & Content
              </button>
              <button
                type="button"
                disabled={exportingBackup}
                onClick={handleExportBackup}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border border-[#292326]/20 text-[#292326] hover:border-[#651B32] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Full Data Backup</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#292326]/10 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-[#651B32]" />
              <h2 className="font-display text-2xl font-semibold text-[#292326]">
                Cross-Domain Deployment & Data Safety
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-[#81747A] list-disc pl-5">
              <li>
                Built-in boutique images are compiled into production assets so they render reliably across any domain or CDN.
              </li>
              <li>
                If you deploy to a custom domain (such as <span className="font-medium text-[#292326]">www.kumarsarees.com</span>), add that domain in Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized domains and update your Google Maps API key HTTP referrers.
              </li>
              <li>
                Files uploaded via the server are stored under <code className="text-xs bg-[#FAF6EF] px-1.5 py-0.5">/uploads/</code> on this server; if migrating to a static-only host, host custom photos on HTTPS storage (e.g. Firebase Storage) or download a JSON backup first.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSaveProduct}
            className="lg:col-span-5 bg-white border border-[#292326]/10 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-[#292326]">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h2>
              {editingProductId && (
                <button
                  type="button"
                  onClick={() => setEditingProductId(null)}
                  className="text-xs text-[#651B32] underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#292326] mb-1">Title *</label>
              <input
                type="text"
                required
                value={prodForm.title}
                onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#292326] mb-1">Category *</label>
                <select
                  value={prodForm.category}
                  onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20 bg-white"
                >
                  {ALL_CATALOGUE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#292326] mb-1">Availability</label>
                <select
                  value={prodForm.availability}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, availability: e.target.value as AvailabilityStatus })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20 bg-white"
                >
                  <option value="In Store">In Store</option>
                  <option value="Made to Order">Made to Order</option>
                  <option value="Enquire for Availability">Enquire for Availability</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#292326] mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={prodForm.description}
                onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#292326] mb-1">Fabric</label>
                <input
                  type="text"
                  value={prodForm.fabric}
                  onChange={(e) => setProdForm({ ...prodForm, fabric: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#292326] mb-1">Color</label>
                <input
                  type="text"
                  value={prodForm.color}
                  onChange={(e) => setProdForm({ ...prodForm, color: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#292326] mb-1">Work Details</label>
              <input
                type="text"
                value={prodForm.workDetails}
                onChange={(e) => setProdForm({ ...prodForm, workDetails: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#292326] mb-1">
                Sizes (comma-separated)
              </label>
              <input
                type="text"
                value={prodForm.sizesText}
                onChange={(e) => setProdForm({ ...prodForm, sizesText: e.target.value })}
                placeholder="S, M, L, XL"
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-[#292326] mb-1">
                  Price (INR ₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={prodForm.price}
                  onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                  placeholder="Leave blank if unverified"
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20 tabular-nums"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-[#292326] pb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prodForm.priceVerified}
                  onChange={(e) => setProdForm({ ...prodForm, priceVerified: e.target.checked })}
                />
                <span>Show Verified Price Publicly</span>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[#292326]">
                  Images (1 URL per line) *
                </label>
                <label className="inline-flex items-center gap-1 text-xs font-semibold text-[#651B32] cursor-pointer hover:underline">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(e) =>
                      handleImageFileUpload(e, (url) =>
                        setProdForm((prev) => ({
                          ...prev,
                          imagesText: prev.imagesText ? `${url}\n${prev.imagesText}` : url,
                        }))
                      )
                    }
                  />
                </label>
              </div>
              <textarea
                rows={3}
                required
                value={prodForm.imagesText}
                onChange={(e) => setProdForm({ ...prodForm, imagesText: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#292326]/20 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-[#292326] cursor-pointer">
                <input
                  type="checkbox"
                  checked={prodForm.featured}
                  onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })}
                />
                <span>Featured on Homepage</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="text-xs text-[#81747A]">Order:</label>
                <input
                  type="number"
                  min={0}
                  value={prodForm.displayOrder}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, displayOrder: Number(e.target.value) })
                  }
                  className="w-16 px-2 py-1 text-xs border border-[#292326]/20 tabular-nums"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProduct}
              className="w-full py-3 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] flex items-center justify-center gap-2 cursor-pointer"
            >
              {savingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>{editingProductId ? 'Update Product' : 'Add Product'}</span>
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-[#292326]/10 p-4 flex items-center gap-4"
              >
                <BoutiqueImage
                  src={p.images[0]}
                  alt={p.title}
                  className="w-16 h-20 object-cover bg-[#F3ECE1] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#81747A]">
                    {p.category} · {p.availability} {p.featured ? '· Featured' : ''}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-[#292326] truncate">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#651B32] mt-0.5 tabular-nums">
                    {p.priceVerified && p.price ? formatINR(p.price) : 'Price on Enquiry'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditProduct(p)}
                    aria-label={`Edit ${p.title}`}
                    className="w-9 h-9 flex items-center justify-center border border-[#292326]/15 text-[#292326] hover:border-[#651B32] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {confirmDeleteKey === `prod:${p.id}` ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-[#651B32] text-white cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteKey(null)}
                        className="px-2 py-1.5 text-xs border border-[#292326]/20 text-[#292326] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteKey(`prod:${p.id}`)}
                      aria-label={`Delete ${p.title}`}
                      className="w-9 h-9 flex items-center justify-center border border-[#292326]/15 text-[#651B32] hover:bg-[#651B32]/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSaveCategory}
            className="lg:col-span-5 bg-white border border-[#292326]/10 p-6 space-y-4"
          >
            <h2 className="font-display text-2xl font-semibold text-[#292326]">
              {editingCatId ? 'Edit Category' : 'Add Category'}
            </h2>
            <div>
              <label className="block text-xs font-medium mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium">Cover Image URL *</label>
                <label className="text-xs font-semibold text-[#651B32] cursor-pointer hover:underline">
                  Upload File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageFileUpload(e, (url) => setCatForm((p) => ({ ...p, coverImage: url })))
                    }
                  />
                </label>
              </div>
              <input
                type="text"
                required
                value={catForm.coverImage}
                onChange={(e) => setCatForm({ ...catForm, coverImage: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#292326]/20"
              />
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={catForm.featured}
                onChange={(e) => setCatForm({ ...catForm, featured: e.target.checked })}
              />
              <span>Show in Featured Collections</span>
            </label>
            <button
              type="submit"
              className="w-full py-3 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] cursor-pointer"
            >
              {editingCatId ? 'Update Category' : 'Save Category'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {categories.map((c: Category) => (
              <div key={c.id} className="bg-white border border-[#292326]/10 p-4 flex items-center gap-4">
                <BoutiqueImage src={c.coverImage} alt={c.name} className="w-16 h-20 object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl font-semibold text-[#292326]">{c.name}</h3>
                  <p className="text-xs text-[#81747A] line-clamp-2">{c.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(c.id);
                      setCatForm({
                        name: c.name,
                        description: c.description,
                        coverImage: c.coverImage,
                        featured: c.featured,
                        displayOrder: c.displayOrder,
                      });
                    }}
                    className="w-9 h-9 flex items-center justify-center border border-[#292326]/15"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {confirmDeleteKey === `cat:${c.id}` ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await removeCategory(c.id);
                            setConfirmDeleteKey(null);
                            await refreshStoreData();
                            notify('success', 'Category deleted.');
                          } catch (err) {
                            notify('error', err instanceof Error ? err.message : 'Failed to delete category.');
                          }
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-[#651B32] text-white cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteKey(null)}
                        className="px-2 py-1.5 text-xs border border-[#292326]/20 text-[#292326] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteKey(`cat:${c.id}`)}
                      aria-label={`Delete ${c.name}`}
                      className="w-9 h-9 flex items-center justify-center border border-[#292326]/15 text-[#651B32] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {['All', 'New', 'Contacted', 'Resolved', 'Archived'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setEnquiryFilter(st)}
                  className={`px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                    enquiryFilter === st
                      ? 'bg-[#651B32] text-white'
                      : 'bg-white border border-[#292326]/15 text-[#292326]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={loadProtectedAdminData}
              className="text-xs font-semibold text-[#651B32] underline"
            >
              Refresh Enquiries
            </button>
          </div>

          {adminDataLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#651B32]" />
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="bg-white border border-[#292326]/10 p-10 text-center text-sm text-[#81747A]">
              No customer enquiries found in this view.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEnquiries.map((enq) => (
                <div key={enq.id} className="bg-white border border-[#292326]/10 p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-[#292326]">
                        {enq.customerName}
                      </h3>
                      <p className="text-xs text-[#81747A]">
                        Phone: <span className="text-[#292326] font-medium tabular-nums">{enq.phone}</span>
                        {enq.email ? ` · Email: ${enq.email}` : ''} · Regarding:{' '}
                        <span className="text-[#651B32] font-medium">{enq.productOrCategory}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={enq.status}
                        onChange={async (e) => {
                          await updateEnquiryStatus(enq.id, e.target.value as EnquiryStatus);
                          await loadProtectedAdminData();
                          notify('success', 'Enquiry status updated.');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold border border-[#292326]/20 bg-[#FAF6EF]"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Archived">Archived</option>
                      </select>
                      {confirmDeleteKey === `enq:${enq.id}` ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await deleteEnquiry(enq.id);
                                setConfirmDeleteKey(null);
                                await loadProtectedAdminData();
                                notify('success', 'Enquiry deleted.');
                              } catch (err) {
                                notify('error', err instanceof Error ? err.message : 'Failed to delete enquiry.');
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#651B32] text-white cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteKey(null)}
                            className="px-2 py-1 text-xs border border-[#292326]/20 text-[#292326] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteKey(`enq:${enq.id}`)}
                          aria-label={`Delete enquiry from ${enq.customerName}`}
                          className="w-8 h-8 flex items-center justify-center border border-[#292326]/15 text-[#651B32] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[#292326]/85 bg-[#FAF6EF] p-3 border border-[#292326]/6">
                    {enq.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: GALLERY */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSaveGallery}
            className="lg:col-span-5 bg-white border border-[#292326]/10 p-6 space-y-4"
          >
            <h2 className="font-display text-2xl font-semibold text-[#292326]">
              {editingGalId ? 'Edit Gallery Photo' : 'Add Gallery Photo'}
            </h2>
            <div>
              <label className="block text-xs font-medium mb-1">Title *</label>
              <input
                type="text"
                required
                value={galForm.title}
                onChange={(e) => setGalForm({ ...galForm, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category *</label>
              <input
                type="text"
                required
                value={galForm.category}
                onChange={(e) => setGalForm({ ...galForm, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium">Image URL *</label>
                <label className="text-xs font-semibold text-[#651B32] cursor-pointer hover:underline">
                  Upload File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageFileUpload(e, (url) => setGalForm((p) => ({ ...p, imageUrl: url })))
                    }
                  />
                </label>
              </div>
              <input
                type="text"
                required
                value={galForm.imageUrl}
                onChange={(e) => setGalForm({ ...galForm, imageUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#292326]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Caption</label>
              <textarea
                rows={2}
                value={galForm.caption}
                onChange={(e) => setGalForm({ ...galForm, caption: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] cursor-pointer"
            >
              Save Gallery Photo
            </button>
          </form>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gallery.map((g: GalleryItem) => (
              <div key={g.id} className="bg-white border border-[#292326]/10 overflow-hidden">
                <div className="aspect-[4/3]">
                  <BoutiqueImage src={g.imageUrl} alt={g.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#81747A]">{g.category}</p>
                    <p className="font-display text-lg font-semibold truncate">{g.title}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGalId(g.id);
                        setGalForm({
                          title: g.title,
                          category: g.category,
                          imageUrl: g.imageUrl,
                          caption: g.caption,
                          aspect: g.aspect,
                          displayOrder: g.displayOrder,
                        });
                      }}
                      className="w-8 h-8 flex items-center justify-center border border-[#292326]/15"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {confirmDeleteKey === `gal:${g.id}` ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await removeGalleryItem(g.id);
                              setConfirmDeleteKey(null);
                              await refreshStoreData();
                              notify('success', 'Gallery photo deleted.');
                            } catch (err) {
                              notify('error', err instanceof Error ? err.message : 'Failed to delete photo.');
                            }
                          }}
                          className="px-2 py-1 text-[11px] font-semibold bg-[#651B32] text-white cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteKey(null)}
                          className="px-2 py-1 text-[11px] border border-[#292326]/20 text-[#292326] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteKey(`gal:${g.id}`)}
                        aria-label={`Delete ${g.title}`}
                        className="w-8 h-8 flex items-center justify-center border border-[#292326]/15 text-[#651B32] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSaveReview}
            className="lg:col-span-5 bg-white border border-[#292326]/10 p-6 space-y-4"
          >
            <h2 className="font-display text-2xl font-semibold text-[#292326]">
              Add Verified Customer Review
            </h2>
            <p className="text-xs text-[#81747A]">
              Only add genuine, verified customer reviews from Google Reviews or authenticated buyers.
            </p>
            <div>
              <label className="block text-xs font-medium mb-1">Reviewer Name *</label>
              <input
                type="text"
                required
                value={revForm.reviewerName}
                onChange={(e) => setRevForm({ ...revForm, reviewerName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Occasion / Purchase</label>
                <input
                  type="text"
                  value={revForm.occasion}
                  onChange={(e) => setRevForm({ ...revForm, occasion: e.target.value })}
                  placeholder="e.g. Bridal Trousseau"
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Rating (1–5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={revForm.rating}
                  onChange={(e) => setRevForm({ ...revForm, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Verified Source *</label>
              <input
                type="text"
                required
                value={revForm.verifiedSource}
                onChange={(e) => setRevForm({ ...revForm, verifiedSource: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Review Quote *</label>
              <textarea
                rows={3}
                required
                value={revForm.comment}
                onChange={(e) => setRevForm({ ...revForm, comment: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#292326]/20"
              />
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={revForm.published}
                onChange={(e) => setRevForm({ ...revForm, published: e.target.checked })}
              />
              <span>Publish on Storefront</span>
            </label>
            <button
              type="submit"
              className="w-full py-3 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] cursor-pointer"
            >
              Save Verified Review
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {allReviews.length === 0 ? (
              <div className="bg-white border border-[#292326]/10 p-8 text-center text-sm text-[#81747A]">
                No verified reviews added yet. The storefront displays a verified Google Reviews link.
              </div>
            ) : (
              allReviews.map((r) => (
                <div key={r.id} className="bg-white border border-[#292326]/10 p-4 flex justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm text-[#292326]">
                      {r.reviewerName} · {r.rating}/5 · {r.published ? 'Published' : 'Draft'}
                    </p>
                    <p className="text-xs text-[#81747A] mb-2">{r.verifiedSource}</p>
                    <p className="text-sm text-[#292326]/85">"{r.comment}"</p>
                  </div>
                  {confirmDeleteKey === `rev:${r.id}` ? (
                    <div className="flex items-center gap-1 shrink-0 self-start">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await removeReview(r.id);
                            setConfirmDeleteKey(null);
                            await Promise.all([loadProtectedAdminData(), refreshStoreData()]);
                            notify('success', 'Review removed.');
                          } catch (err) {
                            notify('error', err instanceof Error ? err.message : 'Failed to delete review.');
                          }
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-[#651B32] text-white cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteKey(null)}
                        className="px-2 py-1.5 text-xs border border-[#292326]/20 text-[#292326] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteKey(`rev:${r.id}`)}
                      aria-label={`Delete review by ${r.reviewerName}`}
                      className="w-9 h-9 flex items-center justify-center border border-[#292326]/15 text-[#651B32] shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS & BANNERS */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white border border-[#292326]/10 p-6 sm:p-8 space-y-8 max-w-4xl"
        >
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#292326] mb-4">
              Homepage Banners & Copy
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Hero Headline</label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroHeadline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroHeadline: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Hero Supporting Text</label>
                <textarea
                  rows={2}
                  value={settingsForm.heroSubtext || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtext: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium">Hero Banner Image URL</label>
                  <label className="text-xs font-semibold text-[#651B32] cursor-pointer hover:underline">
                    Upload Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) =>
                        handleImageFileUpload(e, (url) =>
                          setSettingsForm((prev) => ({ ...prev, heroImage: url }))
                        )
                      }
                    />
                  </label>
                </div>
                <select
                  value={
                    PRESET_IMAGE_OPTIONS.some((o) => o.url === settingsForm.heroImage)
                      ? settingsForm.heroImage
                      : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      setSettingsForm({ ...settingsForm, heroImage: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20 bg-white mb-2"
                >
                  <option value="">Choose bundled preset or enter custom URL below...</option>
                  {PRESET_IMAGE_OPTIONS.map((opt) => (
                    <option key={opt.url} value={opt.url}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-3">
                  <BoutiqueImage
                    src={settingsForm.heroImage || BOUTIQUE_ASSETS.heroBridal}
                    alt="Hero Banner Preview"
                    className="w-20 h-14 object-cover border border-[#292326]/15 shrink-0"
                  />
                  <input
                    type="text"
                    value={settingsForm.heroImage || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroImage: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#292326]/20 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Bridal Section Title</label>
                  <input
                    type="text"
                    value={settingsForm.bridalBannerTitle || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, bridalBannerTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium">Bridal Banner Image URL</label>
                    <label className="text-xs font-semibold text-[#651B32] cursor-pointer hover:underline">
                      Upload Image
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(e) =>
                          handleImageFileUpload(e, (url) =>
                            setSettingsForm((prev) => ({ ...prev, bridalBannerImage: url }))
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <BoutiqueImage
                      src={settingsForm.bridalBannerImage || BOUTIQUE_ASSETS.bridalLehengas}
                      alt="Bridal Banner Preview"
                      className="w-12 h-10 object-cover border border-[#292326]/15 shrink-0"
                    />
                    <input
                      type="text"
                      value={settingsForm.bridalBannerImage || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, bridalBannerImage: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-[#292326]/20 font-mono"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Bridal Section Text</label>
                <textarea
                  rows={2}
                  value={settingsForm.bridalBannerText || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, bridalBannerText: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#292326]/10">
            <h2 className="font-display text-2xl font-semibold text-[#292326] mb-4">
              Contact Details & Business Verification
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={settingsForm.businessName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Showroom Address</label>
                <input
                  type="text"
                  required
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Primary Phone</label>
                <input
                  type="text"
                  required
                  value={settingsForm.primaryPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, primaryPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">WhatsApp Number (digits)</label>
                <input
                  type="text"
                  required
                  value={settingsForm.whatsappNumber}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
                <label className="flex items-center gap-2 text-xs mt-2 cursor-pointer text-[#651B32] font-medium">
                  <input
                    type="checkbox"
                    checked={settingsForm.whatsappConfirmed}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, whatsappConfirmed: e.target.checked })
                    }
                  />
                  <span>Confirm Verified WhatsApp Number (enables direct wa.me launch)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Alternative Phone</label>
                <input
                  type="text"
                  value={settingsForm.altPhone || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, altPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
                <label className="flex items-center gap-2 text-xs mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(settingsForm.altPhoneVerified)}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, altPhoneVerified: e.target.checked })
                    }
                  />
                  <span>Alternative Phone Confirmed</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Establishment Year</label>
                <input
                  type="text"
                  value={settingsForm.establishmentYear || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, establishmentYear: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
                <label className="flex items-center gap-2 text-xs mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.establishmentYearVerified}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        establishmentYearVerified: e.target.checked,
                      })
                    }
                  />
                  <span>Confirm & Display Establishment Year (e.g. 1989)</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Opening Hours</label>
                <input
                  type="text"
                  required
                  value={settingsForm.openingHours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
                <label className="flex items-center gap-2 text-xs mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.openingHoursVerified}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, openingHoursVerified: e.target.checked })
                    }
                  />
                  <span>Opening Hours Verified for Public Display</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Google Reviews Link</label>
                <input
                  type="url"
                  value={settingsForm.googleReviewsUrl || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, googleReviewsUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={settingsForm.instagramUrl || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">
                  Store Policies & Delivery Note
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.policiesNote || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, policiesNote: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#292326]/20"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold bg-[#651B32] text-white hover:bg-[#872D49] cursor-pointer"
          >
            {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            <span>Save & Publish Website Settings</span>
          </button>
        </form>
      )}
    </div>
  );
}
