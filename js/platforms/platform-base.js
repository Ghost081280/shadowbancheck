/* =============================================================================
   PLATFORM-BASE.JS - Shared Platform Logic
   ShadowBanCheck.io
   
   Base class for platform-specific implementations.
   Handles URL normalization, input validation, and common utilities.
   
   All platform classes extend this base.
   ============================================================================= */

(function() {
'use strict';

// ============================================================================
// BASE PLATFORM CLASS
// ============================================================================
class PlatformBase {
    
    constructor(platformId) {
        this.platformId = platformId;
        this.platformData = window.getPlatformById ? 
            window.getPlatformById(platformId) : null;
    }
    
    // =========================================================================
    // URL NORMALIZATION
    // =========================================================================
    
    /**
     * Basic URL normalization - removes protocol and www
     * @param {string} url - URL to normalize
     * @returns {string} Normalized URL
     */
    normalizeUrl(url) {
        if (!url || typeof url !== 'string') return '';
        
        return url
            .trim()
            .replace(/^https?:\/\//, '')    // Remove protocol
            .replace(/^www\./, '')           // Remove www
            .replace(/\/$/, '');             // Remove trailing slash
    }
    
    /**
     * Get full URL with https
     * @param {string} normalizedUrl - Already normalized URL
     * @returns {string} Full URL with https
     */
    getFullUrl(normalizedUrl) {
        if (!normalizedUrl) return '';
        if (normalizedUrl.startsWith('http')) return normalizedUrl;
        return 'https://' + normalizedUrl;
    }
    
    // =========================================================================
    // PLATFORM DETECTION
    // =========================================================================
    
    /**
     * Detect platform from URL
     * @param {string} url - URL to check
     * @returns {string|null} Platform ID or null
     */
    static detectPlatform(url) {
        if (!url || typeof url !== 'string') return null;
        
        const lowerUrl = url.toLowerCase().trim();
        
        // Twitter/X - handle ALL variations
        if (lowerUrl.match(/(?:www\.|mobile\.|m\.)?(?:twitter|x)\.com/)) {
            return 'twitter';
        }
        
        // Reddit - handle variations
        if (lowerUrl.match(/(?:old\.|new\.|www\.|np\.)?reddit\.com|redd\.it/)) {
            return 'reddit';
        }
        
        // Instagram
        if (lowerUrl.match(/(?:www\.)?instagram\.com|instagr\.am/)) {
            return 'instagram';
        }
        
        // TikTok
        if (lowerUrl.match(/(?:www\.|vm\.)?tiktok\.com/)) {
            return 'tiktok';
        }
        
        // Facebook
        if (lowerUrl.match(/(?:www\.|m\.)?facebook\.com|fb\.com|fb\.me/)) {
            return 'facebook';
        }
        
        // YouTube
        if (lowerUrl.match(/(?:www\.)?youtube\.com|youtu\.be/)) {
            return 'youtube';
        }
        
        // LinkedIn
        if (lowerUrl.match(/(?:www\.)?linkedin\.com|lnkd\.in/)) {
            return 'linkedin';
        }
        
        return null;
    }
    
    /**
     * Check if URL matches this platform
     * @param {string} url - URL to check
     * @returns {boolean}
     */
    matchesUrl(url) {
        return PlatformBase.detectPlatform(url) === this.platformId;
    }
    
    // =========================================================================
    // VALIDATION
    // =========================================================================
    
    /**
     * Validate username format
     * @param {string} username - Username to validate
     * @returns {object} Validation result
     */
    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { valid: false, error: 'Username is required' };
        }
        
        // Remove @ prefix if present
        const clean = username.replace(/^@/, '').trim();
        
        if (clean.length === 0) {
            return { valid: false, error: 'Username cannot be empty' };
        }
        
        if (clean.length > 50) {
            return { valid: false, error: 'Username too long' };
        }
        
        // Default: alphanumeric and underscore
        if (!/^[\w]+$/.test(clean)) {
            return { valid: false, error: 'Invalid username format' };
        }
        
        return { valid: true, username: clean };
    }
    
    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {object} Validation result
     */
    validateUrl(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, error: 'URL is required' };
        }
        
        const trimmed = url.trim();
        
        // Basic URL pattern check
        if (!trimmed.match(/^https?:\/\/.+/i) && !trimmed.match(/^[\w.-]+\..+/)) {
            return { valid: false, error: 'Invalid URL format' };
        }
        
        // Check if it matches this platform
        if (!this.matchesUrl(trimmed)) {
            return { 
                valid: false, 
                error: `URL does not match ${this.platformId}`,
                detectedPlatform: PlatformBase.detectPlatform(trimmed)
            };
        }
        
        return { valid: true, url: trimmed };
    }
    
    // =========================================================================
    // EXTRACTION (To be overridden by subclasses)
    // =========================================================================
    
    /**
     * Extract username from URL (override in subclass)
     * @param {string} url - URL to parse
     * @returns {string|null} Username or null
     */
    extractUsername(url) {
        // Override in subclass
        return null;
    }
    
    /**
     * Extract post ID from URL (override in subclass)
     * @param {string} url - URL to parse
     * @returns {string|null} Post ID or null
     */
    extractPostId(url) {
        // Override in subclass
        return null;
    }
    
    // =========================================================================
    // API METHODS (To be overridden by subclasses)
    // =========================================================================
    
    /**
     * Get account data (override in subclass)
     * @param {string} username - Username to check
     * @returns {Promise<object>} Account data
     */
    async getAccountData(username) {
        // Override in subclass
        // Return demo data when not implemented
        return this._getDemoAccountData(username);
    }
    
    /**
     * Get post data (override in subclass)
     * @param {string} postId - Post ID to check
     * @returns {Promise<object>} Post data
     */
    async getPostData(postId) {
        // Override in subclass
        // Return demo data when not implemented
        return this._getDemoPostData(postId);
    }
    
    /**
     * Check account shadowban status (override in subclass)
     * @param {string} username - Username to check
     * @returns {Promise<object>} Shadowban check result
     */
    async checkShadowban(username) {
        // Override in subclass
        return this._getDemoShadowbanResult(username);
    }
    
    // =========================================================================
    // DEMO DATA HELPERS
    // =========================================================================
    
    _getDemoAccountData(username) {
        return {
            demo: true,
            username: username,
            exists: true,
            suspended: false,
            protected: false,
            verified: false,
            verifiedType: 'none',
            accountAge: 365,
            followerCount: 1000,
            followingCount: 500,
            postCount: 250,
            message: 'Demo data - connect to real API for live results'
        };
    }
    
    _getDemoPostData(postId) {
        return {
            demo: true,
            postId: postId,
            exists: true,
            visible: true,
            restricted: false,
            message: 'Demo data - connect to real API for live results'
        };
    }
    
    _getDemoShadowbanResult(username) {
        return {
            demo: true,
            username: username,
            probability: 25,
            checks: {
                searchBan: false,
                ghostBan: false,
                replyDeboosting: false,
                suggestBan: false
            },
            message: 'Demo data - connect to real API for live results'
        };
    }
    
    // =========================================================================
    // UTILITY METHODS
    // =========================================================================
    
    /**
     * Get platform info from platforms.js
     * @returns {object|null} Platform configuration
     */
    getPlatformInfo() {
        return this.platformData;
    }
    
    /**
     * Check if platform is live
     * @returns {boolean}
     */
    isLive() {
        return this.platformData && this.platformData.status === 'live';
    }
    
    /**
     * Check if platform supports a feature
     * @param {string} feature - Feature name
     * @returns {boolean}
     */
    supports(feature) {
        return this.platformData && 
               this.platformData.supports && 
               this.platformData.supports[feature] === true;
    }
    
    /**
     * Get platform name
     * @returns {string}
     */
    getName() {
        return this.platformData ? this.platformData.name : this.platformId;
    }
    
    /**
     * Get platform icon
     * @returns {string}
     */
    getIcon() {
        return this.platformData ? this.platformData.icon : '🔍';
    }
}

