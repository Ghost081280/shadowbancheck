/* =============================================================================
   PLATFORMS.JS - SINGLE SOURCE OF TRUTH
   Social Media Platforms for Shadow Ban Detection
   
   This file is loaded FIRST on all pages.
   Edit this file to add/remove platforms - both index and checker update automatically.
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
    // COMING SOON - In development
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
        icon: '♪', 
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
        name: 'Facebook', 
        icon: 'ⓕ', 
        status: 'soon',
        id: 'facebook',
        checks: [
            'News Feed visibility',
            'Group post reach',
            'Page distribution penalties',
            'Marketplace restrictions',
            'Comment visibility filtering',
            'Share functionality limits',
            'Profile search visibility',
            'Event promotion reach',
            'Ad account restrictions',
            'Content recommendation status'
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'Group filter triggers',
            'Spam keyword identification'
        ],
        postChecks: [
            'News Feed distribution',
            'Share reach analysis',
            'Group visibility status'
        ]
    },
    { 
        name: 'YouTube', 
        icon: '▶', 
        status: 'soon',
        id: 'youtube',
        checks: [
            'Search result visibility',
            'Recommendation algorithm status',
            'Monetization eligibility',
            'Comment visibility',
            'Community post reach',
            'Shorts recommendation status',
            'Channel discoverability',
            'Video age-restriction flags',
            'Limited ads status',
            'Subscriber notification delivery'
        ],
        hashtagChecks: [
            'Tag visibility in search',
            'Banned tag detection',
            'Trending eligibility'
        ],
        postChecks: [
            'Video search visibility',
            'Recommendation status',
            'Comment section analysis'
        ]
    },
    { 
        name: 'LinkedIn', 
        icon: 'in', 
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
            'Industry tag visibility'
        ],
        postChecks: [
            'Feed distribution analysis',
            'Article reach status'
        ]
    },
    { 
        name: 'Threads', 
        icon: '@', 
        status: 'soon',
        id: 'threads',
        checks: [
            'Feed visibility status',
            'Reply visibility',
            'Search discoverability',
            'Recommendation eligibility',
            'Account restrictions',
            'Cross-posting to Instagram',
            'Engagement throttling',
            'Content warning flags'
        ],
        hashtagChecks: [
            'Tag visibility',
            'Trending eligibility'
        ],
        postChecks: [
            'Thread visibility',
            'Reply reach analysis'
        ]
    },
    { 
        name: 'Pinterest', 
        icon: '📍', 
        status: 'soon',
        id: 'pinterest',
        checks: [
            'Pin visibility in search',
            'Board discoverability',
            'Home feed recommendations',
            'Idea Pin distribution',
            'Shopping pin eligibility',
            'Profile search ranking',
            'Spam flag detection',
            'Engagement rate analysis'
        ],
        hashtagChecks: [
            'Pin tag visibility',
            'Board discovery tags'
        ],
        postChecks: [
            'Pin search visibility',
            'Board reach analysis'
        ]
    },
    { 
        name: 'Snapchat', 
        icon: '👻', 
        status: 'soon',
        id: 'snapchat',
        checks: [
            'Story visibility',
            'Spotlight eligibility',
            'Discover page presence',
            'Public profile discoverability',
            'Snap Map visibility',
            'Quick Add suggestions',
            'Lens/filter restrictions',
            'Account flags'
        ],
        hashtagChecks: [
            'Story tag visibility',
            'Spotlight tags'
        ],
        postChecks: [
            'Story reach analysis',
            'Spotlight distribution'
        ]
    },
    { 
        name: 'Twitch', 
        icon: '🎮', 
        status: 'soon',
        id: 'twitch',
        checks: [
            'Stream discoverability',
            'Category/tag visibility',
            'Chat restrictions',
            'Clip visibility',
            'VOD availability',
            'Raid/host eligibility',
            'Partner/Affiliate status',
            'Ad revenue eligibility',
            'Recommendation placement',
            'Community guidelines strikes'
        ],
        hashtagChecks: [
            'Stream tag visibility',
            'Category tags'
        ],
        postChecks: [
            'Clip discoverability',
            'VOD visibility'
        ]
    },
    { 
        name: 'Discord', 
        icon: '💬', 
        status: 'soon',
        id: 'discord',
        checks: [
            'Server discovery visibility',
            'Message delivery status',
            'DM restrictions',
            'Server join limitations',
            'Nitro feature access',
            'Account flags',
            'Phone verification requirements',
            'Slow mode triggers'
        ]
    },
    { 
        name: 'Telegram', 
        icon: '✈️', 
        status: 'soon',
        id: 'telegram',
        checks: [
            'Channel discoverability',
            'Group visibility in search',
            'Message forwarding restrictions',
            'Bot functionality limits',
            'Content restriction flags',
            'Account limitations',
            'Sticker pack visibility',
            'Voice chat access'
        ]
    },
    { 
        name: 'Bluesky', 
        icon: '🦋', 
        status: 'soon',
        id: 'bluesky',
        checks: [
            'Feed visibility',
            'Search discoverability',
            'Reply visibility',
            'Moderation labels',
            'Custom feed inclusion',
            'Account flags',
            'Content warnings',
            'Handle verification'
        ]
    },
    { 
        name: 'Mastodon', 
        icon: '🐘', 
        status: 'soon',
        id: 'mastodon',
        checks: [
            'Instance federation status',
            'Post visibility across instances',
            'Hashtag discoverability',
            'Boost/favorite delivery',
            'Profile discoverability',
            'Media attachment visibility',
            'Instance-specific restrictions',
            'Moderation flags'
        ]
    },
    { 
        name: 'Truth Social', 
        icon: 'T', 
        status: 'soon',
        id: 'truthsocial',
        checks: [
            'Truth visibility',
            'ReTruth reach',
            'Search discoverability',
            'Feed placement',
            'Account verification status',
            'Content flags',
            'Engagement throttling',
            'Profile visibility'
        ]
    },
    { 
        name: 'Rumble', 
        icon: 'R', 
        status: 'soon',
        id: 'rumble',
        checks: [
            'Video discoverability',
            'Search ranking',
            'Recommendation status',
            'Monetization eligibility',
            'Comment visibility',
            'Channel growth restrictions',
            'Content flags',
            'Live stream visibility'
        ]
    },
    { 
        name: 'Kick', 
        icon: 'K', 
        status: 'soon',
        id: 'kick',
        checks: [
            'Stream discoverability',
            'Category placement',
            'Chat restrictions',
            'Clip visibility',
            'VOD availability',
            'Subscription eligibility',
            'Revenue access',
            'Community guidelines status'
        ]
    }
];

// =========================================================================
// UTILITY FUNCTIONS
// =========================================================================

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
 * Get platform by slug (URL-friendly format)
 */
window.getPlatformBySlug = function(slug) {
    return window.platformData.find(p => 
        p.name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-') === slug
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

console.log('✅ Platforms loaded:', window.platformData.length, 'social media platforms');

// Alias for backwards compatibility - make PLATFORMS globally available
window.PLATFORMS = window.platformData;
var PLATFORMS = window.platformData;
