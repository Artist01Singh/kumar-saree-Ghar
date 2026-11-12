import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Star,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { BOUTIQUE_ASSETS } from '../data/seedData';
import { BoutiqueImage } from '../components/BoutiqueImage';
import { ProductCard } from '../components/ProductCard';
import { StoreMap } from '../components/StoreMap';
import { SeoHead } from '../components/SeoHead';

const FAQS = [
  {
    question: 'Where is the Kumar Saree Ghar showroom located?',
    answer:
      'Our showroom is located at H-1, Vijay Chowk, Laxmi Nagar, Delhi – 110092, India. You can use the interactive map and Directions link in the Store Information section below to plan your visit.',
  },
  {
    question: 'How can I enquire about pricing, fabric details, or piece availability?',
    answer:
      'Click "Enquire" on any product card or product detail page to send us a direct showroom enquiry with the garment name, or call us on +91 99718 72666. Where verified prices are listed, they appear directly on the product page.',
  },
  {
    question: 'Do you offer bridal trousseau consultations?',
    answer:
      'Yes. We welcome brides and families at our Laxmi Nagar showroom for personalized bridal saree, lehenga, and occasion ensemble viewings. Use the Bridal Enquiry button to schedule a conversation with our team.',
  },
  {
    question: 'How are alterations, payment methods, and delivery timelines handled?',
    answer:
      'Custom tailoring, blouse stitching, payment methods, exchange terms, and delivery timelines are confirmed transparently in-store or over the phone prior to finalizing any order.',
  },
  {
    question: 'Can I save outfits before visiting the store?',
    answer:
      'Yes. Tap the heart icon on any piece across our catalogue to save it to your Wishlist, then share or enquire about your saved shortlist directly before your showroom visit.',
  },
];

