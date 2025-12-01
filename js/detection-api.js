/* =============================================================================
   DETECTION-API.JS - Frontend API Client
   ShadowBanCheck.io
   
   Client-side API wrapper for the 5-Factor Detection Engine.
   Can work in two modes:
   1. Local mode - Uses browser-side engine directly (demo/testing)
   2. API mode - Calls backend server endpoints (production)
   
   Usage:
   const api = new DetectionAPI({ mode: 'local' }); // or 'api'
   const result = await api.powerCheck('https://x.com/user/status/123');
   ============================================================================= */

(function() {
'use strict';

// ============================================================================
// DETECTION API CLIENT
// ============================================================================
class DetectionAPI {
    
    constructor(options = {}) {
        this.mode = options.mode || 'local'; // 'local' or 'api'
        this.baseUrl = options.baseUrl || '/api';
        this.timeout = options.timeout || 30000; // 30 seconds
        this.debug = options.debug || false;
        
        // Callbacks for UI updates
        this.onStart = options.onStart || null;
        this.onProgress = options.onProgress || null;
        this.onComplete = options.onComplete || null;
        this.onError = options.onError || null;
    }
    
    // =========================================================================
    // PUBLIC METHODS - 3 Main Tools
    // =========================================================================
    
    /**
     * 3-in-1 Power Check - Full analysis of a post URL
     * @param {string} url - Post URL (Twitter/X or Reddit)
     * @returns {Promise<object>} Complete analysis result
     */
    async powerCheck(url) {
        this._log('Power Check:', url);
        this._emit('start', { type: 'powerCheck', url });
        
        try {
            let result;
            
            if (this.mode === 'local') {
                // Use local engine
                if (window.shadowBanEngine) {
                    result = await window.shadowBanEngine.powerCheck(url);
                } else if (window.powerCheck) {
                    result = await window.powerCheck(url);
                } else {
                    throw new Error('Local engine not loaded');
                }
            } else {
                // Call API
                result = await this._post('/analyze/post', { url });
            }
            
            this._emit('complete', { type: 'powerCheck', result });
            return result;
            
        } catch (error) {
            this._emit('error', { type: 'powerCheck', error });
            throw error;
        }
    }
    
    /**
     * Account Check - Analyze account shadowban status
     * @param {string} username - Username (with or without @)
     * @param {string} platform - Platform ID (default: 'twitter')
     * @returns {Promise<object>} Account analysis result
     */
    async checkAccount(username, platform = 'twitter') {
        this._log('Account Check:', username, platform);
        this._emit('start', { type: 'accountCheck', username, platform });
        
        try {
            let result;
            
            if (this.mode === 'local') {
                if (window.shadowBanEngine) {
                    result = await window.shadowBanEngine.checkAccount(username, platform);
                } else if (window.checkAccount) {
                    result = await window.checkAccount(username, platform);
                } else {
                    throw new Error('Local engine not loaded');
                }
            } else {
                result = await this._post('/analyze/account', { username, platform });
            }
            
            this._emit('complete', { type: 'accountCheck', result });
            return result;
            
        } catch (error) {
            this._emit('error', { type: 'accountCheck', error });
            throw error;
        }
    }
    
    /**
     * Hashtag/Cashtag Check - Check safety of tags
     * @param {string|array} tags - Tags to check
     * @param {string} platform - Platform ID (default: 'twitter')
     * @returns {Promise<object>} Tag analysis result
     */
    async checkTags(tags, platform = 'twitter') {
        this._log('Tag Check:', tags, platform);
        this._emit('start', { type: 'tagCheck', tags, platform });
        
        try {
            let result;
            
            // Normalize tags to array
            const tagArray = this._normalizeTags(tags);
            
            if (this.mode === 'local') {
                if (window.shadowBanEngine) {
                    result = await window.shadowBanEngine.checkTags(tagArray, platform);
                } else if (window.checkTags) {
                    result = await window.checkTags(tagArray, platform);
                } else {
                    throw new Error('Local engine not loaded');
                }
            } else {
                result = await this._post('/hashtag/check-bulk', { tags: tagArray, platform });
            }
            
            this._emit('complete', { type: 'tagCheck', result });
            return result;
            
        } catch (error) {
            this._emit('error', { type: 'tagCheck', error });
            throw error;
        }
    }
    
    // =========================================================================
    // ADDITIONAL API METHODS
    // =========================================================================
    
    /**
     * Analyze text content for flagged terms
     * @param {string} text - Text to analyze
     * @param {string} platform - Platform ID
     * @returns {Promise<object>} Content analysis result
     */
    async analyzeContent(text, platform = 'twitter') {
        this._log('Content Analysis:', text.substring(0, 50) + '...');
        
        if (this.mode === 'local') {
            if (window.FlaggedContent) {
                return window.FlaggedContent.scan(text, platform);
            }
            throw new Error('FlaggedContent not loaded');
        }
        
        return await this._post('/content/analyze', { text, platform });
    }
    
    /**
     * Check links for flags
     * @param {array} urls - URLs to check
     * @param {string} platform - Platform ID
     * @returns {Promise<object>} Link analysis result
     */
    async checkLinks(urls, platform = 'twitter') {
        this._log('Link Check:', urls);
        
        if (this.mode === 'local') {
            if (window.FlaggedLinks) {
                return window.FlaggedLinks.checkBulk(urls, platform);
            }
            // Return safe result if database not loaded
            return { urls, flagged: [], safe: urls };
        }
        
        return await this._post('/link/check-bulk', { urls, platform });
    }
    
    /**
     * Check mentions for flags
     * @param {array} mentions - Mentions to check
     * @param {string} platform - Platform ID
     * @returns {Promise<object>} Mention analysis result
     */
    async checkMentions(mentions, platform = 'twitter') {
        this._log('Mention Check:', mentions);
        
        if (this.mode === 'local') {
            if (window.FlaggedMentions) {
                return window.FlaggedMentions.checkBulk(mentions, platform);
            }
            return { mentions, flagged: [], safe: mentions };
        }
        
        return await this._post('/mention/check-bulk', { mentions, platform });
    }
    
    /**
     * Check emojis for flags
     * @param {string} text - Text containing emojis
     * @param {string} platform - Platform ID
     * @returns {Promise<object>} Emoji analysis result
     */
    async checkEmojis(text, platform = 'twitter') {
        this._log('Emoji Check');
        
        if (this.mode === 'local') {
            if (window.FlaggedEmojis) {
                return window.FlaggedEmojis.extractAndCheck(text, platform);
            }
            return { emojis: [], flagged: [], safe: [] };
        }
        
        return await this._post('/emoji/check-bulk', { text, platform });
    }
    
    // =========================================================================
    // SEARCH METHODS
    // =========================================================================
    
    /**
     * Search hashtag database
     * @param {string} query - Search query
     * @param {string} platform - Platform filter (optional)
     * @returns {Promise<object>} Search results
     */
    async searchHashtags(query, platform = null) {
        if (this.mode === 'local') {
            if (window.FlaggedHashtags) {
                return window.FlaggedHashtags.search(query, platform);
            }
            return [];
        }
        
        const params = new URLSearchParams({ q: query });
        if (platform) params.append('platform', platform);
        
        return await this._get(`/hashtag/search?${params}`);
    }
    
    /**
     * Search content database
     * @param {string} query - Search query
     * @returns {Promise<object>} Search results
     */
    async searchContent(query) {
        if (this.mode === 'local') {
            if (window.FlaggedContent) {
                return window.FlaggedContent.getByCategory(query) || [];
            }
            return [];
        }
        
        return await this._get(`/content/search?q=${encodeURIComponent(query)}`);
    }
    
    // =========================================================================
    // REPORTING METHODS
    // =========================================================================
    
    /**
     * Report a hashtag
     * @param {object} report - Report data { tag, platform, status, reason }
     * @returns {Promise<object>} Report confirmation
     */
    async reportHashtag(report) {
        if (this.mode === 'local') {
            console.log('Hashtag report (local mode):', report);
            return { success: true, message: 'Report logged locally' };
        }
        
        return await this._post('/hashtag/report', report);
    }
    
    /**
     * Report a link
     * @param {object} report - Report data
     * @returns {Promise<object>} Report confirmation
     */
    async reportLink(report) {
        if (this.mode === 'local') {
            console.log('Link report (local mode):', report);
            return { success: true, message: 'Report logged locally' };
        }
        
        return await this._post('/link/report', report);
    }
    
    // =========================================================================
    // STATS METHODS
    // =========================================================================
    
    /**
     * Get health status
     * @returns {Promise<object>} Health status
     */
    async getHealth() {
        if (this.mode === 'local') {
            return {
                status: 'healthy',
                mode: 'local',
                engineLoaded: !!window.shadowBanEngine,
                timestamp: new Date().toISOString()
            };
        }
        
        return await this._get('/health');
    }
    
    /**
     * Get engine statistics
     * @returns {Promise<object>} Statistics
     */
    async getStats() {
        if (this.mode === 'local') {
            const stats = {
                mode: 'local',
                databases: {}
            };
            
            if (window.FlaggedHashtags) {
                stats.databases.hashtags = window.FlaggedHashtags.getStats();
            }
            if (window.FlaggedContent) {
                stats.databases.content = window.FlaggedContent.getStats();
            }
            if (window.FlaggedMentions) {
                stats.databases.mentions = window.FlaggedMentions.getStats();
            }
            if (window.FlaggedEmojis) {
                stats.databases.emojis = window.FlaggedEmojis.getStats();
            }
            
            return stats;
        }
        
        return await this._get('/stats');
    }
    
    /**
     * Get hashtag database stats
     * @returns {Promise<object>} Hashtag stats
     */
    async getHashtagStats() {
        if (this.mode === 'local' && window.FlaggedHashtags) {
            return window.FlaggedHashtags.getStats();
        }
        return await this._get('/hashtag/stats');
    }
    
    // =========================================================================
    // UTILITY METHODS
    // =========================================================================
    
    /**
     * Detect platform from URL
     * @param {string} url - URL to analyze
     * @returns {string|null} Platform ID or null
     */
    detectPlatform(url) {
        if (!url) return null;
        const lower = url.toLowerCase();
        
        if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
        if (lower.includes('reddit.com') || lower.includes('redd.it')) return 'reddit';
        if (lower.includes('instagram.com')) return 'instagram';
        if (lower.includes('tiktok.com')) return 'tiktok';
        
        return null;
    }
    
    /**
     * Normalize URL for the detected platform
     * @param {string} url - URL to normalize
     * @returns {string} Normalized URL
     */
    normalizeUrl(url) {
        const platform = this.detectPlatform(url);
        
        if (platform === 'twitter' && window.TwitterPlatform) {
            const tp = new window.TwitterPlatform();
            return tp.getCanonicalUrl(url);
        }
        if (platform === 'reddit' && window.RedditPlatform) {
            const rp = new window.RedditPlatform();
            return rp.getCanonicalUrl(url);
        }
        
        return url;
    }
    
    /**
     * Set API mode
     * @param {string} mode - 'local' or 'api'
     */
    setMode(mode) {
        this.mode = mode;
    }
    
    /**
     * Set base URL for API mode
     * @param {string} url - Base URL
     */
    setBaseUrl(url) {
        this.baseUrl = url;
    }
    
    // =========================================================================
    // PRIVATE METHODS
    // =========================================================================
    
    _normalizeTags(tags) {
        if (typeof tags === 'string') {
            return tags.split(/[\s,\n]+/).filter(t => t.length > 0);
        }
        if (Array.isArray(tags)) {
            return tags;
        }
        return [];
    }
    
    async _get(endpoint) {
        const url = this.baseUrl + endpoint;
        this._log('GET:', url);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw error;
        }
    }
    
    async _post(endpoint, data) {
        const url = this.baseUrl + endpoint;
        this._log('POST:', url, data);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody.message || `HTTP ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw error;
        }
    }
    
    _emit(event, data) {
        switch (event) {
            case 'start':
                if (this.onStart) this.onStart(data);
                break;
            case 'progress':
                if (this.onProgress) this.onProgress(data);
                break;
            case 'complete':
                if (this.onComplete) this.onComplete(data);
                break;
            case 'error':
                if (this.onError) this.onError(data);
                break;
        }
    }
    
    _log(...args) {
        if (this.debug) {
            console.log('[DetectionAPI]', ...args);
        }
    }
}

// ============================================================================
// CONVENIENCE INSTANCE
// ============================================================================

// Create default instance
const defaultAPI = new DetectionAPI({ mode: 'local', debug: false });

// ============================================================================
// EXPORTS
// ============================================================================
window.DetectionAPI = DetectionAPI;
window.detectionAPI = defaultAPI;

// ============================================================================
// INITIALIZATION
// ============================================================================
console.log('✅ DetectionAPI client loaded');

})();
