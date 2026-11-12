import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, MessageCircle, Search, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { BoutiqueImage } from './BoutiqueImage';
import { formatINR } from './ProductCard';
import { EnquiryForm } from './EnquiryForm';

export function Overlays() {
  const {
    products,
    wishlistIds,
    toggleWishlist,
    wishlistDrawerOpen,
    setWishlistDrawerOpen,
    searchOpen,
    setSearchOpen,
    enquiryModalOpen,
    enquiryContext,
    closeEnquiryModal,
    triggerWhatsAppEnquiry,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 4);
    return products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.fabric && p.fabric.toLowerCase().includes(q)) ||
          (p.color && p.color.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [products, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate(searchQuery.trim() ? `/collections?q=${encodeURIComponent(searchQuery.trim())}` : '/collections');
  };

  return (
    <>
      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-[#292326]/55 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-[#FAF6EF] border border-[#292326]/15 shadow-2xl p-6 z-10"
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 border-b border-[#292326]/20 pb-3">
                <Search className="w-5 h-5 text-[#651B32] shrink-0" />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sarees, bridal lehengas, Anarkali suits, Indo-Western..."
                  className="flex-1 bg-transparent text-base text-[#292326] placeholder:text-[#81747A] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="w-9 h-9 flex items-center justify-center text-[#81747A] hover:text-[#292326]"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>

              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#81747A]">
                    {searchQuery.trim() ? 'Matching Pieces' : 'Suggested Collections'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-xs font-semibold text-[#651B32] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View All in Catalogue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <p className="text-sm text-[#81747A] py-6 text-center">
                    No matching pieces found. Try searching for Sarees, Lehengas, Suits, or Gowns.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto">
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-2 bg-white border border-[#292326]/8 hover:border-[#651B32]/40 transition-colors"
                      >
                        <BoutiqueImage
                          src={p.images[0]}
                          alt={p.title}
                          className="w-14 h-16 object-cover shrink-0 bg-[#F3ECE1]"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] text-[#81747A] truncate">{p.category}</p>
                          <p className="font-display text-base font-semibold text-[#292326] truncate">
                            {p.title}
                          </p>
                          <p className="text-xs text-[#651B32] mt-0.5">
                            {p.priceVerified && p.price ? formatINR(p.price) : 'Price on Enquiry'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wishlist Slide-Over Drawer */}
      <AnimatePresence>
        {wishlistDrawerOpen && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWishlistDrawerOpen(false)}
              className="fixed inset-0 bg-[#292326]/50 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[#FAF6EF] shadow-2xl flex flex-col justify-between p-6 z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#292326]/10">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#651B32]" />
                  <h2 className="font-display text-2xl font-semibold text-[#292326]">
                    Saved Wishlist ({wishlistProducts.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setWishlistDrawerOpen(false)}
                  aria-label="Close wishlist"
                  className="w-10 h-10 flex items-center justify-center text-[#292326]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <Heart className="w-8 h-8 text-[#C6A15B] mx-auto mb-3" strokeWidth={1.5} />
                    <p className="font-display text-xl font-semibold text-[#292326] mb-1">
                      Your Wishlist is Empty
                    </p>
                    <p className="text-sm text-[#81747A] mb-6">
                      Save your favourite sarees, lehengas, and occasion outfits to compare and enquire.
                    </p>
                    <Link
                      to="/collections"
                      onClick={() => setWishlistDrawerOpen(false)}
                      className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49]"
                    >
                      Explore Collections
                    </Link>
                  </div>
                ) : (
                  wishlistProducts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 bg-white p-3 border border-[#292326]/10"
                    >
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={() => setWishlistDrawerOpen(false)}
                        className="shrink-0"
                      >
                        <BoutiqueImage
                          src={item.images[0]}
                          alt={item.title}
                          className="w-16 h-20 object-cover bg-[#F3ECE1]"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#81747A]">{item.category}</p>
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={() => setWishlistDrawerOpen(false)}
                          className="font-display text-lg font-semibold text-[#292326] hover:text-[#651B32] block truncate"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs font-medium text-[#651B32] mt-0.5">
                          {item.priceVerified && item.price
                            ? formatINR(item.price)
                            : 'Price on Enquiry'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(item.id)}
                        aria-label={`Remove ${item.title} from wishlist`}
                        className="w-9 h-9 flex items-center justify-center text-[#81747A] hover:text-[#651B32]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {wishlistProducts.length > 0 && (
                <div className="pt-4 border-t border-[#292326]/10">
                  <button
                    type="button"
                    onClick={() => {
                      setWishlistDrawerOpen(false);
                      triggerWhatsAppEnquiry({
                        subject: `Wishlist Pieces (${wishlistProducts.map((w) => w.title).join(', ')})`,
                        sourcePage: window.location.pathname,
                      });
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold bg-[#651B32] text-white hover:bg-[#872D49]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enquire About Saved Pieces</span>
                  </button>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Enquiry Modal */}
      <AnimatePresence>
        {enquiryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEnquiryModal}
              className="fixed inset-0 bg-[#292326]/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl bg-[#FAF6EF] border border-[#292326]/15 shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto z-10"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-medium text-[#C6A15B] mb-1">
                    Kumar Saree Ghar Showroom Concierge
                  </p>
                  <h2 className="font-display text-3xl font-semibold text-[#292326]">
                    Product & Bridal Enquiry
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeEnquiryModal}
                  aria-label="Close enquiry dialog"
                  className="w-10 h-10 flex items-center justify-center text-[#292326] hover:text-[#651B32]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <EnquiryForm
                defaultSubject={enquiryContext?.productOrCategory || 'General Collection Enquiry'}
                defaultMessage={enquiryContext?.prefilledMessage || ''}
                sourcePage={enquiryContext?.sourcePage || window.location.pathname}
                whatsappPendingNotice={enquiryContext?.whatsappPendingNotice}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compact Sticky Floating WhatsApp / Enquiry Action */}
      <button
        type="button"
        onClick={() =>
          triggerWhatsAppEnquiry({
            subject: 'Showroom & Collection Enquiry',
            sourcePage: window.location.pathname,
          })
        }
        aria-label="Enquire on WhatsApp"
        className="fixed bottom-5 right-5 z-30 h-12 px-4 inline-flex items-center gap-2 bg-[#651B32] text-white shadow-lg border border-[#C6A15B]/50 hover:bg-[#872D49] transition-all duration-200 cursor-pointer"
      >
        <MessageCircle className="w-4 h-4 text-[#C6A15B]" />
        <span className="text-xs font-semibold hidden sm:inline">Enquire Now</span>
      </button>
    </>
  );
}
