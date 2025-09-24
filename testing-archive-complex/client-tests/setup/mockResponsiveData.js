// Mock Responsive Data for Testing
// Provides test fixtures for responsive design testing

export const mockViewports = {
  mobile: {
    width: 375,
    height: 667,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    touch: true,
  },
  tablet: {
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    touch: true,
  },
  desktop: {
    width: 1920,
    height: 1080,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    touch: false,
  },
  largeDesktop: {
    width: 2560,
    height: 1440,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    touch: false,
  },
}

export const mockBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
}

export const mockMediaQueries = {
  mobile: `(max-width: ${mockBreakpoints.sm - 1}px)`,
  tablet: `(min-width: ${mockBreakpoints.sm}px) and (max-width: ${mockBreakpoints.lg - 1}px)`,
  desktop: `(min-width: ${mockBreakpoints.lg}px)`,
  touchDevice: '(hover: none) and (pointer: coarse)',
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
}

export const mockResponsiveComponents = {
  header: {
    mobile: {
      height: 60,
      showMenuButton: true,
      showSearchIcon: true,
      showCartIcon: true,
      showLogo: true,
      showNavigation: false,
    },
    tablet: {
      height: 70,
      showMenuButton: true,
      showSearchIcon: true,
      showCartIcon: true,
      showLogo: true,
      showNavigation: false,
    },
    desktop: {
      height: 80,
      showMenuButton: false,
      showSearchIcon: true,
      showCartIcon: true,
      showLogo: true,
      showNavigation: true,
    },
  },
  card: {
    mobile: {
      columns: 2,
      imageRatio: '1:1',
      showQuickActions: false,
      showDescription: false,
    },
    tablet: {
      columns: 3,
      imageRatio: '4:3',
      showQuickActions: true,
      showDescription: true,
    },
    desktop: {
      columns: 4,
      imageRatio: '4:3',
      showQuickActions: true,
      showDescription: true,
    },
  },
  productDetail: {
    mobile: {
      layout: 'stack',
      imageGallery: 'swipe',
      showRelated: false,
      showReviews: true,
    },
    tablet: {
      layout: 'split',
      imageGallery: 'grid',
      showRelated: true,
      showReviews: true,
    },
    desktop: {
      layout: 'sidebar',
      imageGallery: 'grid',
      showRelated: true,
      showReviews: true,
    },
  },
  cart: {
    mobile: {
      showAsDrawer: true,
      showQuantityControls: true,
      showItemImages: true,
      showItemDetails: false,
    },
    tablet: {
      showAsDrawer: true,
      showQuantityControls: true,
      showItemImages: true,
      showItemDetails: true,
    },
    desktop: {
      showAsDrawer: false,
      showQuantityControls: true,
      showItemImages: true,
      showItemDetails: true,
    },
  },
}

export const mockTouchGestures = {
  tap: {
    type: 'tap',
    duration: 100,
    coordinates: { x: 100, y: 100 },
  },
  longPress: {
    type: 'longPress',
    duration: 500,
    coordinates: { x: 100, y: 100 },
  },
  swipeLeft: {
    type: 'swipe',
    direction: 'left',
    distance: 200,
    duration: 300,
    startCoordinates: { x: 200, y: 100 },
    endCoordinates: { x: 0, y: 100 },
  },
  swipeRight: {
    type: 'swipe',
    direction: 'right',
    distance: 200,
    duration: 300,
    startCoordinates: { x: 0, y: 100 },
    endCoordinates: { x: 200, y: 100 },
  },
  swipeUp: {
    type: 'swipe',
    direction: 'up',
    distance: 200,
    duration: 300,
    startCoordinates: { x: 100, y: 200 },
    endCoordinates: { x: 100, y: 0 },
  },
  swipeDown: {
    type: 'swipe',
    direction: 'down',
    distance: 200,
    duration: 300,
    startCoordinates: { x: 100, y: 0 },
    endCoordinates: { x: 100, y: 200 },
  },
  pinchOut: {
    type: 'pinch',
    direction: 'out',
    scale: 1.5,
    duration: 300,
    centerCoordinates: { x: 100, y: 100 },
  },
  pinchIn: {
    type: 'pinch',
    direction: 'in',
    scale: 0.8,
    duration: 300,
    centerCoordinates: { x: 100, y: 100 },
  },
}

