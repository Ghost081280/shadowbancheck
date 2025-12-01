/* =============================================================================
   TWITTER.JS - Twitter/X Platform Implementation
   ShadowBanCheck.io
   
   Handles Twitter and X.com URLs - normalizes ALL variations to x.com
   
   Supported URL formats:
   - twitter.com/user/status/123
   - x.com/user/status/123
   - www.twitter.com/user/status/123
   - www.x.com/user/status/123
   - mobile.twitter.com/user/status/123
   - m.twitter.com/user/status/123
   
   All normalize to: x.com/user/status/123
   ============================================================================= */

(function() {
'use strict';

// ============================================================================
// TWITTER PLATFORM CLASS
// ============================================================================
class TwitterPlatform extends window.PlatformBase {
    
    constructor() {
        super('twitter');
        
        // Reserved/special paths that are not usernames
        this.reservedPaths = [
            'home', 'explore', 'search', 'notifications', 'messages',
            'settings', 'i', 'intent', 'hashtag', 'share', 'status',
            'compose', 'lists', 'bookmarks', 'moments', 'topics',
            'communities', 'tos', 'privacy', 'help', 'about',
            'login', 'logout', 'signup', 'account', 'oauth'
        ];
        
        // Verification types
        this.verificationTypes = {
            none: 'No verification',
            blue: 'Twitter Blue subscriber',
            gold: 'Business/Organization',
            gray: 'Government/Multilateral',
            legacy: 'Legacy verified (pre-2023)'
        };
    }
    
    // =========================================================================
    // URL NORMALIZATION - Core Feature
    // =========================================================================
    
    /**
     * Normalize Twitter/X URL to canonical x.com format
     * @param {string} url - Any Twitter/X URL variant
     * @returns {string} Normalized URL (x.com/...)
     */
    normalizeTwitterUrl(url) {
        if (!url || typeof url !== 'string') return '';
        
        let normalized = url.trim();
        
        // Remove protocol
        normalized = normalized.replace(/^https?:\/\//, '');
        
        // Normalize all Twitter/X domains to x.com
        // Handle: www., mobile., m. prefixes
        // Handle: twitter.com, x.com domains
        normalized = normalized
            .replace(/^(www\.|mobile\.|m\.)?twitter\.com/i, 'x.com')
            .replace(/^(www\.|mobile\.|m\.)?x\.com/i, 'x.com');
        
        // Remove trailing slash
        normalized = normalized.replace(/\/$/, '');
        
        return normalized;
    }
    
    /**
     * Get full normalized URL with https
     * @param {string} url - URL to normalize
     * @returns {string} Full normalized URL
     */
    getCanonicalUrl(url) {
        const normalized = this.normalizeTwitterUrl(url);
        return normalized ? 'https://' + normalized : '';
    }
    
    /**
     * Check if URL is a Twitter/X URL
     * @param {string} url - URL to check
     * @returns {boolean}
     */
    isTwitterUrl(url) {
        if (!url) return false;
        const lowerUrl = url.toLowerCase();
        return lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com');
    }
    
    // =========================================================================
    // EXTRACTION METHODS
    // =========================================================================
    
    /**
     * Extract username from Twitter/X URL
     * @param {string} url - URL to parse
     * @returns {string|null} Username without @ or null
     */
    extractUsername(url) {
        if (!url) return null;
        
        const normalized = this.normalizeTwitterUrl(url);
        
        // Match x.com/username (not a reserved path)
        const match = normalized.match(/^x\.com\/([^\/\?#]+)/i);
        
        if (match && match[1]) {
            const username = match[1].toLowerCase();
            
            // Check if it's a reserved path
            if (this.reservedPaths.includes(username)) {
                return null;
            }
            
            return username;
        }
        
        return null;
    }
    
    /**
     * Extract tweet ID from Twitter/X URL
     * @param {string} url - URL to parse
     * @returns {string|null} Tweet ID or null
     */
    extractTweetId(url) {
        if (!url) return null;
        
        const normalized = this.normalizeTwitterUrl(url);
        
        // Match x.com/username/status/TWEET_ID
        const match = normalized.match(/x\.com\/[^\/]+\/status\/(\d+)/i);
        
        return match ? match[1] : null;
    }
    
    /**
     * Extract hashtag from Twitter/X URL
     * @param {string} url - URL to parse
     * @returns {string|null} Hashtag without # or null
     */
    extractHashtag(url) {
        if (!url) return null;
        
        const normalized = this.normalizeTwitterUrl(url);
        
        // Match x.com/hashtag/TAG
        const match = normalized.match(/x\.com\/hashtag\/([^\/\?#]+)/i);
        
        return match ? match[1] : null;
    }
    
    /**
     * Determine URL type
     * @param {string} url - URL to analyze
     * @returns {object} URL type info
     */
    getUrlType(url) {
        if (!url) return { type: 'invalid', valid: false };
        
        if (!this.isTwitterUrl(url)) {
            return { type: 'invalid', valid: false, error: 'Not a Twitter/X URL' };
        }
        
        const normalized = this.normalizeTwitterUrl(url);
        
        // Check for tweet URL
        const tweetId = this.extractTweetId(url);
        if (tweetId) {
            const username = this.extractUsername(url);
            return {
                type: 'tweet',
                valid: true,
                tweetId: tweetId,
                username: username,
                normalizedUrl: 'https://' + normalized
            };
        }
        
        // Check for hashtag URL
        const hashtag = this.extractHashtag(url);
        if (hashtag) {
            return {
                type: 'hashtag',
                valid: true,
                hashtag: hashtag,
                normalizedUrl: 'https://' + normalized
            };
        }
        
        // Check for profile URL
        const username = this.extractUsername(url);
        if (username) {
            return {
                type: 'profile',
                valid: true,
                username: username,
                normalizedUrl: 'https://' + normalized
            };
        }
        
        return { type: 'other', valid: true, normalizedUrl: 'https://' + normalized };
    }
    
    // =========================================================================
    // VALIDATION
    // =========================================================================
    
    /**
     * Validate Twitter username
     * @param {string} username - Username to validate
     * @returns {object} Validation result
     */
    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { valid: false, error: 'Username is required' };
        }
        
        // Remove @ prefix if present
        let clean = username.replace(/^@/, '').trim();
        
        if (clean.length === 0) {
            return { valid: false, error: 'Username cannot be empty' };
        }
        
        if (clean.length > 15) {
            return { valid: false, error: 'Twitter usernames are max 15 characters' };
        }
        
        if (clean.length < 4) {
            return { valid: false, error: 'Twitter usernames are min 4 characters' };
        }
        
        // Twitter allows: letters, numbers, underscores only
        if (!/^[A-Za-z0-9_]+$/.test(clean)) {
            return { valid: false, error: 'Only letters, numbers, and underscores allowed' };
        }
        
        // Cannot be only numbers
        if (/^\d+$/.test(clean)) {
            return { valid: false, error: 'Username cannot be only numbers' };
        }
        
        return { valid: true, username: clean };
    }
    
    /**
     * Validate Twitter URL
     * @param {string} url - URL to validate
     * @returns {object} Validation result
     */
    validateUrl(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, error: 'URL is required' };
        }
        
        if (!this.isTwitterUrl(url)) {
            return { 
                valid: false, 
                error: 'Not a Twitter/X URL. Must contain twitter.com or x.com'
            };
        }
        
        const urlType = this.getUrlType(url);
        return {
            valid: urlType.valid,
            ...urlType
        };
    }
    
    // =========================================================================
    // API METHODS (Demo data for now, ready for real API)
    // =========================================================================
    
    /**
     * Get account data
     * @param {string} username - Username to check
     * @returns {Promise<object>} Account data
     */
    async getAccountData(username) {
        const validation = this.validateUsername(username);
        if (!validation.valid) {
            return { error: validation.error };
        }
        
        // TODO: Replace with real API call
        // For now, return demo data
        return this._getDemoAccountData(validation.username);
    }
    
    /**
     * Get tweet data
     * @param {string} tweetId - Tweet ID to check
     * @returns {Promise<object>} Tweet data
     */
    async getTweetData(tweetId) {
        if (!tweetId) {
            return { error: 'Tweet ID is required' };
        }
        
        // TODO: Replace with real API call
        // For now, return demo data
        return this._getDemoTweetData(tweetId);
    }
    
    /**
     * Check shadowban status
     * @param {string} username - Username to check
     * @returns {Promise<object>} Shadowban check result
     */
    async checkShadowban(username) {
        const validation = this.validateUsername(username);
        if (!validation.valid) {
            return { error: validation.error };
        }
        
        // TODO: Replace with real API call
        // For now, return demo data from demo-data.js if available
        if (window.DemoData && window.DemoData.getResult) {
            const demoResult = window.DemoData.getResult('twitter', 'accountCheck');
            return {
                ...demoResult,
                username: validation.username
            };
        }
        
        return this._getDemoShadowbanResult(validation.username);
    }
    
    /**
     * Full power check (tweet + account)
     * @param {string} url - Tweet URL
     * @returns {Promise<object>} Full analysis result
     */
    async powerCheck(url) {
        const validation = this.validateUrl(url);
        if (!validation.valid) {
            return { error: validation.error };
        }
        
        // TODO: Replace with real API call
        // For now, return demo data from demo-data.js if available
        if (window.DemoData && window.DemoData.getResult) {
            const demoResult = window.DemoData.getResult('twitter', 'powerCheck');
            return {
                ...demoResult,
                inputUrl: url,
                normalizedUrl: validation.normalizedUrl,
                tweetId: validation.tweetId,
                username: validation.username
            };
        }
        
        return {
            demo: true,
            inputUrl: url,
            normalizedUrl: validation.normalizedUrl,
            type: validation.type,
            tweetId: validation.tweetId,
            username: validation.username,
            message: 'Demo data - connect to real API for live results'
        };
    }
    
    // =========================================================================
    // DEMO DATA HELPERS (Override parent)
    // =========================================================================
    
    _getDemoAccountData(username) {
        return {
            demo: true,
            platform: 'twitter',
            username: username,
            displayName: `@${username}`,
            exists: true,
            suspended: false,
            protected: false,
            verified: false,
            verifiedType: 'none',
            accountLabels: [],
            accountAge: 730, // ~2 years
            followerCount: Math.floor(Math.random() * 10000),
            followingCount: Math.floor(Math.random() * 1000),
            tweetCount: Math.floor(Math.random() * 5000),
            listedCount: Math.floor(Math.random() * 50),
            profileImageExists: true,
            bannerImageExists: true,
            bioText: 'Demo bio text for testing',
            bioUrls: [],
            pinnedTweetId: null,
            message: 'Demo data - connect to real API for live results'
        };
    }
    
    _getDemoTweetData(tweetId) {
        return {
            demo: true,
            platform: 'twitter',
            tweetId: tweetId,
            exists: true,
            tombstoned: false,
            ageRestricted: false,
            isRetweet: false,
            isQuoteRetweet: false,
            isReply: false,
            isThread: false,
            visibility: 'visible',
            replyCount: Math.floor(Math.random() * 100),
            retweetCount: Math.floor(Math.random() * 500),
            likeCount: Math.floor(Math.random() * 2000),
            quoteCount: Math.floor(Math.random() * 50),
            viewCount: Math.floor(Math.random() * 50000),
            message: 'Demo data - connect to real API for live results'
        };
    }
    
    _getDemoShadowbanResult(username) {
        return {
            demo: true,
            platform: 'twitter',
            username: username,
            probability: Math.floor(Math.random() * 40) + 10, // 10-50%
            checks: {
                searchBan: false,
                ghostBan: false,
                replyDeboosting: Math.random() > 0.7,
                suggestBan: Math.random() > 0.8,
                sensitiveMediaFlag: false
            },
            verifiedType: 'none',
            accountAge: 730,
            message: 'Demo data - connect to real API for live results'
        };
    }
}

// ============================================================================
// REGISTER PLATFORM
// ============================================================================
if (window.PlatformFactory) {
    window.PlatformFactory.register('twitter', TwitterPlatform);
}

// ============================================================================
// EXPORTS
// ============================================================================
window.TwitterPlatform = TwitterPlatform;

// ============================================================================
// INITIALIZATION
// ============================================================================
console.log('✅ TwitterPlatform loaded');

})();
