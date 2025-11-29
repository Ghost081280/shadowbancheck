/* =============================================================================
   PLATFORMS.JS - SINGLE SOURCE OF TRUTH
   Social Media Platforms for Shadow Ban Detection
   
   This file is loaded FIRST on all pages.
   7 platforms (2 live, 5 coming soon)
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
                { id: 'follow', label: 'Follow @ghost081280', icon: '👤' },
                { id: 'like', label: 'Like our pinned tweet', icon: '❤️' },
                { id: 'retweet', label: 'Retweet our pinned tweet', icon: '🔁' },
                { id: 'reply', label: 'Reply with "check @yourusername"', icon: '💬' },
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
            engagementTest: false, // TBD
        },
        
        engagementTest: {
            enabled: false,
            testAccount: 'ShadowBanCheck', // To be created
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
        
        messages: {
            platformNote: 'LinkedIn content reach varies based on multiple factors we analyze.',
        },
    },
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
        p.name.toLowerCase().replace(/\s+/g, '').replace(/\//g, '') === normalized ||
        p.id === normalized
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
 * Get platforms that support hashtags (for Hashtag Checker)
 */
window.getHashtagPlatforms = function() {
    return window.platformData.filter(p => p.supports && p.supports.hashtagCheck);
};

/**
 * Get LIVE platforms that support hashtags
 */
window.getLiveHashtagPlatforms = function() {
    return window.platformData.filter(p => p.status === 'live' && p.supports && p.supports.hashtagCheck);
};

/**
 * Get platforms that support engagement test
 */
window.getEngagementTestPlatforms = function() {
    return window.platformData.filter(p => p.supports && p.supports.engagementTest && p.engagementTest && p.engagementTest.enabled);
};

/**
 * Check if platform supports a specific feature
 */
window.platformSupports = function(platformId, feature) {
    const platform = window.getPlatformById(platformId);
    return platform && platform.supports && platform.supports[feature];
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

/**
 * Detect platform from URL
 */
window.detectPlatformFromUrl = function(url) {
    if (!url) return null;
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
        return window.getPlatformById('twitter');
    }
    if (lowerUrl.includes('reddit.com')) {
        return window.getPlatformById('reddit');
    }
    if (lowerUrl.includes('instagram.com')) {
        return window.getPlatformById('instagram');
    }
    if (lowerUrl.includes('tiktok.com')) {
        return window.getPlatformById('tiktok');
    }
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
        return window.getPlatformById('facebook');
    }
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return window.getPlatformById('youtube');
    }
    if (lowerUrl.includes('linkedin.com')) {
        return window.getPlatformById('linkedin');
    }
    
    return null;
};

/**
 * Extract username from URL (platform-specific)
 */
window.extractUsernameFromUrl = function(url, platformId) {
    if (!url) return null;
    
    try {
        if (platformId === 'twitter') {
            // https://twitter.com/username/status/123 or https://x.com/username/status/123
            const match = url.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/i);
            if (match && match[1] && !['status', 'home', 'search', 'explore', 'i'].includes(match[1])) {
                return match[1];
            }
        }
        if (platformId === 'reddit') {
            // https://reddit.com/user/username or https://reddit.com/u/username
            const userMatch = url.match(/reddit\.com\/u(?:ser)?\/([^\/\?]+)/i);
            if (userMatch) return userMatch[1];
            
            // https://reddit.com/r/subreddit/comments/id/title - extract from post
            // Would need API to get actual username from post
        }
        // Add more platforms as needed
    } catch (e) {
        console.error('Error extracting username:', e);
    }
    
    return null;
};

console.log('✅ Platforms loaded:', window.platformData.length, 'platforms (', 
    window.getLivePlatformCount(), 'live,',
    window.getComingSoonPlatforms().length, 'coming soon)');

