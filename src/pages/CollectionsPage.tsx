import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ALL_CATALOGUE_CATEGORIES } from '../data/seedData';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';
import { slugify } from '../lib/storeService';

type SortOption = 'featured' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export function CollectionsPage() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products, settings, loading } = useStore();

  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (!categorySlug) {
      setSelectedCategory('All');
      return;
    }
    const matched = ALL_CATALOGUE_CATEGORIES.find((c) => slugify(c) === categorySlug);
    if (matched) {
      setSelectedCategory(matched);
    } else {
      setSelectedCategory('All');
    }
  }, [categorySlug]);

  const verifiedPriceCeiling = useMemo(() => {
    const verifiedPrices = products
      .filter((p) => p.priceVerified && typeof p.price === 'number' && p.price > 0)
      .map((p) => p.price as number);
    return verifiedPrices.length > 0 ? Math.max(...verifiedPrices) : null;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = products.filter((p) => {
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Suits' && p.category === 'Anarkali Suits') {
          // Include Suits & Anarkali Suits when filtering broadly under Suits
        } else if (selectedCategory === 'Sarees' && (p.category === 'Designer Sarees' || p.category === 'Bridal Sarees')) {
          // Include Saree sub-collections under Sarees
        } else if (selectedCategory === 'Lehengas' && p.category === 'Bridal Lehengas') {
          // Include Bridal Lehengas under Lehengas
        } else if (p.category !== selectedCategory) {
          return false;
        }
      }

      if (availabilityFilter !== 'All' && p.availability !== availabilityFilter) {
        return false;
      }

      if (maxPriceFilter !== null) {
        if (!p.priceVerified || !p.price || p.price > maxPriceFilter) {
          return false;
        }
      }

      if (q) {
        const hay = `${p.title} ${p.category} ${p.description} ${p.fabric || ''} ${
          p.color || ''
        }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'price-asc': {
          const pa = a.priceVerified && a.price ? a.price : Number.MAX_SAFE_INTEGER;
          const pb = b.priceVerified && b.price ? b.price : Number.MAX_SAFE_INTEGER;
          return pa - pb;
        }
        case 'price-desc': {
          const pa = a.priceVerified && a.price ? a.price : -1;
          const pb = b.priceVerified && b.price ? b.price : -1;
          return pb - pa;
        }
        case 'featured':
        default:
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return (a.displayOrder || 0) - (b.displayOrder || 0);
      }
    });
  }, [products, selectedCategory, availabilityFilter, maxPriceFilter, searchQuery, sortBy]);

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      navigate('/collections');
    } else {
      navigate(`/collections/${slugify(cat)}`);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSearchParams({});
    setSelectedCategory('All');
    setAvailabilityFilter('All');
    setMaxPriceFilter(null);
    setSortBy('featured');
    navigate('/collections');
  };

  const pageTitle =
    selectedCategory === 'All'
      ? 'Ethnic Wear Catalogue — Kumar Saree Ghar Laxmi Nagar'
      : `${selectedCategory} — Kumar Saree Ghar Laxmi Nagar, Delhi`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <SeoHead
        title={pageTitle}
        description={`Browse ${
          selectedCategory === 'All' ? 'designer sarees, bridal lehengas, suits, kurtis, and Indo-Western couture' : selectedCategory
        } at Kumar Saree Ghar Pvt. Ltd., Laxmi Nagar, East Delhi.`}
        settings={settings}
      />

      <div className="border-b border-[#292326]/12 pb-8 mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-[#81747A] mb-2">
          Curated Showroom Catalogue
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#292326] mb-3">
          {selectedCategory === 'All' ? 'All Ethnic Collections' : selectedCategory}
        </h1>
        <p className="text-sm sm:text-base text-[#81747A] max-w-2xl">
          Explore pieces available at our Laxmi Nagar showroom. Save your favourites to Wishlist or
          enquire directly for verified pricing, custom sizing, and stock availability.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
        <button
          type="button"
          onClick={() => handleCategoryClick('All')}
          className={`px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-[#651B32] text-white'
              : 'bg-white border border-[#292326]/15 text-[#292326] hover:border-[#651B32]'
          }`}
        >
          All Collections
        </button>
        {ALL_CATALOGUE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#651B32] text-white'
                : 'bg-white border border-[#292326]/15 text-[#292326] hover:border-[#651B32]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search, Availability, Price & Sort Toolbar */}
      <div className="bg-white border border-[#292326]/10 p-4 mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#81747A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by product name, fabric, color, or occasion..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF6EF] border border-[#292326]/15 text-[#292326] placeholder:text-[#81747A] focus:outline-none focus:border-[#651B32]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#81747A]" />
            <select
              aria-label="Filter by availability"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-2.5 text-xs font-medium bg-[#FAF6EF] border border-[#292326]/15 text-[#292326] focus:outline-none focus:border-[#651B32]"
            >
              <option value="All">All Availability</option>
              <option value="In Store">In Store</option>
              <option value="Made to Order">Made to Order</option>
              <option value="Enquire for Availability">Enquire for Availability</option>
            </select>
          </div>

          {verifiedPriceCeiling !== null && (
            <div className="flex items-center gap-2 bg-[#FAF6EF] border border-[#292326]/15 px-3 py-2">
              <label htmlFor="ksg-price-cap" className="text-xs text-[#81747A] whitespace-nowrap">
                Max ₹:
              </label>
              <input
                id="ksg-price-cap"
                type="number"
                min={0}
                max={verifiedPriceCeiling}
                placeholder={`${verifiedPriceCeiling}`}
                value={maxPriceFilter ?? ''}
                onChange={(e) =>
                  setMaxPriceFilter(e.target.value ? Number(e.target.value) : null)
                }
                className="w-24 text-xs bg-transparent text-[#292326] focus:outline-none tabular-nums"
              />
            </div>
          )}

          <select
            aria-label="Sort products"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2.5 text-xs font-medium bg-[#FAF6EF] border border-[#292326]/15 text-[#292326] focus:outline-none focus:border-[#651B32]"
          >
            <option value="featured">Sort: Featured</option>
            <option value="name-asc">Sort: Name (A–Z)</option>
            <option value="name-desc">Sort: Name (Z–A)</option>
            {verifiedPriceCeiling !== null && (
              <>
                <option value="price-asc">Sort: Price Low to High</option>
                <option value="price-desc">Sort: Price High to Low</option>
              </>
            )}
          </select>

          {(selectedCategory !== 'All' ||
            searchQuery ||
            availabilityFilter !== 'All' ||
            maxPriceFilter !== null) && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-2.5 text-xs font-semibold text-[#651B32] hover:bg-[#FAF6EF] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6 text-xs text-[#81747A]">
        <span className="tabular-nums">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
        </span>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-[#292326]/8 p-4 animate-pulse">
              <div className="aspect-[3/4] bg-[#F3ECE1] mb-4" />
              <div className="h-4 bg-[#F3ECE1] w-1/3 mb-2" />
              <div className="h-6 bg-[#F3ECE1] w-3/4 mb-4" />
              <div className="h-9 bg-[#F3ECE1] w-full" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#292326]/10 p-12 text-center max-w-lg mx-auto">
          <h2 className="font-display text-2xl font-semibold text-[#292326] mb-2">
            No Matching Pieces Found
          </h2>
          <p className="text-sm text-[#81747A] mb-6">
            Try clearing your filters or contact our showroom directly — we carry additional designs
            in-store at Vijay Chowk, Laxmi Nagar.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-6 py-3 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49]"
          >
            Show All Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
