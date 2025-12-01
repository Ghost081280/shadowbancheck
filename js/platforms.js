/* =============================================================================
   PLATFORMS.JS - SINGLE SOURCE OF TRUTH
   ShadowBanCheck.io
   
   Platform definitions for the 3-Point Intelligence Model
   Powered by 5 Specialized Detection Agents
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
        },
        
        accountChecks: [
            'Search suggestion ban detection',
            'Reply deboosting analysis',
            'Ghost ban verification',
            'Search ban identification',
            'Quality Filter Detection (QFD) status',
            'Verification status analysis',
            'Account trust signal evaluation',
            'Follower/following ratio analysis',
            'Sensitive media flag detection',
            'Profile accessibility verification',
        ],
        
        hashtagChecks: [
            'Banned hashtag detection (real-time)',
            'Restricted hashtag identification', 
            'Trending eligibility analysis',
            'Suppression trigger detection',
            'Cashtag verification',
        ],
        
        powerChecks: [
            'Post visibility analysis',
            'Reply thread visibility',
            'Engagement pattern analysis',
            'Content scan (21 signal modules)',
            'Link reputation verification',
            'Hashtag & cashtag analysis',
        ],
        
        detectionModules: {
            hashtags: true,
            cashtags: true,
            links: true,
            content: true,
            mentions: true,
            emojis: true
        },
        
        messages: {
            accountCheck: 'Analyze your Twitter/X account for suppression indicators.',
            hashtagCheck: 'Verify hashtag and cashtag safety before posting.',
            powerCheck: 'Full post analysis with 5 Specialized Detection Agents.',
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
            hashtagCheck: false,  // Reddit doesn't use hashtags
            powerCheck: true,
        },
        
        accountChecks: [
            'Shadowban status verification',
            'Profile visibility analysis',
            'Subreddit-specific ban detection',
            'Karma threshold restriction analysis',
            'Account age restriction detection',
            'Spam filter trigger analysis',
            'AutoModerator removal detection',
            'Comment visibility verification',
            'Cross-posting restriction analysis',
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
            'Content filter analysis',
            'Subreddit rule violation detection',
            'Link/domain restriction analysis',
        ],
        
        detectionModules: {
            hashtags: false,
            cashtags: false,
            links: true,
            content: true,
            mentions: true,
            emojis: false
        },
        
        messages: {
            accountCheck: 'Analyze your Reddit account for shadowban indicators.',
            hashtagCheck: null,
            powerCheck: 'Full analysis including subreddit-specific restrictions.',
            platformNote: 'Reddit does not use hashtags. Analysis focuses on account visibility, subreddit bans, and content patterns.',
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
        supports: { accountCheck: true, postCheck: true, hashtagCheck: true, powerCheck: true },
        accountChecks: [
            'Explore page eligibility analysis',
            'Hashtag search visibility',
            'Story visibility verification',
            'Reels recommendation status',
            'Account reach restriction detection',
            'Profile discoverability analysis',
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'Restricted hashtag identification',
            'Explore eligibility verification',
        ],
        detectionModules: {
            hashtags: true,
            cashtags: false,
            links: true,
            content: true,
            mentions: true,
            emojis: true
        },
        messages: { platformNote: 'Instagram maintains aggressive hashtag restrictions. Our database tracks 1,800+ flagged tags.' },
    },
    
    { 
        id: 'tiktok',
        name: 'TikTok', 
        icon: '🎵', 
        status: 'soon',
        supports: { accountCheck: true, postCheck: true, hashtagCheck: true, powerCheck: true },
        accountChecks: [
            'For You Page eligibility analysis',
            'Search visibility verification',
            'Comment visibility detection',
            'Duet/Stitch restriction analysis',
            'Account trust score evaluation',
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'Restricted hashtag identification',
            'FYP eligibility verification',
        ],
        detectionModules: {
            hashtags: true,
            cashtags: false,
            links: true,
            content: true,
            mentions: true,
            emojis: true
        },
        messages: { platformNote: 'TikTok shadow bans are notoriously difficult to detect. Our agents use multiple verification methods.' },
    },
    
    { 
        id: 'facebook',
        name: 'Facebook', 
        icon: '📘', 
        status: 'soon',
        supports: { accountCheck: true, postCheck: true, hashtagCheck: true, powerCheck: true },
        accountChecks: [
            'Reduced distribution status',
            'Fact-check overlay detection',
            'Group posting restriction analysis',
            'Marketplace restriction detection',
            'Comment visibility verification',
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'Restricted hashtag identification',
        ],
        detectionModules: {
            hashtags: true,
            cashtags: false,
            links: true,
            content: true,
            mentions: true,
            emojis: false
        },
        messages: { platformNote: 'Facebook uses "reduced distribution" rather than explicit shadowbans.' },
    },
    
    { 
        id: 'youtube',
        name: 'YouTube', 
        icon: '▶️', 
        status: 'soon',
        supports: { accountCheck: true, postCheck: true, hashtagCheck: false, powerCheck: true },
        accountChecks: [
            'Search visibility analysis',
            'Recommendation algorithm status',
            'Demonetization indicator detection',
            'Age restriction flag analysis',
            'Limited state detection',
        ],
        hashtagChecks: null,
        detectionModules: {
            hashtags: false,
            cashtags: false,
            links: true,
            content: true,
            mentions: false,
            emojis: false
        },
        messages: { platformNote: 'YouTube uses "limited state" for shadow restrictions on videos.' },
    },
    
    { 
        id: 'linkedin',
        name: 'LinkedIn', 
        icon: '💼', 
        status: 'soon',
        supports: { accountCheck: true, postCheck: true, hashtagCheck: true, powerCheck: true },
        accountChecks: [
            'Feed visibility analysis',
            'Search presence verification',
            'Connection request restriction detection',
            'Content reach limitation analysis',
            'Profile view restriction detection',
        ],
        hashtagChecks: [
            'Banned hashtag detection',
            'Professional hashtag analysis',
        ],
        detectionModules: {
            hashtags: true,
            cashtags: false,
            links: true,
            content: true,
            mentions: true,
            emojis: false
        },
        messages: { platformNote: 'LinkedIn heavily restricts spam-like behavior and promotional content.' },
    },
];

// =========================================================================
// 3-POINT INTELLIGENCE MODEL CONFIGURATION
// =========================================================================
window.IntelligenceModel = {
    // Intelligence point weights
    points: {
        predictive: { weight: 15, name: 'Predictive Intelligence', description: 'ML-based risk forecasting' },
        realtime: { weight: 55, name: 'Real-Time Detection', description: 'Live signal analysis across 21 modules' },
        historical: { weight: 30, name: 'Historical Analysis', description: 'Pattern tracking over time' }
    },
    
    // 5 Specialized Detection Agents
    agents: {
        api: { weight: 20, name: 'API Agent', description: 'Direct platform data access' },
        web: { weight: 20, name: 'Web Analysis Agent', description: 'Search & visibility testing' },
        historical: { weight: 15, name: 'Historical Agent', description: 'Pattern tracking & trends' },
        detection: { weight: 25, name: 'Detection Agent', description: '21 signal modules across 6 types' },
        predictive: { weight: 20, name: 'Predictive AI Agent', description: 'ML-based risk scoring' }
    },
    
    // 6 Signal Types with 21 Detection Modules
    signalTypes: {
        hashtags: { modules: 4, name: 'Hashtags', icon: '#️⃣' },
        cashtags: { modules: 3, name: 'Cashtags', icon: '💲' },
        links: { modules: 4, name: 'Links', icon: '🔗' },
        content: { modules: 4, name: 'Content', icon: '📝' },
        mentions: { modules: 3, name: 'Mentions', icon: '@' },
        emojis: { modules: 3, name: 'Emojis', icon: '😀' }
    },
    
    totalModules: 21,
    
    // Confidence thresholds
    confidence: {
        high: { min: 70, label: 'High Confidence', description: '3+ sources corroborate' },
        medium: { min: 40, label: 'Medium Confidence', description: '2 sources corroborate' },
        low: { min: 0, label: 'Low Confidence', description: 'Single source' }
    }
};

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

window.getActiveModulesForPlatform = function(platformId) {
    const platform = window.getPlatformById(platformId);
    if (!platform || !platform.detectionModules) {
        return window.IntelligenceModel.totalModules;
    }
    
    let count = 0;
    const modules = platform.detectionModules;
    const signalTypes = window.IntelligenceModel.signalTypes;
    
    for (const [type, enabled] of Object.entries(modules)) {
        if (enabled && signalTypes[type]) {
            count += signalTypes[type].modules;
        }
    }
    
    return count;
};

window.getConfidenceLevel = function(confidence) {
    const thresholds = window.IntelligenceModel.confidence;
    if (confidence >= thresholds.high.min) return thresholds.high;
    if (confidence >= thresholds.medium.min) return thresholds.medium;
    return thresholds.low;
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
console.log('   3-Point Intelligence Model: Predictive (15%) + Real-Time (55%) + Historical (30%)');
console.log('   Detection Modules:', window.IntelligenceModel.totalModules, 'across 6 signal types');

// Dispatch ready event
try {
    document.dispatchEvent(new CustomEvent('platformsReady'));
} catch (e) {
    console.log('Could not dispatch platformsReady event');
}

})();
