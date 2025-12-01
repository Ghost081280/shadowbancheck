/* =============================================================================
   DEMO-DATA.JS - Demo Result Data for Testing
   ShadowBanCheck.io
   
   Provides realistic demo data for testing the results page.
   Supports both legacy format and new 5-Factor Engine format.
   ============================================================================= */

(function() {
'use strict';

// ============================================================================
// 5-FACTOR ENGINE FORMAT - New comprehensive result structure
// ============================================================================
const fiveFactorResults = {
    
    twitter: {
        powerCheck: {
            checkType: 'powerCheck',
            platform: 'twitter',
            inputUrl: 'https://x.com/testuser/status/1234567890',
            normalizedUrl: 'https://x.com/testuser/status/1234567890',
            timestamp: null, // Set dynamically
            processingTime: 2847,
            demo: true,
            
            post: {
                id: '1234567890',
                exists: true,
                showingUp: true,
                reachScore: 72,
                probability: 28,
                visibility: {
                    directLink: true,
                    onProfile: true,
                    inSearch: true,
                    inHashtagFeeds: false,
                    inCashtagFeeds: true,
                    inRecommendations: false
                },
                detection: {
                    hashtags: { checked: 3, flagged: 1, banned: ['#followback'], restricted: [], monitored: [] },
                    cashtags: { checked: 1, flagged: 0, banned: [], restricted: [], monitored: [] },
                    links: { checked: 1, flagged: 1, issues: ['Link shortener: bit.ly'] },
                    content: { checked: true, flagged: 1, issues: ['Engagement bait phrase detected'] },
                    mentions: { checked: 2, flagged: 0, issues: [] },
                    emojis: { checked: 5, flagged: 0, issues: [] }
                },
                verdict: 'LIKELY CLEAR'
            },
            
            account: {
                username: 'testuser',
                displayName: 'Test User',
                exists: true,
                suspended: false,
                protected: false,
                showingUp: true,
                verifiedType: 'none',
                accountLabels: [],
                accountAge: 1245, // days
                metrics: {
                    followers: 12500,
                    following: 890,
                    posts: 3420
                },
                reachScore: 78,
                probability: 22,
                visibility: {
                    searchable: true,
                    suggestable: true,
                    repliesVisible: true
                },
                shadowbanChecks: {
                    searchBan: false,
                    ghostBan: false,
                    replyDeboosting: false,
                    suggestBan: false
                },
                verdict: 'CLEAR'
            },
            
            factors: [
                {
                    factor: 1,
                    name: 'Platform API Analysis',
                    weight: 20,
                    rawScore: 15,
                    weightedScore: 3,
                    confidence: 85,
                    findingsCount: 2,
                    findings: [
                        { type: 'good', severity: 'none', message: 'Account exists and is active', impact: 0 },
                        { type: 'info', severity: 'low', message: 'Account not verified - may affect reach', impact: 5 }
                    ]
                },
                {
                    factor: 2,
                    name: 'Web/Search Analysis',
                    weight: 20,
                    rawScore: 25,
                    weightedScore: 5,
                    confidence: 75,
                    findingsCount: 3,
                    findings: [
                        { type: 'good', severity: 'none', message: 'Profile visible when logged in', impact: 0 },
                        { type: 'warning', severity: 'medium', message: 'Reduced visibility in logged-out search', impact: 15 },
                        { type: 'warning', severity: 'low', message: 'Not appearing in recommendations', impact: 10 }
                    ]
                },
                {
                    factor: 3,
                    name: 'Historical Data',
                    weight: 15,
                    rawScore: 0,
                    weightedScore: 0,
                    confidence: 40,
                    findingsCount: 1,
                    findings: [
                        { type: 'info', severity: 'none', message: 'No historical data - first analysis (Free tier)', impact: 0 }
                    ]
                },
                {
                    factor: 4,
                    name: 'Real-Time Detection',
                    weight: 25,
                    rawScore: 35,
                    weightedScore: 8.75,
                    confidence: 90,
                    findingsCount: 4,
                    findings: [
                        { type: 'danger', severity: 'high', message: 'Banned hashtag detected: #followback', impact: 25 },
                        { type: 'warning', severity: 'medium', message: 'Link shortener in bio: bit.ly', impact: 10 },
                        { type: 'warning', severity: 'low', message: 'Engagement bait phrase detected', impact: 5 },
                        { type: 'good', severity: 'none', message: 'No risky emoji combinations', impact: 0 }
                    ]
                },
                {
                    factor: 5,
                    name: 'Predictive Intelligence',
                    weight: 20,
                    rawScore: 20,
                    weightedScore: 4,
                    confidence: 70,
                    findingsCount: 2,
                    findings: [
                        { type: 'info', severity: 'low', message: 'Posting during high-activity period', impact: 0 },
                        { type: 'warning', severity: 'medium', message: 'Content pattern matches suppressed topics', impact: 15 }
                    ]
                }
            ],
            
            overallProbability: 28,
            overallConfidence: 72,
            combinedVerdict: 'LIKELY CLEAR',
            
            recommendations: [
                { priority: 'high', action: 'Remove banned hashtag #followback from post' },
                { priority: 'medium', action: 'Replace bit.ly link with full URL' },
                { priority: 'medium', action: 'Avoid engagement bait phrases like "follow for follow"' },
                { priority: 'low', action: 'Consider verification for improved visibility' },
                { priority: 'info', action: 'Upgrade to Pro for historical tracking' }
            ],
            
            _findings: [
                { type: 'danger', message: 'Banned hashtag: #followback' },
                { type: 'warning', message: 'Reduced logged-out search visibility' },
                { type: 'warning', message: 'Link shortener detected: bit.ly' },
                { type: 'warning', message: 'Not appearing in recommendations' },
                { type: 'good', message: 'Account active and not suspended' },
                { type: 'good', message: 'Profile visible when logged in' },
                { type: 'info', message: 'Account not verified' }
            ],
            
            _flags: ['banned_hashtag', 'link_shortener', 'reduced_search_visibility']
        },
        
        accountCheck: {
            checkType: 'accountCheck',
            platform: 'twitter',
            username: 'testuser',
            timestamp: null,
            processingTime: 1923,
            demo: true,
            
            account: {
                username: 'testuser',
                displayName: 'Test User',
                exists: true,
                suspended: false,
                protected: false,
                verifiedType: 'none',
                accountAge: 1245,
                metrics: {
                    followers: 12500,
                    following: 890,
                    posts: 3420
                },
                shadowbanChecks: {
                    searchBan: false,
                    ghostBan: false,
                    replyDeboosting: false,
                    suggestBan: false
                },
                probability: 18,
                verdict: 'CLEAR'
            },
            
            factors: [
                { factor: 1, name: 'Platform API Analysis', weight: 20, rawScore: 10, weightedScore: 2, confidence: 90, findingsCount: 1 },
                { factor: 2, name: 'Web/Search Analysis', weight: 20, rawScore: 15, weightedScore: 3, confidence: 80, findingsCount: 2 },
                { factor: 3, name: 'Historical Data', weight: 15, rawScore: 0, weightedScore: 0, confidence: 40, findingsCount: 1 },
                { factor: 4, name: 'Real-Time Detection', weight: 25, rawScore: 10, weightedScore: 2.5, confidence: 85, findingsCount: 2 },
                { factor: 5, name: 'Predictive Intelligence', weight: 20, rawScore: 5, weightedScore: 1, confidence: 65, findingsCount: 1 }
            ],
            
            overallProbability: 18,
            overallConfidence: 72,
            verdict: 'CLEAR',
            
            recommendations: [
                { priority: 'low', action: 'Consider verification for improved visibility' },
                { priority: 'info', action: 'Account appears healthy - continue current practices' },
                { priority: 'info', action: 'Upgrade to Pro for ongoing monitoring' }
            ]
        },
        
        tagCheck: {
            checkType: 'tagCheck',
            platform: 'twitter',
            timestamp: null,
            processingTime: 342,
            demo: true,
            
            input: {
                tags: ['#crypto', '#bitcoin', '#followback', '#f4f', '#photography', '$BTC', '$ETH', '$SCAM'],
                count: 8
            },
            
            results: {
                banned: [
                    { tag: '#followback', type: 'hashtag', category: 'engagement', reason: 'Follow-for-follow schemes' },
                    { tag: '#f4f', type: 'hashtag', category: 'engagement', reason: 'Follow-for-follow schemes' },
                    { tag: '$SCAM', type: 'cashtag', category: 'spam', reason: 'Scam indicator cashtag' }
                ],
                restricted: [
                    { tag: '#crypto', type: 'hashtag', category: 'finance', reason: 'Monitored for spam activity' }
                ],
                monitored: [
                    { tag: '$BTC', type: 'cashtag', category: 'crypto', reason: 'High-volume crypto tag' }
                ],
                safe: [
                    { tag: '#bitcoin', type: 'hashtag', category: 'crypto', status: 'safe' },
                    { tag: '#photography', type: 'hashtag', category: 'hobby', status: 'safe' },
                    { tag: '$ETH', type: 'cashtag', category: 'crypto', status: 'safe' }
                ]
            },
            
            summary: {
                total: 8,
                banned: 3,
                restricted: 1,
                monitored: 1,
                safe: 3,
                riskScore: 62
            },
            
            verdict: 'HIGH RISK',
            
            recommendations: [
                { priority: 'critical', action: 'Remove #followback and #f4f immediately' },
                { priority: 'critical', action: 'Never use $SCAM - obvious spam indicator' },
                { priority: 'medium', action: 'Use #crypto sparingly - it\'s monitored' },
                { priority: 'info', action: '#photography and #bitcoin are safe to use' }
            ]
        }
    },
    
    reddit: {
        powerCheck: {
            checkType: 'powerCheck',
            platform: 'reddit',
            inputUrl: 'https://reddit.com/r/technology/comments/abc123/my_post_title',
            normalizedUrl: 'https://reddit.com/r/technology/comments/abc123/my_post_title',
            timestamp: null,
            processingTime: 2156,
            demo: true,
            
            post: {
                id: 'abc123',
                subreddit: 'technology',
                exists: true,
                showingUp: false,
                reachScore: 45,
                probability: 55,
                visibility: {
                    directLink: true,
                    onProfile: true,
                    inSubreddit: false,
                    inSearch: false,
                    inRAll: false
                },
                detection: {
                    hashtags: { checked: 0, flagged: 0, banned: [], restricted: [], monitored: [], note: 'N/A for Reddit' },
                    links: { checked: 1, flagged: 1, issues: ['Self-promotion: links to same domain repeatedly'] },
                    content: { checked: true, flagged: 2, issues: ['Promotional language detected', 'Low comment-to-post ratio'] },
                    mentions: { checked: 0, flagged: 0, issues: [] }
                },
                verdict: 'LIKELY RESTRICTED'
            },
            
            account: {
                username: 'reddituser',
                exists: true,
                suspended: false,
                showingUp: true,
                accountAge: 730,
                metrics: {
                    karma: 1234,
                    postKarma: 456,
                    commentKarma: 778
                },
                reachScore: 65,
                probability: 35,
                subredditBans: [
                    { subreddit: 'r/technology', reason: 'Self-promotion', date: '2024-08-15' }
                ],
                verdict: 'UNCERTAIN'
            },
            
            factors: [
                { factor: 1, name: 'Platform API Analysis', weight: 20, rawScore: 25, weightedScore: 5, confidence: 85, findingsCount: 2 },
                { factor: 2, name: 'Web/Search Analysis', weight: 20, rawScore: 40, weightedScore: 8, confidence: 80, findingsCount: 3 },
                { factor: 3, name: 'Historical Data', weight: 15, rawScore: 30, weightedScore: 4.5, confidence: 75, findingsCount: 2 },
                { factor: 4, name: 'Real-Time Detection', weight: 25, rawScore: 45, weightedScore: 11.25, confidence: 90, findingsCount: 4 },
                { factor: 5, name: 'Predictive Intelligence', weight: 20, rawScore: 25, weightedScore: 5, confidence: 65, findingsCount: 2 }
            ],
            
            overallProbability: 42,
            overallConfidence: 79,
            combinedVerdict: 'UNCERTAIN',
            
            recommendations: [
                { priority: 'high', action: 'Reduce self-promotion ratio - follow Reddit\'s 10% rule' },
                { priority: 'high', action: 'Increase comment engagement before posting links' },
                { priority: 'medium', action: 'Diversify content sources' },
                { priority: 'medium', action: 'Appeal subreddit ban if appropriate' },
                { priority: 'info', action: 'Build karma in other subreddits first' }
            ],
            
            _findings: [
                { type: 'danger', message: 'Post not appearing in subreddit feed' },
                { type: 'danger', message: 'Previously banned from r/technology' },
                { type: 'warning', message: 'High self-promotion ratio (80%)' },
                { type: 'warning', message: 'Not appearing in r/all' },
                { type: 'good', message: 'Positive karma score' },
                { type: 'good', message: 'Account age > 1 year' }
            ],
            
            _flags: ['subreddit_removed', 'self_promotion', 'prior_ban']
        }
    },
    
    instagram: {
        powerCheck: {
            checkType: 'powerCheck',
            platform: 'instagram',
            inputUrl: 'https://instagram.com/p/ABC123xyz',
            normalizedUrl: 'https://instagram.com/p/ABC123xyz',
            timestamp: null,
            processingTime: 2534,
            demo: true,
            
            post: {
                id: 'ABC123xyz',
                exists: true,
                showingUp: false,
                reachScore: 55,
                probability: 45,
                visibility: {
                    directLink: true,
                    onProfile: true,
                    inHashtagFeeds: false,
                    inExplore: false,
                    inRecommendations: false
                },
                detection: {
                    hashtags: { checked: 12, flagged: 2, banned: ['#adulting'], restricted: ['#instagood'], monitored: [] },
                    links: { checked: 1, flagged: 1, issues: ['Linktree detected - may limit reach'] },
                    content: { checked: true, flagged: 0, issues: [] },
                    mentions: { checked: 3, flagged: 0, issues: [] },
                    emojis: { checked: 8, flagged: 0, issues: [] }
                },
                verdict: 'LIKELY RESTRICTED'
            },
            
            account: {
                username: 'instauser',
                displayName: 'Instagram User',
                exists: true,
                suspended: false,
                protected: false,
                showingUp: true,
                verifiedType: 'none',
                accountAge: 890,
                metrics: {
                    followers: 5200,
                    following: 420,
                    posts: 156
                },
                reachScore: 70,
                probability: 30,
                verdict: 'LIKELY CLEAR'
            },
            
            factors: [
                { factor: 1, name: 'Platform API Analysis', weight: 20, rawScore: 15, weightedScore: 3, confidence: 80, findingsCount: 2 },
                { factor: 2, name: 'Web/Search Analysis', weight: 20, rawScore: 35, weightedScore: 7, confidence: 75, findingsCount: 3 },
                { factor: 3, name: 'Historical Data', weight: 15, rawScore: 0, weightedScore: 0, confidence: 40, findingsCount: 1 },
                { factor: 4, name: 'Real-Time Detection', weight: 25, rawScore: 40, weightedScore: 10, confidence: 88, findingsCount: 4 },
                { factor: 5, name: 'Predictive Intelligence', weight: 20, rawScore: 20, weightedScore: 4, confidence: 70, findingsCount: 2 }
            ],
            
            overallProbability: 35,
            overallConfidence: 71,
            combinedVerdict: 'UNCERTAIN',
            
            recommendations: [
                { priority: 'critical', action: 'Remove #adulting - it\'s currently banned' },
                { priority: 'medium', action: 'Consider replacing Linktree with direct link' },
                { priority: 'low', action: 'Use #instagood sparingly - it\'s oversaturated' },
                { priority: 'info', action: 'Wait 24-48 hours before posting after removing banned hashtag' }
            ],
            
            _findings: [
                { type: 'danger', message: 'Banned hashtag: #adulting' },
                { type: 'warning', message: 'Post not appearing in hashtag feeds' },
                { type: 'warning', message: 'Linktree in bio may limit distribution' },
                { type: 'warning', message: 'Not appearing in Explore' },
                { type: 'good', message: 'Account is public and searchable' }
            ],
            
            _flags: ['banned_hashtag', 'hashtag_shadowban', 'link_aggregator']
        }
    },
    
    tiktok: {
        powerCheck: {
            checkType: 'powerCheck',
            platform: 'tiktok',
            inputUrl: 'https://tiktok.com/@user/video/1234567890',
            normalizedUrl: 'https://tiktok.com/@user/video/1234567890',
            timestamp: null,
            processingTime: 2891,
            demo: true,
            
            post: {
                id: '1234567890',
                exists: true,
                showingUp: false,
                reachScore: 40,
                probability: 60,
                visibility: {
                    directLink: true,
                    onProfile: true,
                    inForYou: false,
                    inSearch: false,
                    inHashtagFeeds: false
                },
                detection: {
                    hashtags: { checked: 5, flagged: 1, banned: [], restricted: ['#viral'], monitored: ['#fyp'] },
                    links: { checked: 1, flagged: 1, issues: ['External link in bio limits distribution'] },
                    content: { checked: true, flagged: 1, issues: ['Video flagged for review'] },
                    mentions: { checked: 1, flagged: 0, issues: [] },
                    emojis: { checked: 3, flagged: 0, issues: [] }
                },
                verdict: 'LIKELY RESTRICTED'
            },
            
            account: {
                username: 'tiktokuser',
                displayName: 'TikTok Creator',
                exists: true,
                suspended: false,
                showingUp: true,
                verifiedType: 'none',
                accountAge: 456,
                metrics: {
                    followers: 8900,
                    following: 234,
                    likes: 125000
                },
                reachScore: 65,
                probability: 35,
                verdict: 'LIKELY CLEAR'
            },
            
            factors: [
                { factor: 1, name: 'Platform API Analysis', weight: 20, rawScore: 30, weightedScore: 6, confidence: 75, findingsCount: 2 },
                { factor: 2, name: 'Web/Search Analysis', weight: 20, rawScore: 45, weightedScore: 9, confidence: 80, findingsCount: 3 },
                { factor: 3, name: 'Historical Data', weight: 15, rawScore: 0, weightedScore: 0, confidence: 40, findingsCount: 1 },
                { factor: 4, name: 'Real-Time Detection', weight: 25, rawScore: 35, weightedScore: 8.75, confidence: 85, findingsCount: 4 },
                { factor: 5, name: 'Predictive Intelligence', weight: 20, rawScore: 40, weightedScore: 8, confidence: 70, findingsCount: 2 }
            ],
            
            overallProbability: 52,
            overallConfidence: 70,
            combinedVerdict: 'LIKELY RESTRICTED',
            
            recommendations: [
                { priority: 'high', action: 'Video may be under review - wait 24 hours' },
                { priority: 'medium', action: 'Remove external link from bio temporarily' },
                { priority: 'medium', action: 'Replace #viral with niche-specific hashtags' },
                { priority: 'low', action: 'Use #fyp sparingly - it\'s oversaturated' },
                { priority: 'info', action: 'Consider reposting if views stay unusually low' }
            ],
            
            _findings: [
                { type: 'danger', message: 'Video flagged for limited distribution' },
                { type: 'warning', message: 'Not appearing on For You page' },
                { type: 'warning', message: 'External link in bio limits reach' },
                { type: 'warning', message: '#viral under review' },
                { type: 'good', message: 'Account is public' }
            ],
            
            _flags: ['limited_distribution', 'external_link', 'under_review']
        }
    }
};

// ============================================================================
// LEGACY FORMAT - For backwards compatibility with existing results.js
// ============================================================================
const legacyResults = {
    twitter: {
        powerCheck: {
            platform: 'twitter',
            platformName: 'Twitter/X',
            platformIcon: '𝕏',
            probability: 28,
            checkType: 'power',
            factorsUsed: 5,
            factors: [
                { name: 'Platform APIs', icon: '🔌', status: 'complete', score: 15, finding: 'Account active, no API flags detected', details: 'Direct API query returned normal account status' },
                { name: 'Web Analysis', icon: '🔍', status: 'complete', score: 20, finding: 'Mixed search visibility results', details: 'Profile visible logged-in, reduced visibility logged-out' },
                { name: 'Historical Data', icon: '📊', status: 'complete', score: 0, finding: 'No historical data available (Free tier)', details: 'Upgrade to Pro to track changes over time' },
                { name: 'Hashtag Database', icon: '#️⃣', status: 'complete', score: 5, finding: 'Post contains 1 restricted hashtag', details: '#followback is commonly restricted' },
                { name: 'Content & Links', icon: '📝', status: 'complete', score: 8, finding: 'Bio contains shortened link', details: 'Link shorteners (bit.ly) may reduce reach' }
            ],
            findings: [
                { type: 'good', text: 'Account appears in search when logged in' },
                { type: 'good', text: 'Profile is public and accessible' },
                { type: 'warning', text: 'Reduced visibility in logged-out search' },
                { type: 'warning', text: 'Post contains restricted hashtag #followback' },
                { type: 'info', text: 'Bio link uses shortener (bit.ly)' }
            ],
            contentAnalysis: {
                bioFlags: ['Link shortener detected: bit.ly'],
                postFlags: ['Restricted hashtag: #followback'],
                linkFlags: [],
                taggedUserFlags: []
            },
            recommendations: [
                'Remove or replace restricted hashtags with alternatives',
                'Consider using full URLs instead of link shorteners in bio',
                'Continue engaging authentically with your audience',
                'Post consistently to maintain algorithmic favor',
                'Consider verification for improved visibility'
            ]
        },
        accountCheck: {
            platform: 'twitter',
            platformName: 'Twitter/X',
            platformIcon: '𝕏',
            probability: 22,
            checkType: 'account',
            factorsUsed: 5,
            factors: [
                { name: 'Platform APIs', icon: '🔌', status: 'complete', score: 10, finding: 'Account exists and is active', details: 'API returned normal account status' },
                { name: 'Web Analysis', icon: '🔍', status: 'complete', score: 15, finding: 'Profile visible in all search contexts', details: 'Passed logged-in, logged-out, and incognito tests' },
                { name: 'Historical Data', icon: '📊', status: 'complete', score: 0, finding: 'No historical baseline (Free tier)', details: 'First analysis - no comparison data available' },
                { name: 'Hashtag Database', icon: '#️⃣', status: 'complete', score: 5, finding: 'Recent posts use safe hashtags', details: 'Scanned pinned tweet and recent activity' },
                { name: 'Content & Links', icon: '📝', status: 'complete', score: 5, finding: 'Bio content clean, no flagged patterns', details: 'No flagged words, links appear legitimate' }
            ],
            findings: [
                { type: 'good', text: 'Account appears in all search contexts' },
                { type: 'good', text: 'Profile is public and fully accessible' },
                { type: 'good', text: 'No flagged content in bio or pinned tweet' },
                { type: 'good', text: 'Links in profile pass reputation checks' },
                { type: 'info', text: 'Account not verified - may affect reach' }
            ],
            contentAnalysis: { bioFlags: [], postFlags: [], linkFlags: [], taggedUserFlags: [] },
            recommendations: [
                'Your account appears healthy - keep up the good work',
                'Continue posting quality content regularly',
                'Consider verification for improved discoverability',
                'Upgrade to Pro to track visibility changes over time'
            ]
        },
        hashtagCheck: {
            platform: 'twitter',
            platformName: 'Twitter/X',
            platformIcon: '𝕏',
            probability: 45,
            checkType: 'hashtag',
            factorsUsed: 3,
            factors: [
                { name: 'Platform APIs', icon: '🔌', status: 'na', score: 0, finding: 'Not applicable for hashtag checks', details: 'API queries not used for hashtag analysis' },
                { name: 'Web Analysis', icon: '🔍', status: 'complete', score: 20, finding: 'Hashtag visibility varies by context', details: 'Some hashtags hidden from non-logged-in users' },
                { name: 'Historical Data', icon: '📊', status: 'complete', score: 10, finding: 'Known restriction patterns detected', details: 'Based on historical ban wave data' },
                { name: 'Hashtag Database', icon: '#️⃣', status: 'complete', score: 25, finding: '2 of 5 hashtags are restricted', details: '#followforfollow and #f4f commonly suppressed' },
                { name: 'Content & Links', icon: '📝', status: 'na', score: 0, finding: 'Not applicable for hashtag checks', details: 'Content analysis not used for hashtag-only checks' }
            ],
            findings: [
                { type: 'danger', text: '#followforfollow - RESTRICTED' },
                { type: 'danger', text: '#f4f - RESTRICTED' },
                { type: 'good', text: '#photography - SAFE' },
                { type: 'good', text: '#sunset - SAFE' },
                { type: 'good', text: '#nature - SAFE' }
            ],
            recommendations: [
                'Remove #followforfollow and #f4f from your posts',
                'Use community-focused hashtags instead',
                'Mix popular and niche hashtags for best reach',
                'Avoid engagement-bait hashtags'
            ]
        }
    },
    instagram: {
        powerCheck: {
            platform: 'instagram',
            platformName: 'Instagram',
            platformIcon: '📸',
            probability: 35,
            checkType: 'power',
            factorsUsed: 5,
            factors: [
                { name: 'Platform APIs', icon: '🔌', status: 'complete', score: 10, finding: 'Account active, no action blocks', details: 'No temporary restrictions detected' },
                { name: 'Web Analysis', icon: '🔍', status: 'complete', score: 25, finding: 'Post not appearing in hashtag feeds', details: 'Content may be shadowbanned from hashtag discovery' },
                { name: 'Historical Data', icon: '📊', status: 'complete', score: 0, finding: 'No tracking history (Free tier)', details: 'Upgrade to Pro for engagement tracking' },
                { name: 'Hashtag Database', icon: '#️⃣', status: 'complete', score: 15, finding: '1 banned hashtag detected', details: '#adulting is currently banned on Instagram' },
                { name: 'Content & Links', icon: '📝', status: 'complete', score: 10, finding: 'Bio link flagged as affiliate', details: 'Linktree detected - may affect organic reach' }
            ],
            findings: [
                { type: 'danger', text: 'Post using banned hashtag #adulting' },
                { type: 'warning', text: 'Post not appearing in hashtag feeds' },
                { type: 'warning', text: 'Bio contains link aggregator (Linktree)' },
                { type: 'good', text: 'Account is public and searchable' },
                { type: 'good', text: 'Profile accessible to all users' }
            ],
            contentAnalysis: {
                bioFlags: ['Link aggregator detected: linktree'],
                postFlags: ['Banned hashtag: #adulting'],
                linkFlags: [],
                taggedUserFlags: []
            },
            recommendations: [
                'Remove #adulting immediately - it\'s currently banned',
                'Wait 24-48 hours before posting new content',
                'Consider using direct link instead of Linktree',
                'Use Instagram\'s built-in link features',
                'Check our hashtag database before posting'
            ]
        },
        accountCheck: {
            platform: 'instagram',
            platformName: 'Instagram',
            platformIcon: '📸',
            probability: 18,
            checkType: 'account',
            factorsUsed: 5,
            factors: [
                { name: 'Platform APIs', icon: '🔌', status: 'complete', score: 5, finding: 'Account in good standing', details: 'No restrictions or warnings on account' },
                { name: 'Web Analysis', icon: '🔍', status: 'complete', score: 10, finding: 'Profile visible in search', details: 'Appears in username and hashtag search' },
                { name: 'Historical Data', icon: '📊', status: 'complete', score: 0, finding: 'No baseline data (Free tier)', details: 'First analysis for this account' },
                { name: 'Hashtag Database', icon: '#️⃣', status: 'complete', score: 0, finding: 'Recent posts use safe hashtags', details: 'No banned or restricted hashtags detected' },
                { name: 'Content & Links', icon: '📝', status: 'complete', score: 3, finding: 'Bio clean, links legitimate', details: 'No flagged content patterns detected' }
            ],
            findings: [
                { type: 'good', text: 'Account appears in search results' },
                { type: 'good', text: 'Profile fully accessible' },
                { type: 'good', text: 'No banned hashtags in recent posts' },
                { type: 'good', text: 'Bio content passes all checks' },
                { type: 'info', text: 'Consider verification for more reach' }
            ],
            contentAnalysis: { bioFlags: [], postFlags: [], linkFlags: [], taggedUserFlags: [] },
            recommendations: [
                'Your account looks healthy!',
                'Continue using diverse, relevant hashtags',
                'Maintain consistent posting schedule',
                'Engage authentically with your community'
            ]
        }
    },
    reddit: {
        powerCheck: {
            platform: 'reddit',
            platformName: 'Reddit',
            platformIcon: '🤖',
            probability: 42,
            checkType: 'power',
            factorsUsed: 4,
            factors: [
                { name: 'Platform APIs', icon: '🔌', status: 'complete', score: 15, finding: 'Account active, karma positive', details: 'API shows normal account status' },
                { name: 'Web Analysis', icon: '🔍', status: 'complete', score: 25, finding: 'Post visibility limited in some subreddits', details: 'Content visible but not appearing in r/all' },
                { name: 'Historical Data', icon: '📊', status: 'complete', score: 5, finding: 'Previous bans detected', details: 'Account has 1 prior subreddit ban' },
                { name: 'Hashtag Database', icon: '#️⃣', status: 'na', score: 0, finding: 'Not applicable for Reddit', details: 'Reddit does not use hashtags' },
                { name: 'Content & Links', icon: '📝', status: 'complete', score: 12, finding: 'Self-promotion ratio high', details: 'Most posts link to same domain - may trigger spam filters' }
            ],
            findings: [
                { type: 'warning', text: 'Post not appearing in r/all' },
                { type: 'warning', text: 'High self-promotion ratio detected' },
                { type: 'warning', text: 'Previously banned from r/technology' },
                { type: 'good', text: 'Karma score is positive (1,234)' },
                { type: 'good', text: 'Account age > 1 year' }
            ],
            contentAnalysis: {
                bioFlags: [],
                postFlags: ['High self-promotion ratio: 80% posts link to same domain'],
                linkFlags: ['Repeated domain: myblog.com (flagged as potential spam)'],
                taggedUserFlags: []
            },
            subredditBans: [{ subreddit: 'r/technology', reason: 'Self-promotion', date: '2024-08-15' }],
            karma: { total: 1234, post: 456, comment: 778, age: '2 years' },
            recommendations: [
                'Diversify your content sources - Reddit\'s 10% rule',
                'Engage more in comments before posting links',
                'Build karma in new subreddits before posting',
                'Appeal your r/technology ban if possible',
                'Post more text-based content to balance ratio'
            ]
        },
        accountCheck: {
            platform: 'reddit',
            platformName: 'Reddit',
            platformIcon: '🤖',
            probability: 25,
            checkType: 'account',
            factorsUsed: 4,
            factors: [
                { name: 'Platform APIs', icon: '🔌', status: 'complete', score: 10, finding: 'Account in good standing', details: 'No site-wide restrictions' },
                { name: 'Web Analysis', icon: '🔍', status: 'complete', score: 15, finding: 'Profile visible in search', details: 'Username searchable, posts indexed' },
                { name: 'Historical Data', icon: '📊', status: 'complete', score: 0, finding: 'No prior issues detected', details: 'Clean account history' },
                { name: 'Hashtag Database', icon: '#️⃣', status: 'na', score: 0, finding: 'N/A for Reddit', details: 'Reddit does not use hashtags' },
                { name: 'Content & Links', icon: '📝', status: 'complete', score: 5, finding: 'Content patterns normal', details: 'No spam indicators in recent activity' }
            ],
            findings: [
                { type: 'good', text: 'Account is active and visible' },
                { type: 'good', text: 'Positive karma score' },
                { type: 'good', text: 'No subreddit bans detected' },
                { type: 'good', text: 'Content patterns appear normal' },
                { type: 'info', text: 'Account age helps credibility' }
            ],
            contentAnalysis: { bioFlags: [], postFlags: [], linkFlags: [], taggedUserFlags: [] },
            karma: { total: 2500, post: 1200, comment: 1300, age: '3 years' },
            recommendations: [
                'Your Reddit account looks healthy',
                'Continue diverse participation across subreddits',
                'Maintain the 10% self-promotion rule',
                'Keep engaging authentically in comments'
            ]
        }
    },
    tiktok: {
        powerCheck: {
            platform: 'tiktok',
            platformName: 'TikTok',
            platformIcon: '🎵',
            probability: 52,
            checkType: 'power',
            factorsUsed: 5,
            factors: [
                { name: 'Platform APIs', icon: '🔌', status: 'complete', score: 20, finding: 'Video marked for limited distribution', details: 'Content review flag detected' },
                { name: 'Web Analysis', icon: '🔍', status: 'complete', score: 25, finding: 'Video not appearing on For You page', details: 'Limited to followers only currently' },
                { name: 'Historical Data', icon: '📊', status: 'complete', score: 0, finding: 'No baseline (Free tier)', details: 'Upgrade to track view patterns' },
                { name: 'Hashtag Database', icon: '#️⃣', status: 'complete', score: 10, finding: 'Using borderline hashtag', details: '#viral sometimes triggers review' },
                { name: 'Content & Links', icon: '📝', status: 'complete', score: 15, finding: 'Bio contains external link', details: 'External links may limit distribution' }
            ],
            findings: [
                { type: 'danger', text: 'Video flagged for limited distribution' },
                { type: 'warning', text: 'Not appearing on For You page' },
                { type: 'warning', text: '#viral hashtag under review' },
                { type: 'warning', text: 'External link in bio may limit reach' },
                { type: 'good', text: 'Account is public' }
            ],
            contentAnalysis: {
                bioFlags: ['External link detected - may limit distribution'],
                postFlags: ['Borderline hashtag: #viral'],
                linkFlags: [],
                taggedUserFlags: []
            },
            recommendations: [
                'Remove #viral and use niche-specific hashtags',
                'Wait 24 hours and repost if views are unusually low',
                'Consider removing external link from bio temporarily',
                'Use TikTok\'s native features for links',
                'Check video for any borderline content'
            ]
        },
        accountCheck: {
            platform: 'tiktok',
            platformName: 'TikTok',
            platformIcon: '🎵',
            probability: 20,
            checkType: 'account',
            factorsUsed: 5,
            factors: [
                { name: 'Platform APIs', icon: '🔌', status: 'complete', score: 5, finding: 'Account in good standing', details: 'No violations on record' },
                { name: 'Web Analysis', icon: '🔍', status: 'complete', score: 10, finding: 'Profile discoverable', details: 'Appears in search results' },
                { name: 'Historical Data', icon: '📊', status: 'complete', score: 0, finding: 'No baseline data', details: 'First analysis for this account' },
                { name: 'Hashtag Database', icon: '#️⃣', status: 'complete', score: 5, finding: 'Recent videos use safe hashtags', details: 'No restricted hashtags detected' },
                { name: 'Content & Links', icon: '📝', status: 'complete', score: 0, finding: 'Bio clean, no red flags', details: 'Content patterns appear normal' }
            ],
            findings: [
                { type: 'good', text: 'Account is active and visible' },
                { type: 'good', text: 'No community guidelines strikes' },
                { type: 'good', text: 'Recent content using safe hashtags' },
                { type: 'good', text: 'Bio passes content checks' },
                { type: 'info', text: 'Pro accounts get more analytics' }
            ],
            contentAnalysis: { bioFlags: [], postFlags: [], linkFlags: [], taggedUserFlags: [] },
            recommendations: [
                'Your TikTok account appears healthy',
                'Continue creating original content',
                'Engage with your niche community',
                'Use trending sounds but avoid overused ones'
            ]
        }
    }
};

// ============================================================================
// PUBLIC API
// ============================================================================
window.DemoData = {
    
    /**
     * Get demo result - returns 5-Factor format if engine=5factor, else legacy
     * @param {string} platformId - Platform identifier
     * @param {string} checkType - Check type (powerCheck, accountCheck, hashtagCheck/tagCheck)
     * @param {object} options - { format: 'legacy' | '5factor' | 'auto' }
     */
    getResult: function(platformId, checkType, options = {}) {
        const format = options.format || 'auto';
        
        // Normalize check type
        let normalizedType = checkType;
        if (checkType === 'hashtag' || checkType === 'hashtagCheck') {
            normalizedType = 'tagCheck';
        }
        if (checkType === 'power') {
            normalizedType = 'powerCheck';
        }
        if (checkType === 'account') {
            normalizedType = 'accountCheck';
        }
        
        // Determine which format to use
        const use5Factor = format === '5factor' || 
                          (format === 'auto' && window.FiveFactorLoader && window.FiveFactorLoader.isEngineReady());
        
        let result = null;
        
        if (use5Factor) {
            // Try 5-Factor format first
            const platform = fiveFactorResults[platformId];
            if (platform && platform[normalizedType]) {
                result = JSON.parse(JSON.stringify(platform[normalizedType])); // Deep clone
            }
        }
        
        // Fall back to legacy
        if (!result) {
            const legacyType = normalizedType === 'tagCheck' ? 'hashtagCheck' : normalizedType;
            const platform = legacyResults[platformId];
            if (platform && platform[legacyType]) {
                result = JSON.parse(JSON.stringify(platform[legacyType]));
            }
        }
        
        // Still no result? Generate default
        if (!result) {
            return this.getDefaultResult(platformId, checkType);
        }
        
        // Add timestamp
        result.timestamp = new Date().toISOString();
        
        return result;
    },
    
    /**
     * Get result in 5-Factor Engine format specifically
     */
    get5FactorResult: function(platformId, checkType) {
        return this.getResult(platformId, checkType, { format: '5factor' });
    },
    
    /**
     * Get result in legacy format specifically  
     */
    getLegacyResult: function(platformId, checkType) {
        return this.getResult(platformId, checkType, { format: 'legacy' });
    },
    
    /**
     * Get default result when no specific demo exists
     */
    getDefaultResult: function(platformId, checkType) {
        const platform = window.getPlatformById ? window.getPlatformById(platformId) : null;
        const isReddit = platformId === 'reddit';
        const isHashtag = checkType === 'hashtagCheck' || checkType === 'hashtag' || checkType === 'tagCheck';
        
        return {
            platform: platformId,
            platformName: platform ? platform.name : 'Platform',
            platformIcon: platform ? platform.icon : '🔍',
            probability: Math.floor(Math.random() * 30) + 15,
            checkType: checkType,
            factorsUsed: isHashtag ? 3 : (isReddit ? 4 : 5),
            demo: true,
            factors: [
                { name: 'Platform APIs', icon: '🔌', status: isHashtag ? 'na' : 'complete', score: 10, finding: isHashtag ? 'N/A for hashtag checks' : 'Account queried successfully' },
                { name: 'Web Analysis', icon: '🔍', status: 'complete', score: 15, finding: 'Web visibility tests completed' },
                { name: 'Historical Data', icon: '📊', status: 'complete', score: 0, finding: 'No baseline data (Free tier)' },
                { name: 'Hashtag Database', icon: '#️⃣', status: isReddit ? 'na' : 'complete', score: 5, finding: isReddit ? 'N/A for Reddit' : 'Hashtags checked' },
                { name: 'Content & Links', icon: '📝', status: isHashtag ? 'na' : 'complete', score: 5, finding: isHashtag ? 'N/A for hashtag checks' : 'Bio and content analyzed' }
            ],
            findings: [
                { type: 'good', text: 'Analysis completed successfully' },
                { type: 'good', text: 'No major issues detected' },
                { type: 'info', text: 'Upgrade to Pro for detailed tracking' }
            ],
            contentAnalysis: { bioFlags: [], postFlags: [], linkFlags: [], taggedUserFlags: [] },
            recommendations: [
                'Continue monitoring your account regularly',
                'Check our hashtag database before posting',
                'Consider upgrading to Pro for historical tracking'
            ],
            timestamp: new Date().toISOString()
        };
    },
    
    /**
     * Get all available platforms with demo data
     */
    getAvailablePlatforms: function() {
        return [...new Set([...Object.keys(fiveFactorResults), ...Object.keys(legacyResults)])];
    },
    
    /**
     * Check if demo data exists for a platform
     */
    hasDemo: function(platformId) {
        return !!(fiveFactorResults[platformId] || legacyResults[platformId]);
    },
    
    /**
     * Check if 5-Factor format exists for a platform
     */
    has5FactorDemo: function(platformId) {
        return !!fiveFactorResults[platformId];
    }
};

console.log('✅ DemoData loaded (5-Factor + Legacy) - platforms:', window.DemoData.getAvailablePlatforms().join(', '));

})();