export const mockResponsiveImages = {
  hero: {
    mobile: {
      src: '/images/hero-mobile.jpg',
      width: 375,
      height: 300,
      alt: 'Hero image for mobile',
    },
    tablet: {
      src: '/images/hero-tablet.jpg',
      width: 768,
      height: 400,
      alt: 'Hero image for tablet',
    },
    desktop: {
      src: '/images/hero-desktop.jpg',
      width: 1920,
      height: 600,
      alt: 'Hero image for desktop',
    },
  },
  product: {
    mobile: {
      src: '/images/product-mobile.jpg',
      width: 200,
      height: 200,
      alt: 'Product image for mobile',
    },
    tablet: {
      src: '/images/product-tablet.jpg',
      width: 300,
      height: 300,
      alt: 'Product image for tablet',
    },
    desktop: {
      src: '/images/product-desktop.jpg',
      width: 400,
      height: 400,
      alt: 'Product image for desktop',
    },
  },
}

export const mockResponsiveText = {
  heading: {
    mobile: {
      fontSize: '24px',
      lineHeight: '28px',
      fontWeight: 'bold',
    },
    tablet: {
      fontSize: '32px',
      lineHeight: '36px',
      fontWeight: 'bold',
    },
    desktop: {
      fontSize: '48px',
      lineHeight: '52px',
      fontWeight: 'bold',
    },
  },
  body: {
    mobile: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 'normal',
    },
    tablet: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 'normal',
    },
    desktop: {
      fontSize: '18px',
      lineHeight: '28px',
      fontWeight: 'normal',
    },
  },
}

export const mockResponsiveSpacing = {
  mobile: {
    padding: '16px',
    margin: '8px',
    gap: '12px',
  },
  tablet: {
    padding: '24px',
    margin: '16px',
    gap: '20px',
  },
  desktop: {
    padding: '32px',
    margin: '24px',
    gap: '32px',
  },
}

export const mockResponsiveGrid = {
  mobile: {
    columns: 1,
    gap: '16px',
    columnWidth: 'auto',
  },
  tablet: {
    columns: 2,
    gap: '24px',
    columnWidth: 'auto',
  },
  desktop: {
    columns: 3,
    gap: '32px',
    columnWidth: 'auto',
  },
}

export const mockResponsiveInteractions = {
  mobile: {
    hoverEffects: false,
    touchEffects: true,
    keyboardNavigation: true,
    gestureNavigation: true,
  },
  tablet: {
    hoverEffects: true,
    touchEffects: true,
    keyboardNavigation: true,
    gestureNavigation: true,
  },
  desktop: {
    hoverEffects: true,
    touchEffects: false,
    keyboardNavigation: true,
    gestureNavigation: false,
  },
}

// Utility function to get responsive data for current viewport
export const getResponsiveData = (componentName, viewport) => {
  return mockResponsiveComponents[componentName]?.[viewport] || {}
}

// Utility function to check if viewport matches media query
export const matchesMediaQuery = (viewport, mediaQuery) => {
  const viewportData = mockViewports[viewport]
  if (!viewportData) return false
  
  // Simple media query matching for tests
  if (mediaQuery.includes('max-width')) {
    const maxWidth = parseInt(mediaQuery.match(/max-width:\s*(\d+)/)?.[1])
    return viewportData.width <= maxWidth
  }
  
  if (mediaQuery.includes('min-width')) {
    const minWidth = parseInt(mediaQuery.match(/min-width:\s*(\d+)/)?.[1])
    return viewportData.width >= minWidth
  }
  
  return false
}

export default {
  mockViewports,
  mockBreakpoints,
  mockMediaQueries,
  mockResponsiveComponents,
  mockTouchGestures,
  mockResponsiveImages,
  mockResponsiveText,
  mockResponsiveSpacing,
  mockResponsiveGrid,
  mockResponsiveInteractions,
  getResponsiveData,
  matchesMediaQuery,
}
