import { useState, useEffect } from 'react';

// Breakpoint definitions following Tailwind CSS
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Device detection utilities
export const deviceDetection = {
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoints.md;
  },
  
  isTablet: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
  },
  
  isDesktop: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints.lg;
  },
  
  isTouchDevice: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  isStandalone: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  },
  
  getOrientation: () => {
    if (typeof window === 'undefined') return 'landscape';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  },
  
  getViewportSize: () => {
    if (typeof window === 'undefined') return { width: 1024, height: 768 };
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
};

// Hook for responsive design
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    breakpoint: 'lg' as Breakpoint,
    orientation: 'landscape' as 'portrait' | 'landscape'
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < breakpoints.md;
      const isTablet = width >= breakpoints.md && width < breakpoints.lg;
      const isDesktop = width >= breakpoints.lg;
      
      let breakpoint: Breakpoint = 'sm';
      if (width >= breakpoints['2xl']) breakpoint = '2xl';
      else if (width >= breakpoints.xl) breakpoint = 'xl';
      else if (width >= breakpoints.lg) breakpoint = 'lg';
      else if (width >= breakpoints.md) breakpoint = 'md';
      
      setScreenSize({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        breakpoint,
        orientation: height > width ? 'portrait' : 'landscape'
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

// Hook for media queries
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

// Responsive class generator
export const responsive = {
  // Grid utilities
  grid: (config: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  }) => {
    const classes = ['grid'];
    
    Object.entries(config).forEach(([breakpoint, cols]) => {
      if (breakpoint === 'sm') {
        classes.push(`grid-cols-${cols}`);
      } else {
        classes.push(`${breakpoint}:grid-cols-${cols}`);
      }
    });
    
    return classes.join(' ');
  },

  // Text size utilities
  text: (config: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }) => {
    const classes: string[] = [];
    
    Object.entries(config).forEach(([breakpoint, size]) => {
      if (breakpoint === 'sm') {
        classes.push(`text-${size}`);
      } else {
        classes.push(`${breakpoint}:text-${size}`);
      }
    });
    
    return classes.join(' ');
  },

  // Spacing utilities
  padding: (config: {
    sm?: number | string;
    md?: number | string;
    lg?: number | string;
    xl?: number | string;
    '2xl'?: number | string;
  }) => {
    const classes: string[] = [];
    
    Object.entries(config).forEach(([breakpoint, size]) => {
      if (breakpoint === 'sm') {
        classes.push(`p-${size}`);
      } else {
        classes.push(`${breakpoint}:p-${size}`);
      }
    });
    
    return classes.join(' ');
  },

  // Flex utilities
  flex: (config: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }) => {
    const classes: string[] = [];
    
    Object.entries(config).forEach(([breakpoint, direction]) => {
      if (breakpoint === 'sm') {
        classes.push(`flex-${direction}`);
      } else {
        classes.push(`${breakpoint}:flex-${direction}`);
      }
    });
    
    return classes.join(' ');
  },

  // Show/hide utilities
  display: (config: {
    sm?: 'block' | 'inline' | 'flex' | 'grid' | 'hidden';
    md?: 'block' | 'inline' | 'flex' | 'grid' | 'hidden';
    lg?: 'block' | 'inline' | 'flex' | 'grid' | 'hidden';
    xl?: 'block' | 'inline' | 'flex' | 'grid' | 'hidden';
    '2xl'?: 'block' | 'inline' | 'flex' | 'grid' | 'hidden';
  }) => {
    const classes: string[] = [];
    
    Object.entries(config).forEach(([breakpoint, display]) => {
      if (breakpoint === 'sm') {
        classes.push(display === 'hidden' ? 'hidden' : display);
      } else {
        classes.push(display === 'hidden' ? `${breakpoint}:hidden` : `${breakpoint}:${display}`);
      }
    });
    
    return classes.join(' ');
  }
};