// Backwards compatibility
window.PLATFORMS = window.platformData;
var PLATFORMS = window.platformData;
```

---

Now here's the **updated final prompt** with your additions:

---
```
Claude, I need help updating ShadowBanCheck.io's front-end to reflect our refined offering structure. This is a foundational update before we build the detection engine.

## OVERVIEW

We're building a shadow ban detection tool focused on gathering intelligence, analyzing signals, and reporting with the best variables per platform.

Key insights driving this update:

1. A post URL check in isolation is incomplete - if an account is shadowbanned, ALL posts are affected. We can't accurately score a post without knowing the account status.

2. Reddit doesn't use hashtags, so the Hashtag Checker shouldn't show Reddit as an option.

3. Each platform has unique checks - the UI should adapt to show what's relevant per platform.

4. Twitter has a unique "engagement test" where users interact with our test account (@ghost081280) so we can verify their visibility through legitimate API calls.

5. Free searches have NO historical data - users must upgrade to Pro and store their account for us to track over time.

6. Users should only search their OWN content - searching someone else's post will use the WRONG IP address in the calculation.

## NEW OFFERING STRUCTURE

KEEP:
- Power Check (3-in-1) - Main feature, paste a post URL for full analysis
- Account Checker - Standalone username check
- Hashtag Checker - Pre-post hashtag research (with platform selector)

REMOVE:
- Post Checker standalone page - Merged into Power Check

## PLATFORM LINEUP

LIVE (2):
- Twitter/X - Full support (Account, Post, Hashtags, Engagement Test)
- Reddit - Full support (Account, Post, NO hashtags, Subreddit bans, Karma analysis)

COMING SOON (5):
- Instagram - Hashtag-heavy, creator demand
- TikTok - FYP shadow bans
- Facebook - News feed throttling
- YouTube - Search/recommendation suppression
- LinkedIn - Professional network reach analysis

Keep "Suggest a Platform" option next to the platforms we analyze on the index page.

## IMPORTANT USER WARNINGS TO DISPLAY

### Free vs Pro - Historical Data Warning
Display prominently on checker pages:
"⚠️ Free checks have no historical data. Upgrade to Pro and save your account for tracking over time - historical patterns significantly improve accuracy."

### Check Your OWN Content Warning
Display on Power Check and Account Checker:
"⚠️ Only check your own accounts and posts. Checking someone else's content will use YOUR IP address in the calculation, which skews the results."

## FILES TO DELETE

- post-checker.html
- js/post-checker.js
- css/post-checker.css

## FILE UPDATES NEEDED

### 1. js/platforms.js

Replace entirely with new structure (provided separately) that includes:
- Feature support flags per platform
- Engagement test configuration for Twitter
- Platform-specific checks and messages
- New utility functions for filtering platforms by features
- Reddit with supports.hashtagCheck: false

### 2. index.html

Updates needed:
- Remove Post Checker from "Or check individually" section (keep only Account Checker and Hashtag Checker)
- Remove Post Checker from navigation
- Keep "Suggest a Platform" card in the platforms section
- Add "checks preview" to Power Check showing what will be analyzed based on detected platform
- Add platform detection message (e.g., "Reddit detected - hashtag analysis not applicable")
- Expand the connection-step div with full Twitter engagement test UI
- Add warning: "Only check your own posts - checking others uses your IP in calculation"
- Update footer links removing Post Checker

### 3. checker.html (Account Checker)

Updates needed:
- Add Twitter engagement test section when Twitter/X is selected
- Add platform-specific messaging
- Add cross-promotion section recommending Power Check and Hashtag Checker
- Add warning about checking only your own account
- Add note about free vs Pro historical data
- Remove any Post Checker references
- Update navigation

### 4. hashtag-checker.html

Updates needed:
- ADD platform selector dropdown at top of form
- Only show platforms that support hashtags (NOT Reddit)
- Twitter/X as only live option, others as "Coming Soon" (disabled)
- Add note: "Reddit does not use hashtags for discovery"
- Add cross-promotion section recommending Power Check and Account Checker
- Update supported platforms display to exclude Reddit
- Remove any Post Checker references
- Update navigation