export function HomePage() {
  const { products, categories, gallery, settings, reviews, openEnquiryModal, triggerWhatsAppEnquiry } =
    useStore();
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; caption: string } | null>(
    null
  );

  const featuredCategories = categories.filter((c) => c.featured).slice(0, 6);
  const featuredProducts = products.filter((p) => p.featured).slice(0, 6);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${settings.businessName}, ${settings.address}`
  )}`;

  return (
    <div>
      <SeoHead
        title="Kumar Saree Ghar — Luxury Sarees & Bridal Lehengas in Laxmi Nagar, Delhi"
        description="Discover the art of Indian elegance at Kumar Saree Ghar Pvt. Ltd. in Laxmi Nagar, East Delhi. Shop curated designer sarees, bridal lehengas, suits, kurtis, and Indo-Western wear."
        settings={settings}
      />

      {/* 1. Hero Section */}
      <section className="relative min-h-[78vh] lg:min-h-[84vh] flex items-end lg:items-center overflow-hidden bg-[#292326]">
        <BoutiqueImage
          src={settings.heroImage || BOUTIQUE_ASSETS.heroBridal}
          alt="Luxury burgundy Banarasi silk saree worn in heritage sandstone courtyard — Kumar Saree Ghar"
          eager
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#292326]/85 via-[#292326]/55 to-[#292326]/20"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#292326]/80 via-transparent to-transparent lg:hidden"
        />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-[#C6A15B] mb-4">
              {settings.businessName} · Laxmi Nagar, Delhi
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#FAF6EF] leading-[1.08] tracking-tight [text-wrap:balance] mb-5">
              {settings.heroHeadline || 'Discover the Art of Indian Elegance.'}
            </h1>
            <p className="text-base sm:text-lg text-[#FAF6EF]/90 leading-relaxed max-w-xl mb-8">
              {settings.heroSubtext ||
                'A destination in East Delhi for heritage sarees, bridal lehengas, tailored suits, and contemporary Indo-Western silhouettes.'}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/collections"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold bg-[#651B32] text-white border border-[#C6A15B]/40 hover:bg-[#872D49] transition-colors whitespace-nowrap"
              >
                <span>Explore Collections</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() =>
                  openEnquiryModal({
                    productOrCategory: 'General Collection Enquiry',
                    sourcePage: '/',
                  })
                }
                className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold bg-[#FAF6EF]/10 backdrop-blur-sm text-[#FAF6EF] border border-[#FAF6EF]/40 hover:bg-[#FAF6EF] hover:text-[#292326] transition-colors whitespace-nowrap cursor-pointer"
              >
                Enquire Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Featured Collections */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-12">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-[#81747A] mb-2">
              Curated Categories
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326]">
              Featured Collections
            </h2>
          </div>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#651B32] hover:text-[#872D49] transition-colors"
          >
            <span>Browse Full Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/collections/${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-[#292326] block"
            >
              <BoutiqueImage
                src={cat.coverImage}
                alt={`${cat.name} collection at Kumar Saree Ghar`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#292326]/85 via-[#292326]/20 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-2xl font-semibold text-[#FAF6EF] mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#FAF6EF]/85 line-clamp-2 mb-3">{cat.description}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C6A15B] group-hover:translate-x-1 transition-transform">
                  <span>View Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="py-16 md:py-24 bg-white border-y border-[#292326]/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-12">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-[#81747A] mb-2">
                Showroom Highlights
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326]">
                Featured Pieces
              </h2>
            </div>
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#651B32] hover:text-[#872D49] transition-colors"
            >
              <span>View All Pieces</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Brand Story */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          <div className="lg:col-span-6 relative min-h-[340px] lg:min-h-[460px] overflow-hidden bg-[#EBDDC8]">
            <BoutiqueImage
              src={BOUTIQUE_ASSETS.boutiqueInterior}
              alt="Kumar Saree Ghar flagship showroom interior at Vijay Chowk, Laxmi Nagar"
              className="w-full h-full object-cover lg:absolute lg:inset-0"
            />
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-medium tracking-widest uppercase text-[#C6A15B] mb-3">
              Our Identity
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326] [text-wrap:balance] mb-5">
              Draping Generations in Timeless Indian Craft
            </h2>
            <p className="text-base text-[#292326]/85 leading-relaxed mb-4">
              {settings.businessName} is an established ethnic wear destination situated at H-1,
              Vijay Chowk, Laxmi Nagar, East Delhi. We bring together traditional Indian handloom
              heritage and contemporary celebratory silhouettes under one roof.
            </p>
            <p className="text-base text-[#81747A] leading-relaxed mb-6">
              From richly woven bridal sarees and zardozi lehengas to refined Anarkali suits,
              kurtis, and Indo-Western evening gowns, every garment is selected for graceful drape,
              textile integrity, and enduring occasion appeal.
            </p>
            {settings.establishmentYearVerified && settings.establishmentYear && (
              <p className="text-sm font-medium text-[#651B32] mb-6">
                Established in {settings.establishmentYear} · H-1, Vijay Chowk, Laxmi Nagar
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#651B32] text-white hover:bg-[#872D49] transition-colors"
              >
                <span>Read Our Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 text-sm font-semibold border border-[#292326]/20 text-[#292326] hover:border-[#651B32] hover:text-[#651B32] transition-colors"
              >
                Visit the Showroom
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bridal & Occasion Wear */}
      <section className="bg-[#651B32] text-[#FAF6EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <p className="text-xs font-medium tracking-widest uppercase text-[#C6A15B] mb-3">
                Bridal & Celebration Edit
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-semibold text-[#FAF6EF] [text-wrap:balance] mb-5">
                {settings.bridalBannerTitle || 'The Bridal & Celebration Trousseau'}
              </h2>
              <p className="text-base text-[#FAF6EF]/85 leading-relaxed mb-8 max-w-xl">
                {settings.bridalBannerText ||
                  'Visit our Vijay Chowk showroom for personalized bridal consultations, handloom silk selections, and occasion ensemble styling.'}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/collections/bridal-lehengas"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#FAF6EF] text-[#292326] hover:bg-[#C6A15B] hover:text-[#292326] transition-colors"
                >
                  <span>Explore Bridal Lehengas</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    openEnquiryModal({
                      productOrCategory: 'Bridal Collection Consultation',
                      prefilledMessage:
                        'Hello Kumar Saree Ghar, I would like to enquire about viewing your Bridal Lehenga and Bridal Saree collection at your Laxmi Nagar showroom.',
                      sourcePage: '/bridal-section',
                    })
                  }
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border border-[#C6A15B] text-[#FAF6EF] hover:bg-[#872D49] transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#C6A15B]" />
                  <span>Bridal Enquiry</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="aspect-[4/3] lg:aspect-[5/4] overflow-hidden border border-[#C6A15B]/30">
                <BoutiqueImage
                  src={settings.bridalBannerImage || BOUTIQUE_ASSETS.bridalLehengas}
                  alt="Indian Bridal Couture Lehenga at Kumar Saree Ghar"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-widest uppercase text-[#81747A] mb-2">
              Showroom Experience
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326] mb-8">
              Why Families Shop at Kumar Saree Ghar
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="pt-4 border-t border-[#292326]/15">
                <h3 className="font-display text-2xl font-semibold text-[#651B32] mb-2">
                  01. Diverse Occasion Range
                </h3>
                <p className="text-sm text-[#81747A] leading-relaxed">
                  From traditional bridal sarees and heavy lehengas to festive Anarkalis, kurtis,
                  and Indo-Western reception gowns in one East Delhi showroom.
                </p>
              </div>

              <div className="pt-4 border-t border-[#292326]/15">
                <h3 className="font-display text-2xl font-semibold text-[#651B32] mb-2">
                  02. Central Laxmi Nagar Address
                </h3>
                <p className="text-sm text-[#81747A] leading-relaxed">
                  Conveniently situated at H-1, Vijay Chowk in Laxmi Nagar for wedding shoppers
                  across East Delhi and NCR.
                </p>
              </div>

              <div className="pt-4 border-t border-[#292326]/15">
                <h3 className="font-display text-2xl font-semibold text-[#651B32] mb-2">
                  03. Guided In-Store Styling
                </h3>
                <p className="text-sm text-[#81747A] leading-relaxed">
                  Dedicated staff assistance to help inspect weaves, drape sarees, compare colors,
                  and coordinate family wedding attire.
                </p>
              </div>

              <div className="pt-4 border-t border-[#292326]/15">
                <h3 className="font-display text-2xl font-semibold text-[#651B32] mb-2">
                  04. Direct Showroom Communication
                </h3>
                <p className="text-sm text-[#81747A] leading-relaxed">
                  Speak directly with our showroom desk on {settings.primaryPhone} to confirm piece
                  availability, verified pricing, and visit details.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[4/3] overflow-hidden border border-[#292326]/10 bg-[#F3ECE1]">
              <BoutiqueImage
                src={BOUTIQUE_ASSETS.zariCraft}
                alt="Close-up of fine Indian gold zari weaving and zardozi craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Fashion Gallery */}
      <section className="py-16 md:py-24 bg-white border-y border-[#292326]/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-12">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-[#81747A] mb-2">
                Lookbook & Textures
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326]">
                Editorial Fashion Gallery
              </h2>
            </div>
            <p className="text-sm text-[#81747A] max-w-md">
              Select any photograph to inspect silhouettes, textile drapes, and embroidery craftsmanship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setLightboxImage({
                    src: item.imageUrl,
                    title: item.title,
                    caption: item.caption,
                  })
                }
                className="group text-left bg-[#FAF6EF] border border-[#292326]/10 overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-[#651B32]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#F3ECE1]">
                  <BoutiqueImage
                    src={item.imageUrl}
                    alt={`${item.title} — ${item.category}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#81747A] mb-1">{item.category}</p>
                  <h3 className="font-display text-xl font-semibold text-[#292326] group-hover:text-[#651B32] transition-colors">
                    {item.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews (Genuine Verified Only) */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-[#81747A] mb-2">
              Patron Feedback
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326]">
              Verified Customer Reviews
            </h2>
          </div>
          <a
            href={
              settings.googleReviewsUrl ||
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${settings.businessName} ${settings.address}`
              )}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border border-[#292326]/20 text-[#292326] hover:border-[#651B32] hover:text-[#651B32] transition-colors w-fit"
          >
            <span>View Google Reviews</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white border border-[#292326]/10 p-8 sm:p-12 text-center max-w-3xl mx-auto">
            <Star className="w-7 h-7 text-[#C6A15B] mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="font-display text-2xl font-semibold text-[#292326] mb-2">
              Genuine Patron Reviews Only
            </h3>
            <p className="text-sm text-[#81747A] leading-relaxed max-w-xl mx-auto mb-6">
              We publish only verified customer reviews confirmed by our showroom team. Read
              authenticated patron feedback directly on Google Maps or share your experience after
              visiting our Laxmi Nagar store.
            </p>
            <a
              href={
                settings.googleReviewsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${settings.businessName} ${settings.address}`
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] transition-colors"
            >
              <span>Read & Leave a Google Review</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <article key={rev.id} className="bg-white border border-[#292326]/10 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[#C6A15B] mb-3" aria-label={`${rev.rating} out of 5 stars`}>
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-[#C6A15B]" />
                    ))}
                  </div>
                  <p className="text-sm text-[#292326]/90 leading-relaxed mb-5">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="pt-4 border-t border-[#292326]/8 text-xs">
                  <p className="font-semibold text-[#292326]">{rev.reviewerName}</p>
                  <p className="text-[#81747A] mt-0.5">
                    {rev.occasion ? `${rev.occasion} · ` : ''}
                    {rev.verifiedSource}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 9. Store Information & Google Maps */}
      <section className="py-16 md:py-24 bg-white border-y border-[#292326]/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <p className="text-xs font-medium tracking-widest uppercase text-[#81747A] mb-2">
                  Visit Our Flagship
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326]">
                  Laxmi Nagar Showroom
                </h2>
              </div>

              <div className="space-y-4 text-sm text-[#292326]">
                <div className="flex items-start gap-3 pb-4 border-b border-[#292326]/10">
                  <MapPin className="w-5 h-5 text-[#651B32] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#292326] mb-0.5">Showroom Address</p>
                    <p className="text-[#81747A] leading-relaxed">{settings.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b border-[#292326]/10">
                  <Clock className="w-5 h-5 text-[#651B32] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#292326] mb-0.5">Opening Hours</p>
                    <p className="text-[#81747A]">
                      {settings.openingHours}
                      {!settings.openingHoursVerified && (
                        <span className="block text-xs text-[#651B32] mt-1">
                          Verification pending — call {settings.primaryPhone} before visiting.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b border-[#292326]/10">
                  <Phone className="w-5 h-5 text-[#651B32] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#292326] mb-0.5">Phone</p>
                    <a
                      href={`tel:${settings.primaryPhone.replace(/[^0-9+]/g, '')}`}
                      className="text-[#651B32] font-semibold hover:underline tabular-nums"
                    >
                      {settings.primaryPhone}
                    </a>
                    {settings.altPhone && (
                      <p className="text-xs text-[#81747A] mt-1 tabular-nums">
                        Landline: {settings.altPhone}{' '}
                        {!settings.altPhoneVerified ? '(Pending Confirmation)' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#651B32] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#292326] mb-0.5">Email</p>
                    <a href={`mailto:${settings.email}`} className="text-[#81747A] hover:text-[#651B32]">
                      {settings.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>
                <a
                  href={`tel:${settings.primaryPhone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold border border-[#292326]/20 text-[#292326] hover:border-[#651B32] hover:text-[#651B32] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Showroom</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <StoreMap
                businessName={settings.businessName}
                address={settings.address}
                phone={settings.primaryPhone}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ Section */}
      <section className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-medium tracking-widest uppercase text-[#81747A] mb-2">
            Helpful Information
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-[#292326]/12 border-y border-[#292326]/12">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full py-5 flex items-center justify-between gap-4 text-left cursor-pointer group"
                >
                  <span className="font-display text-xl sm:text-2xl font-semibold text-[#292326] group-hover:text-[#651B32] transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#651B32] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pb-5 pr-8 text-sm text-[#81747A] leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. Final CTA */}
      <section className="py-16 md:py-20 bg-[#292326] text-[#FAF6EF] text-center px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-medium tracking-widest uppercase text-[#C6A15B] mb-3">
            Kumar Saree Ghar Pvt. Ltd.
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#FAF6EF] [text-wrap:balance] mb-5">
            Find Your Perfect Ethnic Look.
          </h2>
          <p className="text-base text-[#FAF6EF]/80 leading-relaxed mb-8">
            Explore our curated ethnic collections online or visit us at H-1, Vijay Chowk, Laxmi
            Nagar for personal styling assistance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold bg-[#651B32] text-white hover:bg-[#872D49] transition-colors"
            >
              <span>Browse Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() =>
                triggerWhatsAppEnquiry({
                  subject: 'Personal Styling & Showroom Enquiry',
                  sourcePage: '/',
                })
              }
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold border border-[#C6A15B] text-[#FAF6EF] hover:bg-[#C6A15B] hover:text-[#292326] transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enquire via WhatsApp</span>
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#FAF6EF] border border-[#292326]/20 shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              aria-label="Close image preview"
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 flex items-center justify-center text-[#292326] hover:text-[#651B32]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[75vh] overflow-hidden bg-[#292326]">
              <BoutiqueImage
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="w-full h-full max-h-[75vh] object-contain mx-auto"
              />
            </div>
            <div className="p-5">
              <h3 className="font-display text-2xl font-semibold text-[#292326]">
                {lightboxImage.title}
              </h3>
              <p className="text-sm text-[#81747A] mt-1">{lightboxImage.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
