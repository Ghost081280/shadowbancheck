/* =============================================================================
   FLAGGED-LINKS.JS - Link & Domain Reputation Database
   ShadowBanCheck.io
   
   Database of known flagged domains, link patterns, and content indicators
   that platforms commonly filter or suppress.
   
   Used by the Content & Links factor (Factor 5) in the 5-Factor Engine.
   ============================================================================= */

(function() {
'use strict';

// ============================================
// FLAGGED DOMAINS & PATTERNS DATABASE
// ============================================
window.flaggedLinks = {
    
    // ========================================
    // KNOWN BAD/SPAM DOMAINS
    // ========================================
    badDomains: [
        // Known spam/scam domains
        'spam-site.com',
        'free-followers.net',
        'get-likes-now.com',
        'buy-followers.io',
        'instant-fame.co',
        'viral-boost.net',
        'follow4follow.xyz',
        'like4like.club',
        // Phishing indicators
        'secure-login-verify.com',
        'account-verify-now.net',
        // Known malware distributors (examples)
        'download-free-stuff.ru',
        'crack-software.to',
    ],
    
    // ========================================
    // LINK SHORTENERS (May reduce reach)
    // ========================================
    shorteners: [
        // Major shorteners
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
        'linktr.ee',
        'smarturl.it',
        'dub.sh',
        'short.io',
        'rebrand.ly',
        // Social-specific shorteners
        'fb.me',
        'youtu.be',
        'amzn.to',
        'amzn.com',
        'ebay.to',
    ],
    
    // ========================================
    // LINK AGGREGATORS (May affect organic reach)
    // ========================================
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
    
    // ========================================
    // PLATFORM-SPECIFIC BLOCKED DOMAINS
    // ========================================
    twitter: [
        // Domains Twitter has historically blocked or limited
        'facebook.com', // Cross-platform rivalry
        'instagram.com', // Same
        'threads.net', // Competitor
        // Known spam domains on Twitter
        'twitterfollow.me',
        'justunfollow.com',
        'crowdfire.com', // Automation tools often flagged
    ],
    
    reddit: [
        // Domains Reddit commonly blocks
        'clickbait-news.com',
        'viral-content-farm.net',
        // Self-promotion spam indicators
        'my-blog-promo.com',
        // Known banned domains on Reddit
        'zerohedge.com', // Example of historically banned
        'rt.com', // State media often restricted
    ],
    
    instagram: [
        // External domains that may reduce reach
        'linktree.com', // Sometimes deprioritized
        'taplink.cc',
        // Competitor links
        'tiktok.com',
        'snapchat.com',
    ],
    
    tiktok: [
        // TikTok restricts most external links
        'youtube.com',
        'instagram.com',
        'twitter.com',
        'x.com',
        // Any external commerce not through TikTok Shop
    ],
    
    facebook: [
        // Domains Facebook has restricted
        'tiktok.com',
        'twitter.com',
        'x.com',
    ],
    
    youtube: [
        // YouTube restricts competitor platforms
        'tiktok.com',
        'dailymotion.com',
        'vimeo.com', // Sometimes limited in descriptions
    ],
    
    // ========================================
    // AFFILIATE/REFERRAL PATTERNS
    // ========================================
    affiliatePatterns: [
        // URL parameter patterns indicating affiliate links
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
        // Amazon affiliate patterns
        'amzn.to',
        'amazon.com/gp/product',
        'amazon.com?tag=',
        // Other common affiliate networks
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
    
    // ========================================
    // SUSPICIOUS PATTERNS IN URLS
    // ========================================
    suspiciousPatterns: [
        // Engagement manipulation indicators
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
        // Crypto/financial scam indicators
        'guaranteed-returns',
        'double-bitcoin',
        'crypto-giveaway',
        'free-crypto',
        'money-flip',
        'cash-app-flip',
        // Adult/NSFW indicators (platforms often filter)
        'onlyfans.com', // May reduce reach on some platforms
        'fansly.com',
        'fanvue.com',
        // Gambling (regulated/restricted)
        'online-casino',
        'sports-betting',
        'free-spins',
        // MLM/Pyramid indicators
        'join-my-team',
        'passive-income-opportunity',
        'work-from-home-mlm',
    ],
    
    // ========================================
    // FLAGGED WORDS IN BIO/CONTENT
    // ========================================
    flaggedBioWords: {
        // High risk - often trigger filters
        highRisk: [
            'dm for collab',
            'dm to work together',
            'link in bio',
            'click link below',
            'free giveaway',
            'follow for follow',
            'f4f',
            'l4l',
            'like for like',
            'follow back',
            'followback',
            'team follow back',
            'tfb',
            'instant follow back',
            'follow train',
            'follow party',
            'gain with',
            'gain train',
            'shoutout for shoutout',
            's4s',
            'promo for promo',
            'p4p',
            // Financial claims
            'guaranteed income',
            'make money fast',
            'get rich quick',
            'financial freedom',
            'passive income',
            'work from home opportunity',
            'be your own boss',
            'fire your boss',
            // Crypto hype
            'to the moon',
            '100x gains',
            'not financial advice',
            'dyor',
            // Adult content indicators
            'dm for exclusive',
            'spicy content',
            'premium content',
            '18+',
            'nsfw',
            'explicit',
        ],
        
        // Medium risk - contextual
        mediumRisk: [
            'dm me',
            'dms open',
            'collaborations welcome',
            'brand partnerships',
            'influencer',
            'content creator',
            'entrepreneur',
            'ceo of',
            'founder of',
            'affiliate',
            'ambassador',
            'promo code',
            'discount code',
            'use my code',
            'crypto',
            'bitcoin',
            'nft',
            'web3',
            'metaverse',
            'trading',
            'forex',
            'stocks',
            'investor',
        ],
        
        // Low risk - just informational
        lowRisk: [
            'check out my',
            'new post',
            'latest video',
            'subscribe',
            'turn on notifications',
            'join my',
            'support me',
            'buy me a coffee',
        ]
    },
    
    // ========================================
    // PLATFORM-SPECIFIC FLAGGED PHRASES
    // ========================================
    platformFlaggedPhrases: {
        twitter: [
            'retweet to win',
            'rt to enter',
            'follow and rt',
            'like and retweet',
            'quote tweet this',
            'ratio',
            'breaking:',
            'urgent:',
            'thread 🧵',
        ],
        
        instagram: [
            'link in bio',
            'tap link in bio',
            'check bio',
            'dm for rates',
            'dm for price',
            'comment below',
            'double tap',
            'save this post',
            'share to stories',
            'tag a friend',
            'tag someone who',
        ],
        
        tiktok: [
            'duet this',
            'stitch this',
            'greenscreen this',
            'use my sound',
            'fyp',
            'foryou',
            'foryoupage',
            'viral',
            'blowthisup',
            'xyzbca',
        ],
        
        youtube: [
            'subscribe',
            'hit the bell',
            'notification squad',
            'like and subscribe',
            'smash that like',
            'leave a comment',
            'check description',
            'link below',
        ],
        
        reddit: [
            'upvote if',
            'awards appreciated',
            'please upvote',
            'karma please',
            'check my profile',
            'self-promo',
        ],
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if a URL contains any flagged patterns
 * @param {string} url - URL to check
 * @param {string} platformId - Platform context (optional)
 * @returns {Object} Result with flagged items
 */
window.checkUrlForFlags = function(url, platformId = null) {
    if (!url) return { flagged: false, reasons: [] };
    
    const urlLower = url.toLowerCase();
    const reasons = [];
    
    // Check bad domains
    for (const domain of window.flaggedLinks.badDomains) {
        if (urlLower.includes(domain)) {
            reasons.push({ type: 'danger', reason: `Known spam domain: ${domain}` });
        }
    }
    
    // Check shorteners
    for (const shortener of window.flaggedLinks.shorteners) {
        if (urlLower.includes(shortener)) {
            reasons.push({ type: 'warning', reason: `Link shortener detected: ${shortener}` });
        }
    }
    
    // Check link aggregators
    for (const aggregator of window.flaggedLinks.linkAggregators) {
        if (urlLower.includes(aggregator)) {
            reasons.push({ type: 'warning', reason: `Link aggregator: ${aggregator} (may reduce organic reach)` });
        }
    }
    
    // Check affiliate patterns
    for (const pattern of window.flaggedLinks.affiliatePatterns) {
        if (urlLower.includes(pattern)) {
            reasons.push({ type: 'info', reason: `Affiliate link pattern: ${pattern}` });
            break; // Only flag once for affiliates
        }
    }
    
    // Check suspicious patterns
    for (const pattern of window.flaggedLinks.suspiciousPatterns) {
        if (urlLower.includes(pattern)) {
            reasons.push({ type: 'danger', reason: `Suspicious pattern: ${pattern}` });
        }
    }
    
    // Check platform-specific blocked domains
    if (platformId && window.flaggedLinks[platformId]) {
        for (const domain of window.flaggedLinks[platformId]) {
            if (urlLower.includes(domain)) {
                reasons.push({ type: 'warning', reason: `${platformId} may limit: ${domain}` });
            }
        }
    }
    
    return {
        flagged: reasons.length > 0,
        reasons: reasons
    };
};

/**
 * Check bio/content text for flagged words
 * @param {string} text - Text to check
 * @param {string} platformId - Platform context (optional)
 * @returns {Object} Result with flagged items
 */
window.checkTextForFlags = function(text, platformId = null) {
    if (!text) return { flagged: false, reasons: [] };
    
    const textLower = text.toLowerCase();
    const reasons = [];
    
    // Check high risk words
    for (const word of window.flaggedLinks.flaggedBioWords.highRisk) {
        if (textLower.includes(word)) {
            reasons.push({ type: 'danger', reason: `High-risk phrase: "${word}"` });
        }
    }
    
    // Check medium risk words
    for (const word of window.flaggedLinks.flaggedBioWords.mediumRisk) {
        if (textLower.includes(word)) {
            reasons.push({ type: 'warning', reason: `Contextual flag: "${word}"` });
        }
    }
    
    // Check platform-specific phrases
    if (platformId && window.flaggedLinks.platformFlaggedPhrases[platformId]) {
        for (const phrase of window.flaggedLinks.platformFlaggedPhrases[platformId]) {
            if (textLower.includes(phrase.toLowerCase())) {
                reasons.push({ type: 'info', reason: `Platform-specific: "${phrase}"` });
            }
        }
    }
    
    return {
        flagged: reasons.length > 0,
        reasons: reasons
    };
};

/**
 * Full content analysis for Factor 5
 * @param {Object} content - Content object with bio, postText, links, taggedUsers
 * @param {string} platformId - Platform context
 * @returns {Object} Complete analysis result
 */
window.analyzeContentAndLinks = function(content, platformId) {
    const result = {
        score: 0, // Higher = more risk
        maxScore: 100,
        bioFlags: [],
        postFlags: [],
        linkFlags: [],
        taggedUserFlags: [],
        summary: '',
        recommendations: []
    };
    
    // Analyze bio
    if (content.bio) {
        const bioCheck = window.checkTextForFlags(content.bio, platformId);
        result.bioFlags = bioCheck.reasons;
        result.score += bioCheck.reasons.filter(r => r.type === 'danger').length * 15;
        result.score += bioCheck.reasons.filter(r => r.type === 'warning').length * 8;
        result.score += bioCheck.reasons.filter(r => r.type === 'info').length * 3;
    }
    
    // Analyze post text
    if (content.postText) {
        const postCheck = window.checkTextForFlags(content.postText, platformId);
        result.postFlags = postCheck.reasons;
        result.score += postCheck.reasons.filter(r => r.type === 'danger').length * 15;
        result.score += postCheck.reasons.filter(r => r.type === 'warning').length * 8;
        result.score += postCheck.reasons.filter(r => r.type === 'info').length * 3;
    }
    
    // Analyze links
    if (content.links && Array.isArray(content.links)) {
        for (const link of content.links) {
            const linkCheck = window.checkUrlForFlags(link, platformId);
            result.linkFlags.push(...linkCheck.reasons);
            result.score += linkCheck.reasons.filter(r => r.type === 'danger').length * 20;
            result.score += linkCheck.reasons.filter(r => r.type === 'warning').length * 10;
            result.score += linkCheck.reasons.filter(r => r.type === 'info').length * 5;
        }
    }
    
    // Cap score at max
    result.score = Math.min(result.score, result.maxScore);
    
    // Generate summary
    const totalFlags = result.bioFlags.length + result.postFlags.length + result.linkFlags.length;
    if (totalFlags === 0) {
        result.summary = 'No flagged content detected';
    } else if (result.score < 20) {
        result.summary = `${totalFlags} minor flags detected`;
    } else if (result.score < 50) {
        result.summary = `${totalFlags} flags detected - review recommended`;
    } else {
        result.summary = `${totalFlags} significant flags - action needed`;
    }
    
    // Generate recommendations
    if (result.linkFlags.some(f => f.reason.includes('shortener'))) {
        result.recommendations.push('Consider using full URLs instead of link shorteners');
    }
    if (result.linkFlags.some(f => f.reason.includes('aggregator'))) {
        result.recommendations.push('Link aggregators may reduce organic reach on some platforms');
    }
    if (result.bioFlags.some(f => f.reason.includes('follow'))) {
        result.recommendations.push('Remove follow-for-follow language from bio');
    }
    if (result.postFlags.some(f => f.type === 'danger')) {
        result.recommendations.push('Remove high-risk phrases from post content');
    }
    
    return result;
};

console.log('✅ FlaggedLinks database loaded');

})();
