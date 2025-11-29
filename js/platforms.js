/* =============================================================================
   PLATFORMS.JS - SINGLE SOURCE OF TRUTH
   Social Media Platforms for Shadow Ban Detection
   
   This file is loaded FIRST on all pages.
   7 platforms (2 live, 5 coming soon)
   
   Last Updated: 2025
   ============================================================================= */

window.platformData = [
    // =========================================================================
    // LIVE PLATFORMS
    // =========================================================================
    { 
        id: 'twitter',
        name: 'Twitter/X', 
        icon: '𝕏', 
        status: 'live',
        
        // Feature support flags
        supports: {
            accountCheck: true,
            postCheck: true,
            hashtagCheck: true,
            powerCheck: true,
            engagementTest: true,
        },
        
        // Engagement test configuration
        engagementTest: {
            enabled: true,
            testAccount: 'ghost081280',
            testAccountUrl: 'https://twitter.com/ghost081280',
            pinnedTweetId: '', // TO BE FILLED when tweet is created
            pinnedTweetUrl: '', // TO BE FILLED
            steps: [
                { 
                    id: 'follow', 
                    label: 'Follow @ghost081280', 
                    icon: '👤',
                    url: 'https://twitter.com/intent/follow?screen_name=ghost081280',
                    description: 'Lets us check if your content appears to followers'
                },
                { 
                    id: 'like', 
                    label: 'Like our pinned tweet', 
                    icon: '❤️',
                    url: 'https://twitter.com/ghost081280',
                    description: 'Helps verify your engagement actions are visible'
                },
                { 
                    id: 'retweet', 
                    label: 'Retweet our pinned tweet', 
                    icon: '🔁',
                    url: 'https://twitter.com/ghost081280',
                    description: 'Tests if your retweets appear on timelines'
                },
                { 
                    id: 'reply', 
                    label: 'Reply with "check @yourusername"', 
                    icon: '💬',
                    url: 'https://twitter.com/ghost081280',
                    description: 'Verifies your replies aren\'t being hidden'
                },
            ],
        },
        
        // Account check signals
        accountChecks: [
            'Search suggestion ban (hidden from search)',
            'Reply deboosting (replies hidden behind "Show more")',
            'Ghost ban (tweets invisible to others)',
            'Search ban (tweets not in search results)',
            'Quality Filter Detection (QFD) status',
            'Verification status (blue/gold/grey/none)',
            'Account age and trust signals',
            'Follower/following ratio analysis',
            'Sensitive media flags',
            'Profile accessibility (logged out)',
        ],
        
        // Hashtag check signals
        hashtagChecks: [
            'Banned hashtag detection',
            'Restricted hashtag identification', 
            'Trending eligibility check',
            'Shadowban trigger hashtags',
            'Overused hashtag warnings',
        ],
        
        // Power check additional signals
        powerChecks: [
            'Tweet visibility in search',
            'Reply thread visibility',
            'Engagement rate vs expected',
            'Content scan for flagged terms',
            'Link analysis',
            'Hashtag analysis',
        ],
        
        // UI messages
        messages: {
            accountCheck: 'Check if your Twitter/X account is shadowbanned.',
            hashtagCheck: 'Verify hashtags are safe before tweeting.',
            powerCheck: 'Full analysis of your tweet with engagement testing.',
            engagementPrompt: 'For maximum accuracy, complete our engagement test. This lets us check your visibility from multiple angles.',
            platformNote: null,
        },
    },
    
    { 
        id: 'reddit',
        name: 'Reddit', 
        icon: '🤖', 
        status: 'live',
        
        supports: {
            accountCheck: true,
            postCheck: true,
            hashtagCheck: false,  // Reddit doesn't use hashtags!
            powerCheck: true,
            engagementTest: false,
        },
        
        engagementTest: {
            enabled: false,
            testAccount: 'ShadowBanCheck',
        },
        
        accountChecks: [
            'Shadowban status (posts invisible to others)',
            'Profile visibility (logged out test)',
            'Subreddit-specific bans',
            'Karma threshold restrictions',
            'Account age restrictions',
            'Spam filter triggering patterns',
            'AutoModerator removal detection',
            'Comment visibility in threads',
            'Cross-posting restrictions',
        ],
        
        hashtagChecks: null, // Reddit doesn't use hashtags
        
        // Reddit-specific checks
        redditSpecific: {
            subredditBans: true,
            karmaAnalysis: true,
            automodDetection: true,
            karmaThresholds: {
                low: 100,
                medium: 1000,
                high: 10000,
            },
        },
        
        powerChecks: [
            'Post visibility in subreddit',
            'Comment shadow removal detection',
            'Content scan for filtered terms',
            'Subreddit rule violation signals',
            'Link/domain restrictions',
        ],
        
        messages: {
            accountCheck: 'Check if your Reddit account is shadowbanned.',
            hashtagCheck: null, // Not applicable
            powerCheck: 'Full analysis including subreddit-specific restrictions.',
            engagementPrompt: null,
            platformNote: 'Reddit does not use hashtags. We focus on account visibility, subreddit bans, and content analysis.',
        },
    },
    
    // =========================================================================
    // COMING SOON PLATFORMS
    // =========================================================================
    { 
        id: 'instagram',
        name: 'Instagram', 
        icon: '📸', 
        status: 'soon',
        
        supports: {
            accountCheck: true,
            postCheck: true,
            hashtagCheck: true,  // Instagram is HEAVY on hashtag bans
            powerCheck: true,
            engagementTest: false,
        },
        
        accountChecks: [
            'Explore page eligibility',
            'Hashtag search visibility',
            'Story visibility to non-followers',
            'Reels recommendation status',
            'Account reach restrictions',
            'Profile discoverability',
            'Engagement rate anomalies',
        ],
        
        hashtagChecks: [
            'Banned hashtag detection',
            'Restricted hashtag identification',
            'Explore eligibility per hashtag',
            'Hashtag reach analysis',
        ],
        
        messages: {
            platformNote: 'Instagram has aggressive hashtag restrictions. Our database tracks 500+ banned Instagram hashtags.',
        },
    },
    
    { 
        id: 'tiktok',
        name: 'TikTok', 
        icon: '🎵', 
        status: 'soon',
        
        supports: {
            accountCheck: true,
            postCheck: true,
            hashtagCheck: true,
            powerCheck: true,
            engagementTest: false,
        },
        
        accountChecks: [
            'For You Page (FYP) eligibility',
            'Video visibility restrictions',
            'Account discoverability',
            'Live streaming eligibility',
            'Creator fund status',
            'Content warning flags',
        ],
        
        hashtagChecks: [
            'Banned hashtag detection',
            'FYP eligibility per hashtag',
            'Shadowban trigger hashtags',
            'Trend eligibility',
        ],
        
        // TikTok-specific
        tiktokSpecific: {
            fypAnalysis: true,
            soundRestrictions: true,
            duetStitchBans: true,
        },
        
        messages: {
            platformNote: 'TikTok shadow bans often affect FYP distribution without any notification.',
        },
    },
    
    { 
        id: 'facebook',
        name: 'Facebook', 
        icon: '📘', 
        status: 'soon',
        
        supports: {
            accountCheck: true,
            postCheck: true,
            hashtagCheck: true,
            powerCheck: true,
            engagementTest: false,
        },
        
        accountChecks: [
            'News feed visibility',
            'Page reach restrictions',
            'Group posting limitations',
            'Profile discoverability',
            'Marketplace restrictions',
            'Ad account flags',
        ],
        
        hashtagChecks: [
            'Hashtag reach analysis',
            'Banned hashtag detection',
            'Topic restrictions',
        ],
        
        messages: {
            platformNote: 'Facebook throttles page and profile reach without notification. We detect engagement anomalies.',
        },
    },
    
    { 
        id: 'youtube',
        name: 'YouTube', 
        icon: '📺', 
        status: 'soon',
        
        supports: {
            accountCheck: true,
            postCheck: true,
            hashtagCheck: true,
            powerCheck: true,
            engagementTest: false,
        },
        
        accountChecks: [
            'Search result visibility',
            'Recommendation algorithm status',
            'Monetization eligibility',
            'Community tab restrictions',
            'Comment visibility',
            'Live stream eligibility',
        ],
        
        hashtagChecks: [
            'Tag reach analysis',
            'Restricted topic tags',
            'Demonetization trigger tags',
        ],
        
        // YouTube-specific
        youtubeSpecific: {
            searchSuppression: true,
            recommendationThrottling: true,
            demonetizationFlags: true,
        },
        
        messages: {
            platformNote: 'YouTube suppresses videos from search and recommendations without telling creators.',
        },
    },
    
    { 
        id: 'linkedin',
        name: 'LinkedIn', 
        icon: '💼', 
        status: 'soon',
        
        supports: {
            accountCheck: true,
            postCheck: true,
            hashtagCheck: true,
            powerCheck: true,
            engagementTest: false,
        },
        
        accountChecks: [
            'Post visibility in feed',
            'Profile search ranking',
            'Connection request limits',
            'Content engagement throttling',
            'Article distribution',
            'Professional community access',
        ],
        
        hashtagChecks: [
            'Professional hashtag reach',
            'Industry tag visibility',
            'Restricted topic detection',
        ],
        
        // LinkedIn-specific - Known suppression patterns
        linkedinSpecific: {
            cryptoSuppression: true,      // Known to suppress crypto content
            politicalFiltering: true,     // Filters political content
            externalLinkPenalty: true,    // Penalizes posts with external links
            engagementBaiting: true,      // Detects and suppresses engagement bait
        },
        
        messages: {
            platformNote: 'LinkedIn is known to suppress crypto-related content and filter political posts. External links may reduce reach.',
        },
    },
];

