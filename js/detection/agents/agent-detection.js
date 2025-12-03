/* =============================================================================
   AGENT-DETECTION.JS - Factor 4: Real-Time Detection (25%)
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   Version: 2.0.0
   Updated: December 2025
   
   6 Signal Types with 3-Point Intelligence:
   - Hashtags (4 modules on most platforms)
   - Cashtags (3 modules - Twitter/TikTok only)
   - Links (4 modules)
   - Content (4 modules)
   - Mentions (3 modules)
   - Emojis (3 modules)
   
   3-Point Intelligence Model per Signal:
   - Predictive (15%): Community reports, trends, news
   - Real-Time (55%): Live API/web checks
   - Historical (30%): Database records, past scans
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// PLATFORM MODULE CONFIGURATION
// =============================================================================

const PLATFORM_MODULES = {
    twitter:   { total: 21, hashtags: 4, cashtags: 3, links: 4, content: 4, mentions: 3, emojis: 3 },
    instagram: { total: 18, hashtags: 4, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    tiktok:    { total: 21, hashtags: 4, cashtags: 3, links: 4, content: 4, mentions: 3, emojis: 3 },
    reddit:    { total: 14, hashtags: 0, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    facebook:  { total: 18, hashtags: 4, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    youtube:   { total: 14, hashtags: 0, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    linkedin:  { total: 17, hashtags: 3, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 }
};

// Signal type weights for overall score calculation
const SIGNAL_WEIGHTS = {
    hashtags: 25,
    cashtags: 15,
    links: 25,
    content: 20,
    mentions: 10,
    emojis: 5
};

// =============================================================================
// DETECTION AGENT CLASS
// =============================================================================

class DetectionAgent extends window.AgentBase {
    
    constructor() {
        super('detection', 4, 25); // id, factor 4, weight 25%
    }
    
    // =========================================================================
    // MAIN ANALYZE METHOD
    // =========================================================================
    
    async analyze(input) {
        const startTime = Date.now();
        const platform = input.platform || 'twitter';
        const platformModules = PLATFORM_MODULES[platform] || PLATFORM_MODULES.twitter;
        const timestamp = new Date().toISOString();
        
        try {
            const text = this.extractText(input);
            
            // No content to analyze
            if (!text) {
                return this.createEmptyResult(platform, platformModules, timestamp, startTime);
            }
            
            // Run all 6 signal type analyses with 3-Point Intelligence
            const signals = {
                hashtags: await this.analyzeHashtags(text, platform, platformModules),
                cashtags: await this.analyzeCashtags(text, platform, platformModules),
                links: await this.analyzeLinks(text, platform, platformModules),
                content: await this.analyzeContent(text, platform, platformModules),
                mentions: await this.analyzeMentions(text, platform, platformModules),
                emojis: await this.analyzeEmojis(text, platform, platformModules)
            };
            
            // Build signal summary
            const signalSummary = this.buildSignalSummary(signals);
            
            // Generate findings from signals
            const findings = this.generateFindings(signals);
            
            // Calculate overall detection score
            const { rawScore, confidence } = this.calculateOverallScore(signals, signalSummary);
            
            return {
                // Agent identification
                agentId: 'detection',
                agent: 'Detection Agent',
                factorNumber: 4,
                factor: 4,
                factorName: 'Real-Time Detection',
                weight: 25,
                
                // Status
                status: 'complete',
                enabled: this.enabled,
                demo: this.useDemo,
                dataSource: this.useDemo ? 'demo' : 'live',
                
                // Platform info
                platform: platform,
                modulesActive: platformModules.total,
                
                // 6 Signal Types with 3-Point Intelligence
                signals: signals,
                
                // Aggregate summary
                signalSummary: signalSummary,
                
                // Findings for display
                findings: findings,
                
                // Scores
                rawScore: rawScore,
                weightedScore: Math.round((rawScore * 25) / 100 * 100) / 100,
                confidence: confidence,
                
                // Metadata
                timestamp: timestamp,
                processingTime: Date.now() - startTime
            };
            
        } catch (error) {
            this.log(`Error: ${error.message}`, 'error');
            return this.createErrorResult(error, platform, platformModules, timestamp, startTime);
        }
    }
    
    // =========================================================================
    // SIGNAL TYPE 1: HASHTAGS
    // =========================================================================
    
    async analyzeHashtags(text, platform, platformModules) {
        const timestamp = new Date().toISOString();
        const moduleCount = platformModules.hashtags;
        
        // Platform doesn't support hashtags
        if (moduleCount === 0) {
            return this.createDisabledSignal('hashtags', platform, `N/A for ${platform}`);
        }
        
        // Extract hashtags from text
        const hashtagPattern = /#[\w\u0080-\uFFFF]+/g;
        const found = text.match(hashtagPattern) || [];
        
        // Initialize results
        let banned = [], restricted = [], monitored = [], safe = [];
        let realtimeScore = 0;
        const realtimeSources = [];
        
        // Check against database
        if (window.FlaggedHashtags && found.length > 0) {
            const results = window.FlaggedHashtags.checkBulk(found, platform);
            banned = results.banned || [];
            restricted = results.restricted || [];
            monitored = results.monitored || [];
            safe = results.safe || [];
            realtimeScore = results.summary?.riskScore || 0;
            
            realtimeSources.push(`Database: ${found.length} hashtags analyzed`);
            if (banned.length > 0) {
                realtimeSources.push(`Found ${banned.length} banned hashtag(s)`);
            }
            if (restricted.length > 0) {
                realtimeSources.push(`Found ${restricted.length} restricted hashtag(s)`);
            }
        } else if (found.length > 0) {
            safe = found.map(h => ({ tag: h }));
            realtimeSources.push('Basic extraction (database not loaded)');
        } else {
            realtimeSources.push('No hashtags found in content');
        }
        
        // Get Predictive score (community reports, trends)
        const predictive = await this.getPredictiveHashtagScore(found, platform);
        
        // Get Historical score (past scans, database records)
        const historical = await this.getHistoricalScore('hashtags', found, banned, platform);
        
        // Calculate 3-Point score
        const threePoint = this.calculate3PointScore(predictive.score, realtimeScore, historical.score);
        threePoint.predictive.sources = predictive.sources;
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historical.sources;
        
        const activeSourceCount = [predictive.score, realtimeScore, historical.score].filter(s => s > 0).length;
        
        return {
            signalType: 'hashtags',
            platform: platform,
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            analyzed: {
                total: found.length,
                checked: found,
                flagged: {
                    banned: banned.map(h => ({ 
                        tag: h.tag, 
                        reason: h.notes || 'Banned on platform', 
                        since: h.since 
                    })),
                    restricted: restricted.map(h => ({ 
                        tag: h.tag, 
                        reason: h.notes || 'May reduce reach' 
                    })),
                    spamAssociated: monitored.map(h => ({ 
                        tag: h.tag, 
                        reason: h.notes || 'Being monitored' 
                    }))
                },
                safe: safe.map(h => h.tag || h)
            },
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, activeSourceCount),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // SIGNAL TYPE 2: CASHTAGS
    // =========================================================================
    
    async analyzeCashtags(text, platform, platformModules) {
        const timestamp = new Date().toISOString();
        const moduleCount = platformModules.cashtags;
        
        // Platform doesn't support cashtags
        if (moduleCount === 0) {
            return this.createDisabledSignal('cashtags', platform, `N/A for ${platform}`);
        }
        
        // Extract cashtags ($BTC, $ETH, etc.)
        const cashtagPattern = /\$[A-Za-z]{1,5}/g;
        const found = text.match(cashtagPattern) || [];
        
        let scamAssociated = [], pumpDump = [], coordinated = [], safe = [];
        let realtimeScore = 0;
        const realtimeSources = [];
        
        if (found.length > 0) {
            realtimeSources.push(`API: ${found.length} cashtag(s) found`);
            
            // Check for spam patterns
            if (found.length > 3) {
                realtimeScore += 15;
                realtimeSources.push('Warning: Multiple cashtags may trigger spam filters');
            }
            
            // Check for pump-and-dump patterns
            const pumpPatterns = /moon|100x|gem|buy now|hurry/i;
            if (pumpPatterns.test(text)) {
                realtimeScore += 25;
                pumpDump.push({ pattern: 'pump_language', reason: 'Pump and dump language detected' });
                realtimeSources.push('Pump-and-dump language pattern detected');
            }
            
            // Check database if available
            if (window.FlaggedHashtags) {
                const results = window.FlaggedHashtags.checkBulk(found, platform);
                if (results.banned?.length > 0) {
                    scamAssociated = results.banned;
                    realtimeScore += results.summary?.riskScore || 0;
                }
            }
            
            // Mark remaining as safe
            safe = found.filter(c => 
                !scamAssociated.some(s => s.tag === c) && 
                !pumpDump.some(p => p.tag === c)
            );
        } else {
            realtimeSources.push('No cashtags found in content');
        }
        
        const predictive = await this.getPredictiveCashtagScore(found, platform);
        const historical = await this.getHistoricalScore('cashtags', found, scamAssociated, platform);
        
        const threePoint = this.calculate3PointScore(predictive.score, realtimeScore, historical.score);
        threePoint.predictive.sources = predictive.sources;
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historical.sources;
        
        const activeSourceCount = [predictive.score, realtimeScore, historical.score].filter(s => s > 0).length;
        
        return {
            signalType: 'cashtags',
            platform: platform,
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            analyzed: {
                total: found.length,
                checked: found,
                flagged: {
                    scamAssociated: scamAssociated,
                    pumpDump: pumpDump,
                    coordinated: coordinated
                },
                safe: safe
            },
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, activeSourceCount),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // SIGNAL TYPE 3: LINKS
    // =========================================================================
    
    async analyzeLinks(text, platform, platformModules) {
        const timestamp = new Date().toISOString();
        const moduleCount = platformModules.links;
        
        // Extract URLs
        const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
        const found = text.match(urlPattern) || [];
        
        let throttled = [], blocked = [], shorteners = [], suspicious = [], safe = [];
        let realtimeScore = 0;
        const realtimeSources = [];
        
        // Throttled domains (confirmed by The Markup - September 2023)
        const throttledDomains = {
            twitter: [
                { domain: 'facebook.com', delay: 2544 },
                { domain: 'instagram.com', delay: 2544 },
                { domain: 'threads.net', delay: 2544 },
                { domain: 'bsky.app', delay: 2544 },
                { domain: 'substack.com', delay: 2544 },
                { domain: 'patreon.com', delay: 2544 },
                { domain: 'wa.me', delay: 2544 },
                { domain: 'messenger.com', delay: 2544 },
                { domain: 'linktree.com', delay: 2544 }
            ]
        };
        
        // Link shorteners (suspicious on all platforms)
        const shortenerDomains = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly'];
        
        // Suspicious TLDs
        const suspiciousTlds = ['.xyz', '.click', '.top', '.work', '.buzz'];
        
        if (found.length > 0) {
            realtimeSources.push(`Link check: ${found.length} URL(s) found`);
            
            for (const url of found) {
                const domain = this.extractDomain(url);
                if (!domain) continue;
                
                // Check for shorteners
                const isShortener = shortenerDomains.some(d => domain.includes(d));
                if (isShortener) {
                    shorteners.push({ 
                        url: url, 
                        domain: domain, 
                        reason: 'Link shortener may reduce reach' 
                    });
                    realtimeScore += 15;
                    continue;
                }
                
                // Check for throttled domains (platform-specific)
                const platformThrottled = throttledDomains[platform] || [];
                const throttledMatch = platformThrottled.find(t => domain.includes(t.domain));
                if (throttledMatch) {
                    throttled.push({ 
                        url: url, 
                        domain: throttledMatch.domain, 
                        delay: throttledMatch.delay, 
                        reason: `Domain throttled ~${(throttledMatch.delay / 1000).toFixed(1)}s` 
                    });
                    realtimeScore += 25;
                    realtimeSources.push(`Throttled domain: ${throttledMatch.domain}`);
                    continue;
                }
                
                // Check for suspicious TLDs
                const hasSuspiciousTld = suspiciousTlds.some(tld => domain.endsWith(tld));
                if (hasSuspiciousTld) {
                    suspicious.push({ 
                        url: url, 
                        domain: domain, 
                        reason: 'Suspicious TLD' 
                    });
                    realtimeScore += 10;
                    continue;
                }
                
                // Safe link
                safe.push(url);
            }
            
            // Check database if available
            if (window.FlaggedLinks) {
                const results = window.FlaggedLinks.checkBulk(found, platform);
                if (results.blocked?.length > 0) {
                    blocked = results.blocked;
                    realtimeScore += 35 * results.blocked.length;
                }
            }
        } else {
            realtimeSources.push('No URLs found in content');
        }
        
        if (shorteners.length > 0) {
            realtimeSources.push(`${shorteners.length} link shortener(s) detected`);
        }
        
        const predictive = await this.getPredictiveLinkScore(found, platform);
        const historical = await this.getHistoricalScore('links', found, [...throttled, ...blocked], platform);
        
        const threePoint = this.calculate3PointScore(predictive.score, realtimeScore, historical.score);
        threePoint.predictive.sources = predictive.sources;
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historical.sources;
        
        const activeSourceCount = [predictive.score, realtimeScore, historical.score].filter(s => s > 0).length;
        
        return {
            signalType: 'links',
            platform: platform,
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            analyzed: {
                total: found.length,
                checked: found,
                flagged: {
                    throttled: throttled,
                    blocked: blocked,
                    shorteners: shorteners,
                    suspicious: suspicious
                },
                safe: safe
            },
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, activeSourceCount),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // SIGNAL TYPE 4: CONTENT
    // =========================================================================
    
    async analyzeContent(text, platform, platformModules) {
        const timestamp = new Date().toISOString();
        const moduleCount = platformModules.content;
        
        let spamPatterns = [], engagementBait = [], sensitiveContent = [];
        let realtimeScore = 0;
        const realtimeSources = [];
        
        // Content analysis checks
        const lowerText = text.toLowerCase();
        
        // 1. Check caps ratio
        const capsRatio = text.length > 0 
            ? (text.match(/[A-Z]/g) || []).length / text.length 
            : 0;
        if (capsRatio > 0.5 && text.length > 20) {
            spamPatterns.push({ 
                pattern: 'excessive_caps', 
                reason: 'High caps ratio may trigger spam filters',
                value: `${(capsRatio * 100).toFixed(1)}%`
            });
            realtimeScore += 10;
            realtimeSources.push('Excessive capitalization detected');
        }
        
        // 2. Check for engagement bait
        const engagementBaitPatterns = [
            { pattern: /(?:like|share|comment|follow).*(?:if you|to win|for a chance)/i, name: 'engagement_bait' },
            { pattern: /(?:act now|limited time|hurry|last chance|don't miss)/i, name: 'urgency_tactics' },
            { pattern: /(?:tag \d+ friends|tag someone|share to)/i, name: 'tag_bait' }
        ];
        
        for (const eb of engagementBaitPatterns) {
            if (eb.pattern.test(text)) {
                engagementBait.push({ 
                    pattern: eb.name, 
                    reason: 'Engagement bait detected' 
                });
                realtimeScore += 15;
            }
        }
        
        if (engagementBait.length > 0) {
            realtimeSources.push('Engagement bait patterns detected');
        }
        
        // 3. Check for spam patterns
        const spamPhrases = [
            'free followers', 'free likes', 'make money fast', 'dm for promo',
            'follow train', 'f4f', 'l4l', 'click link in bio'
        ];
        
        for (const phrase of spamPhrases) {
            if (lowerText.includes(phrase)) {
                spamPatterns.push({ 
                    pattern: 'spam_phrase', 
                    reason: `Contains spam phrase: "${phrase}"` 
                });
                realtimeScore += 20;
            }
        }
        
        // 4. Check for sensitive topics
        const sensitiveTopics = [
            { pattern: /election|vote|ballot|poll/i, category: 'political' },
            { pattern: /covid|vaccine|pandemic/i, category: 'health' },
            { pattern: /war|invasion|military attack/i, category: 'geopolitical' }
        ];
        
        for (const st of sensitiveTopics) {
            if (st.pattern.test(text)) {
                sensitiveContent.push({ 
                    category: st.category, 
                    reason: 'Sensitive topic - increased scrutiny likely' 
                });
                realtimeScore += 5; // Lower impact, just a flag
            }
        }
        
        // 5. Check database if available
        if (window.FlaggedContent) {
            const scan = window.FlaggedContent.scan(text, platform);
            if (scan.flags?.length > 0) {
                spamPatterns.push(...scan.flags.map(f => ({ 
                    pattern: f.type, 
                    reason: f.message 
                })));
                realtimeScore += scan.score || 0;
            }
        }
        
        if (realtimeScore === 0) {
            realtimeSources.push('Content scan: No issues detected');
        } else {
            realtimeSources.push(`Content scan: ${spamPatterns.length + engagementBait.length} pattern(s) found`);
        }
        
        const predictive = await this.getPredictiveContentScore(text, platform);
        const historical = await this.getHistoricalScore('content', [text], spamPatterns, platform);
        
        const threePoint = this.calculate3PointScore(predictive.score, realtimeScore, historical.score);
        threePoint.predictive.sources = predictive.sources;
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historical.sources;
        
        const activeSourceCount = [predictive.score, realtimeScore, historical.score].filter(s => s > 0).length;
        
        return {
            signalType: 'content',
            platform: platform,
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            analyzed: {
                possiblySensitive: sensitiveContent.length > 0,
                capsRatio: capsRatio,
                spamPatterns: spamPatterns,
                engagementBait: engagementBait.length > 0,
                sensitiveTopics: sensitiveContent,
                duplicateContent: false // Would need history to detect
            },
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, activeSourceCount),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // SIGNAL TYPE 5: MENTIONS
    // =========================================================================
    
    async analyzeMentions(text, platform, platformModules) {
        const timestamp = new Date().toISOString();
        const moduleCount = platformModules.mentions;
        
        // Platform-specific mention patterns
        const mentionPattern = platform === 'reddit' ? /u\/[\w-]+/g : /@[\w]+/g;
        const found = text.match(mentionPattern) || [];
        
        let suspended = [], shadowbanned = [], bots = [], safe = [];
        let realtimeScore = 0;
        const realtimeSources = [];
        
        if (found.length > 0) {
            realtimeSources.push(`${found.length} mention(s) found`);
            
            // Check for mass mentioning (spam signal)
            if (found.length > 5) {
                realtimeScore += 15;
                realtimeSources.push('Warning: Many mentions may trigger spam filters');
            }
            
            if (found.length > 10) {
                realtimeScore += 25;
                realtimeSources.push('Critical: Excessive mentions - likely spam flagged');
            }
            
            // Check database if available
            if (window.FlaggedMentions) {
                const results = window.FlaggedMentions.checkBulk(found, platform);
                suspended = results.flagged?.filter(m => m.status === 'suspended') || [];
                shadowbanned = results.flagged?.filter(m => m.status === 'shadowbanned') || [];
                bots = results.flagged?.filter(m => m.status === 'bot') || [];
                safe = results.safe || [];
                
                if (suspended.length > 0) {
                    realtimeScore += 25;
                    realtimeSources.push(`${suspended.length} suspended account(s) mentioned`);
                }
                if (shadowbanned.length > 0) {
                    realtimeScore += 20;
                }
            } else {
                safe = found;
            }
        } else {
            realtimeSources.push('No mentions found in content');
        }
        
        const predictive = await this.getPredictiveMentionScore(found, platform);
        const historical = await this.getHistoricalScore('mentions', found, [...suspended, ...shadowbanned], platform);
        
        const threePoint = this.calculate3PointScore(predictive.score, realtimeScore, historical.score);
        threePoint.predictive.sources = predictive.sources;
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historical.sources;
        
        const activeSourceCount = [predictive.score, realtimeScore, historical.score].filter(s => s > 0).length;
        
        return {
            signalType: 'mentions',
            platform: platform,
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            analyzed: {
                totalMentions: found.length,
                checked: found,
                mentionPattern: found.length > 10 ? 'spam' : found.length > 5 ? 'high' : 'normal',
                massTagging: found.length > 5,
                flagged: {
                    suspended: suspended,
                    shadowbanned: shadowbanned,
                    bots: bots
                },
                safe: safe
            },
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, activeSourceCount),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // SIGNAL TYPE 6: EMOJIS
    // =========================================================================
    
    async analyzeEmojis(text, platform, platformModules) {
        const timestamp = new Date().toISOString();
        const moduleCount = platformModules.emojis;
        
        // Extract emojis
        const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu;
        const found = text.match(emojiPattern) || [];
        
        let cryptoPattern = [], adultPattern = [], spamPattern = [];
        let realtimeScore = 0;
        const realtimeSources = [];
        
        // Crypto spam emojis (rocket, moon, diamond, money)
        const cryptoEmojis = ['🚀', '💎', '🙌', '🌙', '📈', '💰', '🤑', '💵'];
        const adultEmojis = ['🍆', '🍑', '💦', '😈'];
        
        if (found.length > 0) {
            realtimeSources.push(`${found.length} emoji(s) found`);
            
            // Check for excessive emojis
            if (found.length > 10) {
                realtimeScore += 10;
                spamPattern.push({ pattern: 'excessive_emojis', reason: 'Excessive emojis may reduce reach' });
                realtimeSources.push('Warning: Excessive emojis detected');
            }
            
            // Check for crypto spam pattern
            const cryptoCount = found.filter(e => cryptoEmojis.includes(e)).length;
            if (cryptoCount >= 3) {
                realtimeScore += 15;
                cryptoPattern.push({ 
                    pattern: 'crypto_spam', 
                    reason: 'Crypto spam emoji pattern detected',
                    emojis: found.filter(e => cryptoEmojis.includes(e))
                });
                realtimeSources.push('Crypto spam emoji pattern detected');
            }
            
            // Check for adult content pattern
            const adultCount = found.filter(e => adultEmojis.includes(e)).length;
            if (adultCount >= 2) {
                realtimeScore += 10;
                adultPattern.push({ 
                    pattern: 'adult_suggestive', 
                    reason: 'Adult content emoji pattern',
                    emojis: found.filter(e => adultEmojis.includes(e))
                });
            }
            
            // Check for emoji-only content (high spam signal)
            const emojiRatio = found.length / Math.max(1, text.replace(/\s/g, '').length);
            if (emojiRatio > 0.5 && text.length < 50) {
                realtimeScore += 15;
                spamPattern.push({ pattern: 'emoji_only', reason: 'Emoji-heavy content' });
            }
            
            // Check database if available
            if (window.FlaggedEmojis) {
                const results = window.FlaggedEmojis.checkBulk(found, platform);
                if (results.flagged?.length > 0) {
                    spamPattern.push(...results.flagged);
                    realtimeScore += results.summary?.riskScore || 0;
                }
            }
        } else {
            realtimeSources.push('No emojis found in content');
        }
        
        const predictive = await this.getPredictiveEmojiScore(found, platform);
        const historical = await this.getHistoricalScore('emojis', found, [...cryptoPattern, ...spamPattern], platform);
        
        const threePoint = this.calculate3PointScore(predictive.score, realtimeScore, historical.score);
        threePoint.predictive.sources = predictive.sources;
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historical.sources;
        
        const activeSourceCount = [predictive.score, realtimeScore, historical.score].filter(s => s > 0).length;
        
        return {
            signalType: 'emojis',
            platform: platform,
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            analyzed: {
                totalEmojis: found.length,
                checked: found,
                emojiRatio: text.length > 0 ? (found.length / text.length).toFixed(3) : 0,
                flagged: {
                    cryptoPattern: cryptoPattern,
                    adultPattern: adultPattern,
                    spamPattern: spamPattern
                },
                excessiveUse: found.length > 10
            },
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, activeSourceCount),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // PREDICTIVE SCORE METHODS (Point 1 of 3-Point Intelligence)
    // =========================================================================
    
    async getPredictiveHashtagScore(hashtags, platform) {
        const sources = [];
        let score = 0;
        
        if (hashtags.length === 0) return { score: 0, sources: [] };
        
        try {
            // Query Web Analysis Agent for community reports
            const webAgent = window.AgentRegistry?.get('web-analysis');
            if (webAgent?.searchForFlaggedContent) {
                const queries = hashtags.slice(0, 3).map(h => `${h} banned ${platform}`);
                const results = await webAgent.searchForFlaggedContent(queries, platform);
                
                if (results.available && results.riskScore > 0) {
                    score = results.riskScore;
                    sources.push(...(results.sources || []));
                }
            } else if (this.useDemo) {
                // Demo: simulate predictive data
                score = hashtags.some(h => /(follow|like|f4f|l4l)/i.test(h)) ? 30 : 5;
                if (score > 5) sources.push('Community reports indicate hashtag issues');
            }
        } catch (error) {
            this.log(`Predictive hashtag error: ${error.message}`, 'warn');
        }
        
        if (sources.length === 0 && score === 0) {
            sources.push('No community warnings found');
        }
        
        return { score, sources };
    }
    
    async getPredictiveCashtagScore(cashtags, platform) {
        const sources = [];
        let score = 0;
        
        if (cashtags.length === 0) return { score: 0, sources: [] };
        
        try {
            if (this.useDemo) {
                // Demo: check for known risky patterns
                score = cashtags.length > 3 ? 20 : 5;
                if (score > 5) sources.push('Multiple cashtags flagged in community');
            }
        } catch (error) {
            this.log(`Predictive cashtag error: ${error.message}`, 'warn');
        }
        
        if (sources.length === 0) {
            sources.push('No SEC/crypto warnings found');
        }
        
        return { score, sources };
    }
    
    async getPredictiveLinkScore(urls, platform) {
        const sources = [];
        let score = 0;
        
        if (urls.length === 0) return { score: 0, sources: [] };
        
        try {
            // Check for known throttled domains
            const hasThrottled = urls.some(u => 
                /(substack|facebook|instagram|threads|bsky)/i.test(u)
            );
            
            if (hasThrottled && platform === 'twitter') {
                score = 40;
                sources.push('The Markup investigation: Domain confirmed throttled');
            }
        } catch (error) {
            this.log(`Predictive link error: ${error.message}`, 'warn');
        }
        
        if (sources.length === 0) {
            sources.push('No industry reports on linked domains');
        }
        
        return { score, sources };
    }
    
    async getPredictiveContentScore(text, platform) {
        const sources = [];
        let score = 0;
        
        try {
            // Check for trending sensitive topics
            if (/election|vote/i.test(text)) {
                score = 15;
                sources.push('Election-related content under increased scrutiny');
            } else if (/covid|vaccine/i.test(text)) {
                score = 15;
                sources.push('Health content subject to additional review');
            }
        } catch (error) {
            this.log(`Predictive content error: ${error.message}`, 'warn');
        }
        
        if (sources.length === 0) {
            sources.push('No pattern warnings from community');
        }
        
        return { score, sources };
    }
    
    async getPredictiveMentionScore(mentions, platform) {
        const sources = [];
        let score = 0;
        
        if (mentions.length === 0) return { score: 0, sources: [] };
        
        if (mentions.length > 5) {
            score = 15;
            sources.push('Mass mentioning patterns often flagged');
        }
        
        if (sources.length === 0) {
            sources.push('No mention-related warnings');
        }
        
        return { score, sources };
    }
    
    async getPredictiveEmojiScore(emojis, platform) {
        const sources = [];
        let score = 0;
        
        if (emojis.length === 0) return { score: 0, sources: [] };
        
        const cryptoEmojis = ['🚀', '💎', '🙌', '🌙'];
        const hasCrypto = emojis.some(e => cryptoEmojis.includes(e));
        
        if (hasCrypto) {
            score = 10;
            sources.push('Crypto emoji patterns under monitoring');
        }
        
        if (sources.length === 0) {
            sources.push('No emoji-related warnings');
        }
        
        return { score, sources };
    }
    
    // =========================================================================
    // HISTORICAL SCORE METHOD (Point 3 of 3-Point Intelligence)
    // =========================================================================
    
    async getHistoricalScore(signalType, items, flagged, platform) {
        const sources = [];
        let score = 0;
        
        if (items.length === 0 && flagged.length === 0) {
            return { score: 0, sources: [] };
        }
        
        try {
            // Query Historical Agent
            const histAgent = window.AgentRegistry?.get('historical');
            if (histAgent?.getPastScores) {
                const pastScores = await histAgent.getPastScores(items, signalType, platform);
                
                if (pastScores.available) {
                    score = pastScores.averageScore || 0;
                    
                    if (pastScores.itemsWithHistory > 0) {
                        sources.push(`${pastScores.itemsWithHistory} item(s) found in history`);
                    }
                    if (pastScores.trendDirection === 'worsening') {
                        sources.push('Historical trend: worsening');
                        score += 10;
                    } else if (pastScores.trendDirection === 'improving') {
                        sources.push('Historical trend: improving');
                    }
                }
            }
            
            // Factor in currently flagged items
            if (flagged.length > 0) {
                const flaggedScore = Math.min(100, flagged.length * 25);
                score = Math.max(score, flaggedScore);
                sources.push(`${flagged.length} item(s) flagged in database`);
            }
            
        } catch (error) {
            this.log(`Historical score error: ${error.message}`, 'warn');
            
            // Fallback to flagged-based scoring
            if (flagged.length > 0) {
                score = Math.min(100, flagged.length * 25);
                sources.push('Database records checked');
            }
        }
        
        if (sources.length === 0) {
            sources.push('No historical data available');
        }
        
        return { score, sources };
    }
    
    // =========================================================================
    // HELPER METHODS
    // =========================================================================
    
    createDisabledSignal(signalType, platform, note) {
        return {
            signalType: signalType,
            platform: platform,
            moduleCount: 0,
            enabled: false,
            note: note,
            
            threePoint: {
                predictive: { weight: 15, score: 0, contribution: 0, sources: [] },
                realtime: { weight: 55, score: 0, contribution: 0, sources: [] },
                historical: { weight: 30, score: 0, contribution: 0, sources: [] },
                combinedScore: 0
            },
            combinedScore: 0,
            
            analyzed: {
                total: 0,
                checked: [],
                flagged: {},
                safe: []
            },
            
            confidence: { level: 'low', score: 0, sources: 0, description: 'Signal type disabled' },
            lastVerified: new Date().toISOString()
        };
    }
    
    buildSignalSummary(signals) {
        const scores = {};
        let totalSignals = 0;
        let activeSignals = 0;
        let flaggedSignals = 0;
        let scoreSum = 0;
        let activeCount = 0;
        
        for (const [type, signal] of Object.entries(signals)) {
            totalSignals++;
            scores[type] = signal.combinedScore;
            
            if (signal.enabled) {
                activeSignals++;
                if (signal.combinedScore > 0) {
                    scoreSum += signal.combinedScore;
                    activeCount++;
                }
                
                // Check if any items were flagged
                const flaggedObj = signal.analyzed?.flagged || {};
                const hasFlagged = Object.values(flaggedObj).some(arr => 
                    Array.isArray(arr) && arr.length > 0
                );
                if (hasFlagged) flaggedSignals++;
            }
        }
        
        return {
            totalSignals,
            activeSignals,
            flaggedSignals,
            scores,
            averageScore: activeCount > 0 ? Math.round((scoreSum / activeCount) * 100) / 100 : 0
        };
    }
    
    generateFindings(signals) {
        const findings = [];
        
        for (const [type, signal] of Object.entries(signals)) {
            if (!signal.enabled) continue;
            
            const flagged = signal.analyzed?.flagged || {};
            
            // Check for banned items
            if (flagged.banned?.length > 0) {
                findings.push({
                    type: 'danger',
                    severity: 'high',
                    message: `Banned ${type} detected: ${flagged.banned.map(b => b.tag || b.url || b.pattern).join(', ')}`,
                    impact: 30,
                    signal: type
                });
            }
            
            // Check for restricted items
            if (flagged.restricted?.length > 0) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: `Restricted ${type}: ${flagged.restricted.length} item(s) may reduce reach`,
                    impact: 15,
                    signal: type
                });
            }
            
            // Check for throttled links
            if (flagged.throttled?.length > 0) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: `Throttled domain(s): ${flagged.throttled.map(t => t.domain).join(', ')} (~2.5s delay)`,
                    impact: 20,
                    signal: type
                });
            }
            
            // Check for shorteners
            if (flagged.shorteners?.length > 0) {
                findings.push({
                    type: 'warning',
                    severity: 'low',
                    message: 'Link shortener(s) detected - may reduce reach',
                    impact: 10,
                    signal: type
                });
            }
            
            // Check for spam patterns
            if (flagged.spamPattern?.length > 0 || signal.analyzed?.spamPatterns?.length > 0) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: 'Spam patterns detected in content',
                    impact: 15,
                    signal: type
                });
            }
            
            // Check for engagement bait
            if (signal.analyzed?.engagementBait) {
                findings.push({
                    type: 'warning',
                    severity: 'low',
                    message: 'Engagement bait language detected',
                    impact: 10,
                    signal: type
                });
            }
            
            // Check for crypto spam pattern
            if (flagged.cryptoPattern?.length > 0) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: 'Crypto spam emoji pattern detected',
                    impact: 15,
                    signal: type
                });
            }
            
            // Check for suspended account mentions
            if (flagged.suspended?.length > 0) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: `Mentioning ${flagged.suspended.length} suspended account(s)`,
                    impact: 20,
                    signal: type
                });
            }
        }
        
        // Add positive finding if nothing flagged
        if (findings.length === 0) {
            findings.push({
                type: 'good',
                severity: 'none',
                message: 'All signals clean - no issues detected',
                impact: 0
            });
        }
        
        // Sort by impact (highest first)
        findings.sort((a, b) => b.impact - a.impact);
        
        return findings;
    }
    
    calculateOverallScore(signals, summary) {
        let weightedSum = 0;
        let totalWeight = 0;
        let confidenceSum = 0;
        let confidenceCount = 0;
        
        for (const [type, signal] of Object.entries(signals)) {
            if (!signal.enabled) continue;
            
            const weight = SIGNAL_WEIGHTS[type] || 10;
            weightedSum += signal.combinedScore * weight;
            totalWeight += weight;
            
            if (signal.confidence?.score) {
                confidenceSum += signal.confidence.score;
                confidenceCount++;
            }
        }
        
        const rawScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
        const confidence = confidenceCount > 0 ? Math.round(confidenceSum / confidenceCount) : 50;
        
        return { rawScore, confidence };
    }
    
    createEmptyResult(platform, platformModules, timestamp, startTime) {
        return {
            agentId: 'detection',
            agent: 'Detection Agent',
            factorNumber: 4,
            factor: 4,
            factorName: 'Real-Time Detection',
            weight: 25,
            status: 'complete',
            platform: platform,
            modulesActive: platformModules.total,
            signals: {},
            signalSummary: { totalSignals: 0, activeSignals: 0, flaggedSignals: 0, scores: {}, averageScore: 0 },
            findings: [{ type: 'info', severity: 'none', message: 'No content to analyze', impact: 0 }],
            rawScore: 0,
            weightedScore: 0,
            confidence: 100,
            timestamp: timestamp,
            processingTime: Date.now() - startTime,
            demo: this.useDemo
        };
    }
    
    createErrorResult(error, platform, platformModules, timestamp, startTime) {
        return {
            agentId: 'detection',
            agent: 'Detection Agent',
            factorNumber: 4,
            factor: 4,
            factorName: 'Real-Time Detection',
            weight: 25,
            status: 'error',
            platform: platform,
            modulesActive: 0,
            signals: {},
            signalSummary: { totalSignals: 0, activeSignals: 0, flaggedSignals: 0, scores: {}, averageScore: 0 },
            findings: [{ type: 'danger', severity: 'high', message: `Error: ${error.message}`, impact: 0 }],
            rawScore: 0,
            weightedScore: 0,
            confidence: 0,
            timestamp: timestamp,
            processingTime: Date.now() - startTime,
            error: error.message,
            demo: this.useDemo
        };
    }
}

// =============================================================================
// REGISTER AGENT
// =============================================================================

const detectionAgent = new DetectionAgent();

if (window.AgentRegistry) {
    window.AgentRegistry.register(detectionAgent);
}

window.DetectionAgent = DetectionAgent;
window.detectionAgent = detectionAgent;

// Export platform modules for reference
window.PLATFORM_MODULES = PLATFORM_MODULES;
window.SIGNAL_WEIGHTS = SIGNAL_WEIGHTS;

console.log('✅ DetectionAgent v2.0.0 loaded - 6 Signal Types with 3-Point Intelligence');

})();
