import { useMemo } from 'react';

export type Platform = 'edura' | 'akboy';

interface DomainConfig {
  platform: Platform;
  isAkboy: boolean;
  isEdura: boolean;
}

// Configure your domains here
const AKBOY_DOMAINS = [
  'akboy.space',
  'www.akboy.space',
  'akboy.lovable.app',
];

const EDURA_DOMAINS = [
  'edura.space',
  'www.edura.space',
  'edura.lovable.app',
  // Add your Edura domain when connected
];

export function useDomainDetection(): DomainConfig {
  return useMemo(() => {
    const hostname = window.location.hostname.toLowerCase();
    
    // Check if current domain is Akboy
    const isAkboyDomain = AKBOY_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    // Check if current domain is Edura
    const isEduraDomain = EDURA_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    // For localhost/preview, check if URL path starts with /akboy
    const isAkboyPath = window.location.pathname.startsWith('/akboy');
    
    // Determine platform
    let platform: Platform = 'edura'; // Default to Edura
    
    if (isAkboyDomain) {
      platform = 'akboy';
    } else if (isEduraDomain) {
      platform = 'edura';
    } else if (isAkboyPath) {
      // Fallback for development/preview - detect via path
      platform = 'akboy';
    }
    
    return {
      platform,
      isAkboy: platform === 'akboy',
      isEdura: platform === 'edura',
    };
  }, []);
}

// Utility function for non-React contexts
export function detectPlatform(): Platform {
  const hostname = window.location.hostname.toLowerCase();
  
  const isAkboyDomain = AKBOY_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith('.' + domain)
  );
  
  if (isAkboyDomain) {
    return 'akboy';
  }
  
  // Fallback for development - check path
  if (window.location.pathname.startsWith('/akboy')) {
    return 'akboy';
  }
  
  return 'edura';
}
