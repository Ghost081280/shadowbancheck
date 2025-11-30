/* =============================================================================
   HASHTAG-API.JS - Real-Time Hashtag API Client
   ShadowBanCheck.io
   
   Frontend client for connecting to the Real-Time Hashtag Engine API.
   Handles caching, fallback to local database, and UI updates.
   ============================================================================= */

(function() {
'use strict';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // API endpoint (Railway deployment URL)
    API_BASE: window.HASHTAG_API_URL || 'https://shadowbancheck-api.up.railway.app',
    
    // Fallback to local check if API fails
    FALLBACK_TO_LOCAL: true,
    
    // Cache duration (milliseconds)
    CACHE_DURATION: 60 * 60 * 1000, // 1 hour
    
    // Request timeout
    TIMEOUT: 10000, // 10 seconds
    
    // Max hashtags per bulk request
    MAX_BULK_SIZE: 30
};

// ============================================
// LOCAL CACHE
// ============================================
const cache = {
    data: new Map(),
    
    get(key) {
        const item = this.data.get(key);
        if (!item) return null;
        
        // Check expiry
        if (Date.now() > item.expiry) {
            this.data.delete(key);
            return null;
        }
        
        return item.value;
    },
    
    set(key, value, duration = CONFIG.CACHE_DURATION) {
        this.data.set(key, {
            value: value,
            expiry: Date.now() + duration
        });
    },
    
    clear() {
        this.data.clear();
    }
};

// ============================================
// API CLIENT
// ============================================
const HashtagAPI = {
    
    /**
     * Check a single hashtag in real-time
     * @param {string} hashtag - Hashtag to check (with or without #)
     * @param {string} platform - Platform ID
     * @returns {Promise<Object>} Hashtag status
     */
    async checkHashtag(hashtag, platform) {
        const cleanTag = hashtag.replace('#', '').toLowerCase();
        const cacheKey = `${cleanTag}:${platform}`;
        
        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(`📦 Cache hit: #${cleanTag} on ${platform}`);
            return { ...cached, source: 'cache' };
        }
        
        try {
            const response = await this._fetchWithTimeout(
                `${CONFIG.API_BASE}/api/hashtag/check?hashtag=${encodeURIComponent(cleanTag)}&platform=${encodeURIComponent(platform)}`,
                { method: 'GET' }
            );
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                // Cache the result
                cache.set(cacheKey, result.data);
                return { ...result.data, source: 'api' };
            }
            
            throw new Error('Invalid API response');
            
        } catch (error) {
            console.warn(`⚠️ API error for #${cleanTag}:`, error.message);
            
            // Fallback to local database
            if (CONFIG.FALLBACK_TO_LOCAL) {
                return this._checkLocal(cleanTag, platform);
            }
            
            return {
                hashtag: cleanTag,
                platform: platform,
                status: 'unknown',
                confidence: 0,
                source: 'error',
                error: error.message
            };
        }
    },
    
    /**
     * Check multiple hashtags in bulk
     * @param {Array<string>} hashtags - Array of hashtags
     * @param {string} platform - Platform ID
     * @returns {Promise<Object>} Bulk results with summary
     */
    async checkBulk(hashtags, platform) {
        // Clean hashtags
        const cleanTags = hashtags.map(h => h.replace('#', '').toLowerCase());
        
        // Check cache for each
        const results = [];
        const uncached = [];
        
        cleanTags.forEach(tag => {
            const cacheKey = `${tag}:${platform}`;
            const cached = cache.get(cacheKey);
            
            if (cached) {
                results.push({ ...cached, source: 'cache' });
            } else {
                uncached.push(tag);
            }
        });
        
        // If all cached, return immediately
        if (uncached.length === 0) {
            console.log(`📦 All ${cleanTags.length} hashtags from cache`);
            return this._summarizeResults(results);
        }
        
        // Fetch uncached from API
        try {
            const response = await this._fetchWithTimeout(
                `${CONFIG.API_BASE}/api/hashtag/check-bulk`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hashtags: uncached.slice(0, CONFIG.MAX_BULK_SIZE),
                        platform: platform
                    })
                }
            );
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const apiResult = await response.json();
            
            if (apiResult.success && apiResult.results) {
                // Cache each result
                apiResult.results.forEach(r => {
                    const cacheKey = `${r.hashtag}:${platform}`;
                    cache.set(cacheKey, r);
                    results.push({ ...r, source: 'api' });
                });
                
                return this._summarizeResults(results);
            }
            
            throw new Error('Invalid API response');
            
        } catch (error) {
            console.warn('⚠️ Bulk API error:', error.message);
            
            // Fallback to local for uncached
            if (CONFIG.FALLBACK_TO_LOCAL) {
                uncached.forEach(tag => {
                    results.push(this._checkLocal(tag, platform));
                });
            }
            
            return this._summarizeResults(results);
        }
    },
    
    /**
     * Report a hashtag as banned/restricted
     * @param {string} hashtag - Hashtag to report
     * @param {string} platform - Platform ID
     * @param {string} status - Reported status (banned/restricted)
     * @param {string} evidence - Optional evidence/notes
     * @returns {Promise<Object>} Report result
     */
    async reportHashtag(hashtag, platform, status, evidence = '') {
        const cleanTag = hashtag.replace('#', '').toLowerCase();
        
        try {
            const response = await this._fetchWithTimeout(
                `${CONFIG.API_BASE}/api/hashtag/report`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hashtag: cleanTag,
                        platform: platform,
                        reportedStatus: status,
                        evidence: evidence
                    })
                }
            );
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Invalidate cache for this hashtag
            cache.data.delete(`${cleanTag}:${platform}`);
            
            return result;
            
        } catch (error) {
            console.error('Report error:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Get database statistics
     * @returns {Promise<Object>} Stats object
     */
    async getStats() {
        try {
            const response = await this._fetchWithTimeout(
                `${CONFIG.API_BASE}/api/hashtag/stats`,
                { method: 'GET' }
            );
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.warn('Stats fetch error:', error.message);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Search hashtags (for Research Dashboard)
     * @param {Object} params - Search parameters
     * @returns {Promise<Object>} Search results
     */
    async search(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.query) queryParams.set('query', params.query);
        if (params.platform) queryParams.set('platform', params.platform);
        if (params.status) queryParams.set('status', params.status);
        if (params.limit) queryParams.set('limit', params.limit);
        if (params.offset) queryParams.set('offset', params.offset);
        
        try {
            const response = await this._fetchWithTimeout(
                `${CONFIG.API_BASE}/api/hashtag/search?${queryParams.toString()}`,
                { method: 'GET' }
            );
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.warn('Search error:', error.message);
            return { success: false, error: error.message, results: [] };
        }
    },
    
    /**
     * Get recently banned hashtags (for Research Dashboard)
     * @param {Object} params - Parameters
     * @returns {Promise<Object>} Recent bans
     */
    async getRecentBans(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.platform) queryParams.set('platform', params.platform);
        if (params.days) queryParams.set('days', params.days);
        if (params.limit) queryParams.set('limit', params.limit);
        
        try {
            const response = await this._fetchWithTimeout(
                `${CONFIG.API_BASE}/api/hashtag/recent-bans?${queryParams.toString()}`,
                { method: 'GET' }
            );
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.warn('Recent bans error:', error.message);
            return { success: false, error: error.message, results: [] };
        }
    },
    
    /**
     * Check API health
     * @returns {Promise<boolean>} True if API is healthy
     */
    async isHealthy() {
        try {
            const response = await this._fetchWithTimeout(
                `${CONFIG.API_BASE}/api/health`,
                { method: 'GET' },
                5000 // 5 second timeout for health check
            );
            
            return response.ok;
        } catch {
            return false;
        }
    },
    
    // ========================================
    // PRIVATE METHODS
    // ========================================
    
    /**
     * Fetch with timeout
     */
    async _fetchWithTimeout(url, options = {}, timeout = CONFIG.TIMEOUT) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    },
    
    /**
     * Fallback local check using window.bannedHashtags
     */
    _checkLocal(hashtag, platform) {
        console.log(`📂 Local fallback: #${hashtag} on ${platform}`);
        
        let status = 'safe';
        let confidence = 50;
        
        // Check against local banned hashtags database
        if (window.bannedHashtags) {
            const platformBanned = window.bannedHashtags[platform]?.banned || [];
            const platformRestricted = window.bannedHashtags[platform]?.restricted || [];
            const allBanned = window.bannedHashtags.all?.banned || [];
            const allRestricted = window.bannedHashtags.all?.restricted || [];
            
            if (platformBanned.includes(hashtag) || allBanned.includes(hashtag)) {
                status = 'banned';
                confidence = 85;
            } else if (platformRestricted.includes(hashtag) || allRestricted.includes(hashtag)) {
                status = 'restricted';
                confidence = 75;
            }
        }
        
        // Pattern matching fallback
        if (status === 'safe') {
            const bannedPatterns = ['porn', 'xxx', 'nsfw', 'nude', 'naked', 'followback', 'f4f', 'follow4follow'];
            const restrictedPatterns = ['like4like', 'l4l', 'spam', 'dm', 'adult'];
            
            if (bannedPatterns.some(p => hashtag.includes(p))) {
                status = 'banned';
                confidence = 70;
            } else if (restrictedPatterns.some(p => hashtag.includes(p))) {
                status = 'restricted';
                confidence = 60;
            }
        }
        
        return {
            hashtag: hashtag,
            platform: platform,
            status: status,
            confidence: confidence,
            source: 'local',
            lastVerified: null,
            needsVerification: true
        };
    },
    
    /**
     * Summarize bulk results
     */
    _summarizeResults(results) {
        return {
            success: true,
            summary: {
                total: results.length,
                banned: results.filter(r => r.status === 'banned').length,
                restricted: results.filter(r => r.status === 'restricted').length,
                safe: results.filter(r => r.status === 'safe').length,
                unknown: results.filter(r => r.status === 'unknown').length
            },
            results: results,
            timestamp: new Date().toISOString()
        };
    }
};

// ============================================
// EXPORT
// ============================================
window.HashtagAPI = HashtagAPI;

// Also expose cache for debugging
window.HashtagAPICache = cache;

console.log('✅ HashtagAPI client loaded');
console.log(`   API endpoint: ${CONFIG.API_BASE}`);

})();
