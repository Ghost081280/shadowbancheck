/* =============================================================================
   DEMO-DATA.JS - CENTRALIZED MOCK DATA
   ShadowBanCheck.io
   
   All demo/mock data for testing UI flows before API integration.
   When ready to go live, swap this file's exports with real API calls.
   
   Last Updated: 2025
   ============================================================================= */

window.DemoData = {
    
    // =========================================================================
    // TWITTER/X DEMO RESULTS
    // =========================================================================
    twitter: {
        // Account check demo
        accountCheck: {
            platform: 'twitter',
            username: 'demo_user',
            displayName: 'Demo User',
            profileUrl: 'https://twitter.com/demo_user',
            timestamp: new Date().toISOString(),
            probability: 42,
            verdict: 'Likely Limited',
            verdictClass: 'warning',
            
            // 5 Factor Results
            factors: {
                api: {
                    status: 'warning',
                    score: 35,
                    finding: 'API indicates account exists but has limited visibility flags',
                    signals: [
                        { name: 'Account exists', status: 'good', value: true },
                        { name: 'Account suspended', status: 'good', value: false },
                        { name: 'Account protected', status: 'good', value: false },
                        { name: 'Has visibility warnings', status: 'warning', value: true },
                    ]
                },
                web: {
                    status: 'warning',
                    score: 45,
                    finding: 'Profile appears in some searches but not others',
                    signals: [
                        { name: 'Profile accessible logged out', status: 'good', value: true },
                        { name: 'Appears in search (logged out)', status: 'warning', value: 'partial' },
                        { name: 'Appears in search (logged in)', status: 'good', value: true },
                        { name: 'Appears in search (incognito)', status: 'warning', value: 'partial' },
                    ]
                },
                historical: {
                    status: 'neutral',
                    score: 20,
                    finding: 'No historical data available for free checks',
                    signals: [
                        { name: 'Historical tracking', status: 'neutral', value: 'Not available (Free tier)' },
                    ],
                    upgradeNote: 'Upgrade to Pro for historical tracking and trend analysis'
                },
                hashtag: {
                    status: 'warning',
                    score: 55,
                    finding: '1 restricted hashtag detected in recent posts',
                    signals: [
                        { name: 'Banned hashtags found', status: 'good', value: 0 },
                        { name: 'Restricted hashtags found', status: 'warning', value: 1 },
                        { name: 'Low-reach hashtags found', status: 'neutral', value: 3 },
                    ],
                    flaggedHashtags: [
                        { tag: '#crypto', risk: 'restricted', reason: 'High spam association' },
                    ]
                },
                ip: {
                    status: 'good',
                    score: 15,
                    finding: 'Residential IP detected, no VPN/proxy flags',
                    signals: [
                        { name: 'IP type', status: 'good', value: 'Residential' },
                        { name: 'VPN detected', status: 'good', value: false },
                        { name: 'Proxy detected', status: 'good', value: false },
                        { name: 'Datacenter IP', status: 'good', value: false },
                        { name: 'Country', status: 'neutral', value: 'US' },
                    ]
                }
            },
            
            // Engagement test results (if completed)
            engagementTest: {
                completed: true,
                stepsCompleted: 3,
                totalSteps: 4,
                results: {
                    follow: { completed: true, visible: true },
                    like: { completed: true, visible: true },
                    retweet: { completed: true, visible: false, note: 'Retweet not appearing on timeline' },
                    reply: { completed: false, visible: null },
                },
                finding: 'Retweets may be suppressed - not visible on our timeline'
            },
            
            // Platform-specific checks
            platformChecks: {
                searchSuggestionBan: { status: 'good', value: false, label: 'Search suggestion ban' },
                searchBan: { status: 'warning', value: 'partial', label: 'Search ban' },
                ghostBan: { status: 'good', value: false, label: 'Ghost ban' },
                replyDeboosting: { status: 'warning', value: true, label: 'Reply deboosting (QFD)' },
                sensitiveMedia: { status: 'good', value: false, label: 'Sensitive media flag' },
                verification: { status: 'neutral', value: 'none', label: 'Verification status' },
            },
            
            // Content scan
            contentScan: {
                flaggedTermsFound: 2,
                terms: [
                    { term: 'crypto', risk: 'medium', context: 'Financial topic - may reduce reach' },
                    { term: 'BREAKING', risk: 'low', context: 'Engagement bait pattern detected' },
                ]
            },
            
            // Key findings for summary
            keyFindings: [
                { status: 'good', text: 'Account accessible and not suspended' },
                { status: 'warning', text: 'Partial visibility in logged-out search' },
                { status: 'warning', text: 'Reply deboosting (QFD) detected' },
                { status: 'warning', text: 'Retweets may not be visible to all users' },
                { status: 'neutral', text: 'No verification badge (may affect reach)' },
            ],
            
            // Recommendations
            recommendations: [
                {
                    priority: 'high',
                    title: 'Address Reply Deboosting',
                    description: 'Your replies may be hidden behind "Show more replies". Avoid aggressive engagement patterns and reduce reply frequency for a few days.',
                },
                {
                    priority: 'medium',
                    title: 'Review Hashtag Usage',
                    description: 'The hashtag #crypto is restricted. Consider using alternatives like #blockchain or #web3.',
                },
                {
                    priority: 'low',
                    title: 'Consider Verification',
                    description: 'Verified accounts typically receive better visibility in search and recommendations.',
                },
            ]
        },
        
        // Power check demo (includes post analysis)
        powerCheck: {
            // Inherits from accountCheck, adds:
            postUrl: 'https://twitter.com/demo_user/status/1234567890',
            postId: '1234567890',
            postContent: 'Just launched my new crypto project! 🚀 Check it out! #crypto #web3 #BREAKING',
            postTimestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            
            postAnalysis: {
                visible: true,
                visibleInSearch: 'partial',
                engagementRate: 2.3,
                expectedEngagementRate: 4.1,
                engagementAnomaly: true,
                
                contentFlags: [
                    { type: 'hashtag', value: '#crypto', risk: 'medium' },
                    { type: 'pattern', value: 'ALL CAPS word', risk: 'low' },
                    { type: 'emoji', value: 'Rocket emoji', risk: 'low', note: 'Often associated with promotional content' },
                ],
                
                linkAnalysis: null, // No links in this post
            }
        }
    },
    
    // =========================================================================
    // REDDIT DEMO RESULTS
    // =========================================================================
    reddit: {
        accountCheck: {
            platform: 'reddit',
            username: 'demo_redditor',
            displayName: 'demo_redditor',
            profileUrl: 'https://reddit.com/user/demo_redditor',
            timestamp: new Date().toISOString(),
            probability: 28,
            verdict: 'Likely Visible',
            verdictClass: 'good',
            
            factors: {
                api: {
                    status: 'good',
                    score: 10,
                    finding: 'Account exists and is not shadowbanned via API check',
                    signals: [
                        { name: 'Account exists', status: 'good', value: true },
                        { name: 'Account suspended', status: 'good', value: false },
                        { name: 'Shadowban status', status: 'good', value: false },
                    ]
                },
                web: {
                    status: 'good',
                    score: 15,
                    finding: 'Profile and posts visible when logged out',
                    signals: [
                        { name: 'Profile visible logged out', status: 'good', value: true },
                        { name: 'Recent posts visible', status: 'good', value: true },
                        { name: 'Comments visible in threads', status: 'good', value: true },
                    ]
                },
                historical: {
                    status: 'neutral',
                    score: 20,
                    finding: 'No historical data available for free checks',
                    signals: [
                        { name: 'Historical tracking', status: 'neutral', value: 'Not available (Free tier)' },
                    ],
                    upgradeNote: 'Upgrade to Pro for karma trend tracking'
                },
                hashtag: null, // Reddit doesn't use hashtags
                ip: {
                    status: 'warning',
                    score: 35,
                    finding: 'VPN detected - some subreddits block VPN users',
                    signals: [
                        { name: 'IP type', status: 'warning', value: 'VPN' },
                        { name: 'VPN detected', status: 'warning', value: true },
                        { name: 'Known VPN provider', status: 'warning', value: 'NordVPN' },
                        { name: 'Country', status: 'neutral', value: 'US' },
                    ]
                }
            },
            
            // Reddit-specific: NO engagement test
            engagementTest: null,
            
            // Reddit-specific checks
            platformChecks: {
                shadowbanned: { status: 'good', value: false, label: 'Shadowbanned' },
                profileVisible: { status: 'good', value: true, label: 'Profile visible' },
                canPost: { status: 'good', value: true, label: 'Can post' },
                canComment: { status: 'good', value: true, label: 'Can comment' },
            },
            
            // Reddit-specific: Subreddit bans
            subredditBans: {
                found: 1,
                bans: [
                    { 
                        subreddit: 'r/cryptocurrency', 
                        reason: 'Low karma threshold', 
                        type: 'karma_restriction',
                        canAppeal: true 
                    },
                ]
            },
            
            // Reddit-specific: Karma analysis
            karmaAnalysis: {
                postKarma: 1250,
                commentKarma: 3420,
                totalKarma: 4670,
                accountAge: '2 years',
                karmaLevel: 'medium',
                restrictions: [
                    'Some subreddits require 5000+ karma to post',
                    'New posts may be auto-filtered in high-karma subreddits',
                ]
            },
            
            // NO content scan or hashtag section for Reddit account checks
            contentScan: null,
            
            keyFindings: [
                { status: 'good', text: 'Account is not shadowbanned' },
                { status: 'good', text: 'Profile and posts visible to others' },
                { status: 'warning', text: 'VPN detected - may affect some subreddits' },
                { status: 'warning', text: 'Banned from r/cryptocurrency (karma threshold)' },
                { status: 'neutral', text: 'Karma level: Medium (4,670)' },
            ],
            
            recommendations: [
                {
                    priority: 'medium',
                    title: 'VPN May Cause Issues',
                    description: 'Some subreddits block VPN users or require additional verification. Consider disabling VPN when posting to sensitive subreddits.',
                },
                {
                    priority: 'low',
                    title: 'Build Karma for Restricted Subreddits',
                    description: 'You\'re banned from r/cryptocurrency due to karma threshold. Participate in other subreddits to build karma.',
                },
            ]
        },
        
        powerCheck: {
            // Inherits from accountCheck, adds post analysis
            postUrl: 'https://reddit.com/r/technology/comments/abc123/my_post_title',
            postId: 'abc123',
            subreddit: 'r/technology',
            postTitle: 'Interesting tech discussion',
            postTimestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            
            postAnalysis: {
                visible: true,
                visibleInSubreddit: true,
                removedByAutomod: false,
                removedByMod: false,
                
                subredditRules: {
                    checked: true,
                    violations: [],
                },
                
                contentFlags: [], // No issues found
            }
        }
    },
    
    // =========================================================================
    // HASHTAG CHECK DEMO RESULTS
    // =========================================================================
    hashtagCheck: {
        twitter: {
            platform: 'twitter',
            timestamp: new Date().toISOString(),
            hashtagsChecked: 5,
            overallRisk: 'medium',
            probability: 38,
            
            results: [
                { 
                    hashtag: '#crypto', 
                    status: 'restricted',
                    risk: 'medium',
                    reason: 'High spam association, may reduce reach',
                    alternative: '#blockchain',
                },
                { 
                    hashtag: '#viral', 
                    status: 'caution',
                    risk: 'low',
                    reason: 'Overused hashtag, low discovery value',
                    alternative: null,
                },
                { 
                    hashtag: '#technology', 
                    status: 'safe',
                    risk: 'none',
                    reason: null,
                    alternative: null,
                },
                { 
                    hashtag: '#innovation', 
                    status: 'safe',
                    risk: 'none',
                    reason: null,
                    alternative: null,
                },
                { 
                    hashtag: '#adult', 
                    status: 'banned',
                    risk: 'high',
                    reason: 'Banned hashtag - will severely limit post visibility',
                    alternative: null,
                },
            ],
            
            summary: {
                safe: 2,
                caution: 1,
                restricted: 1,
                banned: 1,
            },
            
            recommendations: [
                'Remove #adult - this hashtag is banned and will severely limit your post',
                'Consider replacing #crypto with #blockchain for better reach',
                '#viral is overused - consider more specific hashtags for your niche',
            ]
        }
    },
    
    // =========================================================================
    // IP DETECTION DEMO DATA
    // =========================================================================
    ipData: {
        residential: {
            ip: '192.168.1.42',
            type: 'Residential',
            typeClass: 'good',
            vpn: false,
            proxy: false,
            datacenter: false,
            country: 'US',
            countryFlag: '🇺🇸',
            city: 'New York',
            isp: 'Verizon Fios',
            risk: 'low',
        },
        vpn: {
            ip: '45.76.123.45',
            type: 'VPN',
            typeClass: 'warning',
            vpn: true,
            proxy: false,
            datacenter: true,
            country: 'US',
            countryFlag: '🇺🇸',
            city: 'Los Angeles',
            isp: 'NordVPN',
            risk: 'medium',
            warning: 'VPN detected - some platforms may limit visibility',
        },
        datacenter: {
            ip: '104.21.56.78',
            type: 'Datacenter',
            typeClass: 'danger',
            vpn: false,
            proxy: true,
            datacenter: true,
            country: 'DE',
            countryFlag: '🇩🇪',
            city: 'Frankfurt',
            isp: 'AWS',
            risk: 'high',
            warning: 'Datacenter IP detected - platforms may flag this as suspicious',
        }
    },
    
    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    /**
     * Get demo result for a platform and check type
     * @param {string} platform - Platform ID
     * @param {string} checkType - 'accountCheck', 'powerCheck', 'hashtagCheck'
     * @returns {object} Demo data object
     */
    getResult: function(platform, checkType) {
        if (platform === 'twitter' || platform === 'reddit') {
            const platformData = this[platform];
            if (platformData && platformData[checkType]) {
                // Return a copy to avoid mutations
                return JSON.parse(JSON.stringify(platformData[checkType]));
            }
        }
        if (checkType === 'hashtagCheck' && this.hashtagCheck[platform]) {
            return JSON.parse(JSON.stringify(this.hashtagCheck[platform]));
        }
        return null;
    },
    
    /**
     * Get demo IP data
     * @param {string} type - 'residential', 'vpn', 'datacenter'
     * @returns {object} IP data object
     */
    getIpData: function(type = 'residential') {
        return JSON.parse(JSON.stringify(this.ipData[type] || this.ipData.residential));
    },
    
    /**
     * Simulate API delay
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    simulateDelay: function(ms = 1500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    /**
     * Get random probability for testing variations
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random probability
     */
    getRandomProbability: function(min = 10, max = 80) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Get verdict based on probability
     * @param {number} probability - Probability score 0-100
     * @returns {object} Verdict object with text and class
     */
    getVerdict: function(probability) {
        if (probability <= 20) {
            return { text: 'Likely Visible', class: 'good' };
        } else if (probability <= 40) {
            return { text: 'Mostly Visible', class: 'good' };
        } else if (probability <= 60) {
            return { text: 'Likely Limited', class: 'warning' };
        } else if (probability <= 80) {
            return { text: 'Probably Restricted', class: 'danger' };
        } else {
            return { text: 'High Restriction Risk', class: 'danger' };
        }
    }
};

// Log demo data loaded
console.log('✅ Demo data loaded - ready for testing');