// Touch and gesture utilities
export const touchUtils = {
  // Add touch-friendly classes
  touchTarget: 'min-h-[44px] min-w-[44px]', // Minimum touch target size
  
  // Hover states for touch devices
  touchHover: (hoverClasses: string) => 
    `hover:${hoverClasses} focus:${hoverClasses} active:${hoverClasses}`,
  
  // Disable hover on touch devices
  noTouchHover: (hoverClasses: string) => 
    `@media (hover: hover) { ${hoverClasses} }`,
  
  // Scroll behavior for mobile
  mobileScroll: 'overflow-x-auto scrollbar-hide',
  
  // Safe area utilities for notched devices
  safeArea: {
    top: 'pt-safe',
    bottom: 'pb-safe',
    left: 'pl-safe',
    right: 'pr-safe',
    all: 'p-safe'
  }
};

// Performance utilities for mobile
export const mobilePerf = {
  // Reduce motion for users who prefer it
  respectMotionPreference: (animationClasses: string) => 
    `motion-safe:${animationClasses}`,
  
  // Lazy loading utilities
  lazyImage: 'loading-lazy',
  
  // Optimize for mobile rendering
  willChange: (property: string) => `will-change-${property}`,
  
  // Hardware acceleration
  gpu: 'transform-gpu',
  
  // Reduce layout shifts
  aspectRatio: (ratio: string) => `aspect-${ratio}`,
  
  // Image optimization classes
  imageOptimized: 'object-cover object-center w-full h-full',
  
  // Font optimization
  fontOptimized: 'font-display-swap subpixel-antialiased'
};

// Accessibility utilities for mobile
export const a11yMobile = {
  // Screen reader optimizations
  srOnly: 'sr-only',
  
  // Focus management
  focusRing: 'focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:outline-none',
  
  // High contrast mode support
  highContrast: 'contrast-more:border-black contrast-more:text-black',
  
  // Reduced motion
  reduceMotion: 'motion-reduce:transition-none motion-reduce:transform-none',
  
  // Touch accessibility
  touchArea: 'relative overflow-hidden',
  
  // Skip links for mobile navigation
  skipLink: 'absolute -top-full left-0 bg-white p-2 focus:top-0 z-50'
};

// Utility function to get responsive container classes
export const getContainerClasses = (type: 'full' | 'centered' | 'padded' = 'centered') => {
  const base = 'w-full';
  
  switch (type) {
    case 'full':
      return base;
    case 'centered':
      return `${base} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`;
    case 'padded':
      return `${base} px-4 sm:px-6 lg:px-8`;
    default:
      return base;
  }
};

// Responsive typography scale
export const typographyScale = {
  hero: responsive.text({ sm: '3xl', md: '4xl', lg: '6xl', xl: '7xl' }),
  heading1: responsive.text({ sm: '2xl', md: '3xl', lg: '4xl' }),
  heading2: responsive.text({ sm: 'xl', md: '2xl', lg: '3xl' }),
  heading3: responsive.text({ sm: 'lg', md: 'xl', lg: '2xl' }),
  heading4: responsive.text({ sm: 'base', md: 'lg', lg: 'xl' }),
  body: responsive.text({ sm: 'sm', md: 'base' }),
  caption: responsive.text({ sm: 'xs', md: 'sm' })
};

// Mobile-first component sizing
export const componentSizing = {
  button: {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm md:px-6 md:py-3 md:text-base',
    large: 'px-6 py-3 text-base md:px-8 md:py-4 md:text-lg'
  },
  card: {
    padding: responsive.padding({ sm: 4, md: 6, lg: 8 }),
    gap: responsive.text({ sm: '4', md: '6', lg: '8' })
  },
  modal: {
    mobile: 'fixed inset-0 z-50',
    desktop: 'fixed inset-0 z-50 flex items-center justify-center'
  }
};

export default {
  useResponsive,
  useMediaQuery,
  deviceDetection,
  responsive,
  touchUtils,
  mobilePerf,
  a11yMobile,
  getContainerClasses,
  typographyScale,
  componentSizing,
  breakpoints
};