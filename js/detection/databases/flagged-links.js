/* =============================================================================
   FLAGGED-LINKS.JS - Link Database
   ShadowBanCheck.io
   
   Comprehensive database of throttled, blocked, and suspicious links.
   
   Key Data Sources:
   - The Markup Investigation (Sept 2023) - Twitter link throttling confirmation
   - Platform transparency reports
   - Community reports
   - Known spam/malware domains
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// THROTTLED DOMAINS (The Markup Research - Sept 2023)
// These domains have confirmed delays (2.5s+) when posted on Twitter/X
// =============================================================================

const THROTTLED_DOMAINS = [
    // Major competitors (confirmed by The Markup)
    { domain: 'facebook.com', delay: '2.5s+', source: 'The Markup', confirmed: true },
    { domain: 'instagram.com', delay: '2.5s+', source: 'The Markup', confirmed: true },
    { domain: 'threads.net', delay: '2.5s+', source: 'The Markup', confirmed: true },
    { domain: 'bluesky.social', delay: '2.5s+', source: 'The Markup', confirmed: true },
    { domain: 'bsky.app', delay: '2.5s+', source: 'Community reports', confirmed: false },
    { domain: 'mastodon.social', delay: '2.5s+', source: 'Community reports', confirmed: false },
    
    // News/Media (The Markup confirmed)
    { domain: 'nytimes.com', delay: '2.5s+', source: 'The Markup', confirmed: true },
    { domain: 'reuters.com', delay: '2.5s+', source: 'The Markup', confirmed: true },
    
    // Newsletter platforms (high reports)
    { domain: 'substack.com', delay: '5s+', source: 'Community reports', confirmed: false, notes: 'High user reports' },
    { domain: 'beehiiv.com', delay: 'suspected', source: 'Community reports', confirmed: false },
    { domain: 'buttondown.email', delay: 'suspected', source: 'Community reports', confirmed: false },
    { domain: 'convertkit.com', delay: 'suspected', source: 'Community reports', confirmed: false },
    
    // Other platforms
    { domain: 'medium.com', delay: 'suspected', source: 'Community reports', confirmed: false },
    { domain: 'linkedin.com', delay: 'suspected', source: 'Community reports', confirmed: false }
];

// =============================================================================
// LINK SHORTENERS (Often auto-removed or flagged)
// =============================================================================

const LINK_SHORTENERS = [
    // Major shorteners
    { domain: 'bit.ly', risk: 'high', notes: 'Most flagged shortener' },
    { domain: 'tinyurl.com', risk: 'high', notes: 'Common spam vector' },
    { domain: 'goo.gl', risk: 'high', notes: 'Deprecated but still flagged' },
    { domain: 't.co', risk: 'low', notes: 'Twitter\'s own shortener - usually safe' },
    { domain: 'ow.ly', risk: 'medium', notes: 'Hootsuite shortener' },
    { domain: 'is.gd', risk: 'high', notes: 'Often spam' },
    { domain: 'buff.ly', risk: 'medium', notes: 'Buffer shortener' },
    { domain: 'rebrand.ly', risk: 'medium', notes: 'Branded shortener' },
    { domain: 'short.io', risk: 'medium', notes: 'URL shortener' },
    { domain: 'cutt.ly', risk: 'high', notes: 'High spam association' },
    { domain: 'rb.gy', risk: 'high', notes: 'High spam association' },
    { domain: 'v.gd', risk: 'high', notes: 'High spam association' },
    { domain: 'shorturl.at', risk: 'high', notes: 'Spam vector' },
    { domain: 'tiny.cc', risk: 'high', notes: 'Spam vector' },
    { domain: 'lnkd.in', risk: 'low', notes: 'LinkedIn shortener' },
    { domain: 'youtu.be', risk: 'low', notes: 'YouTube shortener - usually safe' },
    { domain: 'redd.it', risk: 'low', notes: 'Reddit shortener - usually safe' },
    { domain: 'amzn.to', risk: 'low', notes: 'Amazon shortener' },
    { domain: 'trib.al', risk: 'medium', notes: 'Social shortener' }
];

// =============================================================================
// BLOCKED/SPAM DOMAINS
// =============================================================================

const BLOCKED_DOMAINS = [
    // Known spam/scam domains
    { domain: 'spam-site.com', category: 'spam', severity: 'critical' },
    { domain: 'get-followers-free.com', category: 'spam', severity: 'critical' },
    { domain: 'free-likes.net', category: 'spam', severity: 'critical' },
    
    // Phishing patterns
    { pattern: /paypa[l1].*\.com/i, category: 'phishing', severity: 'critical' },
    { pattern: /amaz[o0]n.*login/i, category: 'phishing', severity: 'critical' },
    { pattern: /micros[o0]ft.*verify/i, category: 'phishing', severity: 'critical' },
    { pattern: /g[o0][o0]gle.*signin/i, category: 'phishing', severity: 'critical' },
    
    // Malware distribution
    { pattern: /free-download.*exe/i, category: 'malware', severity: 'critical' },
    { pattern: /crack.*software/i, category: 'malware', severity: 'critical' }
];

// =============================================================================
// SUSPICIOUS PATTERNS
// =============================================================================

const SUSPICIOUS_PATTERNS = [
    // Affiliate spam
    { pattern: /\?ref=/i, category: 'affiliate', severity: 'low', notes: 'Referral link' },
    { pattern: /\?aff=/i, category: 'affiliate', severity: 'low', notes: 'Affiliate link' },
    { pattern: /affiliate/i, category: 'affiliate', severity: 'low', notes: 'Affiliate link' },
    
    // Tracking parameters (not blocked, but noted)
    { pattern: /utm_/i, category: 'tracking', severity: 'none', notes: 'Marketing tracking' },
    
    // Crypto/scam patterns
    { pattern: /free.*bitcoin/i, category: 'scam', severity: 'high' },
    { pattern: /crypto.*giveaway/i, category: 'scam', severity: 'high' },
    { pattern: /double.*your.*money/i, category: 'scam', severity: 'critical' },
    { pattern: /guaranteed.*profit/i, category: 'scam', severity: 'critical' }
];

// =============================================================================
// PLATFORM-SPECIFIC RULES
// =============================================================================

const PLATFORM_RULES = {
    twitter: {
        throttledDomains: THROTTLED_DOMAINS,
        shortenerBehavior: 'flag', // Flag but don't block
        notes: 'External links may have 2.5s+ load delay'
    },
    reddit: {
        shortenerBehavior: 'auto-remove', // AutoMod removes
        blockedDomains: ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co'],
        selfPromoLimit: 0.10 // 10% max
    },
    instagram: {
        linksInPosts: 'blocked', // Can't put links in posts
        linksInBio: 'allowed',
        linksInStories: 'verified_only'
    },
    linkedin: {
        externalLinks: 'penalized', // LinkedIn prefers native content
        notes: 'External links may reduce reach by 50%+'
    }
};

// =============================================================================
// FLAGGED LINKS API
// =============================================================================

const FlaggedLinks = {
    
    /**
     * Check multiple URLs at once
     * @param {array} urls - Array of URLs to check
     * @param {string} platform - Platform ID
     * @returns {object} Results
     */
    checkBulk: function(urls, platform = 'twitter') {
        const results = {
            throttled: [],
            blocked: [],
            shorteners: [],
            suspicious: [],
            safe: [],
            summary: {
                total: urls.length,
                riskScore: 0
            }
        };
        
        for (const url of urls) {
            if (!url) continue;
            
            const urlLower = url.toLowerCase();
            let domain;
            
            try {
                domain = new URL(url).hostname.replace(/^www\./, '');
            } catch {
                // Invalid URL, try to extract domain
                const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/i);
                domain = match ? match[1] : url;
            }
            
            let categorized = false;
            
            // Check blocked domains/patterns
            for (const blocked of BLOCKED_DOMAINS) {
                if (blocked.domain && urlLower.includes(blocked.domain)) {
                    results.blocked.push({ url, domain, ...blocked });
                    results.summary.riskScore += 40;
                    categorized = true;
                    break;
                }
                if (blocked.pattern && blocked.pattern.test(url)) {
                    results.blocked.push({ url, domain, ...blocked, matchedPattern: true });
                    results.summary.riskScore += 40;
                    categorized = true;
                    break;
                }
            }
            if (categorized) continue;
            
            // Check throttled domains
            const throttled = THROTTLED_DOMAINS.find(t => 
                domain.includes(t.domain) || urlLower.includes(t.domain)
            );
            if (throttled) {
                results.throttled.push({ url, domain, ...throttled });
                results.summary.riskScore += throttled.confirmed ? 25 : 15;
                continue;
            }
            
            // Check shorteners
            const shortener = LINK_SHORTENERS.find(s => 
                domain === s.domain || domain.endsWith('.' + s.domain)
            );
            if (shortener) {
                results.shorteners.push({ url, domain, ...shortener });
                results.summary.riskScore += shortener.risk === 'high' ? 15 : 
                                             shortener.risk === 'medium' ? 10 : 5;
                continue;
            }
            
            // Check suspicious patterns
            let isSuspicious = false;
            for (const pattern of SUSPICIOUS_PATTERNS) {
                if (pattern.pattern.test(url)) {
                    results.suspicious.push({ url, domain, ...pattern, matchedPattern: true });
                    results.summary.riskScore += pattern.severity === 'critical' ? 30 :
                                                pattern.severity === 'high' ? 20 :
                                                pattern.severity === 'medium' ? 10 : 5;
                    isSuspicious = true;
                    break;
                }
            }
            if (isSuspicious) continue;
            
            // Safe
            results.safe.push({ url, domain, status: 'safe' });
        }
        
        return results;
    },
    
    /**
     * Check a single URL
     */
    check: function(url, platform = 'twitter') {
        const result = this.checkBulk([url], platform);
        
        if (result.blocked.length > 0) return { status: 'blocked', ...result.blocked[0] };
        if (result.throttled.length > 0) return { status: 'throttled', ...result.throttled[0] };
        if (result.shorteners.length > 0) return { status: 'shortener', ...result.shorteners[0] };
        if (result.suspicious.length > 0) return { status: 'suspicious', ...result.suspicious[0] };
        return { status: 'safe', url };
    },
    
    /**
     * Check if domain is a link shortener
     */
    isShortener: function(url) {
        try {
            const domain = new URL(url).hostname.replace(/^www\./, '');
            return LINK_SHORTENERS.some(s => domain === s.domain || domain.endsWith('.' + s.domain));
        } catch {
            return false;
        }
    },
    
    /**
     * Check if domain is throttled
     */
    isThrottled: function(url, platform = 'twitter') {
        try {
            const domain = new URL(url).hostname.replace(/^www\./, '');
            return THROTTLED_DOMAINS.some(t => domain.includes(t.domain));
        } catch {
            return false;
        }
    },
    
    /**
     * Get platform rules
     */
    getPlatformRules: function(platform) {
        return PLATFORM_RULES[platform] || PLATFORM_RULES.twitter;
    },
    
    /**
     * Get throttled domains list
     */
    getThrottledDomains: function() {
        return THROTTLED_DOMAINS.map(t => t.domain);
    },
    
    /**
     * Get shorteners list
     */
    getShorteners: function() {
        return LINK_SHORTENERS.map(s => s.domain);
    },
    
    /**
     * Get stats
     */
    getStats: function() {
        return {
            throttledDomains: THROTTLED_DOMAINS.length,
            confirmedThrottled: THROTTLED_DOMAINS.filter(t => t.confirmed).length,
            shorteners: LINK_SHORTENERS.length,
            blockedPatterns: BLOCKED_DOMAINS.length,
            suspiciousPatterns: SUSPICIOUS_PATTERNS.length
        };
    }
};

// =============================================================================
// EXPORT
// =============================================================================

window.FlaggedLinks = FlaggedLinks;
window.THROTTLED_DOMAINS = THROTTLED_DOMAINS;
window.LINK_SHORTENERS = LINK_SHORTENERS;
window.BLOCKED_DOMAINS = BLOCKED_DOMAINS;

console.log('✅ FlaggedLinks database loaded');
console.log('   Stats:', FlaggedLinks.getStats());

})();
