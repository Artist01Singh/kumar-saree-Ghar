import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { submitEnquiry } from '../lib/storeService';
import { useStore } from '../context/StoreContext';
import { ALL_CATALOGUE_CATEGORIES } from '../data/seedData';

interface EnquiryFormProps {
  defaultSubject?: string;
  defaultMessage?: string;
  sourcePage?: string;
  whatsappPendingNotice?: boolean;
  onSuccess?: () => void;
}

export function EnquiryForm({
  defaultSubject = 'General Collection Enquiry',
  defaultMessage = '',
  sourcePage = '/contact',
  whatsappPendingNotice = false,
  onSuccess,
}: EnquiryFormProps) {
  const { settings } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [productOrCategory, setProductOrCategory] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    setProductOrCategory(defaultSubject);
  }, [defaultSubject]);

  useEffect(() => {
    if (defaultMessage) {
      setMessage(defaultMessage);
    }
  }, [defaultMessage]);

  const validate = (): string | null => {
    if (customerName.trim().length < 2) {
      return 'Please enter your full name (at least 2 characters).';
    }
    const digits = phone.replace(/[^0-9+]/g, '');
    if (digits.length < 7 || digits.length > 20) {
      return 'Please enter a valid contact phone number.';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address or leave it blank.';
    }
    if (productOrCategory.trim().length < 1) {
      return 'Please select or enter a product or category.';
    }
    if (message.trim().length < 5) {
      return 'Please share a brief message about what you are looking for.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const id = await submitEnquiry({
        customerName,
        phone,
        email,
        productOrCategory,
        message,
        sourcePage,
      });
      setSubmittedId(id);
      setCustomerName('');
      setPhone('');
      setEmail('');
      setMessage('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? 'Unable to send your enquiry right now. Please call us directly on ' +
              settings.primaryPhone +
              '.'
          : 'Submission failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    const cleanDigits = settings.whatsappNumber.replace(/[^0-9]/g, '');
    return (
      <div className="bg-[#FAF6EF] border border-[#C6A15B]/40 p-6 sm:p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-[#651B32] mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="font-display text-2xl font-semibold text-[#292326] mb-2">
          Thank You — Enquiry Received
        </h3>
        <p className="text-sm text-[#81747A] max-w-md mx-auto mb-5">
          Our Laxmi Nagar showroom team has received your enquiry for{' '}
          <span className="text-[#292326] font-medium">{productOrCategory}</span> and will reach
          out shortly on the number provided.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={`tel:${settings.primaryPhone.replace(/[^0-9+]/g, '')}`}
            className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] transition-colors"
          >
            Call {settings.primaryPhone}
          </a>
          {settings.whatsappConfirmed && cleanDigits.length >= 10 && (
            <a
              href={`https://wa.me/${cleanDigits}?text=${encodeURIComponent(
                `Hello Kumar Saree Ghar, following up on my enquiry (${submittedId}) regarding ${productOrCategory}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold border border-[#292326]/20 text-[#292326] hover:border-[#651B32] hover:text-[#651B32] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => setSubmittedId(null)}
            className="text-xs font-medium text-[#81747A] underline hover:text-[#292326] px-2 py-2"
          >
            Send Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {whatsappPendingNotice && !settings.whatsappConfirmed && (
        <div className="bg-[#FAF6EF] border border-[#C6A15B]/50 p-3.5 text-xs text-[#292326] leading-relaxed">
          WhatsApp click-to-chat is pending final business number confirmation. Submit your enquiry
          below directly to our showroom team, or call us at{' '}
          <a href={`tel:${settings.primaryPhone.replace(/[^0-9+]/g, '')}`} className="font-semibold underline text-[#651B32]">
            {settings.primaryPhone}
          </a>
          .
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="bg-[#651B32]/8 border border-[#651B32]/30 text-[#651B32] px-4 py-3 text-xs font-medium"
        >
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ksg-enq-name" className="block text-xs font-medium text-[#292326] mb-1.5">
            Customer Name <span className="text-[#651B32]">*</span>
          </label>
          <input
            id="ksg-enq-name"
            type="text"
            required
            maxLength={120}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#292326]/20 text-[#292326] placeholder:text-[#81747A]/70 focus:outline-none focus:border-[#651B32]"
          />
        </div>

        <div>
          <label htmlFor="ksg-enq-phone" className="block text-xs font-medium text-[#292326] mb-1.5">
            Phone Number <span className="text-[#651B32]">*</span>
          </label>
          <input
            id="ksg-enq-phone"
            type="tel"
            required
            maxLength={25}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98XXX XXXXX"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#292326]/20 text-[#292326] placeholder:text-[#81747A]/70 focus:outline-none focus:border-[#651B32]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ksg-enq-email" className="block text-xs font-medium text-[#292326] mb-1.5">
            Email Address <span className="text-[#81747A]">(Optional)</span>
          </label>
          <input
            id="ksg-enq-email"
            type="email"
            maxLength={140}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#292326]/20 text-[#292326] placeholder:text-[#81747A]/70 focus:outline-none focus:border-[#651B32]"
          />
        </div>

        <div>
          <label htmlFor="ksg-enq-cat" className="block text-xs font-medium text-[#292326] mb-1.5">
            Product or Category <span className="text-[#651B32]">*</span>
          </label>
          <input
            id="ksg-enq-cat"
            list="ksg-enquiry-options"
            required
            maxLength={180}
            value={productOrCategory}
            onChange={(e) => setProductOrCategory(e.target.value)}
            placeholder="Select or type product / category"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#292326]/20 text-[#292326] placeholder:text-[#81747A]/70 focus:outline-none focus:border-[#651B32]"
          />
          <datalist id="ksg-enquiry-options">
            <option value="General Collection Enquiry" />
            <option value="Bridal Collection Consultation" />
            {ALL_CATALOGUE_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label htmlFor="ksg-enq-msg" className="block text-xs font-medium text-[#292326] mb-1.5">
          Message & Occasion Details <span className="text-[#651B32]">*</span>
        </label>
        <textarea
          id="ksg-enq-msg"
          rows={4}
          required
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your occasion, preferred colors, fabric, or visit date..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#292326]/20 text-[#292326] placeholder:text-[#81747A]/70 focus:outline-none focus:border-[#651B32]"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#651B32] text-white hover:bg-[#872D49] disabled:opacity-60 transition-colors cursor-pointer"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{submitting ? 'Sending Enquiry...' : 'Submit Showroom Enquiry'}</span>
      </button>
    </form>
  );
}