### 5. results.html

Updates needed:
- Make factor sections conditionally visible based on platform
- If Reddit: Hide hashtag factor section OR show "Not applicable for Reddit"
- If Reddit: Add subreddit bans section, karma analysis section
- If Twitter: Add engagement test results section (if completed)
- Update "Run Another Analysis" section - remove Post Checker
- Add note if free user: "Upgrade to Pro for historical tracking and improved accuracy"
- Remove Post Checker from navigation

### 6. JavaScript files (index.js, checker.js, hashtag-checker.js, results.js)

Updates needed:
- Platform detection from URL
- Show/hide engagement test based on platform
- Show/hide checks preview based on platform
- Handle engagement test checkbox tracking
- Platform selector for hashtag checker (exclude Reddit)
- Conditional rendering on results page
- Warning displays for IP and historical data

### 7. CSS files

Add styles for:
- Engagement test section (steps, progress bar, checkboxes)
- Platform detection badge and checks preview
- Cross-promotion sections
- Warning/notice boxes
- Conditional visibility classes
- Omitted check styling (grayed out)
- Platform-specific sections

### 8. NEW FILE: js/flagged-words.js

Create content scanning database with:
- High risk terms (violence, hate, adult, spam, crypto scams)
- Medium risk terms (political, health misinfo, promotional)
- Low risk terms (engagement bait)
- Pattern detection (excessive caps, emojis, hashtags)
- Risk weights for scoring

### 9. NEW FILE: js/banned-hashtags.js

Create hashtag database with:
- Banned hashtags by category
- Restricted hashtags
- Platform-specific restrictions
- Safe alternatives to suggest
- Risk weights for scoring

## TWITTER ENGAGEMENT TEST UI

When Twitter is detected, show section with:
- Header: "Enhanced Analysis Available"
- Four steps: Follow, Like, Retweet, Reply (each links to Twitter)
- Progress indicator (0/4 completed)
- Checkbox: "I've completed the steps above"
- Skip option: "Skip → Run Basic Analysis"
- Expandable "Why does this improve accuracy?" explanation

## CROSS-PROMOTION SECTIONS

Each checker page recommends the others:
- Account Checker → Power Check (highlighted), Hashtag Checker
- Hashtag Checker → Power Check (highlighted), Account Checker
- Power Check → Account Checker, Hashtag Checker as "Or check individually"

## WARNING BOXES

Style these prominently but not intrusively:
```html
<div class="warning-box">
    <span class="warning-icon">⚠️</span>
    <div class="warning-content">
        <strong>Check your own content only</strong>
        <p>Checking someone else's post uses YOUR IP address, which skews results.</p>
    </div>
</div>

<div class="info-box">
    <span class="info-icon">💡</span>
    <div class="info-content">
        <strong>Want historical tracking?</strong>
        <p>Free checks have no historical data. <a href="#pricing">Upgrade to Pro</a> and save your account for tracking over time.</p>
    </div>
</div>
```

## NAVIGATION

All pages should have:
- Home (Power Check)
- Account Checker  
- Hashtag Checker
- Pricing
- FAQ

Remove Post Checker from all navigation, footers, and cross-links.

## DEMO DATA

Use demo data since API isn't connected:
- Twitter result with engagement test, content scan, hashtag scan
- Reddit result with subreddit bans, karma analysis, NO hashtag section

## SUMMARY

This update is about:
1. Removing Post Checker (merged into Power Check)
2. Making Hashtag Checker platform-aware (no Reddit)
3. Adding Twitter engagement test UI
4. Warning users to check only their own content
5. Explaining free vs Pro historical data difference
6. Platform-adaptive UI throughout
7. Cross-promotion between tools
8. Foundation for the detection engine

Please update all files systematically. Start with platforms.js, then HTML files, then JS files, then CSS. Create the two new database files. Use demo data for testing.
