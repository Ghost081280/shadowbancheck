/* =============================================================================
   PLATFORMS.JS - SINGLE SOURCE OF TRUTH
   ShadowBanCheck.io
   
   This file MUST be loaded FIRST on all pages.
   7 platforms (2 live, 5 coming soon)
   ============================================================================= */

(function() {
'use strict';

// =========================================================================
// PLATFORM DATA
// =========================================================================
window.platformData = [
    // =========================================================================
    // LIVE PLATFORMS
    // =========================================================================
    { 
        id: 'twitter',
        name: 'Twitter/X', 
        icon: '𝕏', 
        status: 'live',
        
        supports: {
            accountCheck: true,
            postCheck: true,
            hashtagCheck: true,
            powerCheck: true,
            engagementTest: true,
        },
        
        engagementTest: {
            enabled: true,
            testAccount: 'ghost081280',
            testAccountUrl: 'https://twitter.com/ghost081280',
            steps: [
                { id: 'follow', label: 'Follow @ghost081280', icon: '👤', url: 'https://twitter.com/intent/follow?screen_name=ghost081280' },
                { id: 'like', label: 'Like our pinned tweet', icon: '❤️', url: 'https://twitter.com/ghost081280' },
                { id: 'retweet', label: 'Retweet our pinned tweet', icon: '🔁', url: 'https://twitter.com/ghost081280' },
                { id: 'reply', label: 'Reply with "check @yourusername"', icon: '💬', url: 'https://twitter.com/ghost081280' },
            ],
        },
        
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
        
        hashtagChecks: [
            'Banned hashtag detection',
            'Restricted hashtag identification', 
            'Trending eligibility check',
            'Shadowban trigger hashtags',
            'Overused hashtag warnings',
        ],
        
        powerChecks: [
            'Tweet visibility in search',
            'Reply thread visibility',
            'Engagement rate vs expected',
            'Content scan for flagged terms',
            'Link analysis',
            'Hashtag analysis',
        ],
        
        messages: {
            accountCheck: 'Check if your Twitter/X account is shadowbanned.',
            hashtagCheck: 'Verify hashtags are safe before tweeting.',
            powerCheck: 'Full analysis of your tweet with engagement testing.',
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
        
        engagementTest: { enabled: false },
        
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
        
        hashtagChecks: null,
        
        redditSpecific: {
            subredditBans: true,
            karmaAnalysis: true,
            automodDetection: true,
            karmaThresholds: { low: 100, medium: 1000, high: 10000 },
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
            hashtagCheck: null,
            powerCheck: 'Full analysis including subreddit-specific restrictions.',
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
        supports: { accountCheck: true, postCheck: true, hashtagCheck: true, powerCheck: true, engagementTest: false },
        accountChecks: [
            'Explore page eligibility',
            'Hashtag search visibility',
            'Story visibility to non-followers',
            'Reels recommendation status',
            'Account reach restrictions',
            'Profile discoverability',
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'Restricted hashtag identification',
            'Explore eligibility per hashtag',
        ],
        messages: { platformNote: 'Instagram has aggressive hashtag restrictions.' },
    },
    
    { 
        id: 'tiktok',
        name: 'TikTok', 
        icon: '🎵', 
        status: 'soon',
        supports: { accountCheck: true, postCheck: true, hashtagCheck: true, powerCheck: true, engagementTest: false },
        accountChecks: [
            'For You Page eligibility',
            'Search visibility',
            'Comment visibility',
            'Duet/Stitch restrictions',
            'Account trust score indicators',
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'Restricted hashtag identification',
            'FYP eligibility per hashtag',
        ],
        messages: { platformNote: 'TikTok shadow bans are notoriously hard to detect.' },
    },
    
    { 
        id: 'facebook',
        name: 'Facebook', 
        icon: '📘', 
        status: 'soon',
        supports: { accountCheck: true, postCheck: true, hashtagCheck: true, powerCheck: true, engagementTest: false },
        accountChecks: [
            'Reduced distribution status',
            'Fact-check overlay detection',
            'Group posting restrictions',
            'Marketplace restrictions',
            'Comment visibility',
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'Restricted hashtag identification',
        ],
        messages: { platformNote: 'Facebook uses "reduced distribution" instead of shadowbans.' },
    },
    
    { 
        id: 'youtube',
        name: 'YouTube', 
        icon: '▶️', 
        status: 'soon',
        supports: { accountCheck: true, postCheck: true, hashtagCheck: false, powerCheck: true, engagementTest: false },
        accountChecks: [
            'Search visibility',
            'Recommendation algorithm status',
            'Demonetization indicators',
            'Age restriction flags',
            'Limited state detection',
        ],
        hashtagChecks: null,
        messages: { platformNote: 'YouTube uses "limited state" for shadow restrictions.' },
    },
    
    { 
        id: 'linkedin',
        name: 'LinkedIn', 
        icon: '💼', 
        status: 'soon',
        supports: { accountCheck: true, postCheck: true, hashtagCheck: true, powerCheck: true, engagementTest: false },
        accountChecks: [
            'Feed visibility',
            'Search presence',
            'Connection request restrictions',
            'Content reach limitations',
            'Profile view restrictions',
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'Professional hashtag recommendations',
        ],
        messages: { platformNote: 'LinkedIn restricts spam-like behavior heavily.' },
    },
];

// =========================================================================
// UTILITY FUNCTIONS
// =========================================================================

window.getPlatformById = function(id) {
    if (!id) return null;
    return window.platformData.find(p => p.id === id) || null;
};

window.getLivePlatforms = function() {
    return window.platformData.filter(p => p.status === 'live');
};

window.getComingSoonPlatforms = function() {
    return window.platformData.filter(p => p.status === 'soon');
};

window.getHashtagPlatforms = function() {
    return window.platformData.filter(p => 
        p.supports && p.supports.hashtagCheck === true
    );
};

window.getEngagementTestPlatforms = function() {
    return window.platformData.filter(p => 
        p.supports && p.supports.engagementTest === true && 
        p.engagementTest && p.engagementTest.enabled === true
    );
};

window.platformSupports = function(platformId, feature) {
    const platform = window.getPlatformById(platformId);
    return platform && platform.supports && platform.supports[feature] === true;
};

window.detectPlatformFromUrl = function(url) {
    if (!url || typeof url !== 'string') return null;
    
    const lowerUrl = url.toLowerCase().trim();
    
    // Twitter/X
    if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) {
        return window.getPlatformById('twitter');
    }
    // Reddit
    if (lowerUrl.includes('reddit.com') || lowerUrl.includes('redd.it')) {
        return window.getPlatformById('reddit');
    }
    // Instagram
    if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
        return window.getPlatformById('instagram');
    }
    // TikTok
    if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vm.tiktok.com')) {
        return window.getPlatformById('tiktok');
    }
    // Facebook
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
        return window.getPlatformById('facebook');
    }
    // YouTube
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return window.getPlatformById('youtube');
    }
    // LinkedIn
    if (lowerUrl.includes('linkedin.com') || lowerUrl.includes('lnkd.in')) {
        return window.getPlatformById('linkedin');
    }
    
    return null;
};

