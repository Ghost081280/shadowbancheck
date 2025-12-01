/* =============================================================================
   REDDIT.JS - Reddit Platform Implementation
   ShadowBanCheck.io
   
   Handles Reddit URLs - normalizes all variations
   
   Supported URL formats:
   - reddit.com/r/subreddit/comments/id/title
   - reddit.com/user/username
   - old.reddit.com/...
   - new.reddit.com/...
   - www.reddit.com/...
   - np.reddit.com/... (no participation)
   - redd.it/shortcode
   
   All normalize to: reddit.com/...
   ============================================================================= */

(function() {
'use strict';

// ============================================================================
// REDDIT PLATFORM CLASS
// ============================================================================
class RedditPlatform extends window.PlatformBase {
    
    constructor() {
        super('reddit');
        
        // Reserved paths that are not usernames or subreddits
        this.reservedPaths = [
            'r', 'u', 'user', 'submit', 'search', 'login', 'register',
            'prefs', 'wiki', 'message', 'compose', 'mod', 'about',
            'rules', 'coins', 'premium', 'posts', 'comments', 'saved',
            'hidden', 'upvoted', 'downvoted', 'gilded', 'api', 'dev',
            'advertising', 'help', 'contact', 'media', 'live', 'poll'
        ];
    }
    
    // =========================================================================
    // URL NORMALIZATION
    // =========================================================================
    
    normalizeRedditUrl(url) {
        if (!url || typeof url !== 'string') return '';
        
        let normalized = url.trim();
        normalized = normalized.replace(/^https?:\/\//, '');
        normalized = normalized
            .replace(/^(old\.|new\.|www\.|np\.|i\.|v\.|m\.)?reddit\.com/i, 'reddit.com');
        
        if (normalized.startsWith('redd.it/')) {
            normalized = 'reddit.com/comments/' + normalized.replace('redd.it/', '');
        }
        
        normalized = normalized.replace(/\/$/, '');
        return normalized;
    }
    
    getCanonicalUrl(url) {
        const normalized = this.normalizeRedditUrl(url);
        return normalized ? 'https://' + normalized : '';
    }
    
    isRedditUrl(url) {
        if (!url) return false;
        const lowerUrl = url.toLowerCase();
        return lowerUrl.includes('reddit.com') || lowerUrl.includes('redd.it');
    }
    
    // =========================================================================
    // EXTRACTION METHODS
    // =========================================================================
    
    extractUsername(url) {
        if (!url) return null;
        const normalized = this.normalizeRedditUrl(url);
        const match = normalized.match(/reddit\.com\/(?:u|user)\/([^\/\?#]+)/i);
        return match ? match[1].toLowerCase() : null;
    }
    
    extractSubreddit(url) {
        if (!url) return null;
        const normalized = this.normalizeRedditUrl(url);
        const match = normalized.match(/reddit\.com\/r\/([^\/\?#]+)/i);
        return match ? match[1].toLowerCase() : null;
    }
    
    extractPostId(url) {
        if (!url) return null;
        const normalized = this.normalizeRedditUrl(url);
        const match = normalized.match(/reddit\.com\/(?:r\/[^\/]+\/)?comments\/([a-z0-9]+)/i);
        return match ? match[1] : null;
    }
    
    extractCommentId(url) {
        if (!url) return null;
        const normalized = this.normalizeRedditUrl(url);
        const match = normalized.match(/reddit\.com\/r\/[^\/]+\/comments\/[^\/]+\/[^\/]+\/([a-z0-9]+)/i);
        return match ? match[1] : null;
    }
    
    getUrlType(url) {
        if (!url) return { type: 'invalid', valid: false };
        if (!this.isRedditUrl(url)) {
            return { type: 'invalid', valid: false, error: 'Not a Reddit URL' };
        }
        
        const normalized = this.normalizeRedditUrl(url);
        const postId = this.extractPostId(url);
        
        if (postId) {
            const subreddit = this.extractSubreddit(url);
            const commentId = this.extractCommentId(url);
            
            if (commentId) {
                return {
                    type: 'comment', valid: true, postId, commentId, subreddit,
                    normalizedUrl: 'https://' + normalized
                };
            }
            return {
                type: 'post', valid: true, postId, subreddit,
                normalizedUrl: 'https://' + normalized
            };
        }
        
        const username = this.extractUsername(url);
        if (username) {
            return { type: 'profile', valid: true, username, normalizedUrl: 'https://' + normalized };
        }
        
        const subreddit = this.extractSubreddit(url);
        if (subreddit) {
            return { type: 'subreddit', valid: true, subreddit, normalizedUrl: 'https://' + normalized };
        }
        
        return { type: 'other', valid: true, normalizedUrl: 'https://' + normalized };
    }
    
    // =========================================================================
    // VALIDATION
    // =========================================================================
    
    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { valid: false, error: 'Username is required' };
        }
        let clean = username.replace(/^u\//, '').replace(/^\/u\//, '').trim();
        if (clean.length === 0) return { valid: false, error: 'Username cannot be empty' };
        if (clean.length > 20) return { valid: false, error: 'Reddit usernames are max 20 characters' };
        if (clean.length < 3) return { valid: false, error: 'Reddit usernames are min 3 characters' };
        if (!/^[A-Za-z0-9_-]+$/.test(clean)) {
            return { valid: false, error: 'Only letters, numbers, underscores, and hyphens allowed' };
        }
        return { valid: true, username: clean };
    }
    
    validateUrl(url) {
        if (!url || typeof url !== 'string') return { valid: false, error: 'URL is required' };
        if (!this.isRedditUrl(url)) {
            return { valid: false, error: 'Not a Reddit URL' };
        }
        const urlType = this.getUrlType(url);
        return { valid: urlType.valid, ...urlType };
    }
    
    // =========================================================================
    // API METHODS (Demo data for now)
    // =========================================================================
    
    async getAccountData(username) {
        const validation = this.validateUsername(username);
        if (!validation.valid) return { error: validation.error };
        return this._getDemoAccountData(validation.username);
    }
    
    async getPostData(postId) {
        if (!postId) return { error: 'Post ID is required' };
        return this._getDemoPostData(postId);
    }
    
    async checkShadowban(username) {
        const validation = this.validateUsername(username);
        if (!validation.valid) return { error: validation.error };
        
        if (window.DemoData && window.DemoData.getResult) {
            const demoResult = window.DemoData.getResult('reddit', 'accountCheck');
            return { ...demoResult, username: validation.username };
        }
        return this._getDemoShadowbanResult(validation.username);
    }
    
    async powerCheck(url) {
        const validation = this.validateUrl(url);
        if (!validation.valid) return { error: validation.error };
        
        if (window.DemoData && window.DemoData.getResult) {
            const demoResult = window.DemoData.getResult('reddit', 'powerCheck');
            return {
                ...demoResult,
                inputUrl: url,
                normalizedUrl: validation.normalizedUrl,
                postId: validation.postId,
                subreddit: validation.subreddit
            };
        }
        
        return {
            demo: true, inputUrl: url, normalizedUrl: validation.normalizedUrl,
            type: validation.type, postId: validation.postId, subreddit: validation.subreddit,
            message: 'Demo data - connect to real API for live results'
        };
    }
    
    // =========================================================================
    // DEMO DATA HELPERS
    // =========================================================================
    
    _getDemoAccountData(username) {
        return {
            demo: true, platform: 'reddit', username,
            displayName: `u/${username}`, exists: true, suspended: false, shadowBanned: false,
            accountAge: 1095, postKarma: Math.floor(Math.random() * 10000),
            commentKarma: Math.floor(Math.random() * 50000),
            totalKarma: Math.floor(Math.random() * 60000),
            verifiedEmail: true, hasPremium: Math.random() > 0.8,
            isMod: Math.random() > 0.9,
            message: 'Demo data - connect to real API for live results'
        };
    }
    
    _getDemoPostData(postId) {
        return {
            demo: true, platform: 'reddit', postId, exists: true,
            removed: false, deleted: false, locked: false, archived: false,
            nsfw: false, score: Math.floor(Math.random() * 5000),
            upvoteRatio: 0.85 + Math.random() * 0.1,
            numComments: Math.floor(Math.random() * 500),
            automodFiltered: false, spamFiltered: false,
            message: 'Demo data - connect to real API for live results'
        };
    }
    
    _getDemoShadowbanResult(username) {
        return {
            demo: true, platform: 'reddit', username,
            probability: Math.floor(Math.random() * 30) + 5,
            checks: {
                shadowBanned: false, globalBan: false, subredditBans: [],
                automodFiltered: Math.random() > 0.8, lowKarmaRestriction: false
            },
            message: 'Demo data - connect to real API for live results'
        };
    }
}

// Register platform
if (window.PlatformFactory) {
    window.PlatformFactory.register('reddit', RedditPlatform);
}

window.RedditPlatform = RedditPlatform;
console.log('✅ RedditPlatform loaded');

})();
