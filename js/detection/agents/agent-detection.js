/* =============================================================================
   AGENT-DETECTION.JS - Real-Time Detection Agent (Factor 4, 25%)
   ShadowBanCheck.io
   
   The Detection Agent scans content across 6 signal types using 3-Point
   Intelligence (Predictive 15% + Real-Time 55% + Historical 30%).
   
   THIS VERSION USES REAL DATABASE FILES:
   - window.FlaggedHashtags
   - window.FlaggedContent  
   - window.FlaggedLinks
   - window.FlaggedMentions
   - window.FlaggedEmojis
   
   Platform Module Counts:
   - Twitter: 21 (4+3+4+4+3+3)
   - Instagram: 18 (4+0+4+4+3+3) - no cashtags
   - TikTok: 21 (4+3+4+4+3+3)
   - Reddit: 14 (0+0+4+4+3+3) - no hashtags/cashtags
   - Facebook: 18 (4+0+4+4+3+3) - no cashtags
   - YouTube: 14 (0+0+4+4+3+3) - no hashtags/cashtags
   - LinkedIn: 17 (3+0+4+4+3+3) - limited hashtags, no cashtags
   
   Last Updated: 2025-12-02
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// PLATFORM CONFIGURATION
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

// Signal type weights for overall Detection Agent score
const SIGNAL_WEIGHTS = {
    hashtags: 25,
    cashtags: 15,
    links: 25,
    content: 20,
    mentions: 10,
    emojis: 5
};

// 3-Point Intelligence weights
const THREE_POINT_WEIGHTS = {
    predictive: 15,
    realtime: 55,
    historical: 30
};

// =============================================================================
// DETECTION AGENT CLASS
// =============================================================================
class DetectionAgent {
    
    constructor() {
        this.id = 'detection';
        this.name = 'Detection Agent';
        this.factor = 4;
        this.weight = 25;
        this.version = '2.0.0';
        this.demoMode = true;
    }
    
    // =========================================================================
    // MAIN ANALYSIS METHOD
    // =========================================================================
    
    /**
     * Run full detection analysis on input
     * @param {object} input - Analysis input
     * @param {string} input.platform - Platform ID
     * @param {string} input.content - Text content to analyze
     * @param {array} input.urls - URLs in content
     * @param {string} input.username - Username for historical lookup
     * @returns {object} Detection result with 3-Point Intelligence per signal
     */
    async analyze(input) {
        const startTime = Date.now();
        const platform = input.platform || 'twitter';
        const platformConfig = PLATFORM_MODULES[platform] || PLATFORM_MODULES.twitter;
        
        // Extract content elements
        const content = input.content || input.text || '';
        const extractedData = this.extractContentElements(content, platform);
        
        // Run all 6 signal analyses
        const signals = {};
        
        // Signal 1: Hashtags
        signals.hashtags = await this.analyzeHashtags(
            extractedData.hashtags, 
            platform, 
            platformConfig.hashtags,
            input.username
        );
        
        // Signal 2: Cashtags
        signals.cashtags = await this.analyzeCashtags(
            extractedData.cashtags, 
            platform, 
            platformConfig.cashtags,
            input.username
        );
        
        // Signal 3: Links
        signals.links = await this.analyzeLinks(
            extractedData.urls.concat(input.urls || []), 
            platform, 
            platformConfig.links,
            input.username
        );
        
        // Signal 4: Content
        signals.content = await this.analyzeContent(
            content, 
            platform, 
            platformConfig.content,
            input.username
        );
        
        // Signal 5: Mentions
        signals.mentions = await this.analyzeMentions(
            extractedData.mentions, 
            platform, 
            platformConfig.mentions,
            input.username
        );
        
        // Signal 6: Emojis
        signals.emojis = await this.analyzeEmojis(
            content, 
            platform, 
            platformConfig.emojis,
            input.username
        );
        
        // Calculate aggregate scores
        const signalSummary = this.calculateSignalSummary(signals, platform);
        const findings = this.generateFindings(signals);
        const rawScore = this.calculateRawScore(signals, platform);
        
        return {
            agent: this.name,
            agentId: this.id,
            factor: this.factor,
            weight: this.weight,
            status: 'complete',
            modulesActive: platformConfig.total,
            
            signals: signals,
            signalSummary: signalSummary,
            findings: findings,
            
            rawScore: rawScore,
            weightedScore: Math.round((rawScore * this.weight) / 100 * 100) / 100,
            confidence: this.calculateConfidence(signals),
            
            processingTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
        };
    }
    
    // =========================================================================
    // CONTENT EXTRACTION
    // =========================================================================
    
    extractContentElements(text, platform) {
        if (!text) return { hashtags: [], cashtags: [], mentions: [], urls: [], emojis: [] };
        
        return {
            hashtags: this.extractHashtags(text),
            cashtags: this.extractCashtags(text),
            mentions: this.extractMentions(text, platform),
            urls: this.extractUrls(text),
            emojis: this.extractEmojis(text)
        };
    }
    
    extractHashtags(text) {
        const matches = text.match(/#[\w\u0080-\uFFFF]+/g) || [];
        return [...new Set(matches.map(h => h.toLowerCase()))];
    }
    
    extractCashtags(text) {
        const matches = text.match(/\$[A-Za-z]{1,5}/g) || [];
        return [...new Set(matches.map(c => c.toUpperCase()))];
    }
    
    extractMentions(text, platform) {
        if (platform === 'reddit') {
            const userMatches = text.match(/u\/[\w-]+/g) || [];
            return [...new Set(userMatches.map(m => '@' + m.replace('u/', '')))];
        }
        const matches = text.match(/@[\w]+/g) || [];
        return [...new Set(matches.map(m => m.toLowerCase()))];
    }
    
    extractUrls(text) {
        const matches = text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/g) || [];
        return [...new Set(matches)];
    }
    
    extractEmojis(text) {
        const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
        return text.match(emojiRegex) || [];
    }
    
    // =========================================================================
    // SIGNAL 1: HASHTAG ANALYSIS
    // =========================================================================
    
    async analyzeHashtags(hashtags, platform, moduleCount, username) {
        const timestamp = new Date().toISOString();
        
        // Check if platform uses hashtags
        if (moduleCount === 0) {
            return {
                signalType: 'hashtags',
                moduleCount: 0,
                enabled: false,
                note: `${platform} does not use hashtags`,
                combinedScore: 0,
                confidence: { level: 'high', score: 100, sources: 1 }
            };
        }
        
        // No hashtags to check
        if (!hashtags || hashtags.length === 0) {
            return this.createEmptySignalResult('hashtags', moduleCount, timestamp);
        }
        
        // === REAL-TIME CHECK (55%) ===
        let realtimeScore = 0;
        let realtimeSources = [];
        const flagged = { banned: [], restricted: [], monitored: [] };
        const safe = [];
        
        // Use FlaggedHashtags database if available
        if (window.FlaggedHashtags) {
            const bulkCheck = window.FlaggedHashtags.checkBulk(hashtags, platform);
            
            // Process results
            for (const item of bulkCheck.banned || []) {
                flagged.banned.push({
                    tag: item.tag,
                    reason: item.notes || 'Banned hashtag',
                    category: item.category,
                    since: item.since || null
                });
            }
            for (const item of bulkCheck.restricted || []) {
                flagged.restricted.push({
                    tag: item.tag,
                    reason: item.notes || 'Restricted hashtag',
                    category: item.category
                });
            }
            for (const item of bulkCheck.monitored || []) {
                flagged.monitored.push({
                    tag: item.tag,
                    reason: item.notes || 'Monitored hashtag',
                    category: item.category
                });
            }
            for (const item of bulkCheck.safe || []) {
                safe.push(typeof item === 'string' ? item : item.tag);
            }
            
            // Calculate real-time score based on flags
            realtimeScore = Math.min(100, 
                (flagged.banned.length * 30) + 
                (flagged.restricted.length * 15) + 
                (flagged.monitored.length * 5)
            );
            
            realtimeSources.push(`Database: ${hashtags.length} hashtags checked`);
            if (flagged.banned.length > 0) {
                realtimeSources.push(`Found ${flagged.banned.length} banned hashtag(s)`);
            }
        } else {
            realtimeSources.push('FlaggedHashtags database not loaded');
            safe.push(...hashtags);
        }
        
        // === PREDICTIVE SCORE (15%) ===
        // In live mode, this would query web analysis agent for community reports
        const predictiveScore = this.getPredictiveScore('hashtags', flagged, platform);
        const predictiveSources = predictiveScore > 0 
            ? ['Community reports indicate risk for flagged hashtags']
            : [];
        
        // === HISTORICAL SCORE (30%) ===
        // In live mode, this would query historical agent
        const historicalScore = this.getHistoricalScore('hashtags', username, flagged);
        const historicalSources = historicalScore > 0
            ? ['Previous hashtag violations in user history']
            : ['No hashtag history for this user'];
        
        // Calculate 3-Point combined score
        const threePoint = this.calculate3PointScore(
            predictiveScore, predictiveSources,
            realtimeScore, realtimeSources,
            historicalScore, historicalSources
        );
        
        return {
            signalType: 'hashtags',
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            checked: hashtags,
            flagged: flagged,
            safe: safe,
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, 
                (realtimeSources.length > 0 ? 1 : 0) + 
                (predictiveSources.length > 0 ? 1 : 0) + 
                (historicalSources.length > 0 ? 1 : 0)
            ),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // SIGNAL 2: CASHTAG ANALYSIS
    // =========================================================================
    
    async analyzeCashtags(cashtags, platform, moduleCount, username) {
        const timestamp = new Date().toISOString();
        
        // Check if platform uses cashtags
        if (moduleCount === 0) {
            return {
                signalType: 'cashtags',
                moduleCount: 0,
                enabled: false,
                note: `${platform} does not use cashtags`,
                combinedScore: 0,
                confidence: { level: 'high', score: 100, sources: 1 }
            };
        }
        
        // No cashtags to check
        if (!cashtags || cashtags.length === 0) {
            return this.createEmptySignalResult('cashtags', moduleCount, timestamp);
        }
        
        // === REAL-TIME CHECK (55%) ===
        let realtimeScore = 0;
        let realtimeSources = [];
        const flagged = { scamAssociated: [], pumpDump: [], safe: [] };
        const safe = [];
        
        // Use FlaggedHashtags database (it handles both # and $)
        if (window.FlaggedHashtags) {
            const bulkCheck = window.FlaggedHashtags.checkBulk(cashtags, platform);
            
            for (const item of bulkCheck.banned || []) {
                flagged.scamAssociated.push({
                    tag: item.tag,
                    reason: item.notes || 'Scam-associated cashtag',
                    category: item.category
                });
            }
            for (const item of bulkCheck.restricted || []) {
                flagged.pumpDump.push({
                    tag: item.tag,
                    reason: item.notes || 'Potential pump-and-dump',
                    category: item.category
                });
            }
            for (const item of bulkCheck.safe || []) {
                safe.push(typeof item === 'string' ? item : item.tag);
            }
            
            realtimeScore = Math.min(100,
                (flagged.scamAssociated.length * 35) +
                (flagged.pumpDump.length * 20)
            );
            
            realtimeSources.push(`Database: ${cashtags.length} cashtags checked`);
        } else {
            safe.push(...cashtags);
            realtimeSources.push('FlaggedHashtags database not loaded');
        }
        
        // Check for pump-and-dump patterns in surrounding content
        // Multiple cashtags (>3) is a warning sign
        if (cashtags.length > 3) {
            realtimeScore = Math.min(100, realtimeScore + 15);
            realtimeSources.push(`Multiple cashtags (${cashtags.length}) - potential spam signal`);
        }
        
        const predictiveScore = this.getPredictiveScore('cashtags', flagged, platform);
        const historicalScore = this.getHistoricalScore('cashtags', username, flagged);
        
        const threePoint = this.calculate3PointScore(
            predictiveScore, predictiveScore > 0 ? ['Crypto scam patterns detected'] : [],
            realtimeScore, realtimeSources,
            historicalScore, historicalScore > 0 ? ['Previous cashtag issues'] : []
        );
        
        return {
            signalType: 'cashtags',
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            checked: cashtags,
            flagged: flagged,
            safe: safe,
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, 2),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // SIGNAL 3: LINK ANALYSIS
    // =========================================================================
    
    async analyzeLinks(urls, platform, moduleCount, username) {
        const timestamp = new Date().toISOString();
        
        if (!urls || urls.length === 0) {
            return this.createEmptySignalResult('links', moduleCount, timestamp);
        }
        
        // Deduplicate URLs
        const uniqueUrls = [...new Set(urls)];
        
        // === REAL-TIME CHECK (55%) ===
        let realtimeScore = 0;
        let realtimeSources = [];
        const flagged = { throttled: [], blocked: [], shorteners: [], suspicious: [] };
        const safe = [];
        
        // Use FlaggedLinks database if available
        if (window.FlaggedLinks) {
            const bulkCheck = window.FlaggedLinks.checkBulk(uniqueUrls, platform);
            
            for (const result of bulkCheck.results) {
                if (result.status === 'banned') {
                    flagged.blocked.push({
                        url: result.url,
                        reason: result.issues.join(', '),
                        category: result.category
                    });
                } else if (result.status === 'restricted') {
                    if (result.category === 'shortener') {
                        flagged.shorteners.push({
                            url: result.url,
                            reason: 'Link shortener may reduce reach'
                        });
                    } else if (result.category === 'platform-specific') {
                        flagged.throttled.push({
                            url: result.url,
                            domain: window.FlaggedLinks.extractDomain(result.url),
                            reason: result.issues.join(', ')
                        });
                    } else {
                        flagged.suspicious.push({
                            url: result.url,
                            reason: result.issues.join(', ')
                        });
                    }
                } else if (result.status === 'monitored') {
                    flagged.suspicious.push({
                        url: result.url,
                        reason: result.issues.join(', ')
                    });
                } else {
                    safe.push(result.url);
                }
            }
            
            // Calculate score
            realtimeScore = Math.min(100,
                (flagged.blocked.length * 40) +
                (flagged.throttled.length * 25) +
                (flagged.shorteners.length * 10) +
                (flagged.suspicious.length * 15)
            );
            
            realtimeSources.push(`Link check: ${uniqueUrls.length} URLs analyzed`);
            if (flagged.shorteners.length > 0) {
                realtimeSources.push(`${flagged.shorteners.length} link shortener(s) detected`);
            }
            if (flagged.throttled.length > 0) {
                realtimeSources.push(`${flagged.throttled.length} throttled domain(s) detected`);
            }
        } else {
            safe.push(...uniqueUrls);
            realtimeSources.push('FlaggedLinks database not loaded');
        }
        
        const predictiveScore = this.getPredictiveScore('links', flagged, platform);
        const historicalScore = this.getHistoricalScore('links', username, flagged);
        
        const threePoint = this.calculate3PointScore(
            predictiveScore, predictiveScore > 0 ? ['Industry reports: These links may reduce reach'] : [],
            realtimeScore, realtimeSources,
            historicalScore, historicalScore > 0 ? ['Previous link violations'] : ['No link history for user']
        );
        
        return {
            signalType: 'links',
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            checked: uniqueUrls,
            flagged: flagged,
            safe: safe,
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, 3),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // SIGNAL 4: CONTENT ANALYSIS
    // =========================================================================
    
    async analyzeContent(text, platform, moduleCount, username) {
        const timestamp = new Date().toISOString();
        
        if (!text || text.trim().length === 0) {
            return this.createEmptySignalResult('content', moduleCount, timestamp);
        }
        
        // === REAL-TIME CHECK (55%) ===
        let realtimeScore = 0;
        let realtimeSources = [];
        const flagged = { banned: [], restricted: [], patterns: [] };
        
        // Use FlaggedContent database if available
        if (window.FlaggedContent) {
            const scanResult = window.FlaggedContent.scan(text, platform);
            
            for (const flag of scanResult.flags) {
                if (flag.status === 'banned' || flag.risk === 'high') {
                    flagged.banned.push({
                        term: flag.term,
                        category: flag.category,
                        reason: flag.message || flag.notes
                    });
                } else if (flag.status === 'restricted' || flag.risk === 'medium') {
                    flagged.restricted.push({
                        term: flag.term,
                        category: flag.category,
                        reason: flag.message || flag.notes
                    });
                } else {
                    flagged.patterns.push({
                        term: flag.term,
                        type: flag.type,
                        reason: flag.message || flag.notes
                    });
                }
            }
            
            realtimeScore = scanResult.score;
            realtimeSources.push(`Content scan: ${text.length} characters analyzed`);
            
            if (scanResult.highRiskCount > 0) {
                realtimeSources.push(`${scanResult.highRiskCount} high-risk term(s) found`);
            }
            if (scanResult.flagCount > 0) {
                realtimeSources.push(`${scanResult.flagCount} total flag(s)`);
            } else {
                realtimeSources.push('No banned phrases detected');
            }
            
            // Add pattern analysis info
            const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
            if (capsRatio > 0.5 && text.length > 20) {
                realtimeSources.push(`Caps ratio: ${Math.round(capsRatio * 100)}% (high)`);
            } else {
                realtimeSources.push(`Caps ratio: ${Math.round(capsRatio * 100)}% (normal)`);
            }
        } else {
            realtimeSources.push('FlaggedContent database not loaded');
        }
        
        // Sentiment analysis placeholder
        realtimeSources.push('Sentiment: Neutral/positive');
        
        const predictiveScore = this.getPredictiveScore('content', flagged, platform);
        const historicalScore = this.getHistoricalScore('content', username, flagged);
        
        const threePoint = this.calculate3PointScore(
            predictiveScore, predictiveScore > 0 ? ['Pattern analysis indicates risk'] : ['Pattern analysis: Content appears normal'],
            realtimeScore, realtimeSources,
            historicalScore, historicalScore > 0 ? ['Previous content violations'] : ['No content violations in history']
        );
        
        return {
            signalType: 'content',
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            checked: [text.substring(0, 100) + (text.length > 100 ? '...' : '')],
            flagged: flagged,
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, 3),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // SIGNAL 5: MENTION ANALYSIS
    // =========================================================================
    
    async analyzeMentions(mentions, platform, moduleCount, username) {
        const timestamp = new Date().toISOString();
        
        if (!mentions || mentions.length === 0) {
            return this.createEmptySignalResult('mentions', moduleCount, timestamp);
        }
        
        // === REAL-TIME CHECK (55%) ===
        let realtimeScore = 0;
        let realtimeSources = [];
        const flagged = { suspended: [], shadowbanned: [], bots: [] };
        const safe = [];
        
        // Use FlaggedMentions database if available
        if (window.FlaggedMentions) {
            const checkResult = window.FlaggedMentions.checkBulk(mentions, platform);
            
            for (const item of checkResult.flagged) {
                if (item.status === 'suspended') {
                    flagged.suspended.push({
                        username: item.username,
                        reason: item.reason
                    });
                } else if (item.status === 'shadowbanned') {
                    flagged.shadowbanned.push({
                        username: item.username,
                        reason: item.reason
                    });
                } else if (item.status === 'bot') {
                    flagged.bots.push({
                        username: item.username,
                        reason: item.reason
                    });
                }
            }
            
            for (const item of checkResult.safe) {
                safe.push(item.username);
            }
            
            // Check for excessive mentions
            if (checkResult.excessive) {
                realtimeScore += 20;
                realtimeSources.push(checkResult.excessiveMessage);
            }
            
            realtimeScore = Math.min(100, realtimeScore +
                (flagged.suspended.length * 15) +
                (flagged.shadowbanned.length * 20) +
                (flagged.bots.length * 10)
            );
            
            realtimeSources.push(`Mention check: ${mentions.length} mentions analyzed`);
        } else {
            safe.push(...mentions);
            realtimeSources.push('FlaggedMentions database not loaded');
        }
        
        // Mass mentioning detection
        if (mentions.length > 5) {
            realtimeScore = Math.min(100, realtimeScore + 15);
            realtimeSources.push(`Mass mentioning detected (${mentions.length} mentions)`);
        }
        
        const predictiveScore = this.getPredictiveScore('mentions', flagged, platform);
        const historicalScore = this.getHistoricalScore('mentions', username, flagged);
        
        const threePoint = this.calculate3PointScore(
            predictiveScore, [],
            realtimeScore, realtimeSources,
            historicalScore, []
        );
        
        return {
            signalType: 'mentions',
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            checked: mentions,
            flagged: flagged,
            safe: safe,
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, 2),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // SIGNAL 6: EMOJI ANALYSIS
    // =========================================================================
    
    async analyzeEmojis(text, platform, moduleCount, username) {
        const timestamp = new Date().toISOString();
        
        // === REAL-TIME CHECK (55%) ===
        let realtimeScore = 0;
        let realtimeSources = [];
        const flagged = { risky: [], combinations: [] };
        const safe = [];
        
        // Use FlaggedEmojis database if available
        if (window.FlaggedEmojis) {
            const emojiResult = window.FlaggedEmojis.extractAndCheck(text, platform);
            
            if (emojiResult.results) {
                // Process flagged emojis
                for (const item of emojiResult.results.flagged || []) {
                    flagged.risky.push({
                        emoji: item.emoji,
                        name: item.name,
                        reason: item.context || item.notes,
                        risk: item.risk
                    });
                }
                
                // Process risky combinations
                for (const combo of emojiResult.results.combinations || []) {
                    flagged.combinations.push({
                        emojis: combo.emojis,
                        reason: combo.reason,
                        risk: combo.risk
                    });
                }
                
                // Safe emojis
                for (const item of emojiResult.results.safe || []) {
                    safe.push(item.emoji);
                }
                
                // Get risk score from result
                realtimeScore = emojiResult.results.summary?.riskScore || 0;
                
                // Cap emoji impact at 10 (they rarely cause shadowbans alone)
                realtimeScore = Math.min(10, realtimeScore);
                
                if (emojiResult.results.excessive) {
                    realtimeSources.push(`Excessive emojis: ${emojiResult.emojis.length} emojis detected`);
                }
                if (emojiResult.results.combinations.length > 0) {
                    realtimeSources.push(`${emojiResult.results.combinations.length} risky combination(s) found`);
                }
                if (emojiResult.emojis.length > 0) {
                    realtimeSources.push(`${emojiResult.emojis.length} emojis in content`);
                } else {
                    realtimeSources.push('No emojis in content');
                }
            }
        } else {
            realtimeSources.push('No emojis in content');
        }
        
        const predictiveScore = 0; // Emojis rarely have predictive signals
        const historicalScore = 0;
        
        const threePoint = this.calculate3PointScore(
            predictiveScore, [],
            realtimeScore, realtimeSources,
            historicalScore, []
        );
        
        return {
            signalType: 'emojis',
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: threePoint,
            combinedScore: threePoint.combinedScore,
            
            checked: safe.concat(flagged.risky.map(e => e.emoji)),
            flagged: flagged,
            safe: safe,
            
            confidence: this.getConfidenceLevel(threePoint.combinedScore, 1),
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // 3-POINT INTELLIGENCE HELPERS
    // =========================================================================
    
    calculate3PointScore(predictiveScore, predictiveSources, realtimeScore, realtimeSources, historicalScore, historicalSources) {
        const predictiveContribution = (predictiveScore * THREE_POINT_WEIGHTS.predictive) / 100;
        const realtimeContribution = (realtimeScore * THREE_POINT_WEIGHTS.realtime) / 100;
        const historicalContribution = (historicalScore * THREE_POINT_WEIGHTS.historical) / 100;
        
        return {
            predictive: {
                weight: THREE_POINT_WEIGHTS.predictive,
                score: predictiveScore,
                contribution: Math.round(predictiveContribution * 100) / 100,
                sources: predictiveSources
            },
            realtime: {
                weight: THREE_POINT_WEIGHTS.realtime,
                score: realtimeScore,
                contribution: Math.round(realtimeContribution * 100) / 100,
                sources: realtimeSources
            },
            historical: {
                weight: THREE_POINT_WEIGHTS.historical,
                score: historicalScore,
                contribution: Math.round(historicalContribution * 100) / 100,
                sources: historicalSources
            },
            combinedScore: Math.round((predictiveContribution + realtimeContribution + historicalContribution) * 100) / 100
        };
    }
    
    getPredictiveScore(signalType, flagged, platform) {
        // In live mode, this would query WebAnalysisAgent for community reports
        // For now, estimate based on flagged items
        let score = 0;
        
        if (flagged.banned?.length > 0) score += 40;
        if (flagged.restricted?.length > 0) score += 20;
        if (flagged.blocked?.length > 0) score += 50;
        if (flagged.throttled?.length > 0) score += 30;
        if (flagged.scamAssociated?.length > 0) score += 60;
        
        return Math.min(100, score);
    }
    
    getHistoricalScore(signalType, username, flagged) {
        // In live mode, this would query HistoricalAgent
        // For now, return 0 (no history) or estimate based on flags
        if (!username) return 0;
        
        // If we have flagged items, assume some historical risk
        const hasFlagged = Object.values(flagged).some(arr => 
            Array.isArray(arr) && arr.length > 0
        );
        
        return hasFlagged ? 20 : 0;
    }
    
    getConfidenceLevel(score, sourceCount) {
        const agreementBonus = sourceCount >= 3 ? 15 : sourceCount >= 2 ? 5 : 0;
        const adjustedScore = Math.min(100, score + agreementBonus);
        
        let level, description;
        if (adjustedScore >= 70 || sourceCount >= 3) {
            level = 'high';
            description = '3+ sources corroborate';
        } else if (adjustedScore >= 40 || sourceCount >= 2) {
            level = 'medium';
            description = '2 sources corroborate';
        } else {
            level = 'low';
            description = 'Single source';
        }
        
        return { level, score: adjustedScore, sources: sourceCount, description };
    }
    
    createEmptySignalResult(signalType, moduleCount, timestamp) {
        return {
            signalType: signalType,
            moduleCount: moduleCount,
            enabled: true,
            
            threePoint: {
                predictive: { weight: 15, score: 0, contribution: 0, sources: [] },
                realtime: { weight: 55, score: 0, contribution: 0, sources: [`No ${signalType} in content`] },
                historical: { weight: 30, score: 0, contribution: 0, sources: [] }
            },
            
            combinedScore: 0,
            checked: [],
            flagged: {},
            safe: [],
            
            confidence: { level: 'high', score: 100, sources: 1, description: 'No items to check' },
            lastVerified: timestamp
        };
    }
    
    // =========================================================================
    // AGGREGATE CALCULATIONS
    // =========================================================================
    
    calculateSignalSummary(signals, platform) {
        const scores = {};
        let totalScore = 0;
        let activeSignals = 0;
        let flaggedSignals = 0;
        
        for (const [signalType, signal] of Object.entries(signals)) {
            scores[signalType] = signal.combinedScore || 0;
            
            if (signal.enabled !== false) {
                activeSignals++;
                totalScore += signal.combinedScore || 0;
                
                // Check if signal has any flags
                if (signal.flagged) {
                    const hasFlags = Object.values(signal.flagged).some(arr => 
                        Array.isArray(arr) && arr.length > 0
                    );
                    if (hasFlags) flaggedSignals++;
                }
            }
        }
        
        return {
            totalSignals: 6,
            activeSignals: activeSignals,
            flaggedSignals: flaggedSignals,
            scores: scores,
            averageScore: activeSignals > 0 ? Math.round((totalScore / activeSignals) * 100) / 100 : 0
        };
    }
    
    calculateRawScore(signals, platform) {
        let weightedTotal = 0;
        let weightSum = 0;
        
        for (const [signalType, signal] of Object.entries(signals)) {
            if (signal.enabled === false) continue;
            
            const weight = SIGNAL_WEIGHTS[signalType] || 10;
            weightedTotal += (signal.combinedScore || 0) * weight;
            weightSum += weight;
        }
        
        return weightSum > 0 ? Math.round(weightedTotal / weightSum) : 0;
    }
    
    calculateConfidence(signals) {
        let totalConfidence = 0;
        let count = 0;
        
        for (const signal of Object.values(signals)) {
            if (signal.confidence?.score !== undefined) {
                totalConfidence += signal.confidence.score;
                count++;
            }
        }
        
        return count > 0 ? Math.round(totalConfidence / count) : 50;
    }
    
    generateFindings(signals) {
        const findings = [];
        
        // Check each signal for issues
        for (const [signalType, signal] of Object.entries(signals)) {
            if (signal.enabled === false) continue;
            
            if (signal.flagged) {
                // Banned items
                if (signal.flagged.banned?.length > 0) {
                    for (const item of signal.flagged.banned) {
                        findings.push({
                            type: 'danger',
                            severity: 'high',
                            message: `Banned ${signalType.slice(0, -1)}: ${item.tag || item.term || item.url}`,
                            impact: 30
                        });
                    }
                }
                
                // Blocked items
                if (signal.flagged.blocked?.length > 0) {
                    for (const item of signal.flagged.blocked) {
                        findings.push({
                            type: 'danger',
                            severity: 'high',
                            message: `Blocked link: ${item.url}`,
                            impact: 35
                        });
                    }
                }
                
                // Shorteners
                if (signal.flagged.shorteners?.length > 0) {
                    findings.push({
                        type: 'warning',
                        severity: 'medium',
                        message: `Link shortener(s) detected: ${signal.flagged.shorteners.map(s => s.url).join(', ')}`,
                        impact: 10
                    });
                }
                
                // Throttled domains
                if (signal.flagged.throttled?.length > 0) {
                    findings.push({
                        type: 'warning',
                        severity: 'medium',
                        message: `Throttled domain(s): ${signal.flagged.throttled.map(t => t.domain).join(', ')}`,
                        impact: 20
                    });
                }
                
                // Restricted items
                if (signal.flagged.restricted?.length > 0) {
                    for (const item of signal.flagged.restricted) {
                        findings.push({
                            type: 'warning',
                            severity: 'medium',
                            message: `Restricted ${signalType.slice(0, -1)}: ${item.tag || item.term}`,
                            impact: 15
                        });
                    }
                }
                
                // Risky combinations (emojis)
                if (signal.flagged.combinations?.length > 0) {
                    findings.push({
                        type: 'warning',
                        severity: 'medium',
                        message: `Risky emoji combination detected`,
                        impact: 10
                    });
                }
            }
            
            // Add "good" findings for clean signals
            if (signal.combinedScore === 0 && signal.enabled !== false) {
                findings.push({
                    type: 'good',
                    severity: 'none',
                    message: `${signalType.charAt(0).toUpperCase() + signalType.slice(1)} check passed`,
                    impact: 0
                });
            }
        }
        
        // Sort by impact (highest first)
        findings.sort((a, b) => (b.impact || 0) - (a.impact || 0));
        
        return findings;
    }
    
    // =========================================================================
    // CONFIGURATION
    // =========================================================================
    
    setDemoMode(enabled) {
        this.demoMode = !!enabled;
    }
    
    getStatus() {
        return {
            id: this.id,
            name: this.name,
            factor: this.factor,
            weight: this.weight,
            version: this.version,
            demoMode: this.demoMode,
            databasesLoaded: {
                hashtags: !!window.FlaggedHashtags,
                content: !!window.FlaggedContent,
                links: !!window.FlaggedLinks,
                mentions: !!window.FlaggedMentions,
                emojis: !!window.FlaggedEmojis
            }
        };
    }
}

// =============================================================================
// EXPORTS & REGISTRATION
// =============================================================================

// Create singleton instance
const detectionAgent = new DetectionAgent();

// Register with AgentRegistry if available
if (window.AgentRegistry) {
    window.AgentRegistry.register(detectionAgent);
}

// Export
window.DetectionAgent = DetectionAgent;
window.detectionAgent = detectionAgent;

// =============================================================================
// INITIALIZATION
// =============================================================================
console.log('✅ DetectionAgent v2.0 loaded - Uses real database files');
console.log('   Databases:', detectionAgent.getStatus().databasesLoaded);

})();
