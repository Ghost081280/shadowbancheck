/* =============================================================================
   DEMO-DATA.JS - Demo Result Data for Testing
   ShadowBanCheck.io
   
   Provides realistic demo data for testing the results page
   ============================================================================= */

(function() {
'use strict';

// ============================================
// DEMO RESULTS DATABASE
// ============================================
const demoResults = {
    // Twitter/X Demo Results
    twitter: {
        powerCheck: {
            platform: 'twitter',
            platformName: 'Twitter/X',
            platformIcon: '𝕏',
            probability: 28,
            checkType: 'power',
            factorsUsed: 5,
            factors: [
                { 
                    name: 'Platform APIs', 
                    icon: '🔌',
                    status: 'complete', 
                    score: 15,
                    finding: 'Account active, no API flags detected',
                    details: 'Direct API query returned normal account status'
                },
                { 
                    name: 'Web Analysis', 
                    icon: '🔍',
                    status: 'complete', 
                    score: 20,
                    finding: 'Mixed search visibility results',
                    details: 'Profile visible logged-in, reduced visibility logged-out'
                },
                { 
                    name: 'Historical Data', 
                    icon: '📊',
                    status: 'complete', 
                    score: 0,
                    finding: 'No historical data available (Free tier)',
                    details: 'Upgrade to Pro to track changes over time'
                },
                { 
                    name: 'Hashtag Database', 
                    icon: '#️⃣',
                    status: 'complete', 
                    score: 5,
                    finding: 'Post contains 1 restricted hashtag',
                    details: '#followback is commonly restricted'
                },
                { 
                    name: 'Content & Links', 
                    icon: '📝',
                    status: 'complete', 
                    score: 8,
                    finding: 'Bio contains shortened link',
                    details: 'Link shorteners (bit.ly) may reduce reach'
                }
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
                { 
                    name: 'Platform APIs', 
                    icon: '🔌',
                    status: 'complete', 
                    score: 10,
                    finding: 'Account exists and is active',
                    details: 'API returned normal account status'
                },
                { 
                    name: 'Web Analysis', 
                    icon: '🔍',
                    status: 'complete', 
                    score: 15,
                    finding: 'Profile visible in all search contexts',
                    details: 'Passed logged-in, logged-out, and incognito tests'
                },
                { 
                    name: 'Historical Data', 
                    icon: '📊',
                    status: 'complete', 
                    score: 0,
                    finding: 'No historical baseline (Free tier)',
                    details: 'First analysis - no comparison data available'
                },
                { 
                    name: 'Hashtag Database', 
                    icon: '#️⃣',
                    status: 'complete', 
                    score: 5,
                    finding: 'Recent posts use safe hashtags',
                    details: 'Scanned pinned tweet and recent activity'
                },
                { 
                    name: 'Content & Links', 
                    icon: '📝',
                    status: 'complete', 
                    score: 5,
                    finding: 'Bio content clean, no flagged patterns',
                    details: 'No flagged words, links appear legitimate'
                }
            ],
            findings: [
                { type: 'good', text: 'Account appears in all search contexts' },
                { type: 'good', text: 'Profile is public and fully accessible' },
                { type: 'good', text: 'No flagged content in bio or pinned tweet' },
                { type: 'good', text: 'Links in profile pass reputation checks' },
                { type: 'info', text: 'Account not verified - may affect reach' }
            ],
            contentAnalysis: {
                bioFlags: [],
                postFlags: [],
                linkFlags: [],
                taggedUserFlags: []
            },
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
                { 
                    name: 'Platform APIs', 
                    icon: '🔌',
                    status: 'na', 
                    score: 0,
                    finding: 'Not applicable for hashtag checks',
                    details: 'API queries not used for hashtag analysis'
                },
                { 
                    name: 'Web Analysis', 
                    icon: '🔍',
                    status: 'complete', 
                    score: 20,
                    finding: 'Hashtag visibility varies by context',
                    details: 'Some hashtags hidden from non-logged-in users'
                },
                { 
                    name: 'Historical Data', 
                    icon: '📊',
                    status: 'complete', 
                    score: 10,
                    finding: 'Known restriction patterns detected',
                    details: 'Based on historical ban wave data'
                },
                { 
                    name: 'Hashtag Database', 
                    icon: '#️⃣',
                    status: 'complete', 
                    score: 25,
                    finding: '2 of 5 hashtags are restricted',
                    details: '#followforfollow and #f4f commonly suppressed'
                },
                { 
                    name: 'Content & Links', 
                    icon: '📝',
                    status: 'na', 
                    score: 0,
                    finding: 'Not applicable for hashtag checks',
                    details: 'Content analysis not used for hashtag-only checks'
                }
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
    
    // Instagram Demo Results
    instagram: {
        powerCheck: {
            platform: 'instagram',
            platformName: 'Instagram',
            platformIcon: '📸',
            probability: 35,
            checkType: 'power',
            factorsUsed: 5,
            factors: [
                { 
                    name: 'Platform APIs', 
                    icon: '🔌',
                    status: 'complete', 
                    score: 10,
                    finding: 'Account active, no action blocks',
                    details: 'No temporary restrictions detected'
                },
                { 
                    name: 'Web Analysis', 
                    icon: '🔍',
                    status: 'complete', 
                    score: 25,
                    finding: 'Post not appearing in hashtag feeds',
                    details: 'Content may be shadowbanned from hashtag discovery'
                },
                { 
                    name: 'Historical Data', 
                    icon: '📊',
                    status: 'complete', 
                    score: 0,
                    finding: 'No tracking history (Free tier)',
                    details: 'Upgrade to Pro for engagement tracking'
                },
                { 
                    name: 'Hashtag Database', 
                    icon: '#️⃣',
                    status: 'complete', 
                    score: 15,
                    finding: '1 banned hashtag detected',
                    details: '#adulting is currently banned on Instagram'
                },
                { 
                    name: 'Content & Links', 
                    icon: '📝',
                    status: 'complete', 
                    score: 10,
                    finding: 'Bio link flagged as affiliate',
                    details: 'Linktree detected - may affect organic reach'
                }
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
                { 
                    name: 'Platform APIs', 
                    icon: '🔌',
                    status: 'complete', 
                    score: 5,
                    finding: 'Account in good standing',
                    details: 'No restrictions or warnings on account'
                },
                { 
                    name: 'Web Analysis', 
                    icon: '🔍',
                    status: 'complete', 
                    score: 10,
                    finding: 'Profile visible in search',
                    details: 'Appears in username and hashtag search'
                },
                { 
                    name: 'Historical Data', 
                    icon: '📊',
                    status: 'complete', 
                    score: 0,
                    finding: 'No baseline data (Free tier)',
                    details: 'First analysis for this account'
                },
                { 
                    name: 'Hashtag Database', 
                    icon: '#️⃣',
                    status: 'complete', 
                    score: 0,
                    finding: 'Recent posts use safe hashtags',
                    details: 'No banned or restricted hashtags detected'
                },
                { 
                    name: 'Content & Links', 
                    icon: '📝',
                    status: 'complete', 
                    score: 3,
                    finding: 'Bio clean, links legitimate',
                    details: 'No flagged content patterns detected'
                }
            ],
            findings: [
                { type: 'good', text: 'Account appears in search results' },
                { type: 'good', text: 'Profile fully accessible' },
                { type: 'good', text: 'No banned hashtags in recent posts' },
                { type: 'good', text: 'Bio content passes all checks' },
                { type: 'info', text: 'Consider verification for more reach' }
            ],
            contentAnalysis: {
                bioFlags: [],
                postFlags: [],
                linkFlags: [],
                taggedUserFlags: []
            },
            recommendations: [
                'Your account looks healthy!',
                'Continue using diverse, relevant hashtags',
                'Maintain consistent posting schedule',
                'Engage authentically with your community'
            ]
        }
    },
    
    // Reddit Demo Results
    reddit: {
        powerCheck: {
            platform: 'reddit',
            platformName: 'Reddit',
            platformIcon: '🤖',
            probability: 42,
            checkType: 'power',
            factorsUsed: 4, // No hashtag check for Reddit
            factors: [
                { 
                    name: 'Platform APIs', 
                    icon: '🔌',
                    status: 'complete', 
                    score: 15,
                    finding: 'Account active, karma positive',
                    details: 'API shows normal account status'
                },
                { 
                    name: 'Web Analysis', 
                    icon: '🔍',
                    status: 'complete', 
                    score: 25,
                    finding: 'Post visibility limited in some subreddits',
                    details: 'Content visible but not appearing in r/all'
                },
                { 
                    name: 'Historical Data', 
                    icon: '📊',
                    status: 'complete', 
                    score: 5,
                    finding: 'Previous bans detected',
                    details: 'Account has 1 prior subreddit ban'
                },
                { 
                    name: 'Hashtag Database', 
                    icon: '#️⃣',
                    status: 'na', 
                    score: 0,
                    finding: 'Not applicable for Reddit',
                    details: 'Reddit does not use hashtags'
                },
                { 
                    name: 'Content & Links', 
                    icon: '📝',
                    status: 'complete', 
                    score: 12,
                    finding: 'Self-promotion ratio high',
                    details: 'Most posts link to same domain - may trigger spam filters'
                }
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
            subredditBans: [
                { subreddit: 'r/technology', reason: 'Self-promotion', date: '2024-08-15' }
            ],
            karma: {
                total: 1234,
                post: 456,
                comment: 778,
                age: '2 years'
            },
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
                { 
                    name: 'Platform APIs', 
                    icon: '🔌',
                    status: 'complete', 
                    score: 10,
                    finding: 'Account in good standing',
                    details: 'No site-wide restrictions'
                },
                { 
                    name: 'Web Analysis', 
                    icon: '🔍',
                    status: 'complete', 
                    score: 15,
                    finding: 'Profile visible in search',
                    details: 'Username searchable, posts indexed'
                },
                { 
                    name: 'Historical Data', 
                    icon: '📊',
                    status: 'complete', 
                    score: 0,
                    finding: 'No prior issues detected',
                    details: 'Clean account history'
                },
                { 
                    name: 'Hashtag Database', 
                    icon: '#️⃣',
                    status: 'na', 
                    score: 0,
                    finding: 'N/A for Reddit',
                    details: 'Reddit does not use hashtags'
                },
                { 
                    name: 'Content & Links', 
                    icon: '📝',
                    status: 'complete', 
                    score: 5,
                    finding: 'Content patterns normal',
                    details: 'No spam indicators in recent activity'
                }
            ],
            findings: [
                { type: 'good', text: 'Account is active and visible' },
                { type: 'good', text: 'Positive karma score' },
                { type: 'good', text: 'No subreddit bans detected' },
                { type: 'good', text: 'Content patterns appear normal' },
                { type: 'info', text: 'Account age helps credibility' }
            ],
            contentAnalysis: {
                bioFlags: [],
                postFlags: [],
                linkFlags: [],
                taggedUserFlags: []
            },
            karma: {
                total: 2500,
                post: 1200,
                comment: 1300,
                age: '3 years'
            },
            recommendations: [
                'Your Reddit account looks healthy',
                'Continue diverse participation across subreddits',
                'Maintain the 10% self-promotion rule',
                'Keep engaging authentically in comments'
            ]
        }
    },
    
    // TikTok Demo Results
    tiktok: {
        powerCheck: {
            platform: 'tiktok',
            platformName: 'TikTok',
            platformIcon: '🎵',
            probability: 52,
            checkType: 'power',
            factorsUsed: 5,
            factors: [
                { 
                    name: 'Platform APIs', 
                    icon: '🔌',
                    status: 'complete', 
                    score: 20,
                    finding: 'Video marked for limited distribution',
                    details: 'Content review flag detected'
                },
                { 
                    name: 'Web Analysis', 
                    icon: '🔍',
                    status: 'complete', 
                    score: 25,
                    finding: 'Video not appearing on For You page',
                    details: 'Limited to followers only currently'
                },
                { 
                    name: 'Historical Data', 
                    icon: '📊',
                    status: 'complete', 
                    score: 0,
                    finding: 'No baseline (Free tier)',
                    details: 'Upgrade to track view patterns'
                },
                { 
                    name: 'Hashtag Database', 
                    icon: '#️⃣',
                    status: 'complete', 
                    score: 10,
                    finding: 'Using borderline hashtag',
                    details: '#viral sometimes triggers review'
                },
                { 
                    name: 'Content & Links', 
                    icon: '📝',
                    status: 'complete', 
                    score: 15,
                    finding: 'Bio contains external link',
                    details: 'External links may limit distribution'
                }
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
                { 
                    name: 'Platform APIs', 
                    icon: '🔌',
                    status: 'complete', 
                    score: 5,
                    finding: 'Account in good standing',
                    details: 'No violations on record'
                },
                { 
                    name: 'Web Analysis', 
                    icon: '🔍',
                    status: 'complete', 
                    score: 10,
                    finding: 'Profile discoverable',
                    details: 'Appears in search results'
                },
                { 
                    name: 'Historical Data', 
                    icon: '📊',
                    status: 'complete', 
                    score: 0,
                    finding: 'No baseline data',
                    details: 'First analysis for this account'
                },
                { 
                    name: 'Hashtag Database', 
                    icon: '#️⃣',
                    status: 'complete', 
                    score: 5,
                    finding: 'Recent videos use safe hashtags',
                    details: 'No restricted hashtags detected'
                },
                { 
                    name: 'Content & Links', 
                    icon: '📝',
                    status: 'complete', 
                    score: 0,
                    finding: 'Bio clean, no red flags',
                    details: 'Content patterns appear normal'
                }
            ],
            findings: [
                { type: 'good', text: 'Account is active and visible' },
                { type: 'good', text: 'No community guidelines strikes' },
                { type: 'good', text: 'Recent content using safe hashtags' },
                { type: 'good', text: 'Bio passes content checks' },
                { type: 'info', text: 'Pro accounts get more analytics' }
            ],
            contentAnalysis: {
                bioFlags: [],
                postFlags: [],
                linkFlags: [],
                taggedUserFlags: []
            },
            recommendations: [
                'Your TikTok account appears healthy',
                'Continue creating original content',
                'Engage with your niche community',
                'Use trending sounds but avoid overused ones'
            ]
        }
    }
};

// ============================================
// PUBLIC API
// ============================================
window.DemoData = {
    /**
     * Get demo result for a platform and check type
     * @param {string} platformId - Platform identifier (twitter, instagram, etc.)
     * @param {string} checkType - Check type (powerCheck, accountCheck, hashtagCheck)
     * @returns {Object} Demo result data
     */
    getResult: function(platformId, checkType) {
        const platform = demoResults[platformId];
        if (!platform) {
            console.warn(`No demo data for platform: ${platformId}`);
            return this.getDefaultResult(platformId, checkType);
        }
        
        const result = platform[checkType];
        if (!result) {
            console.warn(`No demo data for ${platformId} ${checkType}`);
            return this.getDefaultResult(platformId, checkType);
        }
        
        // Add timestamp
        return {
            ...result,
            timestamp: new Date().toISOString()
        };
    },
    
    /**
     * Get default result when no specific demo exists
     */
    getDefaultResult: function(platformId, checkType) {
        const platform = window.getPlatformById ? window.getPlatformById(platformId) : null;
        const isReddit = platformId === 'reddit';
        const isHashtag = checkType === 'hashtagCheck' || checkType === 'hashtag';
        
        return {
            platform: platformId,
            platformName: platform ? platform.name : 'Platform',
            platformIcon: platform ? platform.icon : '🔍',
            probability: Math.floor(Math.random() * 30) + 15,
            checkType: checkType,
            factorsUsed: isHashtag ? 3 : (isReddit ? 4 : 5),
            factors: [
                { 
                    name: 'Platform APIs', 
                    icon: '🔌',
                    status: isHashtag ? 'na' : 'complete', 
                    score: 10,
                    finding: isHashtag ? 'N/A for hashtag checks' : 'Account queried successfully'
                },
                { 
                    name: 'Web Analysis', 
                    icon: '🔍',
                    status: 'complete', 
                    score: 15,
                    finding: 'Web visibility tests completed'
                },
                { 
                    name: 'Historical Data', 
                    icon: '📊',
                    status: 'complete', 
                    score: 0,
                    finding: 'No baseline data (Free tier)'
                },
                { 
                    name: 'Hashtag Database', 
                    icon: '#️⃣',
                    status: isReddit ? 'na' : 'complete', 
                    score: 5,
                    finding: isReddit ? 'N/A for Reddit' : 'Hashtags checked'
                },
                { 
                    name: 'Content & Links', 
                    icon: '📝',
                    status: isHashtag ? 'na' : 'complete', 
                    score: 5,
                    finding: isHashtag ? 'N/A for hashtag checks' : 'Bio and content analyzed'
                }
            ],
            findings: [
                { type: 'good', text: 'Analysis completed successfully' },
                { type: 'good', text: 'No major issues detected' },
                { type: 'info', text: 'Upgrade to Pro for detailed tracking' }
            ],
            contentAnalysis: {
                bioFlags: [],
                postFlags: [],
                linkFlags: [],
                taggedUserFlags: []
            },
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
        return Object.keys(demoResults);
    },
    
    /**
     * Check if demo data exists for a platform
     */
    hasDemo: function(platformId) {
        return !!demoResults[platformId];
    }
};

console.log('✅ DemoData loaded with platforms:', Object.keys(demoResults).join(', '));

})();
