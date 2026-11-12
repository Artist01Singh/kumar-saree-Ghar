import React, { useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin, Navigation } from 'lucide-react';

const STORE_COORDS = { lat: 28.6304, lng: 77.2777 };

interface StoreMapProps {
  businessName: string;
  address: string;
  phone: string;
}

function StoreMarker({ businessName, address, phone }: StoreMapProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={STORE_COORDS}
        onClick={() => setInfoOpen(true)}
        title={businessName}
      >
        <Pin background="#651B32" borderColor="#C6A15B" glyphColor="#FAF6EF" scale={1.15} />
      </AdvancedMarker>
      {infoOpen && marker && (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={() => setInfoOpen(false)}>
          <div className="p-1 text-[#292326]">
            <p className="font-semibold text-sm text-[#651B32] mb-1">{businessName}</p>
            <p className="text-xs text-[#292326] leading-relaxed mb-1.5">{address}</p>
            <p className="text-xs text-[#81747A]">{phone}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function StoreMap({ businessName, address, phone }: StoreMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${businessName}, ${address}`
  )}`;

  if (!apiKey) {
    return (
      <div className="w-full h-[360px] md:h-[420px] bg-gradient-to-br from-[#F3ECE1] via-[#FAF6EF] to-[#EBDDC8] border border-[#292326]/12 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 flex items-center justify-center bg-[#651B32] text-[#FAF6EF] mb-4">
          <MapPin className="w-5 h-5" />
        </div>
        <h3 className="font-display text-2xl font-semibold text-[#292326] mb-2">
          {businessName}
        </h3>
        <p className="text-sm text-[#81747A] max-w-md mb-6">{address}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold bg-[#651B32] text-white hover:bg-[#872D49] transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open Directions in Google Maps</span>
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-3 text-xs font-semibold border border-[#292326]/20 text-[#292326] hover:border-[#651B32] hover:text-[#651B32] transition-colors"
          >
            <span>View Location</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[360px] md:h-[420px] border border-[#292326]/12 overflow-hidden relative bg-[#F3ECE1]">
      <APIProvider apiKey={apiKey} libraries={['marker']} language="en" region="IN">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultCenter={STORE_COORDS}
          defaultZoom={16}
          gestureHandling="cooperative"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <StoreMarker businessName={businessName} address={address} phone={phone} />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
