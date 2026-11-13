import React from 'react';
import { Clock, Globe, Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sanitizeExternalUrl } from '../data/seedData';
import { EnquiryForm } from '../components/EnquiryForm';
import { StoreMap } from '../components/StoreMap';
import { SeoHead } from '../components/SeoHead';

export function ContactPage() {
  const { settings, triggerWhatsAppEnquiry } = useStore();

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${settings.businessName}, ${settings.address}`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <SeoHead
        title="Contact & Directions — Kumar Saree Ghar, Laxmi Nagar, Delhi"
        description={`Visit Kumar Saree Ghar Pvt. Ltd. at ${settings.address}. Call ${settings.primaryPhone} or send an enquiry for sarees, bridal lehengas, suits, and gowns.`}
        settings={settings}
      />

      <div className="border-b border-[#292326]/12 pb-8 mb-12">
        <p className="text-xs font-medium tracking-widest uppercase text-[#C6A15B] mb-2">
          Showroom & Concierge
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#292326] mb-3">
          Visit & Enquire
        </h1>
        <p className="text-sm sm:text-base text-[#81747A] max-w-2xl">
          Reach out to our Laxmi Nagar showroom for piece availability, bridal consultations, or
          visit directions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-16">
        {/* Left: Store Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#292326]/10 p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-2xl font-semibold text-[#292326]">
              {settings.businessName}
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#651B32] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#292326]">Address</p>
                  <p className="text-[#81747A] leading-relaxed mt-0.5">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#651B32] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#292326]">Phone</p>
                  <a
                    href={`tel:${settings.primaryPhone.replace(/[^0-9+]/g, '')}`}
                    className="text-[#651B32] font-semibold hover:underline block mt-0.5 tabular-nums"
                  >
                    {settings.primaryPhone}
                  </a>
                  {settings.altPhone && (
                    <p className="text-xs text-[#81747A] mt-1 tabular-nums">
                      Alt: {settings.altPhone}{' '}
                      {!settings.altPhoneVerified ? '(Pending Confirmation)' : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#651B32] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#292326]">Email</p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-[#81747A] hover:text-[#651B32] block mt-0.5"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#651B32] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#292326]">Opening Hours</p>
                  <p className="text-[#81747A] mt-0.5">{settings.openingHours}</p>
                  {!settings.openingHoursVerified && (
                    <p className="text-xs text-[#651B32] mt-1">
                      Please call ahead to confirm daily showroom timings.
                    </p>
                  )}
                </div>
              </div>

              {sanitizeExternalUrl(settings.websiteUrl, '') && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-[#651B32] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#292326]">Website</p>
                    <a
                      href={sanitizeExternalUrl(settings.websiteUrl, '')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#81747A] hover:text-[#651B32] block mt-0.5"
                    >
                      {sanitizeExternalUrl(settings.websiteUrl, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#292326]/10 flex flex-wrap gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Directions</span>
              </a>
              <button
                type="button"
                onClick={() =>
                  triggerWhatsAppEnquiry({
                    subject: 'Showroom Visit & Enquiry',
                    sourcePage: '/contact',
                  })
                }
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold border border-[#292326]/20 text-[#292326] hover:border-[#651B32] hover:text-[#651B32] transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Enquiry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Enquiry Form */}
        <div className="lg:col-span-7 bg-white border border-[#292326]/10 p-6 sm:p-8">
          <h2 className="font-display text-3xl font-semibold text-[#292326] mb-2">
            Send a Showroom Enquiry
          </h2>
          <p className="text-sm text-[#81747A] mb-6">
            Share the collection or garment you are interested in and our team will respond promptly.
          </p>
          <EnquiryForm sourcePage="/contact" />
        </div>
      </div>

      {/* Interactive Map */}
      <div>
        <h2 className="font-display text-3xl font-semibold text-[#292326] mb-4">
          Showroom Location Map
        </h2>
        <StoreMap
          businessName={settings.businessName}
          address={settings.address}
          phone={settings.primaryPhone}
        />
      </div>
    </div>
  );
}
