/* =============================================================================
   PLATFORMS.JS - SINGLE SOURCE OF TRUTH
   Social Media Platforms for Shadow Ban Detection
   
   This file is loaded FIRST on all pages.
   Currently supporting 5 platforms (2 live, 3 coming soon).
   ============================================================================= */

window.platformData = [
    // =========================================================================
    // LIVE PLATFORMS - Detection fully operational
    // =========================================================================
    { 
        name: 'Twitter/X', 
        icon: '𝕏', 
        status: 'live',
        id: 'twitter',
        checks: [
            'Search suggestion ban (account hidden from search)',
            'Reply deboosting (replies hidden behind "Show more")',
            'Ghost ban (tweets invisible to others)',
            'Search ban (tweets hidden from search results)',
            'Quality Filter Detection (QFD) status',
            'Sensitive media flags on profile',
            'Age-restricted content warnings',
            'Engagement rate analysis vs. followers',
            'Hashtag visibility in trends',
            'Profile accessibility from logged-out view'
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'Restricted hashtag identification',
            'Trending eligibility',
            'Shadowban trigger hashtags'
        ],
        postChecks: [
            'Tweet visibility in search',
            'Reply visibility',
            'Retweet reach analysis',
            'Engagement suppression detection'
        ]
    },
    { 
        name: 'Reddit', 
        icon: '🔴', 
        status: 'live',
        id: 'reddit',
        checks: [
            'Shadowban status (posts/comments invisible)',
            'Subreddit-specific bans detection',
            'Karma threshold restrictions',
            'Account age restrictions',
            'Spam filter triggering',
            'AutoModerator removal patterns',
            'Post visibility in subreddit listings',
            'Comment visibility in threads',
            'Profile page accessibility',
            'Cross-posting restrictions'
        ],
        hashtagChecks: [
            'Subreddit filter detection',
            'Spam keyword identification',
            'AutoMod trigger words'
        ],
        postChecks: [
            'Post visibility in subreddit',
            'Comment shadow removal',
            'Upvote/downvote manipulation detection'
        ]
    },
    
    // =========================================================================
    // COMING SOON - In active development
    // =========================================================================
    { 
        name: 'Instagram', 
        icon: '📷', 
        status: 'soon',
        id: 'instagram',
        checks: [
            'Explore page eligibility',
            'Hashtag search visibility',
            'Story visibility to non-followers',
            'Reels recommendation status',
            'Account reach restrictions',
            'Comment visibility filtering',
            'Profile discoverability',
            'Engagement rate anomalies',
            'Content recommendation eligibility',
            'Banned hashtag usage detection'
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'Restricted hashtag identification',
            'Explore eligibility per hashtag',
            'Hashtag reach analysis'
        ],
        postChecks: [
            'Post visibility in Explore',
            'Reel recommendation status',
            'Story reach analysis'
        ]
    },
    { 
        name: 'TikTok', 
        icon: '🎵', 
        status: 'soon',
        id: 'tiktok',
        checks: [
            'For You Page (FYP) eligibility',
            'Video visibility restrictions',
            'Sound/music availability',
            'Hashtag reach limitations',
            'Account discoverability',
            'Comment visibility',
            'Duet/Stitch restrictions',
            'Live streaming eligibility',
            'Creator fund status',
            'Content warning flags'
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'FYP eligibility per hashtag',
            'Shadowban trigger hashtags',
            'Trend eligibility'
        ],
        postChecks: [
            'FYP distribution status',
            'Video reach analysis',
            'Sound availability check'
        ]
    },
    { 
        name: 'LinkedIn', 
        icon: '💼', 
        status: 'soon',
        id: 'linkedin',
        checks: [
            'Post visibility in feed',
            'Profile search ranking',
            'Connection request limits',
            'InMail restrictions',
            'Content engagement throttling',
            'Article distribution',
            'Job posting visibility',
            'Company page reach',
            'Comment visibility',
            'Professional community access'
        ],
        hashtagChecks: [
            'Professional hashtag reach',
            'Industry tag visibility',
            'Banned professional terms'
        ],
        postChecks: [
            'Feed distribution analysis',
            'Article reach status',
            'Engagement throttling detection'
        ]
    }
];

// =========================================================================
// UTILITY FUNCTIONS
// =========================================================================

/**
 * Get platform by ID
 */
window.getPlatformById = function(id) {
    return window.platformData.find(p => p.id === id);
};

/**
 * Get platform by name (case-insensitive, handles slashes)
 */
window.getPlatformByName = function(name) {
    const normalized = name.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');
    return window.platformData.find(p => 
        p.name.toLowerCase().replace(/\s+/g, '').replace(/\//g, '') === normalized
    );
};

/**
 * Get all live platforms
 */
window.getLivePlatforms = function() {
    return window.platformData.filter(p => p.status === 'live');
};

/**
 * Get all coming soon platforms
 */
window.getComingSoonPlatforms = function() {
    return window.platformData.filter(p => p.status === 'soon');
};

/**
 * Get platform count
 */
window.getPlatformCount = function() {
    return window.platformData.length;
};

/**
 * Get live platform count
 */
window.getLivePlatformCount = function() {
    return window.platformData.filter(p => p.status === 'live').length;
};

console.log('✅ Platforms loaded:', window.platformData.length, 'platforms (', 
    window.platformData.filter(p => p.status === 'live').length, 'live,',
    window.platformData.filter(p => p.status === 'soon').length, 'coming soon)');

// Alias for backwards compatibility
window.PLATFORMS = window.platformData;
var PLATFORMS = window.platformData;
