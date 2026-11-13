import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, Phone, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sanitizeExternalUrl } from '../data/seedData';

export function Footer() {
  const { settings } = useStore();
  const [policyModal, setPolicyModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-[#292326] text-[#FAF6EF] border-t border-[#C6A15B]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div>
            <Link to="/" className="font-display text-3xl font-semibold text-[#FAF6EF] block mb-3">
              Kumar Saree Ghar
            </Link>
            <p className="text-xs tracking-wide text-[#C6A15B] mb-4">
              {settings.businessName}
            </p>
            <p className="text-sm text-[#FAF6EF]/75 leading-relaxed max-w-xs">
              Curated Indian ethnic wear in Laxmi Nagar, East Delhi — featuring heritage sarees,
              bridal lehengas, tailored suits, and contemporary Indo-Western silhouettes.
            </p>
            {settings.establishmentYearVerified && settings.establishmentYear && (
              <p className="text-xs text-[#C6A15B] mt-3">
                Serving Patrons Since {settings.establishmentYear}
              </p>
            )}
          </div>

          <div>
            <h4 className="font-display text-xl font-semibold text-[#FAF6EF] mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm text-[#FAF6EF]/75">
              <li>
                <Link to="/collections/designer-sarees" className="hover:text-[#C6A15B] transition-colors">
                  Designer Sarees
                </Link>
              </li>
              <li>
                <Link to="/collections/bridal-lehengas" className="hover:text-[#C6A15B] transition-colors">
                  Bridal Lehengas
                </Link>
              </li>
              <li>
                <Link to="/collections/lehengas" className="hover:text-[#C6A15B] transition-colors">
                  Lehenga Choli
                </Link>
              </li>
              <li>
                <Link to="/collections/suits" className="hover:text-[#C6A15B] transition-colors">
                  Suits & Kurtis
                </Link>
              </li>
              <li>
                <Link to="/collections/indo-western" className="hover:text-[#C6A15B] transition-colors">
                  Indo-Western
                </Link>
              </li>
              <li>
                <Link to="/collections/gowns" className="hover:text-[#C6A15B] transition-colors">
                  Evening Gowns
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xl font-semibold text-[#FAF6EF] mb-4">
              The Showroom
            </h4>
            <ul className="space-y-2.5 text-sm text-[#FAF6EF]/75">
              <li>
                <Link to="/about" className="hover:text-[#C6A15B] transition-colors">
                  About Kumar Saree Ghar
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-[#C6A15B] transition-colors">
                  Full Product Catalogue
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C6A15B] transition-colors">
                  Visit & Directions
                </Link>
              </li>
              <li>
                <a
                  href={sanitizeExternalUrl(settings.googleReviewsUrl, 'https://www.google.com/maps')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C6A15B] transition-colors"
                >
                  Google Reviews
                </a>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#C6A15B] transition-colors">
                  Boutique Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xl font-semibold text-[#FAF6EF] mb-4">
              Showroom Contact
            </h4>
            <ul className="space-y-3 text-sm text-[#FAF6EF]/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <a
                    href={`tel:${settings.primaryPhone.replace(/[^0-9+]/g, '')}`}
                    className="block hover:text-[#C6A15B] transition-colors tabular-nums"
                  >
                    {settings.primaryPhone}
                  </a>
                  {settings.altPhone && (
                    <span className="block text-xs text-[#FAF6EF]/60 tabular-nums">
                      {settings.altPhone}{' '}
                      {!settings.altPhoneVerified ? '(Pending Confirmation)' : ''}
                    </span>
                  )}
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C6A15B] shrink-0" />
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-[#C6A15B] transition-colors break-all"
                >
                  {settings.email}
                </a>
              </li>
              {sanitizeExternalUrl(settings.websiteUrl, '') && (
                <li className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#C6A15B] shrink-0" />
                  <a
                    href={sanitizeExternalUrl(settings.websiteUrl, '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#C6A15B] transition-colors"
                  >
                    {sanitizeExternalUrl(settings.websiteUrl, '').replace(/^https?:\/\//, '')}
                  </a>
                </li>
              )}
            </ul>

            {(sanitizeExternalUrl(settings.instagramUrl, '') ||
              sanitizeExternalUrl(settings.facebookUrl, '')) && (
              <div className="flex items-center gap-4 mt-5 text-xs text-[#C6A15B]">
                {sanitizeExternalUrl(settings.instagramUrl, '') && (
                  <a
                    href={sanitizeExternalUrl(settings.instagramUrl, '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Instagram
                  </a>
                )}
                {sanitizeExternalUrl(settings.facebookUrl, '') && (
                  <a
                    href={sanitizeExternalUrl(settings.facebookUrl, '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Facebook
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF6EF]/60">
          <p>© {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setPolicyModal('privacy')}
              className="hover:text-[#FAF6EF] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setPolicyModal('terms')}
              className="hover:text-[#FAF6EF] transition-colors cursor-pointer"
            >
              Store Policies & Terms
            </button>
          </div>
        </div>
      </div>

      {policyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FAF6EF] text-[#292326] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#292326]/15">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl font-semibold text-[#651B32]">
                {policyModal === 'privacy' ? 'Privacy Policy' : 'Store Policies & Terms'}
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                aria-label="Close policy dialog"
                className="w-9 h-9 flex items-center justify-center text-[#292326] hover:text-[#651B32]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {policyModal === 'privacy' ? (
              <div className="space-y-3 text-sm text-[#292326]/85 leading-relaxed">
                <p>
                  {settings.businessName} respects your privacy. Contact details submitted through
                  our enquiry forms (name, phone number, email, and garment preferences) are used
                  strictly to respond to your showroom or product enquiries.
                </p>
                <p>
                  This website integrates Google Maps features to provide showroom directions and
                  is subject to the Google Maps End User Additional Terms of Service and Google
                  Privacy Policy.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-[#292326]/85 leading-relaxed">
                <p>
                  {settings.policiesNote ||
                    'Payment methods, exchange terms, alterations, and delivery timelines are confirmed directly by our showroom team prior to purchase.'}
                </p>
                <p>
                  Displayed product photographs represent curated styles; exact fabric weaves,
                  shade availability, and pricing are confirmed upon enquiry or in-person visit at{' '}
                  {settings.address}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
