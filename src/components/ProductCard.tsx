import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { BoutiqueImage } from './BoutiqueImage';

interface ProductCardProps {
  product: Product;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductCard({ product }: ProductCardProps) {
  const { isWishlisted, toggleWishlist, triggerWhatsAppEnquiry } = useStore();
  const saved = isWishlisted(product.id);
  const productUrl = `${window.location.origin}/product/${product.slug}`;

  return (
    <article className="group bg-white border border-[#292326]/10 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(41,35,38,0.08)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F3ECE1]">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <BoutiqueImage
            src={product.images[0]}
            alt={`${product.title} — ${product.category} at Kumar Saree Ghar`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={saved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm text-[#292326] hover:text-[#651B32] transition-colors focus-visible:outline-2 focus-visible:outline-[#651B32]"
        >
          <Heart
            className={`w-4 h-4 ${saved ? 'fill-[#651B32] text-[#651B32]' : ''}`}
            strokeWidth={1.75}
          />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#81747A] tracking-wide mb-1.5">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.availability}</span>
          </div>

          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-display text-xl font-semibold text-[#292326] leading-snug group-hover:text-[#651B32] transition-colors line-clamp-2">
              {product.title}
            </h3>
          </Link>

          {product.fabric && (
            <p className="text-xs text-[#81747A] mt-1.5 line-clamp-1">{product.fabric}</p>
          )}
        </div>

        <div className="pt-3 border-t border-[#292326]/8">
          <div className="flex items-baseline justify-between mb-3">
            {product.priceVerified && product.price && product.price > 0 ? (
              <span className="text-base font-semibold text-[#292326] tabular-nums">
                {formatINR(product.price)}
              </span>
            ) : (
              <span className="text-sm font-medium text-[#651B32]">Price on Enquiry</span>
            )}
            {product.color && (
              <span className="text-xs text-[#81747A] truncate max-w-[55%]">{product.color}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to={`/product/${product.slug}`}
              className="inline-flex items-center justify-center px-3 py-2.5 text-xs font-semibold text-[#292326] border border-[#292326]/20 hover:border-[#651B32] hover:text-[#651B32] transition-colors whitespace-nowrap"
            >
              View Product
            </Link>
            <button
              type="button"
              onClick={() =>
                triggerWhatsAppEnquiry({
                  subject: product.title,
                  productUrl,
                  sourcePage: `/product/${product.slug}`,
                })
              }
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Enquire</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