window.extractUsernameFromUrl = function(url, platformId) {
    if (!url) return null;
    try {
        if (platformId === 'twitter') {
            const match = url.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/i);
            if (match && match[1] && !['status', 'home', 'search', 'explore', 'i', 'intent', 'hashtag'].includes(match[1])) {
                return match[1];
            }
        }
        if (platformId === 'reddit') {
            const userMatch = url.match(/reddit\.com\/u(?:ser)?\/([^\/\?]+)/i);
            if (userMatch) return userMatch[1];
        }
    } catch (e) {
        console.error('Error extracting username:', e);
    }
    return null;
};

window.getChecksPreview = function(platformId, checkType) {
    const platform = window.getPlatformById(platformId);
    if (!platform) return [];
    
    switch(checkType) {
        case 'account': return platform.accountChecks || [];
        case 'hashtag': return platform.hashtagChecks || [];
        case 'power': return platform.powerChecks || [];
        default: return [];
    }
};

// =========================================================================
// BACKWARDS COMPATIBILITY
// =========================================================================
window.PLATFORMS = window.platformData;
window.getLivePlatformCount = function() { return window.getLivePlatforms().length; };
window.getComingSoonPlatformCount = function() { return window.getComingSoonPlatforms().length; };

// =========================================================================
// SIGNAL READY
// =========================================================================
window.platformsReady = true;

console.log('✅ Platforms loaded:', window.platformData.length, 'platforms');
console.log('   Live:', window.getLivePlatforms().map(p => p.name).join(', '));
console.log('   Hashtag-enabled:', window.getHashtagPlatforms().map(p => p.name).join(', '));

// Dispatch ready event
try {
    document.dispatchEvent(new CustomEvent('platformsReady'));
} catch (e) {
    console.log('Could not dispatch platformsReady event');
}

})();