// =========================================================================
// UTILITY FUNCTIONS
// =========================================================================

/**
 * Get platform by ID
 * @param {string} id - Platform ID (e.g., 'twitter', 'reddit')
 * @returns {object|undefined} Platform object or undefined
 */
window.getPlatformById = function(id) {
    return window.platformData.find(p => p.id === id);
};

/**
 * Get platform by name (case-insensitive, handles slashes)
 * @param {string} name - Platform name (e.g., 'Twitter/X', 'twitter')
 * @returns {object|undefined} Platform object or undefined
 */
window.getPlatformByName = function(name) {
    const normalized = name.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');
    return window.platformData.find(p => 
        p.name.toLowerCase().replace(/\s+/g, '').replace(/\//g, '') === normalized ||
        p.id === normalized
    );
};

/**
 * Get all live platforms
 * @returns {array} Array of live platform objects
 */
window.getLivePlatforms = function() {
    return window.platformData.filter(p => p.status === 'live');
};

/**
 * Get all coming soon platforms
 * @returns {array} Array of coming soon platform objects
 */
window.getComingSoonPlatforms = function() {
    return window.platformData.filter(p => p.status === 'soon');
};

/**
 * Get platforms that support hashtags (for Hashtag Checker)
 * Excludes Reddit since it doesn't use hashtags
 * @returns {array} Array of platform objects that support hashtag checking
 */
window.getHashtagPlatforms = function() {
    return window.platformData.filter(p => p.supports && p.supports.hashtagCheck);
};

/**
 * Get LIVE platforms that support hashtags
 * @returns {array} Array of live platform objects that support hashtag checking
 */
window.getLiveHashtagPlatforms = function() {
    return window.platformData.filter(p => p.status === 'live' && p.supports && p.supports.hashtagCheck);
};

/**
 * Get platforms that support engagement test
 * @returns {array} Array of platform objects with engagement test enabled
 */
window.getEngagementTestPlatforms = function() {
    return window.platformData.filter(p => p.supports && p.supports.engagementTest && p.engagementTest && p.engagementTest.enabled);
};

/**
 * Check if platform supports a specific feature
 * @param {string} platformId - Platform ID
 * @param {string} feature - Feature name (e.g., 'hashtagCheck', 'engagementTest')
 * @returns {boolean} Whether the platform supports the feature
 */
window.platformSupports = function(platformId, feature) {
    const platform = window.getPlatformById(platformId);
    return platform && platform.supports && platform.supports[feature] === true;
};

/**
 * Get total platform count
 * @returns {number} Total number of platforms
 */
window.getPlatformCount = function() {
    return window.platformData.length;
};

/**
 * Get live platform count
 * @returns {number} Number of live platforms
 */
window.getLivePlatformCount = function() {
    return window.platformData.filter(p => p.status === 'live').length;
};

/**
 * Get coming soon platform count
 * @returns {number} Number of coming soon platforms
 */
window.getComingSoonPlatformCount = function() {
    return window.platformData.filter(p => p.status === 'soon').length;
};

/**
 * Detect platform from URL
 * @param {string} url - URL to analyze
 * @returns {object|null} Platform object or null if not detected
 */
window.detectPlatformFromUrl = function(url) {
    if (!url) return null;
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
        return window.getPlatformById('twitter');
    }
    if (lowerUrl.includes('reddit.com') || lowerUrl.includes('redd.it')) {
        return window.getPlatformById('reddit');
    }
    if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
        return window.getPlatformById('instagram');
    }
    if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vm.tiktok.com')) {
        return window.getPlatformById('tiktok');
    }
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com') || lowerUrl.includes('fb.watch')) {
        return window.getPlatformById('facebook');
    }
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return window.getPlatformById('youtube');
    }
    if (lowerUrl.includes('linkedin.com') || lowerUrl.includes('lnkd.in')) {
        return window.getPlatformById('linkedin');
    }
    
    return null;
};