// ============================================================================
// PLATFORM FACTORY
// ============================================================================
const PlatformFactory = {
    
    platforms: {},
    
    /**
     * Register a platform class
     * @param {string} platformId - Platform ID
     * @param {class} PlatformClass - Platform class
     */
    register(platformId, PlatformClass) {
        this.platforms[platformId] = PlatformClass;
    },
    
    /**
     * Get or create a platform instance
     * @param {string} platformId - Platform ID
     * @returns {PlatformBase} Platform instance
     */
    get(platformId) {
        const PlatformClass = this.platforms[platformId];
        if (PlatformClass) {
            return new PlatformClass();
        }
        // Return base class for unknown platforms
        return new PlatformBase(platformId);
    },
    
    /**
     * Get platform from URL
     * @param {string} url - URL to analyze
     * @returns {PlatformBase|null} Platform instance or null
     */
    fromUrl(url) {
        const platformId = PlatformBase.detectPlatform(url);
        if (platformId) {
            return this.get(platformId);
        }
        return null;
    },
    
    /**
     * Check if a platform is registered
     * @param {string} platformId - Platform ID
     * @returns {boolean}
     */
    has(platformId) {
        return !!this.platforms[platformId];
    },
    
    /**
     * Get all registered platform IDs
     * @returns {array}
     */
    getAll() {
        return Object.keys(this.platforms);
    }
};

// ============================================================================
// EXPORTS
// ============================================================================
window.PlatformBase = PlatformBase;
window.PlatformFactory = PlatformFactory;

// ============================================================================
// INITIALIZATION
// ============================================================================
console.log('✅ PlatformBase loaded');

})();
