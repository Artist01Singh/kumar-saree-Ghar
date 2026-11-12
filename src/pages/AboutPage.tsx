import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BOUTIQUE_ASSETS } from '../data/seedData';
import { BoutiqueImage } from '../components/BoutiqueImage';
import { SeoHead } from '../components/SeoHead';

export function AboutPage() {
  const { settings, categories } = useStore();

  return (
    <div>
      <SeoHead
        title="About Kumar Saree Ghar — Ethnic Wear Store in Laxmi Nagar, Delhi"
        description="Learn about Kumar Saree Ghar Pvt. Ltd. at H-1, Vijay Chowk, Laxmi Nagar, Delhi — our ethnic fashion identity and curated bridal & festive collections."
        settings={settings}
      />

      {/* Editorial Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-medium tracking-widest uppercase text-[#C6A15B] mb-3">
            About the House
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#292326] [text-wrap:balance] mb-6">
            A Destination for Indian Ethnic Elegance in East Delhi
          </h1>
          <p className="text-base sm:text-lg text-[#81747A] leading-relaxed">
            {settings.businessName} brings together traditional Indian drapes, bridal couture, and
            contemporary celebration wear at our Laxmi Nagar showroom.
            {settings.establishmentYearVerified && settings.establishmentYear
              ? ` Established in ${settings.establishmentYear}, our house serves patrons across Delhi NCR.`
              : ''}
          </p>
        </div>
      </section>

      {/* Showroom Photograph */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="aspect-[16/9] overflow-hidden border border-[#292326]/10 bg-[#F3ECE1]">
          <BoutiqueImage
            src={BOUTIQUE_ASSETS.boutiqueInterior}
            alt="Kumar Saree Ghar Pvt. Ltd. showroom interior at H-1, Vijay Chowk, Laxmi Nagar"
            eager
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Ethnic Fashion Identity */}
      <section className="bg-white border-y border-[#292326]/10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs font-medium tracking-widest uppercase text-[#81747A]">
              Our Ethnic Identity
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326]">
              Craft, Drape & Occasion Wear Under One Roof
            </h2>
            <p className="text-base text-[#292326]/85 leading-relaxed">
              Indian ethnic attire carries emotion across every ceremony — from the quiet grace of
              a woven silk saree to the richness of a bridal lehenga and the ease of tailored suits
              and Indo-Western gowns.
            </p>
            <p className="text-base text-[#81747A] leading-relaxed">
              At Kumar Saree Ghar, our showroom curation focuses on versatile silhouettes, rich
              color palettes, and attentive in-person guidance so brides, families, and celebratory
              guests can choose with confidence.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] overflow-hidden border border-[#292326]/10 bg-[#F3ECE1]">
              <BoutiqueImage
                src={BOUTIQUE_ASSETS.zariCraft}
                alt="Detailed Indian zari and zardozi textile craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collection Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-[#81747A] mb-2">
              Wardrobe Spectrum
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#292326]">
              Collections We Carry
            </h2>
          </div>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#651B32] hover:text-[#872D49]"
          >
            <span>Explore Full Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/collections/${cat.slug}`}
              className="bg-white border border-[#292326]/10 p-6 hover:border-[#651B32]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#651B32] mb-2">
                  {cat.name}
                </h3>
                <p className="text-sm text-[#81747A] leading-relaxed mb-4">{cat.description}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#292326]">
                <span>Browse {cat.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Genuine Business Details Banner */}
      <section className="bg-[#651B32] text-[#FAF6EF] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-semibold">{settings.businessName}</h2>
            <p className="flex items-center gap-2 text-sm text-[#FAF6EF]/85">
              <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>{settings.address}</span>
            </p>
            <p className="flex items-center gap-2 text-sm text-[#FAF6EF]/85 tabular-nums">
              <Phone className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>{settings.primaryPhone}</span>
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold bg-[#FAF6EF] text-[#292326] hover:bg-[#C6A15B] transition-colors shrink-0"
          >
            <span>Plan Your Showroom Visit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