/**
 * Extract username from URL (platform-specific)
 * @param {string} url - URL to parse
 * @param {string} platformId - Platform ID for context
 * @returns {string|null} Extracted username or null
 */
window.extractUsernameFromUrl = function(url, platformId) {
    if (!url) return null;
    
    try {
        if (platformId === 'twitter') {
            // https://twitter.com/username/status/123 or https://x.com/username/status/123
            const match = url.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/i);
            if (match && match[1] && !['status', 'home', 'search', 'explore', 'i', 'intent', 'hashtag'].includes(match[1])) {
                return match[1];
            }
        }
        if (platformId === 'reddit') {
            // https://reddit.com/user/username or https://reddit.com/u/username
            const userMatch = url.match(/reddit\.com\/u(?:ser)?\/([^\/\?]+)/i);
            if (userMatch) return userMatch[1];
        }
        if (platformId === 'instagram') {
            // https://instagram.com/username
            const match = url.match(/instagram\.com\/([^\/\?]+)/i);
            if (match && match[1] && !['p', 'reel', 'stories', 'explore', 'tv'].includes(match[1])) {
                return match[1];
            }
        }
        if (platformId === 'tiktok') {
            // https://tiktok.com/@username
            const match = url.match(/tiktok\.com\/@([^\/\?]+)/i);
            if (match) return match[1];
        }
        if (platformId === 'youtube') {
            // https://youtube.com/@username or /channel/id or /c/name
            const handleMatch = url.match(/youtube\.com\/@([^\/\?]+)/i);
            if (handleMatch) return '@' + handleMatch[1];
            const channelMatch = url.match(/youtube\.com\/(?:channel|c)\/([^\/\?]+)/i);
            if (channelMatch) return channelMatch[1];
        }
        if (platformId === 'linkedin') {
            // https://linkedin.com/in/username
            const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/i);
            if (match) return match[1];
        }
    } catch (e) {
        console.error('Error extracting username:', e);
    }
    
    return null;
};

