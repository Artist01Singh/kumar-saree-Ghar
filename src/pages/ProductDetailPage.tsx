import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BoutiqueImage } from '../components/BoutiqueImage';
import { formatINR, ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';
import { slugify } from '../lib/storeService';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    products,
    settings,
    loading,
    isWishlisted,
    toggleWishlist,
    openEnquiryModal,
    triggerWhatsAppEnquiry,
  } = useStore();

  const product = useMemo(
    () => products.find((p) => p.slug === slug || p.id === slug) || null,
    [products, slug]
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    setActiveImageIdx(0);
    setSelectedSize(product?.sizes?.[0] || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, product?.id]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id)
      .sort((a, b) => (a.category === product.category ? -1 : b.category === product.category ? 1 : 0))
      .slice(0, 3);
  }, [products, product]);

  if (loading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
          <div className="lg:col-span-7 aspect-[3/4] bg-[#F3ECE1]" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-5 w-1/3 bg-[#F3ECE1]" />
            <div className="h-10 w-3/4 bg-[#F3ECE1]" />
            <div className="h-24 w-full bg-[#F3ECE1]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <SeoHead
          title="Product Not Found — Kumar Saree Ghar"
          description="Explore our ethnic wear catalogue at Kumar Saree Ghar, Laxmi Nagar, Delhi."
          settings={settings}
        />
        <h1 className="font-display text-4xl font-semibold text-[#292326] mb-3">
          Piece Unavailable or Moved
        </h1>
        <p className="text-sm text-[#81747A] mb-8">
          This specific design is not currently listed online. Browse our active catalogue or
          contact our showroom directly.
        </p>
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#651B32] text-white hover:bg-[#872D49]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Collections</span>
        </Link>
      </div>
    );
  }

  const saved = isWishlisted(product.id);
  const images = product.images.length > 0 ? product.images : [''];
  const productUrl = `${window.location.origin}/product/${product.slug}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <SeoHead
        title={`${product.title} — ${product.category} | Kumar Saree Ghar`}
        description={product.description.slice(0, 155)}
        settings={settings}
        product={product}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#81747A] mb-8">
        <Link to="/" className="hover:text-[#651B32]">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={`/collections/${slugify(product.category)}`} className="hover:text-[#651B32]">
          {product.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#292326] truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Multi-Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] bg-[#F3ECE1] overflow-hidden border border-[#292326]/10">
            <BoutiqueImage
              src={images[activeImageIdx]}
              alt={`${product.title} view ${activeImageIdx + 1}`}
              eager
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length)
                  }
                  aria-label="Previous product image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center text-[#292326] hover:text-[#651B32] shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIdx((prev) => (prev + 1) % images.length)}
                  aria-label="Next product image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center text-[#292326] hover:text-[#651B32] shadow-sm cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-[3/4] overflow-hidden border-2 transition-colors cursor-pointer ${
                    activeImageIdx === idx ? 'border-[#651B32]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <BoutiqueImage
                    src={img}
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase / Enquiry Module */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 bg-white border border-[#292326]/10 p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#81747A] mb-2">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#651B32] font-medium">{product.availability}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326] leading-tight">
              {product.title}
            </h1>
            <div className="mt-4">
              {product.priceVerified && product.price && product.price > 0 ? (
                <p className="text-2xl font-semibold text-[#292326] tabular-nums">
                  {formatINR(product.price)}
                </p>
              ) : (
                <p className="text-base font-semibold text-[#651B32]">
                  Price Available on Showroom Enquiry
                </p>
              )}
            </div>
          </div>

          <p className="text-sm text-[#292326]/85 leading-relaxed border-t border-[#292326]/10 pt-5">
            {product.description}
          </p>

          <dl className="space-y-3 text-sm border-t border-[#292326]/10 pt-5">
            {product.fabric && (
              <div className="flex justify-between gap-4">
                <dt className="text-[#81747A]">Fabric</dt>
                <dd className="text-[#292326] font-medium text-right">{product.fabric}</dd>
              </div>
            )}
            {product.workDetails && (
              <div className="flex justify-between gap-4">
                <dt className="text-[#81747A]">Craft & Work</dt>
                <dd className="text-[#292326] font-medium text-right">{product.workDetails}</dd>
              </div>
            )}
            {product.color && (
              <div className="flex justify-between gap-4">
                <dt className="text-[#81747A]">Color Palette</dt>
                <dd className="text-[#292326] font-medium text-right">{product.color}</dd>
              </div>
            )}
          </dl>

          {product.sizes && product.sizes.length > 0 && (
            <div className="border-t border-[#292326]/10 pt-5">
              <p className="text-xs font-medium text-[#81747A] mb-2.5">
                Available Sizing / Format
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-2 text-xs font-semibold border transition-colors cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#651B32] text-white border-[#651B32]'
                        : 'bg-[#FAF6EF] text-[#292326] border-[#292326]/15 hover:border-[#651B32]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() =>
                triggerWhatsAppEnquiry({
                  subject: selectedSize ? `${product.title} (${selectedSize})` : product.title,
                  productUrl,
                  sourcePage: `/product/${product.slug}`,
                })
              }
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold bg-[#651B32] text-white hover:bg-[#872D49] transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enquire on WhatsApp</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  openEnquiryModal({
                    productOrCategory: product.title,
                    prefilledMessage: `Hello Kumar Saree Ghar, I would like details on "${product.title}"${
                      selectedSize ? ` (${selectedSize})` : ''
                    }. Link: ${productUrl}`,
                    sourcePage: `/product/${product.slug}`,
                  })
                }
                className="inline-flex items-center justify-center px-4 py-3 text-xs font-semibold border border-[#292326]/20 text-[#292326] hover:border-[#651B32] hover:text-[#651B32] transition-colors cursor-pointer"
              >
                Request Callback
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold border border-[#292326]/20 text-[#292326] hover:border-[#651B32] hover:text-[#651B32] transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${saved ? 'fill-[#651B32] text-[#651B32]' : ''}`}
                />
                <span>{saved ? 'Saved' : 'Save Piece'}</span>
              </button>
            </div>
          </div>

          <div className="bg-[#FAF6EF] p-4 text-xs text-[#81747A] space-y-2 border border-[#292326]/8">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#651B32] shrink-0 mt-0.5" />
              <span>Available to view at {settings.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#651B32] shrink-0" />
              <a
                href={`tel:${settings.primaryPhone.replace(/[^0-9+]/g, '')}`}
                className="text-[#292326] font-medium hover:text-[#651B32] tabular-nums"
              >
                Showroom Desk: {settings.primaryPhone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-14 border-t border-[#292326]/12">
          <h2 className="font-display text-3xl font-semibold text-[#292326] mb-8">
            Complementary Selections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
