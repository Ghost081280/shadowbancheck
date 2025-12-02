/* =============================================================================
   DEMO-DATA.JS - Demo Result Data for Testing
   ShadowBanCheck.io
   
   ARCHITECTURE:
   - 5 Specialized Detection Agents (API, Web, Historical, Detection, Predictive)
   - 6 Signal Types (Hashtags, Cashtags, Links, Content, Mentions, Emojis)
   - 3-Point Intelligence Model per Signal: Predictive (15%) + Real-Time (55%) + Historical (30%)
   
   This file produces demo data that EXACTLY matches what the live engine should output.
   Use this as the spec for engine development.
   
   Last Updated: 2025-12-02
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// HELPER: Calculate 3-Point Intelligence Score
// =============================================================================
function calculate3PointScore(predictiveScore, realtimeScore, historicalScore) {
    const predictive = { weight: 15, score: predictiveScore, contribution: (predictiveScore * 15) / 100 };
    const realtime = { weight: 55, score: realtimeScore, contribution: (realtimeScore * 55) / 100 };
    const historical = { weight: 30, score: historicalScore, contribution: (historicalScore * 30) / 100 };
    
    return {
        predictive,
        realtime,
        historical,
        combinedScore: Math.round((predictive.contribution + realtime.contribution + historical.contribution) * 100) / 100
    };
}

// =============================================================================
// HELPER: Calculate Confidence Level
// =============================================================================
function getConfidenceLevel(score, activeSourceCount) {
    const agreementBonus = activeSourceCount >= 3 ? 15 : activeSourceCount >= 2 ? 5 : 0;
    const adjustedScore = Math.min(100, score + agreementBonus);
    
    let level, description;
    if (adjustedScore >= 70) {
        level = 'high';
        description = '3+ sources corroborate';
    } else if (adjustedScore >= 40) {
        level = 'medium';
        description = '2 sources corroborate';
    } else {
        level = 'low';
        description = 'Single source';
    }
    
    return { level, score: adjustedScore, sources: activeSourceCount, description };
}

// =============================================================================
// PLATFORM MODULE COUNTS (From Master Prompt)
// =============================================================================
const PLATFORM_MODULES = {
    twitter: { total: 21, hashtags: 4, cashtags: 3, links: 4, content: 4, mentions: 3, emojis: 3 },
    instagram: { total: 18, hashtags: 4, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    tiktok: { total: 21, hashtags: 4, cashtags: 3, links: 4, content: 4, mentions: 3, emojis: 3 },
    reddit: { total: 14, hashtags: 0, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    facebook: { total: 18, hashtags: 4, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    youtube: { total: 14, hashtags: 0, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    linkedin: { total: 17, hashtags: 3, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 }
};

// =============================================================================
// DEMO SCENARIOS
// =============================================================================

const DemoScenarios = {
    
    // =========================================================================
    // SCENARIO 1: Twitter - Search Suggestion Ban + Banned Hashtag
    // A user with moderate issues - good for showing the system works
    // =========================================================================
    twitter_moderate_issues: {
        
        meta: {
            scenarioId: 'twitter_moderate_issues',
            description: 'Twitter user with search suggestion ban and banned hashtag',
            platform: 'twitter',
            expectedProbability: 45,
            expectedConfidence: 'high'
        },
        
        // What the full powerCheck should return
        powerCheck: function() {
            const timestamp = new Date().toISOString();
            const platformModules = PLATFORM_MODULES.twitter;
            
            return {
                checkType: 'powerCheck',
                platform: 'twitter',
                inputUrl: 'https://x.com/demo_user_1/status/1234567890123456789',
                normalizedUrl: 'https://x.com/demo_user_1/status/1234567890123456789',
                timestamp: timestamp,
                processingTime: 2847,
                demo: true,
                
                // =============================================================
                // POST ANALYSIS
                // =============================================================
                post: {
                    id: '1234567890123456789',
                    exists: true,
                    tombstoned: false,
                    ageRestricted: false,
                    
                    visibility: {
                        directLink: true,
                        onProfile: true,
                        inSearch: false,          // Not appearing in search!
                        inHashtagFeeds: false,    // Hashtag not indexing
                        inCashtagFeeds: true,
                        inRecommendations: false,
                        inReplies: true
                    },
                    
                    metrics: {
                        views: 1250,
                        likes: 23,
                        retweets: 5,
                        replies: 8,
                        quotes: 2
                    },
                    
                    content: {
                        text: 'Check out my new project! #followback #crypto #tech',
                        hashtags: ['#followback', '#crypto', '#tech'],
                        cashtags: [],
                        mentions: [],
                        urls: ['https://bit.ly/myproject']
                    },
                    
                    reachScore: 55,
                    probability: 45,
                    verdict: 'LIKELY RESTRICTED'
                },
                
                // =============================================================
                // ACCOUNT ANALYSIS
                // =============================================================
                account: {
                    username: 'demo_user_1',
                    displayName: 'Demo User',
                    exists: true,
                    suspended: false,
                    protected: false,
                    verifiedType: 'none',
                    accountLabels: [],
                    accountAge: 1245, // days
                    
                    metrics: {
                        followers: 12500,
                        following: 890,
                        tweets: 3420,
                        listed: 45
                    },
                    
                    visibility: {
                        searchable: true,
                        inSuggestions: false,     // Search suggestion ban!
                        repliesVisible: true,
                        suggestable: false
                    },
                    
                    shadowbanChecks: {
                        searchBan: false,
                        searchSuggestionBan: true,  // DETECTED
                        ghostBan: false,
                        replyDeboosting: false,
                        suggestBan: true
                    },
                    
                    reachScore: 60,
                    probability: 40,
                    verdict: 'LIKELY RESTRICTED'
                },
                
                // =============================================================
                // 5 SPECIALIZED DETECTION AGENTS
                // =============================================================
                agents: [
                    // ---------------------------------------------------------
                    // AGENT 1: API Agent (20%)
                    // ---------------------------------------------------------
                    {
                        agent: 'API Agent',
                        agentId: 'api',
                        factor: 1,
                        weight: 20,
                        status: 'complete',
                        
                        checks: {
                            accountExists: true,
                            accountSuspended: false,
                            accountProtected: false,
                            accountVerified: 'none',
                            accountAge: 1245,
                            
                            publicMetrics: {
                                followers: 12500,
                                following: 890,
                                tweetCount: 3420,
                                listedCount: 45
                            },
                            
                            ownedMetrics: {
                                available: false,
                                impressions: null,
                                profileClicks: null,
                                urlClicks: null,
                                note: 'Requires OAuth user context'
                            },
                            
                            contentFlags: {
                                possiblySensitive: false,
                                withheld: null
                            },
                            
                            rateLimitStatus: {
                                remaining: 145,
                                limit: 150,
                                reset: Date.now() + 900000
                            }
                        },
                        
                        findings: [
                            { type: 'good', severity: 'none', message: 'Account exists and is active', impact: 0 },
                            { type: 'info', severity: 'low', message: 'Account not verified — may limit reach', impact: 5 },
                            { type: 'good', severity: 'none', message: 'No content flags on recent posts', impact: 0 }
                        ],
                        
                        rawScore: 15,
                        weightedScore: 3,
                        confidence: 85
                    },
                    
                    // ---------------------------------------------------------
                    // AGENT 2: Web Analysis Agent (20%)
                    // ---------------------------------------------------------
                    {
                        agent: 'Web Analysis Agent',
                        agentId: 'web',
                        factor: 2,
                        weight: 20,
                        status: 'complete',
                        
                        checks: {
                            searchVisibility: {
                                loggedIn: true,
                                loggedOut: true,
                                incognito: false,       // Not appearing!
                                inPeopleSearch: true
                            },
                            
                            searchSuggestion: {
                                appearsInSuggestions: false,  // SEARCH SUGGESTION BAN
                                forFollowers: true,
                                forNonFollowers: false
                            },
                            
                            profileAccessibility: {
                                directAccess: true,
                                inSearchResults: true,
                                inRecommendations: false
                            },
                            
                            replyVisibility: {
                                repliesVisible: true,
                                replyDeboosting: false,
                                hiddenBehindShowMore: false
                            },
                            
                            hashtagIndexing: {
                                tested: true,
                                indexed: false,           // Post not in hashtag search
                                timeToIndex: null
                            },
                            
                            domainThrottling: {
                                tested: true,
                                throttledDomainsDetected: [],
                                averageDelay: 39  // Normal
                            }
                        },
                        
                        findings: [
                            { type: 'warning', severity: 'medium', message: 'Not appearing in incognito search', impact: 15 },
                            { type: 'danger', severity: 'high', message: 'Search suggestion ban detected', impact: 25 },
                            { type: 'warning', severity: 'medium', message: 'Post not appearing in hashtag feeds', impact: 15 },
                            { type: 'good', severity: 'none', message: 'No domain throttling detected', impact: 0 }
                        ],
                        
                        rawScore: 55,
                        weightedScore: 11,
                        confidence: 80
                    },
                    
                    // ---------------------------------------------------------
                    // AGENT 3: Historical Agent (15%)
                    // ---------------------------------------------------------
                    {
                        agent: 'Historical Agent',
                        agentId: 'historical',
                        factor: 3,
                        weight: 15,
                        status: 'complete',
                        
                        checks: {
                            hasHistory: true,
                            previousScans: 3,
                            firstScan: '2024-11-15T10:30:00Z',
                            
                            trend: {
                                direction: 'worsening',
                                previousScore: 28,
                                currentScore: 45,
                                delta: 17
                            },
                            
                            engagementBaseline: {
                                expectedEngagement: 3.5,
                                actualEngagement: 1.8,
                                ratio: 0.51,
                                deviation: '-49%'
                            },
                            
                            anomalies: [
                                {
                                    date: '2024-11-28',
                                    type: 'sudden_drop',
                                    metric: 'impressions',
                                    severity: 'medium',
                                    magnitude: '-45%'
                                }
                            ],
                            
                            signalHistory: {
                                hashtags: { previousFlags: 1, lastFlagged: '2024-11-20', trend: 'recurring' },
                                links: { previousFlags: 0, lastFlagged: null, trend: 'stable' }
                            }
                        },
                        
                        findings: [
                            { type: 'warning', severity: 'medium', message: 'Score worsening: +17 points since last scan', impact: 15 },
                            { type: 'warning', severity: 'medium', message: 'Engagement 49% below baseline', impact: 10 },
                            { type: 'info', severity: 'low', message: 'Previous hashtag flag detected', impact: 5 }
                        ],
                        
                        rawScore: 30,
                        weightedScore: 4.5,
                        confidence: 75
                    },
                    
                    // ---------------------------------------------------------
                    // AGENT 4: Detection Agent (25%) - The Big One!
                    // This is where 3-Point Intelligence happens per signal
                    // ---------------------------------------------------------
                    {
                        agent: 'Detection Agent',
                        agentId: 'detection',
                        factor: 4,
                        weight: 25,
                        status: 'complete',
                        modulesActive: platformModules.total,
                        
                        // 6 SIGNAL TYPES WITH 3-POINT INTELLIGENCE
                        signals: {
                            
                            // SIGNAL 1: HASHTAGS (4 modules)
                            hashtags: {
                                signalType: 'hashtags',
                                moduleCount: platformModules.hashtags,
                                enabled: true,
                                
                                threePoint: {
                                    predictive: {
                                        weight: 15,
                                        score: 60,
                                        contribution: 9,
                                        sources: [
                                            'Reddit reports: #followback causing restrictions (r/Twitter, 47 upvotes)',
                                            'Community: 12 reports of hashtag shadowbans this week'
                                        ]
                                    },
                                    realtime: {
                                        weight: 55,
                                        score: 85,
                                        contribution: 46.75,
                                        sources: [
                                            'API: entities.hashtags parsed - 3 hashtags found',
                                            'Web Test: #followback not indexing in search',
                                            'Web Test: Post not appearing in hashtag feeds'
                                        ]
                                    },
                                    historical: {
                                        weight: 30,
                                        score: 70,
                                        contribution: 21,
                                        sources: [
                                            'Database: #followback flagged since 2019',
                                            'User history: 1 previous post with banned hashtags'
                                        ]
                                    }
                                },
                                
                                combinedScore: 76.75,
                                
                                checked: ['#followback', '#crypto', '#tech'],
                                flagged: {
                                    banned: [{ tag: '#followback', reason: 'Follow-for-follow schemes', since: '2019-03-15' }],
                                    restricted: [],
                                    monitored: []
                                },
                                safe: ['#crypto', '#tech'],
                                
                                confidence: getConfidenceLevel(76.75, 3),
                                lastVerified: timestamp
                            },
                            
                            // SIGNAL 2: CASHTAGS (3 modules)
                            cashtags: {
                                signalType: 'cashtags',
                                moduleCount: platformModules.cashtags,
                                enabled: true,
                                
                                threePoint: {
                                    predictive: {
                                        weight: 15,
                                        score: 0,
                                        contribution: 0,
                                        sources: []
                                    },
                                    realtime: {
                                        weight: 55,
                                        score: 0,
                                        contribution: 0,
                                        sources: ['API: No cashtags found in content']
                                    },
                                    historical: {
                                        weight: 30,
                                        score: 0,
                                        contribution: 0,
                                        sources: ['No cashtag history for this user']
                                    }
                                },
                                
                                combinedScore: 0,
                                
                                checked: [],
                                flagged: { banned: [], restricted: [], monitored: [] },
                                safe: [],
                                
                                confidence: getConfidenceLevel(0, 1),
                                lastVerified: timestamp
                            },
                            
                            // SIGNAL 3: LINKS (4 modules)
                            links: {
                                signalType: 'links',
                                moduleCount: platformModules.links,
                                enabled: true,
                                
                                threePoint: {
                                    predictive: {
                                        weight: 15,
                                        score: 40,
                                        contribution: 6,
                                        sources: [
                                            'Industry reports: Link shorteners reduce reach by ~15%'
                                        ]
                                    },
                                    realtime: {
                                        weight: 55,
                                        score: 35,
                                        contribution: 19.25,
                                        sources: [
                                            'Link check: bit.ly shortener detected',
                                            'Timing test: Normal redirect speed (39ms)'
                                        ]
                                    },
                                    historical: {
                                        weight: 30,
                                        score: 20,
                                        contribution: 6,
                                        sources: [
                                            'Database: bit.ly flagged as suspicious pattern',
                                            'No previous link violations for this user'
                                        ]
                                    }
                                },
                                
                                combinedScore: 31.25,
                                
                                checked: ['https://bit.ly/myproject'],
                                flagged: {
                                    shorteners: [{ url: 'bit.ly', reason: 'Link shortener may reduce reach' }],
                                    throttled: [],
                                    blocked: []
                                },
                                safe: [],
                                
                                confidence: getConfidenceLevel(31.25, 3),
                                lastVerified: timestamp
                            },
                            
                            // SIGNAL 4: CONTENT (4 modules)
                            content: {
                                signalType: 'content',
                                moduleCount: platformModules.content,
                                enabled: true,
                                
                                threePoint: {
                                    predictive: {
                                        weight: 15,
                                        score: 10,
                                        contribution: 1.5,
                                        sources: [
                                            'Pattern analysis: "Check out my" phrase common but not flagged'
                                        ]
                                    },
                                    realtime: {
                                        weight: 55,
                                        score: 5,
                                        contribution: 2.75,
                                        sources: [
                                            'Content scan: No banned phrases detected',
                                            'Sentiment: Neutral/positive',
                                            'Caps ratio: 7% (normal)'
                                        ]
                                    },
                                    historical: {
                                        weight: 30,
                                        score: 0,
                                        contribution: 0,
                                        sources: [
                                            'No content violations in user history'
                                        ]
                                    }
                                },
                                
                                combinedScore: 4.25,
                                
                                checked: ['Check out my new project! #followback #crypto #tech'],
                                flagged: {
                                    banned: [],
                                    restricted: [],
                                    patterns: []
                                },
                                
                                confidence: getConfidenceLevel(4.25, 3),
                                lastVerified: timestamp
                            },
                            
                            // SIGNAL 5: MENTIONS (3 modules)
                            mentions: {
                                signalType: 'mentions',
                                moduleCount: platformModules.mentions,
                                enabled: true,
                                
                                threePoint: {
                                    predictive: {
                                        weight: 15,
                                        score: 0,
                                        contribution: 0,
                                        sources: []
                                    },
                                    realtime: {
                                        weight: 55,
                                        score: 0,
                                        contribution: 0,
                                        sources: ['No mentions in content']
                                    },
                                    historical: {
                                        weight: 30,
                                        score: 0,
                                        contribution: 0,
                                        sources: []
                                    }
                                },
                                
                                combinedScore: 0,
                                
                                checked: [],
                                flagged: { suspended: [], shadowbanned: [], bots: [] },
                                safe: [],
                                
                                confidence: getConfidenceLevel(0, 1),
                                lastVerified: timestamp
                            },
                            
                            // SIGNAL 6: EMOJIS (3 modules)
                            emojis: {
                                signalType: 'emojis',
                                moduleCount: platformModules.emojis,
                                enabled: true,
                                
                                threePoint: {
                                    predictive: {
                                        weight: 15,
                                        score: 0,
                                        contribution: 0,
                                        sources: []
                                    },
                                    realtime: {
                                        weight: 55,
                                        score: 0,
                                        contribution: 0,
                                        sources: ['No emojis in content']
                                    },
                                    historical: {
                                        weight: 30,
                                        score: 0,
                                        contribution: 0,
                                        sources: []
                                    }
                                },
                                
                                combinedScore: 0,
                                
                                checked: [],
                                flagged: { risky: [], combinations: [] },
                                safe: [],
                                
                                confidence: getConfidenceLevel(0, 1),
                                lastVerified: timestamp
                            }
                        },
                        
                        // Aggregate detection score
                        signalSummary: {
                            totalSignals: 6,
                            activeSignals: 6,
                            flaggedSignals: 2,  // hashtags, links
                            scores: {
                                hashtags: 76.75,
                                cashtags: 0,
                                links: 31.25,
                                content: 4.25,
                                mentions: 0,
                                emojis: 0
                            },
                            // Average of non-zero active signals
                            averageScore: 28.06
                        },
                        
                        findings: [
                            { type: 'danger', severity: 'high', message: 'Banned hashtag #followback detected', impact: 30 },
                            { type: 'warning', severity: 'medium', message: 'Link shortener bit.ly may reduce reach', impact: 10 },
                            { type: 'good', severity: 'none', message: 'Content passes all checks', impact: 0 },
                            { type: 'good', severity: 'none', message: 'No risky mentions or emojis', impact: 0 }
                        ],
                        
                        rawScore: 50,
                        weightedScore: 12.5,
                        confidence: 85
                    },
                    
                    // ---------------------------------------------------------
                    // AGENT 5: Predictive AI Agent (20%)
                    // ---------------------------------------------------------
                    {
                        agent: 'Predictive AI Agent',
                        agentId: 'predictive',
                        factor: 5,
                        weight: 20,
                        status: 'complete',
                        
                        synthesis: {
                            inputScores: {
                                apiAgent: 15,
                                webAgent: 55,
                                historicalAgent: 30,
                                detectionAgent: 50
                            },
                            
                            signalBreakdown: {
                                hashtags: 76.75,
                                cashtags: 0,
                                links: 31.25,
                                content: 4.25,
                                mentions: 0,
                                emojis: 0
                            },
                            
                            weightedCalculation: {
                                api: { score: 15, weight: 20, contribution: 3 },
                                web: { score: 55, weight: 20, contribution: 11 },
                                historical: { score: 30, weight: 15, contribution: 4.5 },
                                detection: { score: 50, weight: 25, contribution: 12.5 },
                                predictive: { score: 45, weight: 20, contribution: 9 }
                            },
                            
                            totalContribution: 40,
                            probabilityRaw: 45,
                            probabilityAdjusted: 45
                        },
                        
                        riskFactors: [
                            { factor: 'Search suggestion ban', severity: 'high', source: 'Web Analysis Agent', impact: 25 },
                            { factor: 'Banned hashtag #followback', severity: 'high', source: 'Detection Agent', impact: 30 },
                            { factor: 'Link shortener usage', severity: 'low', source: 'Detection Agent', impact: 10 },
                            { factor: 'Engagement 49% below baseline', severity: 'medium', source: 'Historical Agent', impact: 10 }
                        ],
                        
                        predictions: {
                            shortTerm: 'Visibility likely suppressed for 24-72 hours if no changes made',
                            mediumTerm: 'Recovery possible within 1 week after removing flagged content',
                            longTerm: 'Account health can fully recover with consistent good behavior'
                        },
                        
                        findings: [
                            { type: 'danger', severity: 'high', message: '3 risk factors detected with high confidence', impact: 20 },
                            { type: 'warning', severity: 'medium', message: 'Pattern suggests algorithmic suppression', impact: 15 },
                            { type: 'info', severity: 'low', message: 'Recovery achievable with recommended actions', impact: 0 }
                        ],
                        
                        rawScore: 45,
                        weightedScore: 9,
                        confidence: 78
                    }
                ],
                
                // =============================================================
                // FINAL SYNTHESIS
                // =============================================================
                synthesis: {
                    probability: 45,
                    reachScore: 55,
                    
                    confidence: {
                        level: 'high',
                        score: 78,
                        sources: 4,
                        description: '4 agents corroborate findings'
                    },
                    
                    verdict: 'LIKELY RESTRICTED',
                    verdictDescription: 'Multiple suppression indicators detected with high confidence',
                    
                    primaryIssues: [
                        'Search suggestion ban detected',
                        'Banned hashtag #followback in use',
                        'Post not appearing in hashtag feeds'
                    ],
                    
                    agentAgreement: {
                        api: 'low_risk',
                        web: 'high_risk',
                        historical: 'medium_risk',
                        detection: 'high_risk',
                        predictive: 'medium_risk'
                    }
                },
                
                // =============================================================
                // RECOMMENDATIONS
                // =============================================================
                recommendations: [
                    {
                        priority: 'critical',
                        action: 'Remove #followback from this post and all future posts',
                        impact: 'Could improve score by 25+ points',
                        effort: 'Easy - edit post now'
                    },
                    {
                        priority: 'high',
                        action: 'Replace bit.ly link with full URL',
                        impact: 'Removes shortener penalty, improves trust signals',
                        effort: 'Easy - edit post'
                    },
                    {
                        priority: 'medium',
                        action: 'Avoid engagement-bait hashtags for 2 weeks',
                        impact: 'Helps reset algorithmic trust',
                        effort: 'Moderate - requires discipline'
                    },
                    {
                        priority: 'low',
                        action: 'Consider Twitter Blue for verification',
                        impact: 'May improve visibility in recommendations',
                        effort: 'Low - subscription'
                    },
                    {
                        priority: 'info',
                        action: 'Upgrade to Pro for historical tracking',
                        impact: 'Monitor your score over time',
                        effort: 'Subscription'
                    }
                ]
            };
        },
        
        // What accountCheck should return
        accountCheck: function() {
            const timestamp = new Date().toISOString();
            
            return {
                checkType: 'accountCheck',
                platform: 'twitter',
                username: 'demo_user_1',
                timestamp: timestamp,
                processingTime: 1923,
                demo: true,
                
                account: {
                    username: 'demo_user_1',
                    displayName: 'Demo User',
                    exists: true,
                    suspended: false,
                    protected: false,
                    verifiedType: 'none',
                    accountLabels: [],
                    accountAge: 1245,
                    
                    metrics: {
                        followers: 12500,
                        following: 890,
                        tweets: 3420,
                        listed: 45
                    },
                    
                    shadowbanChecks: {
                        searchBan: false,
                        searchSuggestionBan: true,
                        ghostBan: false,
                        replyDeboosting: false,
                        suggestBan: true
                    },
                    
                    probability: 40,
                    verdict: 'LIKELY RESTRICTED'
                },
                
                agents: [
                    { agent: 'API Agent', factor: 1, weight: 20, rawScore: 10, weightedScore: 2, confidence: 90, status: 'complete' },
                    { agent: 'Web Analysis Agent', factor: 2, weight: 20, rawScore: 45, weightedScore: 9, confidence: 80, status: 'complete' },
                    { agent: 'Historical Agent', factor: 3, weight: 15, rawScore: 25, weightedScore: 3.75, confidence: 70, status: 'complete' },
                    { agent: 'Detection Agent', factor: 4, weight: 25, rawScore: 15, weightedScore: 3.75, confidence: 85, status: 'complete', modulesActive: 21 },
                    { agent: 'Predictive AI Agent', factor: 5, weight: 20, rawScore: 40, weightedScore: 8, confidence: 75, status: 'complete' }
                ],
                
                synthesis: {
                    probability: 40,
                    confidence: { level: 'high', score: 78, sources: 4 },
                    verdict: 'LIKELY RESTRICTED'
                },
                
                recommendations: [
                    { priority: 'high', action: 'Avoid engagement-bait content to lift suggestion ban' },
                    { priority: 'medium', action: 'Post quality content consistently for 1-2 weeks' },
                    { priority: 'info', action: 'Search suggestion bans typically lift within 7-14 days' }
                ]
            };
        },
        
        // What tagCheck should return
        tagCheck: function() {
            const timestamp = new Date().toISOString();
            
            return {
                checkType: 'tagCheck',
                platform: 'twitter',
                timestamp: timestamp,
                processingTime: 342,
                demo: true,
                
                input: {
                    tags: ['#followback', '#crypto', '#tech', '$BTC'],
                    count: 4
                },
                
                results: {
                    banned: [
                        { 
                            tag: '#followback', 
                            type: 'hashtag', 
                            status: 'banned',
                            category: 'engagement_manipulation',
                            reason: 'Follow-for-follow schemes violate platform guidelines',
                            since: '2019-03-15',
                            threePoint: calculate3PointScore(70, 95, 90)
                        }
                    ],
                    restricted: [],
                    monitored: [
                        {
                            tag: '$BTC',
                            type: 'cashtag',
                            status: 'monitored',
                            category: 'crypto',
                            reason: 'High-volume cashtag, monitored for spam',
                            threePoint: calculate3PointScore(30, 20, 40)
                        }
                    ],
                    safe: [
                        { tag: '#crypto', type: 'hashtag', status: 'safe' },
                        { tag: '#tech', type: 'hashtag', status: 'safe' }
                    ]
                },
                
                summary: {
                    total: 4,
                    banned: 1,
                    restricted: 0,
                    monitored: 1,
                    safe: 2,
                    riskScore: 45
                },
                
                confidence: { level: 'high', score: 85, sources: 3 },
                verdict: 'CAUTION - 1 banned tag found',
                
                recommendations: [
                    { priority: 'critical', action: 'Remove #followback - it will suppress your post' },
                    { priority: 'info', action: '#crypto and #tech are safe to use' },
                    { priority: 'info', action: '$BTC is monitored but generally safe' }
                ]
            };
        }
    },
    
    // =========================================================================
    // SCENARIO 2: Twitter - Clean Account (Control)
    // Healthy account with no issues
    // =========================================================================
    twitter_clean: {
        
        meta: {
            scenarioId: 'twitter_clean',
            description: 'Healthy Twitter account with no issues',
            platform: 'twitter',
            expectedProbability: 8,
            expectedConfidence: 'high'
        },
        
        powerCheck: function() {
            const timestamp = new Date().toISOString();
            const platformModules = PLATFORM_MODULES.twitter;
            
            return {
                checkType: 'powerCheck',
                platform: 'twitter',
                inputUrl: 'https://x.com/clean_account/status/9876543210987654321',
                normalizedUrl: 'https://x.com/clean_account/status/9876543210987654321',
                timestamp: timestamp,
                processingTime: 2156,
                demo: true,
                
                post: {
                    id: '9876543210987654321',
                    exists: true,
                    tombstoned: false,
                    ageRestricted: false,
                    
                    visibility: {
                        directLink: true,
                        onProfile: true,
                        inSearch: true,
                        inHashtagFeeds: true,
                        inCashtagFeeds: true,
                        inRecommendations: true,
                        inReplies: true
                    },
                    
                    metrics: {
                        views: 8500,
                        likes: 245,
                        retweets: 42,
                        replies: 28,
                        quotes: 8
                    },
                    
                    content: {
                        text: 'Just launched our new feature! Really excited about this one. #startup #tech #building',
                        hashtags: ['#startup', '#tech', '#building'],
                        cashtags: [],
                        mentions: [],
                        urls: []
                    },
                    
                    reachScore: 92,
                    probability: 8,
                    verdict: 'CLEAR'
                },
                
                account: {
                    username: 'clean_account',
                    displayName: 'Clean Account',
                    exists: true,
                    suspended: false,
                    protected: false,
                    verifiedType: 'blue',
                    accountLabels: [],
                    accountAge: 2847,
                    
                    metrics: {
                        followers: 45000,
                        following: 1200,
                        tweets: 8420,
                        listed: 230
                    },
                    
                    visibility: {
                        searchable: true,
                        inSuggestions: true,
                        repliesVisible: true,
                        suggestable: true
                    },
                    
                    shadowbanChecks: {
                        searchBan: false,
                        searchSuggestionBan: false,
                        ghostBan: false,
                        replyDeboosting: false,
                        suggestBan: false
                    },
                    
                    reachScore: 95,
                    probability: 5,
                    verdict: 'CLEAR'
                },
                
                agents: [
                    {
                        agent: 'API Agent', agentId: 'api', factor: 1, weight: 20, status: 'complete',
                        rawScore: 5, weightedScore: 1, confidence: 95,
                        findings: [
                            { type: 'good', severity: 'none', message: 'Account verified (Blue)', impact: -5 },
                            { type: 'good', severity: 'none', message: 'Strong engagement metrics', impact: 0 }
                        ]
                    },
                    {
                        agent: 'Web Analysis Agent', agentId: 'web', factor: 2, weight: 20, status: 'complete',
                        rawScore: 5, weightedScore: 1, confidence: 90,
                        findings: [
                            { type: 'good', severity: 'none', message: 'Visible in all search contexts', impact: 0 },
                            { type: 'good', severity: 'none', message: 'Appears in suggestions', impact: 0 }
                        ]
                    },
                    {
                        agent: 'Historical Agent', agentId: 'historical', factor: 3, weight: 15, status: 'complete',
                        rawScore: 5, weightedScore: 0.75, confidence: 85,
                        findings: [
                            { type: 'good', severity: 'none', message: 'Consistent healthy scores', impact: 0 },
                            { type: 'good', severity: 'none', message: 'No previous flags', impact: 0 }
                        ]
                    },
                    {
                        agent: 'Detection Agent', agentId: 'detection', factor: 4, weight: 25, status: 'complete',
                        modulesActive: platformModules.total,
                        rawScore: 5, weightedScore: 1.25, confidence: 95,
                        signals: {
                            hashtags: { combinedScore: 0, checked: 3, flagged: { banned: [], restricted: [], monitored: [] } },
                            cashtags: { combinedScore: 0, checked: 0, flagged: { banned: [], restricted: [], monitored: [] } },
                            links: { combinedScore: 0, checked: 0, flagged: { shorteners: [], throttled: [], blocked: [] } },
                            content: { combinedScore: 5, checked: 1, flagged: { banned: [], restricted: [], patterns: [] } },
                            mentions: { combinedScore: 0, checked: 0, flagged: { suspended: [], shadowbanned: [], bots: [] } },
                            emojis: { combinedScore: 0, checked: 0, flagged: { risky: [], combinations: [] } }
                        },
                        findings: [
                            { type: 'good', severity: 'none', message: 'All signals clean', impact: 0 }
                        ]
                    },
                    {
                        agent: 'Predictive AI Agent', agentId: 'predictive', factor: 5, weight: 20, status: 'complete',
                        rawScore: 8, weightedScore: 1.6, confidence: 90,
                        findings: [
                            { type: 'good', severity: 'none', message: 'No risk factors detected', impact: 0 },
                            { type: 'good', severity: 'none', message: 'Account in excellent health', impact: 0 }
                        ]
                    }
                ],
                
                synthesis: {
                    probability: 8,
                    reachScore: 92,
                    confidence: { level: 'high', score: 91, sources: 5 },
                    verdict: 'CLEAR',
                    verdictDescription: 'Account and post appear healthy with no issues detected',
                    primaryIssues: [],
                    agentAgreement: {
                        api: 'clear', web: 'clear', historical: 'clear', detection: 'clear', predictive: 'clear'
                    }
                },
                
                recommendations: [
                    { priority: 'info', action: 'Keep up the great work! Your account is in excellent health.' },
                    { priority: 'info', action: 'Continue posting quality content consistently.' }
                ]
            };
        },
        
        accountCheck: function() {
            return {
                checkType: 'accountCheck',
                platform: 'twitter',
                username: 'clean_account',
                timestamp: new Date().toISOString(),
                processingTime: 1654,
                demo: true,
                
                account: {
                    username: 'clean_account',
                    displayName: 'Clean Account',
                    exists: true,
                    suspended: false,
                    protected: false,
                    verifiedType: 'blue',
                    accountAge: 2847,
                    metrics: { followers: 45000, following: 1200, tweets: 8420, listed: 230 },
                    shadowbanChecks: {
                        searchBan: false, searchSuggestionBan: false, ghostBan: false, replyDeboosting: false, suggestBan: false
                    },
                    probability: 5,
                    verdict: 'CLEAR'
                },
                
                synthesis: {
                    probability: 5,
                    confidence: { level: 'high', score: 92, sources: 5 },
                    verdict: 'CLEAR'
                },
                
                recommendations: [
                    { priority: 'info', action: 'Your account is healthy. Keep posting quality content!' }
                ]
            };
        }
    },
    
    // =========================================================================
    // SCENARIO 3: Reddit - AutoMod + Self-Promotion Issues
    // =========================================================================
    reddit_automod_issues: {
        
        meta: {
            scenarioId: 'reddit_automod_issues',
            description: 'Reddit user with AutoMod removals and self-promotion issues',
            platform: 'reddit',
            expectedProbability: 55,
            expectedConfidence: 'high'
        },
        
        powerCheck: function() {
            const timestamp = new Date().toISOString();
            const platformModules = PLATFORM_MODULES.reddit;
            
            return {
                checkType: 'powerCheck',
                platform: 'reddit',
                inputUrl: 'https://reddit.com/r/technology/comments/abc123/check_out_my_new_app',
                normalizedUrl: 'https://reddit.com/r/technology/comments/abc123/check_out_my_new_app',
                timestamp: timestamp,
                processingTime: 2456,
                demo: true,
                
                post: {
                    id: 'abc123',
                    subreddit: 'technology',
                    exists: true,
                    removed: true,      // Post was removed!
                    removedBy: 'automod',
                    removedReason: 'self_promotion',
                    
                    visibility: {
                        directLink: true,
                        inSubreddit: false,   // Not showing in subreddit
                        inSearch: false,
                        inRAll: false,
                        inUserProfile: true
                    },
                    
                    metrics: {
                        score: 1,
                        upvoteRatio: 0.5,
                        comments: 0
                    },
                    
                    content: {
                        title: 'Check out my new app that does X',
                        body: 'I built this app... [link to myapp.com]',
                        urls: ['https://myapp.com']
                    },
                    
                    reachScore: 15,
                    probability: 85,
                    verdict: 'RESTRICTED'
                },
                
                account: {
                    username: 'demo_redditor',
                    exists: true,
                    suspended: false,
                    shadowBanned: false,
                    
                    metrics: {
                        totalKarma: 234,
                        postKarma: 45,
                        commentKarma: 189,
                        accountAge: 180
                    },
                    
                    analysis: {
                        selfPromotionRatio: 0.78,  // 78% self-promo (10% max recommended!)
                        domainDistribution: {
                            'myapp.com': 14,
                            'other': 4
                        }
                    },
                    
                    subredditBans: [
                        { subreddit: 'r/programming', reason: 'Self-promotion', date: '2024-10-15' }
                    ],
                    
                    probability: 55,
                    verdict: 'LIKELY RESTRICTED'
                },
                
                agents: [
                    {
                        agent: 'API Agent', agentId: 'api', factor: 1, weight: 20, status: 'complete',
                        rawScore: 25, weightedScore: 5, confidence: 90,
                        checks: {
                            postRemoved: true,
                            removedByCategory: 'automod',
                            karma: { total: 234, post: 45, comment: 189 }
                        },
                        findings: [
                            { type: 'danger', severity: 'high', message: 'Post removed by AutoModerator', impact: 40 },
                            { type: 'warning', severity: 'medium', message: 'Low karma may trigger filters', impact: 10 }
                        ]
                    },
                    {
                        agent: 'Web Analysis Agent', agentId: 'web', factor: 2, weight: 20, status: 'complete',
                        rawScore: 65, weightedScore: 13, confidence: 85,
                        findings: [
                            { type: 'danger', severity: 'high', message: 'Post not visible in subreddit', impact: 35 },
                            { type: 'danger', severity: 'high', message: 'Not appearing in r/all', impact: 20 }
                        ]
                    },
                    {
                        agent: 'Historical Agent', agentId: 'historical', factor: 3, weight: 15, status: 'complete',
                        rawScore: 45, weightedScore: 6.75, confidence: 80,
                        findings: [
                            { type: 'danger', severity: 'high', message: 'Previously banned from r/programming', impact: 25 },
                            { type: 'warning', severity: 'medium', message: 'Pattern of AutoMod removals', impact: 15 }
                        ]
                    },
                    {
                        agent: 'Detection Agent', agentId: 'detection', factor: 4, weight: 25, status: 'complete',
                        modulesActive: platformModules.total,
                        rawScore: 70, weightedScore: 17.5, confidence: 90,
                        signals: {
                            // Reddit doesn't use hashtags/cashtags
                            hashtags: { enabled: false, note: 'N/A for Reddit' },
                            cashtags: { enabled: false, note: 'N/A for Reddit' },
                            links: {
                                signalType: 'links',
                                moduleCount: platformModules.links,
                                enabled: true,
                                threePoint: {
                                    predictive: { weight: 15, score: 80, contribution: 12 },
                                    realtime: { weight: 55, score: 90, contribution: 49.5 },
                                    historical: { weight: 30, score: 85, contribution: 25.5 }
                                },
                                combinedScore: 87,
                                checked: ['https://myapp.com'],
                                flagged: {
                                    selfPromotion: [{ domain: 'myapp.com', postCount: 14, ratio: 0.78 }]
                                }
                            },
                            content: {
                                signalType: 'content',
                                moduleCount: platformModules.content,
                                enabled: true,
                                threePoint: {
                                    predictive: { weight: 15, score: 60, contribution: 9 },
                                    realtime: { weight: 55, score: 70, contribution: 38.5 },
                                    historical: { weight: 30, score: 65, contribution: 19.5 }
                                },
                                combinedScore: 67,
                                flagged: {
                                    patterns: ['Promotional title pattern detected']
                                }
                            },
                            mentions: { combinedScore: 0, enabled: true },
                            emojis: { combinedScore: 0, enabled: true }
                        },
                        findings: [
                            { type: 'danger', severity: 'high', message: 'Self-promotion ratio 78% (max 10%)', impact: 40 },
                            { type: 'warning', severity: 'medium', message: 'Same domain posted 14 times', impact: 15 }
                        ]
                    },
                    {
                        agent: 'Predictive AI Agent', agentId: 'predictive', factor: 5, weight: 20, status: 'complete',
                        rawScore: 55, weightedScore: 11, confidence: 85,
                        riskFactors: [
                            { factor: 'AutoMod removal', severity: 'high', source: 'API Agent' },
                            { factor: 'Self-promotion violation', severity: 'high', source: 'Detection Agent' },
                            { factor: 'Previous subreddit ban', severity: 'medium', source: 'Historical Agent' }
                        ],
                        predictions: {
                            shortTerm: 'Posts will likely continue being removed',
                            mediumTerm: 'Risk of additional subreddit bans',
                            longTerm: 'Need to rebuild ratio with genuine participation'
                        }
                    }
                ],
                
                synthesis: {
                    probability: 55,
                    reachScore: 45,
                    confidence: { level: 'high', score: 86, sources: 5 },
                    verdict: 'LIKELY RESTRICTED',
                    verdictDescription: 'Post removed by AutoMod due to self-promotion pattern',
                    primaryIssues: [
                        'Post removed by AutoModerator',
                        'Self-promotion ratio 78% exceeds 10% guideline',
                        'Previous ban from r/programming'
                    ]
                },
                
                recommendations: [
                    { priority: 'critical', action: 'Stop posting links to myapp.com immediately' },
                    { priority: 'high', action: 'Build karma through comments and valuable posts (not self-promo)' },
                    { priority: 'high', action: 'Follow Reddit\'s 10% self-promotion rule strictly' },
                    { priority: 'medium', action: 'Wait 2-4 weeks before posting any promotional content' },
                    { priority: 'info', action: 'Consider messaging r/technology mods to discuss the removal' }
                ]
            };
        },
        
        accountCheck: function() {
            return {
                checkType: 'accountCheck',
                platform: 'reddit',
                username: 'demo_redditor',
                timestamp: new Date().toISOString(),
                processingTime: 1876,
                demo: true,
                
                account: {
                    username: 'demo_redditor',
                    exists: true,
                    suspended: false,
                    shadowBanned: false,
                    metrics: { totalKarma: 234, postKarma: 45, commentKarma: 189, accountAge: 180 },
                    selfPromotionRatio: 0.78,
                    subredditBans: [
                        { subreddit: 'r/programming', reason: 'Self-promotion', date: '2024-10-15' }
                    ],
                    probability: 55,
                    verdict: 'LIKELY RESTRICTED'
                },
                
                synthesis: {
                    probability: 55,
                    confidence: { level: 'high', score: 82, sources: 4 },
                    verdict: 'LIKELY RESTRICTED'
                },
                
                recommendations: [
                    { priority: 'critical', action: 'Reduce self-promotion ratio to under 10%' },
                    { priority: 'high', action: 'Participate genuinely in communities before promoting' }
                ]
            };
        }
    }
};

// =============================================================================
// PUBLIC API
// =============================================================================
window.DemoData = {
    
    version: '3.0.0',
    lastUpdated: '2025-12-02',
    
    // All available scenarios
    scenarios: DemoScenarios,
    
    // Platform module configuration
    platformModules: PLATFORM_MODULES,
    
    /**
     * Get demo result for a specific scenario and check type
     * @param {string} scenarioId - Scenario identifier (e.g., 'twitter_moderate_issues')
     * @param {string} checkType - 'powerCheck', 'accountCheck', or 'tagCheck'
     * @returns {object} Demo result matching engine output format
     */
    getScenarioResult: function(scenarioId, checkType) {
        const scenario = DemoScenarios[scenarioId];
        if (!scenario) {
            console.warn(`[DemoData] Scenario not found: ${scenarioId}`);
            return null;
        }
        
        const method = scenario[checkType];
        if (!method || typeof method !== 'function') {
            console.warn(`[DemoData] Check type not found: ${checkType} in ${scenarioId}`);
            return null;
        }
        
        return method();
    },
    
    /**
     * Get demo result by platform and check type (auto-selects appropriate scenario)
     * @param {string} platformId - 'twitter', 'reddit', etc.
     * @param {string} checkType - 'powerCheck', 'accountCheck', or 'tagCheck'
     * @param {string} variant - 'issues' or 'clean' (default: 'issues')
     * @returns {object} Demo result
     */
    getResult: function(platformId, checkType, variant = 'issues') {
        // Map platform + variant to scenario
        const scenarioMap = {
            twitter: {
                issues: 'twitter_moderate_issues',
                clean: 'twitter_clean'
            },
            reddit: {
                issues: 'reddit_automod_issues',
                clean: 'reddit_automod_issues'  // TODO: Add clean Reddit scenario
            }
        };
        
        const platformScenarios = scenarioMap[platformId];
        if (!platformScenarios) {
            console.warn(`[DemoData] Platform not found: ${platformId}`);
            return this.getDefaultResult(platformId, checkType);
        }
        
        const scenarioId = platformScenarios[variant] || platformScenarios.issues;
        return this.getScenarioResult(scenarioId, checkType);
    },
    
    /**
     * Get default/fallback result for unsupported platform
     */
    getDefaultResult: function(platformId, checkType) {
        return {
            checkType: checkType,
            platform: platformId,
            timestamp: new Date().toISOString(),
            demo: true,
            error: false,
            message: `Demo data for ${platformId} coming soon`,
            
            synthesis: {
                probability: 0,
                confidence: { level: 'low', score: 0, sources: 0 },
                verdict: 'UNKNOWN'
            }
        };
    },
    
    /**
     * Get list of available platforms with demo data
     */
    getAvailablePlatforms: function() {
        const platforms = new Set();
        for (const scenarioId of Object.keys(DemoScenarios)) {
            const platform = DemoScenarios[scenarioId].meta?.platform;
            if (platform) platforms.add(platform);
        }
        return [...platforms];
    },
    
    /**
     * Get list of all scenario IDs
     */
    getScenarioIds: function() {
        return Object.keys(DemoScenarios);
    },
    
    /**
     * Check if demo data exists for platform
     */
    hasDemo: function(platformId) {
        return this.getAvailablePlatforms().includes(platformId);
    },
    
    /**
     * Get module count for platform
     */
    getModuleCount: function(platformId) {
        return PLATFORM_MODULES[platformId]?.total || 0;
    },
    
    /**
     * Calculate 3-Point Intelligence score (utility function)
     */
    calculate3Point: calculate3PointScore,
    
    /**
     * Get confidence level (utility function)
     */
    getConfidence: getConfidenceLevel
};

// =============================================================================
// INITIALIZATION
// =============================================================================
console.log('✅ DemoData v3.0 loaded');
console.log('   Scenarios:', Object.keys(DemoScenarios).length);
console.log('   Platforms:', window.DemoData.getAvailablePlatforms().join(', '));
console.log('   3-Point Intelligence: Predictive (15%) + Real-Time (55%) + Historical (30%)');

})();