/**
 * Extract post ID from URL (platform-specific)
 * @param {string} url - URL to parse
 * @param {string} platformId - Platform ID for context
 * @returns {string|null} Extracted post ID or null
 */
window.extractPostIdFromUrl = function(url, platformId) {
    if (!url) return null;
    
    try {
        if (platformId === 'twitter') {
            const match = url.match(/status\/(\d+)/i);
            if (match) return match[1];
        }
        if (platformId === 'reddit') {
            const match = url.match(/comments\/([a-z0-9]+)/i);
            if (match) return match[1];
        }
        if (platformId === 'instagram') {
            const match = url.match(/(?:p|reel)\/([A-Za-z0-9_-]+)/i);
            if (match) return match[1];
        }
        if (platformId === 'tiktok') {
            const match = url.match(/video\/(\d+)/i);
            if (match) return match[1];
        }
        if (platformId === 'youtube') {
            const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]+)/i);
            if (match) return match[1];
        }
        if (platformId === 'linkedin') {
            const match = url.match(/(?:posts|activity)\/([0-9]+)/i);
            if (match) return match[1];
        }
    } catch (e) {
        console.error('Error extracting post ID:', e);
    }
    
    return null;
};

/**
 * Get checks preview for a platform (what will be analyzed)
 * @param {string} platformId - Platform ID
 * @param {string} checkType - Type of check: 'account', 'post', 'hashtag', 'power'
 * @returns {array} Array of check descriptions
 */
window.getChecksPreview = function(platformId, checkType) {
    const platform = window.getPlatformById(platformId);
    if (!platform) return [];
    
    switch(checkType) {
        case 'account':
            return platform.accountChecks || [];
        case 'hashtag':
            return platform.hashtagChecks || [];
        case 'power':
            return platform.powerChecks || [];
        case 'post':
            return platform.powerChecks || []; // Post uses similar checks to power
        default:
            return [];
    }
};

/**
 * Get platform-specific message
 * @param {string} platformId - Platform ID
 * @param {string} messageType - Message type (e.g., 'accountCheck', 'platformNote')
 * @returns {string|null} Message or null
 */
window.getPlatformMessage = function(platformId, messageType) {
    const platform = window.getPlatformById(platformId);
    if (!platform || !platform.messages) return null;
    return platform.messages[messageType] || null;
};

// =========================================================================
// INITIALIZATION LOG
// =========================================================================
console.log('✅ Platforms loaded:', window.platformData.length, 'platforms (', 
    window.getLivePlatformCount(), 'live,',
    window.getComingSoonPlatformCount(), 'coming soon)');
console.log('   Hashtag-enabled platforms:', window.getHashtagPlatforms().map(p => p.name).join(', '));
console.log('   Engagement test platforms:', window.getEngagementTestPlatforms().map(p => p.name).join(', ') || 'None active');

// =========================================================================
// BACKWARDS COMPATIBILITY
// =========================================================================
window.PLATFORMS = window.platformData;
var PLATFORMS = window.platformData;
