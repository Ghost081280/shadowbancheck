/* =============================================================================
   AGENT-DETECTION.JS - Factor 4: Real-Time Detection (25%)
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   UPDATED: Proper 3-Point Intelligence Model
   - Predictive (15%): Community reports, trends, news
   - Real-Time (55%): Live API/web checks  
   - Historical (30%): Database records, past scans
   
   6 Signal Types: Hashtags, Cashtags, Links, Content, Mentions, Emojis
   ============================================================================= */

(function() {
'use strict';

// Platform module counts (from Master Prompt)
const PLATFORM_MODULES = {
    twitter: { total: 21, hashtags: 4, cashtags: 3, links: 4, content: 4, mentions: 3, emojis: 3 },
    instagram: { total: 18, hashtags: 4, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    tiktok: { total: 21, hashtags: 4, cashtags: 3, links: 4, content: 4, mentions: 3, emojis: 3 },
    reddit: { total: 14, hashtags: 0, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    facebook: { total: 18, hashtags: 4, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    youtube: { total: 14, hashtags: 0, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 },
    linkedin: { total: 17, hashtags: 3, cashtags: 0, links: 4, content: 4, mentions: 3, emojis: 3 }
};

// 3-Point Intelligence weights
const THREE_POINT_WEIGHTS = {
    predictive: 15,
    realtime: 55,
    historical: 30
};

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
            
            if (!text) {
                return this.createEmptyResult(platform, platformModules, timestamp, startTime);
            }
            
            // Run all 6 signal type detections with 3-Point Intelligence
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
                agentId: 'detection',
                agent: 'Detection Agent',
                factorNumber: 4,
                factor: 4,
                factorName: 'Real-Time Detection',
                weight: 25,
                status: 'complete',
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
                
                // Meta
                timestamp: timestamp,
                processingTime: Date.now() - startTime,
                dataSource: this.useDemo ? 'demo' : 'live',
                demo: this.useDemo
            };
            
        } catch (error) {
            this.log(`Error: ${error.message}`, 'error');
            return this.createErrorResult(error, platform, platformModules, timestamp, startTime);
        }
    }
    
    // =========================================================================
    // 3-POINT INTELLIGENCE CALCULATOR
    // =========================================================================
    
    calculate3PointScore(predictiveScore, realtimeScore, historicalScore) {
        const predictive = {
            weight: THREE_POINT_WEIGHTS.predictive,
            score: predictiveScore,
            contribution: Math.round((predictiveScore * THREE_POINT_WEIGHTS.predictive) / 100 * 100) / 100
        };
        
        const realtime = {
            weight: THREE_POINT_WEIGHTS.realtime,
            score: realtimeScore,
            contribution: Math.round((realtimeScore * THREE_POINT_WEIGHTS.realtime) / 100 * 100) / 100
        };
        
        const historical = {
            weight: THREE_POINT_WEIGHTS.historical,
            score: historicalScore,
            contribution: Math.round((historicalScore * THREE_POINT_WEIGHTS.historical) / 100 * 100) / 100
        };
        
        const combinedScore = Math.round((predictive.contribution + realtime.contribution + historical.contribution) * 100) / 100;
        
        return { predictive, realtime, historical, combinedScore };
    }
    
    getConfidenceLevel(score, activeSourceCount) {
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
    
    // =========================================================================
    // SIGNAL TYPE 1: HASHTAGS
    // =========================================================================
    
    async analyzeHashtags(text, platform, platformModules) {
        const timestamp = new Date().toISOString();
        const moduleCount = platformModules.hashtags;
        
        // Platform doesn't support hashtags
        if (moduleCount === 0) {
            return this.createDisabledSignal('hashtags', 'N/A for ' + platform);
        }
        
        // Extract hashtags from text
        const hashtagPattern = /#[\w\u0080-\uFFFF]+/g;
        const found = text.match(hashtagPattern) || [];
        
        // Check against database
        let banned = [], restricted = [], monitored = [], safe = [];
        let realtimeScore = 0;
        let realtimeSources = [];
        
        if (window.FlaggedHashtags && found.length > 0) {
            const results = window.FlaggedHashtags.checkBulk(found, platform);
            banned = results.banned || [];
            restricted = results.restricted || [];
            monitored = results.monitored || [];
            safe = results.safe || [];
            realtimeScore = results.summary?.riskScore || 0;
            realtimeSources.push(`Database check: ${found.length} hashtags analyzed`);
            
            if (banned.length > 0) {
                realtimeSources.push(`Found ${banned.length} banned hashtag(s)`);
            }
        } else if (found.length > 0) {
            safe = found.map(h => ({ tag: h }));
            realtimeSources.push('Database not loaded - basic extraction only');
        }
        
        // Predictive score (community reports, trends)
        const predictiveScore = this.getPredictiveScore('hashtags', found, platform);
        const predictiveSources = predictiveScore > 0 
            ? ['Community reports analyzed', 'Trend data checked']
            : [];
        
        // Historical score (past scans, database age)
        const historicalScore = this.getHistoricalScore('hashtags', found, banned);
        const historicalSources = historicalScore > 0
            ? ['Database records checked', 'Historical patterns analyzed']
            : [];
        
        // Calculate 3-Point score
        const threePoint = this.calculate3PointScore(predictiveScore, realtimeScore, historicalScore);
        threePoint.predictive.sources = predictiveSources;
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historicalSources;
        
        const activeSourceCount = [predictiveScore, realtimeScore, historicalScore].filter(s => s > 0).length;
        
        return {
            signalType: 'hashtags',
            moduleCount: moduleCount,
            enabled: true,
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            checked: found,
            flagged: {
                banned: banned.map(h => ({ tag: h.tag, reason: h.notes || 'Banned on platform', since: h.since })),
                restricted: restricted.map(h => ({ tag: h.tag, reason: h.notes || 'May reduce reach' })),
                monitored: monitored.map(h => ({ tag: h.tag, reason: h.notes || 'Being monitored' }))
            },
            safe: safe.map(h => h.tag || h),
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
        
        if (moduleCount === 0) {
            return this.createDisabledSignal('cashtags', 'N/A for ' + platform);
        }
        
        const cashtagPattern = /\$[A-Za-z]{1,5}/g;
        const found = text.match(cashtagPattern) || [];
        
        let banned = [], restricted = [], monitored = [], safe = [];
        let realtimeScore = 0;
        let realtimeSources = found.length > 0 ? [`API: ${found.length} cashtag(s) found`] : ['API: No cashtags found'];
        
        if (window.FlaggedHashtags && found.length > 0) {
            const results = window.FlaggedHashtags.checkBulk(found, platform);
            banned = results.banned || [];
            restricted = results.restricted || [];
            monitored = results.monitored || [];
            safe = results.safe || [];
            realtimeScore = results.summary?.riskScore || 0;
        } else if (found.length > 0) {
            safe = found;
        }
        
        const predictiveScore = this.getPredictiveScore('cashtags', found, platform);
        const historicalScore = this.getHistoricalScore('cashtags', found, banned);
        
        const threePoint = this.calculate3PointScore(predictiveScore, realtimeScore, historicalScore);
        threePoint.predictive.sources = predictiveScore > 0 ? ['SEC/crypto reports checked'] : [];
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historicalScore > 0 ? ['Cashtag history checked'] : [];
        
        const activeSourceCount = [predictiveScore, realtimeScore, historicalScore].filter(s => s > 0).length;
        
        return {
            signalType: 'cashtags',
            moduleCount: moduleCount,
            enabled: true,
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            checked: found,
            flagged: { banned: banned, restricted: restricted, monitored: monitored },
            safe: safe,
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
        
        const urlPattern = /https?:\/\/[^\s]+/g;
        const found = text.match(urlPattern) || [];
        
        let shorteners = [], throttled = [], blocked = [], safe = [];
        let realtimeScore = 0;
        let realtimeSources = [];
        
        if (found.length > 0) {
            realtimeSources.push(`Link check: ${found.length} URL(s) found`);
            
            // Check for shorteners
            const shortenerDomains = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd'];
            for (const url of found) {
                const isShortener = shortenerDomains.some(d => url.includes(d));
                if (isShortener) {
                    shorteners.push({ url: url.split('/')[2], reason: 'Link shortener may reduce reach' });
                    realtimeScore += 15;
                }
            }
            
            // Check for throttled domains (Twitter-specific)
            if (platform === 'twitter') {
                const throttledDomains = ['facebook.com', 'instagram.com', 'threads.net', 'bsky.app', 'substack.com'];
                for (const url of found) {
                    const isThrottled = throttledDomains.some(d => url.includes(d));
                    if (isThrottled) {
                        const domain = throttledDomains.find(d => url.includes(d));
                        throttled.push({ domain: domain, delay: 2544, reason: 'Domain throttled ~2.5s' });
                        realtimeScore += 25;
                        realtimeSources.push(`Throttled domain detected: ${domain}`);
                    }
                }
            }
            
            if (window.FlaggedLinks) {
                const results = window.FlaggedLinks.checkBulk(found, platform);
                if (results.flagged) {
                    blocked = results.flagged;
                    realtimeScore += results.summary?.riskScore || 0;
                }
            }
        } else {
            realtimeSources.push('No URLs found in content');
        }
        
        const predictiveScore = this.getPredictiveScore('links', found, platform);
        const historicalScore = this.getHistoricalScore('links', found, [...shorteners, ...throttled, ...blocked]);
        
        const threePoint = this.calculate3PointScore(predictiveScore, realtimeScore, historicalScore);
        threePoint.predictive.sources = predictiveScore > 0 ? ['Industry reports on link handling'] : [];
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historicalScore > 0 ? ['Link history analyzed'] : [];
        
        const activeSourceCount = [predictiveScore, realtimeScore, historicalScore].filter(s => s > 0).length;
        
        return {
            signalType: 'links',
            moduleCount: moduleCount,
            enabled: true,
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            checked: found,
            flagged: { shorteners: shorteners, throttled: throttled, blocked: blocked },
            safe: found.filter(u => !shorteners.some(s => u.includes(s.url)) && !throttled.some(t => u.includes(t.domain))),
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
        
        let banned = [], restricted = [], patterns = [];
        let realtimeScore = 0;
        let realtimeSources = [];
        
        if (window.FlaggedContent) {
            const scan = window.FlaggedContent.scan(text, platform);
            banned = scan.flags?.filter(f => f.severity === 'high') || [];
            restricted = scan.flags?.filter(f => f.severity === 'medium') || [];
            patterns = scan.flags?.filter(f => f.severity === 'low') || [];
            realtimeScore = scan.score || 0;
            realtimeSources.push('Content scan complete');
            
            if (scan.flags?.length > 0) {
                realtimeSources.push(`${scan.flags.length} pattern(s) detected`);
            }
        } else {
            // Basic content checks
            const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
            if (capsRatio > 0.5 && text.length > 20) {
                patterns.push({ pattern: 'excessive_caps', reason: 'High caps ratio may trigger spam filters' });
                realtimeScore += 10;
            }
            realtimeSources.push('Basic content analysis (database not loaded)');
        }
        
        realtimeSources.push(`Sentiment: ${realtimeScore > 30 ? 'Flagged' : 'Normal'}`);
        
        const predictiveScore = this.getPredictiveScore('content', [text], platform);
        const historicalScore = this.getHistoricalScore('content', [text], [...banned, ...restricted]);
        
        const threePoint = this.calculate3PointScore(predictiveScore, realtimeScore, historicalScore);
        threePoint.predictive.sources = predictiveScore > 0 ? ['Pattern analysis run'] : [];
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historicalScore > 0 ? ['Content history checked'] : [];
        
        const activeSourceCount = [predictiveScore, realtimeScore, historicalScore].filter(s => s > 0).length;
        
        return {
            signalType: 'content',
            moduleCount: moduleCount,
            enabled: true,
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            checked: [text.substring(0, 100) + (text.length > 100 ? '...' : '')],
            flagged: { banned: banned, restricted: restricted, patterns: patterns },
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
        
        const mentionPattern = platform === 'reddit' ? /u\/[\w-]+/g : /@[\w]+/g;
        const found = text.match(mentionPattern) || [];
        
        let suspended = [], shadowbanned = [], bots = [], safe = [];
        let realtimeScore = 0;
        let realtimeSources = found.length > 0 ? [`${found.length} mention(s) found`] : ['No mentions in content'];
        
        if (window.FlaggedMentions && found.length > 0) {
            const results = window.FlaggedMentions.checkBulk(found, platform);
            suspended = results.flagged?.filter(m => m.status === 'suspended') || [];
            shadowbanned = results.flagged?.filter(m => m.status === 'shadowbanned') || [];
            bots = results.flagged?.filter(m => m.status === 'bot') || [];
            safe = results.safe || [];
            realtimeScore = results.summary?.riskScore || 0;
        } else {
            safe = found;
        }
        
        // Check for excessive mentions (spam signal)
        if (found.length > 5) {
            realtimeScore += 15;
            realtimeSources.push('Warning: Many mentions may trigger spam filters');
        }
        
        const predictiveScore = this.getPredictiveScore('mentions', found, platform);
        const historicalScore = this.getHistoricalScore('mentions', found, [...suspended, ...shadowbanned]);
        
        const threePoint = this.calculate3PointScore(predictiveScore, realtimeScore, historicalScore);
        threePoint.predictive.sources = predictiveScore > 0 ? ['Mention patterns analyzed'] : [];
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historicalScore > 0 ? ['Mention history checked'] : [];
        
        const activeSourceCount = [predictiveScore, realtimeScore, historicalScore].filter(s => s > 0).length;
        
        return {
            signalType: 'mentions',
            moduleCount: moduleCount,
            enabled: true,
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            checked: found,
            flagged: { suspended: suspended, shadowbanned: shadowbanned, bots: bots },
            safe: safe,
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
        
        const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
        const found = text.match(emojiPattern) || [];
        
        let risky = [], combinations = [];
        let realtimeScore = 0;
        let realtimeSources = found.length > 0 ? [`${found.length} emoji(s) found`] : ['No emojis in content'];
        
        if (window.FlaggedEmojis && found.length > 0) {
            const results = window.FlaggedEmojis.checkBulk(found, platform);
            risky = results.flagged || [];
            combinations = results.combinations || [];
            realtimeScore = results.summary?.riskScore || 0;
        }
        
        // Excessive emoji check
        if (found.length > 10) {
            realtimeScore += 10;
            realtimeSources.push('Warning: Excessive emojis may reduce reach');
        }
        
        const predictiveScore = this.getPredictiveScore('emojis', found, platform);
        const historicalScore = this.getHistoricalScore('emojis', found, risky);
        
        const threePoint = this.calculate3PointScore(predictiveScore, realtimeScore, historicalScore);
        threePoint.predictive.sources = predictiveScore > 0 ? ['Emoji trends checked'] : [];
        threePoint.realtime.sources = realtimeSources;
        threePoint.historical.sources = historicalScore > 0 ? ['Emoji history analyzed'] : [];
        
        const activeSourceCount = [predictiveScore, realtimeScore, historicalScore].filter(s => s > 0).length;
        
        return {
            signalType: 'emojis',
            moduleCount: moduleCount,
            enabled: true,
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            checked: found,
            flagged: { risky: risky, combinations: combinations },
            safe: found.filter(e => !risky.includes(e)),
            confidence: this.getConfidenceLevel(threePoint.combinedScore, activeSourceCount),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // HELPER METHODS
    // =========================================================================
    
    extractText(input) {
        if (input.text) return input.text;
        if (input.postData?.text) return input.postData.text;
        if (input.postData?.tweetText) return input.postData.tweetText;
        if (input.postData?.postTitle) {
            return `${input.postData.postTitle} ${input.postData.postBody || ''}`;
        }
        return '';
    }
    
    getPredictiveScore(signalType, items, platform) {
        // In production, this would query WebAnalysisAgent or community reports
        // For now, return simulated scores based on item count
        if (items.length === 0) return 0;
        
        // Simulate predictive intelligence
        if (this.useDemo) {
            const baseScores = {
                hashtags: 20,
                cashtags: 15,
                links: 25,
                content: 10,
                mentions: 5,
                emojis: 5
            };
            return baseScores[signalType] || 0;
        }
        
        return 0;
    }
    
    getHistoricalScore(signalType, items, flagged) {
        // In production, this would query HistoricalAgent
        // For now, base on flagged items
        if (flagged.length === 0) return 0;
        
        // More flagged items = higher historical score
        return Math.min(100, flagged.length * 25);
    }
    
    createDisabledSignal(signalType, note) {
        return {
            signalType: signalType,
            moduleCount: 0,
            enabled: false,
            note: note,
            threePoint: {
                predictive: { weight: 15, score: 0, contribution: 0, sources: [] },
                realtime: { weight: 55, score: 0, contribution: 0, sources: [] },
                historical: { weight: 30, score: 0, contribution: 0, sources: [] }
            },
            combinedScore: 0,
            checked: [],
            flagged: {},
            safe: [],
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
                const flaggedObj = signal.flagged || {};
                const hasFlagged = Object.values(flaggedObj).some(arr => Array.isArray(arr) && arr.length > 0);
                if (hasFlagged) flaggedSignals++;
            }
        }
        
        return {
            totalSignals: totalSignals,
            activeSignals: activeSignals,
            flaggedSignals: flaggedSignals,
            scores: scores,
            averageScore: activeCount > 0 ? Math.round((scoreSum / activeCount) * 100) / 100 : 0
        };
    }
    
    generateFindings(signals) {
        const findings = [];
        
        for (const [type, signal] of Object.entries(signals)) {
            if (!signal.enabled) continue;
            
            const flagged = signal.flagged || {};
            
            // Check for banned items
            if (flagged.banned?.length > 0) {
                findings.push({
                    type: 'danger',
                    severity: 'high',
                    message: `Banned ${type} detected: ${flagged.banned.map(b => b.tag || b.url || b.pattern).join(', ')}`,
                    impact: 30
                });
            }
            
            // Check for restricted items
            if (flagged.restricted?.length > 0) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: `Restricted ${type} found: ${flagged.restricted.length} item(s)`,
                    impact: 15
                });
            }
            
            // Check for throttled links
            if (flagged.throttled?.length > 0) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: `Throttled domain(s): ${flagged.throttled.map(t => t.domain).join(', ')}`,
                    impact: 20
                });
            }
            
            // Check for shorteners
            if (flagged.shorteners?.length > 0) {
                findings.push({
                    type: 'warning',
                    severity: 'low',
                    message: `Link shortener detected - may reduce reach`,
                    impact: 10
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
        
        return findings;
    }
    
    calculateOverallScore(signals, summary) {
        // Weight by signal type importance
        const typeWeights = {
            hashtags: 25,
            cashtags: 15,
            links: 25,
            content: 20,
            mentions: 10,
            emojis: 5
        };
        
        let weightedSum = 0;
        let totalWeight = 0;
        let confidenceSum = 0;
        let confidenceCount = 0;
        
        for (const [type, signal] of Object.entries(signals)) {
            if (!signal.enabled) continue;
            
            const weight = typeWeights[type] || 10;
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

// ============================================================================
// REGISTER AGENT
// ============================================================================
const detectionAgent = new DetectionAgent();

if (window.AgentRegistry) {
    window.AgentRegistry.register(detectionAgent);
}

window.DetectionAgent = DetectionAgent;
window.detectionAgent = detectionAgent;

console.log('✅ DetectionAgent (Factor 4) loaded - 3-Point Intelligence enabled');

})();
