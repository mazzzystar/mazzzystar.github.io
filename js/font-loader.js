/**
 * Progressive Font Loader for Chinese fonts
 * This script manages the loading of font tiers based on:
 * 1. Tier 1: Loaded immediately (most common characters)
 * 2. Tier 2: Loaded when the browser is idle
 * 3. Tier 3: Loaded on demand or after a delay
 */

(function() {
  // Font configuration (to make it easier to add more fonts later)
  const fontConfig = {
    'default': {
      family: 'Chinese',
      style: 'normal',
      weight: 'normal',
      tier1: '/fonts/subsets/HYShuSongErS-tier1.woff2',
      tier2: '/fonts/subsets/HYShuSongErS-tier2.woff2',
      tier3: '/fonts/subsets/HYShuSongErS-tier3.woff2'
    },
    // All font subsets have been created
    'italic': {
      family: 'Chinese',
      style: 'italic', 
      weight: 'normal',
      tier1: '/fonts/subsets/FZKTJW-tier1.woff2',
      tier2: '/fonts/subsets/FZKTJW-tier2.woff2',
      tier3: '/fonts/subsets/FZKTJW-tier3.woff2'
    },
    'bold': {
      family: 'Chinese',
      style: 'normal',
      weight: 'bold',
      tier1: '/fonts/subsets/FZHTJW-tier1.woff2',
      tier2: '/fonts/subsets/FZHTJW-tier2.woff2',
      tier3: '/fonts/subsets/FZHTJW-tier3.woff2'
    },
    'mono': {
      family: 'ChineseMono',
      style: 'normal',
      weight: 'normal',
      tier1: '/fonts/subsets/HYFangSongJ-tier1.woff2',
      tier2: '/fonts/subsets/HYFangSongJ-tier2.woff2',
      tier3: '/fonts/subsets/HYFangSongJ-tier3.woff2'
    }
  };

  // Check if the browser supports Font Loading API
  if ('fonts' in document) {
    // Tier 1 is loaded via CSS with font-display: swap
    
    // Load Tier 2 when browser is idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(function() {
        loadFontTier2();
      }, { timeout: 3000 }); // Fallback timeout of 3 seconds
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(loadFontTier2, 3000);
    }
    
    // Load Tier 3 after 5 seconds or on user interaction
    let tier3Loaded = false;
    const userInteractions = ['scroll', 'mousemove', 'keydown', 'touchstart', 'click'];
    
    // Function to load Tier 3 and remove event listeners
    function loadTier3AndCleanup() {
      if (!tier3Loaded) {
        tier3Loaded = true;
        loadFontTier3();
        
        // Remove event listeners after loading Tier 3
        userInteractions.forEach(function(event) {
          document.removeEventListener(event, loadTier3AndCleanup);
        });
      }
    }
    
    // Set up event listeners for user interactions
    userInteractions.forEach(function(event) {
      document.addEventListener(event, loadTier3AndCleanup, { passive: true });
    });
    
    // Fallback: Load Tier 3 after 10 seconds if no user interaction
    setTimeout(loadTier3AndCleanup, 10000);
  }
  
  // Helper function to load Tier 2 fonts
  function loadFontTier2() {
    loadFontTier(2);
  }
  
  // Helper function to load Tier 3 fonts
  function loadFontTier3() {
    loadFontTier(3);
  }
  
  // Generic function to load a specific tier of fonts
  function loadFontTier(tier) {
    Object.keys(fontConfig).forEach(function(fontType) {
      const config = fontConfig[fontType];
      const fontPath = config[`tier${tier}`];
      
      if (fontPath) {
        const font = new FontFace(
          config.family,
          `url("${fontPath}") format("woff2")`,
          { 
            style: config.style, 
            weight: config.weight,
            unicodeRange: 'U+4E00-9FFF, U+3400-4DBF, U+F900-FAFF, U+3000-303F'
          }
        );
        
        font.load().then(function(loadedFace) {
          document.fonts.add(loadedFace);
          console.log(`Tier ${tier} ${fontType} font loaded`);
        }).catch(function(error) {
          console.warn(`Failed to load Tier ${tier} ${fontType} font:`, error);
        });
      }
    });
  }
})(); 