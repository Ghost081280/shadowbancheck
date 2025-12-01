/* =============================================================================
   FLAGGED-LINKS.JS - Link & Domain Reputation Database
   ShadowBanCheck.io
   
   Database of known flagged domains, link patterns, and content indicators
   that platforms commonly filter or suppress.
   
   Used by the Detection Agent (Factor 4) in the 5-Factor Engine.
   ============================================================================= */

(function() {
'use strict';

// ============================================
// FLAGGED LINKS DATABASE
// ============================================
const FlaggedLinks = {
    
    // ========================================
    // DATA
    // ========================================
    
    // Known bad/spam domains
    badDomains: [
        'spam-site.com',
        'free-followers.net',
        'get-likes-now.com',
        'buy-followers.io',
        'instant-fame.co',
        'viral-boost.net',
        'follow4follow.xyz',
        'like4like.club',
        'secure-login-verify.com',
        'account-verify-now.net',
        'download-free-stuff.ru',
        'crack-software.to',
    ],
    
    // Link shorteners (may reduce reach)
    shorteners: [
        'bit.ly',
        'tinyurl.com',
        'goo.gl',
        'ow.ly',
        't.co',
        'is.gd',
        'v.gd',
        'buff.ly',
        'j.mp',
        'soo.gd',
        'su.pr',
        's.id',
        'clck.ru',
        'bc.vc',
        'adf.ly',
        'shorturl.at',
        'rb.gy',
        'cutt.ly',
        'lnk.to',
        'smarturl.it',
        'dub.sh',
        'short.io',
        'rebrand.ly',
        'fb.me',
        'youtu.be',
        'amzn.to',
        'amzn.com',
        'ebay.to',
    ],
    
    // Link aggregators (may affect organic reach)
    linkAggregators: [
        'linktr.ee',
        'linktree.com',
        'lnk.bio',
        'bio.fm',
        'campsite.bio',
        'tap.bio',
        'beacons.ai',
        'contactinbio.com',
        'shor.by',
        'milkshake.app',
        'carrd.co',
        'bio.link',
        'link.bio',
        'allmylinks.com',
        'linkme.bio',
        'instabio.cc',
        'hoo.be',
        'jemi.so',
        'solo.to',
        'withkoji.com',
    ],
    
    // Platform-specific blocked domains
    platformDomains: {
        twitter: [
            'facebook.com',
            'instagram.com',
            'threads.net',
            'twitterfollow.me',
            'justunfollow.com',
            'crowdfire.com',
        ],
        reddit: [
            'clickbait-news.com',
            'viral-content-farm.net',
            'my-blog-promo.com',
            'zerohedge.com',
            'rt.com',
        ],
        instagram: [
            'linktree.com',
            'taplink.cc',
            'tiktok.com',
            'snapchat.com',
        ],
        tiktok: [
            'youtube.com',
            'instagram.com',
            'twitter.com',
            'x.com',
        ],
        facebook: [
            'tiktok.com',
            'twitter.com',
            'x.com',
        ],
        youtube: [
            'tiktok.com',
            'dailymotion.com',
            'vimeo.com',
        ],
    },
    
    // Affiliate/referral patterns
    affiliatePatterns: [
        '?ref=',
        '?aff=',
        '?affiliate=',
        '?partner=',
        '?referral=',
        '&ref=',
        '&aff=',
        '/affiliate/',
        '/ref/',
        '/partner/',
        'tag=',
        'associate-id=',
        'tracking_id=',
        'clickid=',
        'subid=',
        'amzn.to',
        'amazon.com/gp/product',
        'amazon.com?tag=',
        'shareasale.com',
        'linksynergy.com',
        'cj.com',
        'awin1.com',
        'impact.com',
        'partnerize.com',
        'rakuten.com',
        'clickbank.net',
        'jvzoo.com',
        'warriorplus.com',
    ],
    
    // Suspicious URL patterns
    suspiciousPatterns: [
        'free-followers',
        'buy-likes',
        'get-followers',
        'instant-fans',
        'boost-engagement',
        'viral-service',
        'growth-hack',
        'auto-follow',
        'follow-bot',
        'like-bot',
        'guaranteed-returns',
        'double-bitcoin',
        'crypto-giveaway',
        'free-crypto',
        'money-flip',
        'cash-app-flip',
        'onlyfans.com',
        'fansly.com',
        'fanvue.com',
        'online-casino',
        'sports-betting',
        'free-spins',
        'join-my-team',
        'passive-income-opportunity',
        'work-from-home-mlm',
    ],
    
    // ========================================
    // PUBLIC API METHODS
    // ========================================
    
    /**
     * Check a URL for flagged patterns
     * @param {string} url - URL to check
     * @param {string} platform - Platform context (optional)
     * @returns {Object} { status, issues, category }
     */
    checkUrl: function(url, platform = null) {
        if (!url || typeof url !== 'string') {
            return { status: 'safe', issues: [], category: null };
        }
        
        const urlLower = url.toLowerCase();
        const issues = [];
        let status = 'safe';
        let category = null;
        
        // Check bad domains
        for (const domain of this.badDomains) {
            if (urlLower.includes(domain)) {
                issues.push(`Known spam domain: ${domain}`);
                status = 'banned';
                category = 'spam';
            }
        }
        
        // Check shorteners
        for (const shortener of this.shorteners) {
            if (urlLower.includes(shortener)) {
                issues.push(`Link shortener: ${shortener}`);
                if (status === 'safe') status = 'restricted';
                category = category || 'shortener';
            }
        }
        
        // Check link aggregators
        for (const aggregator of this.linkAggregators) {
            if (urlLower.includes(aggregator)) {
                issues.push(`Link aggregator: ${aggregator}`);
                if (status === 'safe') status = 'restricted';
                category = category || 'aggregator';
            }
        }
        
        // Check affiliate patterns
        for (const pattern of this.affiliatePatterns) {
            if (urlLower.includes(pattern)) {
                issues.push(`Affiliate link detected`);
                if (status === 'safe') status = 'monitored';
                category = category || 'affiliate';
                break;
            }
        }
        
        // Check suspicious patterns
        for (const pattern of this.suspiciousPatterns) {
            if (urlLower.includes(pattern)) {
                issues.push(`Suspicious pattern: ${pattern}`);
                status = 'banned';
                category = category || 'suspicious';
            }
        }
        
        // Check platform-specific
        if (platform && this.platformDomains[platform]) {
            for (const domain of this.platformDomains[platform]) {
                if (urlLower.includes(domain)) {
                    issues.push(`${platform} may limit: ${domain}`);
                    if (status === 'safe') status = 'restricted';
                    category = category || 'platform-specific';
                }
            }
        }
        
        return {
            url: url,
            status: status,
            issues: issues,
            category: category,
            platform: platform
        };
    },
    
    /**
     * Check multiple URLs at once
     * @param {Array} urls - Array of URLs to check
     * @param {string} platform - Platform context
     * @returns {Object} { results, summary }
     */
    checkBulk: function(urls, platform = null) {
        if (!Array.isArray(urls)) urls = [urls];
        
        const results = urls.map(url => this.checkUrl(url, platform));
        
        const summary = {
            total: results.length,
            banned: results.filter(r => r.status === 'banned').length,
            restricted: results.filter(r => r.status === 'restricted').length,
            monitored: results.filter(r => r.status === 'monitored').length,
            safe: results.filter(r => r.status === 'safe').length
        };
        
        return { results, summary };
    },
    
    /**
     * Check if a domain is a known shortener
     * @param {string} url - URL to check
     * @returns {boolean}
     */
    isShortener: function(url) {
        if (!url) return false;
        const urlLower = url.toLowerCase();
        return this.shorteners.some(s => urlLower.includes(s));
    },
    
    /**
     * Check if a domain is a link aggregator
     * @param {string} url - URL to check
     * @returns {boolean}
     */
    isAggregator: function(url) {
        if (!url) return false;
        const urlLower = url.toLowerCase();
        return this.linkAggregators.some(a => urlLower.includes(a));
    },
    
    /**
     * Check if URL contains affiliate patterns
     * @param {string} url - URL to check
     * @returns {boolean}
     */
    isAffiliate: function(url) {
        if (!url) return false;
        const urlLower = url.toLowerCase();
        return this.affiliatePatterns.some(p => urlLower.includes(p));
    },
    
    /**
     * Extract domain from URL
     * @param {string} url - URL to parse
     * @returns {string|null}
     */
    extractDomain: function(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (e) {
            // Try regex fallback
            const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\?]+)/i);
            return match ? match[1] : null;
        }
    },
    
    /**
     * Get database statistics
     * @returns {Object}
     */
    getStats: function() {
        return {
            badDomains: this.badDomains.length,
            shorteners: this.shorteners.length,
            linkAggregators: this.linkAggregators.length,
            affiliatePatterns: this.affiliatePatterns.length,
            suspiciousPatterns: this.suspiciousPatterns.length,
            platformSpecific: Object.keys(this.platformDomains).length,
            total: this.badDomains.length + 
                   this.shorteners.length + 
                   this.linkAggregators.length + 
                   this.affiliatePatterns.length + 
                   this.suspiciousPatterns.length
        };
    }
};

// ============================================
// EXPORT TO WINDOW
// ============================================
window.FlaggedLinks = FlaggedLinks;

// Also keep old exports for backwards compatibility
window.flaggedLinks = FlaggedLinks;
window.checkUrlForFlags = function(url, platform) {
    const result = FlaggedLinks.checkUrl(url, platform);
    return {
        flagged: result.status !== 'safe',
        reasons: result.issues.map(i => ({ type: result.status === 'banned' ? 'danger' : 'warning', reason: i }))
    };
};

console.log('✅ FlaggedLinks database loaded -', FlaggedLinks.getStats().total, 'patterns');

})();
