import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Heart, Menu, MessageCircle, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../context/StoreContext';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Collections', to: '/collections' },
  { label: 'Sarees', to: '/collections/sarees' },
  { label: 'Lehengas', to: '/collections/lehengas' },
  { label: 'Suits & Kurtis', to: '/collections/suits' },
  { label: 'Indo-Western', to: '/collections/indo-western' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function Header() {
  const {
    wishlistIds,
    setWishlistDrawerOpen,
    setSearchOpen,
    triggerWhatsAppEnquiry,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF6EF]/95 backdrop-blur-md border-b border-[#292326]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4 lg:gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden w-11 h-11 -ml-2 flex items-center justify-center text-[#292326] hover:text-[#651B32] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/"
              className="font-display text-2xl md:text-[26px] font-semibold tracking-tight text-[#651B32] whitespace-nowrap shrink-0"
            >
              Kumar Saree Ghar
            </Link>
          </div>

          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-5 xl:gap-6 text-[13px] font-medium text-[#292326]"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative py-1 whitespace-nowrap shrink-0 transition-colors hover:text-[#651B32] ${
                    isActive
                      ? 'text-[#651B32] after:content-[""] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1.5px] after:bg-[#C6A15B]'
                      : 'text-[#292326]/85'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search collections"
              className="w-10 h-10 flex items-center justify-center text-[#292326] hover:text-[#651B32] transition-colors cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              onClick={() => setWishlistDrawerOpen(true)}
              aria-label="Open saved wishlist"
              className="relative w-10 h-10 flex items-center justify-center text-[#292326] hover:text-[#651B32] transition-colors cursor-pointer"
            >
              <Heart className="w-[18px] h-[18px]" strokeWidth={1.75} />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1.5 right-1 min-w-[16px] h-4 px-1 bg-[#651B32] text-white text-[10px] font-semibold flex items-center justify-center rounded-full tabular-nums">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                triggerWhatsAppEnquiry({
                  subject: 'Boutique Collection Enquiry',
                  sourcePage: window.location.pathname,
                })
              }
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Enquiry</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#292326]/50 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 w-[84%] max-w-sm bg-[#FAF6EF] shadow-2xl flex flex-col justify-between p-6 overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#292326]/10">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-display text-2xl font-semibold text-[#651B32]"
                  >
                    Kumar Saree Ghar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="w-11 h-11 flex items-center justify-center text-[#292326]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav aria-label="Mobile Navigation" className="mt-6 flex flex-col space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `py-3 px-2 text-base font-medium border-b border-[#292326]/6 transition-colors ${
                          isActive ? 'text-[#651B32]' : 'text-[#292326]'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="pt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    triggerWhatsAppEnquiry({
                      subject: 'Boutique Collection Enquiry',
                      sourcePage: window.location.pathname,
                    });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold bg-[#651B32] text-white hover:bg-[#872D49]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Enquiry</span>
                </button>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-xs text-[#81747A] hover:text-[#651B32] py-2"
                >
                  Boutique Admin Portal
                </Link>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
