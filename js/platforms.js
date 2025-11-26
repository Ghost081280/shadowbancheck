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
        icon: '🐦', 
        status: 'live',
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
        ]
    },
    { 
        name: 'Reddit', 
        icon: '🤖', 
        status: 'live',
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
        ]
    },
    
    // =========================================================================
    // COMING SOON - In development
    // =========================================================================
    { 
        name: 'Instagram', 
        icon: '📸', 
        status: 'soon',
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
        ]
    },
    { 
        name: 'TikTok', 
        icon: '🎵', 
        status: 'soon',
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
        ]
    },
    { 
        name: 'Facebook', 
        icon: '📘', 
        status: 'soon',
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
        ]
    },
    { 
        name: 'YouTube', 
        icon: '📺', 
        status: 'soon',
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
        ]
    },
    { 
        name: 'LinkedIn', 
        icon: '💼', 
        status: 'soon',
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
        ]
    },
    { 
        name: 'Threads', 
        icon: '🧵', 
        status: 'soon',
        checks: [
            'Feed visibility status',
            'Reply visibility',
            'Search discoverability',
            'Recommendation eligibility',
            'Account restrictions',
            'Cross-posting to Instagram',
            'Engagement throttling',
            'Content warning flags'
        ]
    },
    { 
        name: 'Pinterest', 
        icon: '📌', 
        status: 'soon',
        checks: [
            'Pin visibility in search',
            'Board discoverability',
            'Home feed recommendations',
            'Idea Pin distribution',
            'Shopping pin eligibility',
            'Profile search ranking',
            'Spam flag detection',
            'Engagement rate analysis'
        ]
    },
    { 
        name: 'Snapchat', 
        icon: '👻', 
        status: 'soon',
        checks: [
            'Story visibility',
            'Spotlight eligibility',
            'Discover page presence',
            'Public profile discoverability',
            'Snap Map visibility',
            'Quick Add suggestions',
            'Lens/filter restrictions',
            'Account flags'
        ]
    },
    { 
        name: 'Twitch', 
        icon: '🟣', 
        status: 'soon',
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
        ]
    },
    { 
        name: 'Discord', 
        icon: '🎮', 
        status: 'soon',
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
        icon: '🗽', 
        status: 'soon',
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
        icon: '📹', 
        status: 'soon',
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
        icon: '💚', 
        status: 'soon',
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

// Alias for backwards compatibility
window.PLATFORMS = window.platformData;
const PLATFORMS = window.platformData;
