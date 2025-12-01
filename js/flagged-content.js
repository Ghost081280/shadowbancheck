/* =============================================================================
   FLAGGED-CONTENT.JS - Content Scanning Database
   ShadowBanCheck.io
   
   Database of terms and patterns that may trigger platform content filters.
   Used by the Detection Agent (Factor 4) in the 5-Factor Engine.
   
   Structure follows the new standardized format:
   { term, type, status, platforms, category, risk, notes }
   
   Risk Levels:
   - banned: Will trigger immediate restrictions or removal
   - restricted: May reduce reach or trigger manual review
   - monitored: May slightly affect algorithm ranking
   - safe: No known issues
   
   Last Updated: 2025-01
   ============================================================================= */

(function() {
'use strict';

// ============================================================================
// MAIN DATABASE
// ============================================================================
window.FlaggedContent = {
    
    // Version for cache busting and tracking
    version: '2.0.0',
    lastUpdated: '2025-01-01',
    
    // =========================================================================
    // CONTENT DATABASE - Standardized Format
    // =========================================================================
    content: [
        // =====================================================================
        // HIGH RISK - Violence Related
        // =====================================================================
        { term: 'kill', type: 'word', status: 'banned', platforms: ['all'], category: 'violence', risk: 'high', notes: 'Context-dependent, often triggers review' },
        { term: 'murder', type: 'word', status: 'banned', platforms: ['all'], category: 'violence', risk: 'high', notes: null },
        { term: 'attack', type: 'word', status: 'restricted', platforms: ['all'], category: 'violence', risk: 'high', notes: 'Context-dependent' },
        { term: 'bomb', type: 'word', status: 'banned', platforms: ['all'], category: 'violence', risk: 'high', notes: null },
        { term: 'shoot', type: 'word', status: 'banned', platforms: ['all'], category: 'violence', risk: 'high', notes: null },
        { term: 'terrorism', type: 'word', status: 'banned', platforms: ['all'], category: 'violence', risk: 'high', notes: null },
        { term: 'terrorist', type: 'word', status: 'banned', platforms: ['all'], category: 'violence', risk: 'high', notes: null },
        { term: 'execute', type: 'word', status: 'banned', platforms: ['all'], category: 'violence', risk: 'high', notes: null },
        { term: 'massacre', type: 'word', status: 'banned', platforms: ['all'], category: 'violence', risk: 'high', notes: null },
        { term: 'genocide', type: 'word', status: 'banned', platforms: ['all'], category: 'violence', risk: 'high', notes: null },
        { term: 'death threat', type: 'phrase', status: 'banned', platforms: ['all'], category: 'violence', risk: 'high', notes: null },
        
        // =====================================================================
        // HIGH RISK - Hate Speech
        // =====================================================================
        { term: 'nazi', type: 'word', status: 'banned', platforms: ['all'], category: 'hate', risk: 'high', notes: 'Historical context may be allowed' },
        { term: 'white power', type: 'phrase', status: 'banned', platforms: ['all'], category: 'hate', risk: 'high', notes: null },
        { term: 'white supremacy', type: 'phrase', status: 'banned', platforms: ['all'], category: 'hate', risk: 'high', notes: null },
        { term: 'master race', type: 'phrase', status: 'banned', platforms: ['all'], category: 'hate', risk: 'high', notes: null },
        { term: 'subhuman', type: 'word', status: 'banned', platforms: ['all'], category: 'hate', risk: 'high', notes: null },
        
        // =====================================================================
        // HIGH RISK - Adult/NSFW Content
        // =====================================================================
        { term: 'porn', type: 'word', status: 'banned', platforms: ['all'], category: 'adult', risk: 'high', notes: null },
        { term: 'xxx', type: 'word', status: 'banned', platforms: ['all'], category: 'adult', risk: 'high', notes: null },
        { term: 'nsfw', type: 'word', status: 'restricted', platforms: ['twitter', 'reddit'], category: 'adult', risk: 'high', notes: 'Allowed with age restriction on some platforms' },
        { term: 'nude', type: 'word', status: 'banned', platforms: ['instagram', 'tiktok', 'facebook'], category: 'adult', risk: 'high', notes: null },
        { term: 'naked', type: 'word', status: 'banned', platforms: ['instagram', 'tiktok', 'facebook'], category: 'adult', risk: 'high', notes: null },
        { term: 'sex tape', type: 'phrase', status: 'banned', platforms: ['all'], category: 'adult', risk: 'high', notes: null },
        { term: 'onlyfans', type: 'word', status: 'restricted', platforms: ['instagram', 'tiktok'], category: 'adult', risk: 'high', notes: 'Platform-specific restrictions' },
        { term: 'adult content', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'adult', risk: 'high', notes: null },
        { term: '18+', type: 'word', status: 'restricted', platforms: ['all'], category: 'adult', risk: 'high', notes: null },
        
        // =====================================================================
        // HIGH RISK - Spam/Scam
        // =====================================================================
        { term: 'free money', type: 'phrase', status: 'banned', platforms: ['all'], category: 'spam', risk: 'high', notes: null },
        { term: 'guaranteed returns', type: 'phrase', status: 'banned', platforms: ['all'], category: 'spam', risk: 'high', notes: null },
        { term: 'get rich quick', type: 'phrase', status: 'banned', platforms: ['all'], category: 'spam', risk: 'high', notes: null },
        { term: 'double your', type: 'phrase', status: 'banned', platforms: ['all'], category: 'spam', risk: 'high', notes: 'Common in crypto scams' },
        { term: 'send btc', type: 'phrase', status: 'banned', platforms: ['all'], category: 'spam', risk: 'high', notes: null },
        { term: 'giveaway winner', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'spam', risk: 'high', notes: null },
        { term: 'claim your prize', type: 'phrase', status: 'banned', platforms: ['all'], category: 'spam', risk: 'high', notes: null },
        { term: 'lottery winner', type: 'phrase', status: 'banned', platforms: ['all'], category: 'spam', risk: 'high', notes: null },
        
        // =====================================================================
        // HIGH RISK - Crypto Scams
        // =====================================================================
        { term: 'pump and dump', type: 'phrase', status: 'banned', platforms: ['all'], category: 'crypto_scam', risk: 'high', notes: null },
        { term: 'rug pull', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'crypto_scam', risk: 'high', notes: 'Educational context may be allowed' },
        { term: 'guaranteed profits', type: 'phrase', status: 'banned', platforms: ['all'], category: 'crypto_scam', risk: 'high', notes: null },
        { term: 'airdrop claim', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'crypto_scam', risk: 'high', notes: null },
        { term: 'connect wallet', type: 'phrase', status: 'restricted', platforms: ['twitter'], category: 'crypto_scam', risk: 'high', notes: 'Often used in scams' },
        { term: '100x gains', type: 'phrase', status: 'banned', platforms: ['all'], category: 'crypto_scam', risk: 'high', notes: null },
        { term: '1000x', type: 'word', status: 'banned', platforms: ['all'], category: 'crypto_scam', risk: 'high', notes: null },
        { term: 'moon guaranteed', type: 'phrase', status: 'banned', platforms: ['all'], category: 'crypto_scam', risk: 'high', notes: null },
        { term: 'seed phrase', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'crypto_scam', risk: 'high', notes: 'Triggers scam detection' },
        { term: 'private key', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'crypto_scam', risk: 'high', notes: 'Triggers scam detection' },
        
        // =====================================================================
        // HIGH RISK - Illegal Activities
        // =====================================================================
        { term: 'drugs for sale', type: 'phrase', status: 'banned', platforms: ['all'], category: 'illegal', risk: 'high', notes: null },
        { term: 'buy drugs', type: 'phrase', status: 'banned', platforms: ['all'], category: 'illegal', risk: 'high', notes: null },
        { term: 'cocaine', type: 'word', status: 'banned', platforms: ['all'], category: 'illegal', risk: 'high', notes: null },
        { term: 'heroin', type: 'word', status: 'banned', platforms: ['all'], category: 'illegal', risk: 'high', notes: null },
        { term: 'fentanyl', type: 'word', status: 'banned', platforms: ['all'], category: 'illegal', risk: 'high', notes: null },
        { term: 'fake id', type: 'phrase', status: 'banned', platforms: ['all'], category: 'illegal', risk: 'high', notes: null },
        { term: 'counterfeit', type: 'word', status: 'restricted', platforms: ['all'], category: 'illegal', risk: 'high', notes: 'Context-dependent' },
        { term: 'hacking service', type: 'phrase', status: 'banned', platforms: ['all'], category: 'illegal', risk: 'high', notes: null },
        { term: 'ddos service', type: 'phrase', status: 'banned', platforms: ['all'], category: 'illegal', risk: 'high', notes: null },
        { term: 'malware', type: 'word', status: 'restricted', platforms: ['all'], category: 'illegal', risk: 'high', notes: 'Educational context may be allowed' },
        { term: 'ransomware', type: 'word', status: 'restricted', platforms: ['all'], category: 'illegal', risk: 'high', notes: 'Educational context may be allowed' },
        
        // =====================================================================
        // MEDIUM RISK - Political/Controversial
        // =====================================================================
        { term: 'election fraud', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'political', risk: 'medium', notes: 'May trigger fact-check labels' },
        { term: 'rigged election', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'political', risk: 'medium', notes: null },
        { term: 'stolen election', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'political', risk: 'medium', notes: null },
        { term: 'deep state', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'political', risk: 'medium', notes: null },
        { term: 'qanon', type: 'word', status: 'banned', platforms: ['facebook', 'instagram'], category: 'political', risk: 'high', notes: 'Banned on Meta platforms' },
        { term: 'false flag', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'political', risk: 'medium', notes: null },
        { term: 'crisis actor', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'political', risk: 'medium', notes: null },
        { term: 'new world order', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'political', risk: 'medium', notes: null },
        
        // =====================================================================
        // MEDIUM RISK - Health Misinformation
        // =====================================================================
        { term: 'vaccine injury', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'health_misinfo', risk: 'medium', notes: 'May add context labels' },
        { term: 'microchip vaccine', type: 'phrase', status: 'banned', platforms: ['all'], category: 'health_misinfo', risk: 'high', notes: null },
        { term: 'covid hoax', type: 'phrase', status: 'banned', platforms: ['all'], category: 'health_misinfo', risk: 'high', notes: null },
        { term: 'plandemic', type: 'word', status: 'banned', platforms: ['all'], category: 'health_misinfo', risk: 'high', notes: null },
        { term: 'miracle cure', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'health_misinfo', risk: 'medium', notes: null },
        { term: 'doctors hate this', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'health_misinfo', risk: 'medium', notes: 'Clickbait + medical claims' },
        { term: 'big pharma hiding', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'health_misinfo', risk: 'medium', notes: null },
        
        // =====================================================================
        // MEDIUM RISK - Promotional/Marketing
        // =====================================================================
        { term: 'buy now', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'promotional', risk: 'medium', notes: 'May reduce organic reach' },
        { term: 'limited time', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'promotional', risk: 'medium', notes: null },
        { term: 'act fast', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'promotional', risk: 'medium', notes: null },
        { term: 'dont miss out', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'promotional', risk: 'medium', notes: null },
        { term: 'exclusive offer', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'promotional', risk: 'medium', notes: null },
        { term: 'dm for details', type: 'phrase', status: 'restricted', platforms: ['instagram', 'twitter'], category: 'promotional', risk: 'medium', notes: 'Common spam pattern' },
        { term: 'link in bio', type: 'phrase', status: 'monitored', platforms: ['instagram', 'tiktok'], category: 'promotional', risk: 'low', notes: 'Overused, may reduce reach' },
        
        // =====================================================================
        // MEDIUM RISK - Crypto/Finance (Not Scams)
        // =====================================================================
        { term: 'crypto', type: 'word', status: 'monitored', platforms: ['instagram', 'facebook'], category: 'crypto', risk: 'medium', notes: 'Increased scrutiny' },
        { term: 'bitcoin', type: 'word', status: 'monitored', platforms: ['instagram', 'facebook'], category: 'crypto', risk: 'low', notes: null },
        { term: 'nft', type: 'word', status: 'monitored', platforms: ['all'], category: 'crypto', risk: 'medium', notes: null },
        { term: 'token sale', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'crypto', risk: 'medium', notes: null },
        { term: 'presale', type: 'word', status: 'monitored', platforms: ['twitter'], category: 'crypto', risk: 'medium', notes: null },
        { term: 'whitelist', type: 'word', status: 'monitored', platforms: ['twitter'], category: 'crypto', risk: 'low', notes: 'Crypto context' },
        { term: 'financial advice', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'crypto', risk: 'medium', notes: null },
        
        // =====================================================================
        // MEDIUM RISK - Sensitive Topics
        // =====================================================================
        { term: 'suicide', type: 'word', status: 'restricted', platforms: ['all'], category: 'sensitive', risk: 'medium', notes: 'May add resources, supportive context allowed' },
        { term: 'self harm', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'sensitive', risk: 'medium', notes: null },
        { term: 'eating disorder', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'sensitive', risk: 'medium', notes: 'Recovery content may be allowed' },
        { term: 'anorexia', type: 'word', status: 'restricted', platforms: ['all'], category: 'sensitive', risk: 'medium', notes: null },
        { term: 'bulimia', type: 'word', status: 'restricted', platforms: ['all'], category: 'sensitive', risk: 'medium', notes: null },
        { term: 'depression', type: 'word', status: 'monitored', platforms: ['all'], category: 'sensitive', risk: 'low', notes: 'Supportive content usually allowed' },
        
        // =====================================================================
        // LOW RISK - Engagement Bait
        // =====================================================================
        { term: 'follow for follow', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'engagement_bait', risk: 'medium', notes: 'Reduces reach significantly' },
        { term: 'f4f', type: 'word', status: 'restricted', platforms: ['all'], category: 'engagement_bait', risk: 'medium', notes: null },
        { term: 'like for like', type: 'phrase', status: 'restricted', platforms: ['all'], category: 'engagement_bait', risk: 'medium', notes: null },
        { term: 'l4l', type: 'word', status: 'restricted', platforms: ['all'], category: 'engagement_bait', risk: 'medium', notes: null },
        { term: 'comment if you agree', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'engagement_bait', risk: 'low', notes: null },
        { term: 'share if you', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'engagement_bait', risk: 'low', notes: null },
        { term: 'tag someone who', type: 'phrase', status: 'monitored', platforms: ['instagram'], category: 'engagement_bait', risk: 'low', notes: null },
        { term: 'drop an emoji', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'engagement_bait', risk: 'low', notes: null },
        
        // =====================================================================
        // LOW RISK - Clickbait
        // =====================================================================
        { term: 'you wont believe', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'clickbait', risk: 'low', notes: null },
        { term: 'shocking', type: 'word', status: 'monitored', platforms: ['all'], category: 'clickbait', risk: 'low', notes: 'Overused' },
        { term: 'mind blowing', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'clickbait', risk: 'low', notes: null },
        { term: 'game changer', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'clickbait', risk: 'low', notes: null },
        { term: 'secret revealed', type: 'phrase', status: 'monitored', platforms: ['all'], category: 'clickbait', risk: 'low', notes: null },
        { term: 'wait for it', type: 'phrase', status: 'monitored', platforms: ['tiktok', 'instagram'], category: 'clickbait', risk: 'low', notes: null },
        { term: 'watch till end', type: 'phrase', status: 'monitored', platforms: ['tiktok'], category: 'clickbait', risk: 'low', notes: null },
        
        // =====================================================================
        // LOW RISK - Overused Phrases
        // =====================================================================
        { term: 'thread', type: 'word', status: 'monitored', platforms: ['twitter'], category: 'overused', risk: 'low', notes: 'Common but overused' },
        { term: 'breaking', type: 'word', status: 'monitored', platforms: ['twitter'], category: 'overused', risk: 'low', notes: 'May need verification' },
        { term: 'exclusive', type: 'word', status: 'monitored', platforms: ['all'], category: 'overused', risk: 'low', notes: null },
        { term: 'leaked', type: 'word', status: 'monitored', platforms: ['all'], category: 'overused', risk: 'low', notes: null },
        { term: 'exposed', type: 'word', status: 'monitored', platforms: ['all'], category: 'overused', risk: 'low', notes: null },
        { term: 'cancelled', type: 'word', status: 'monitored', platforms: ['twitter', 'tiktok'], category: 'overused', risk: 'low', notes: null },
    ],
    
    // =========================================================================
    // PATTERN DETECTION - Behavioral Signals
    // =========================================================================
    patterns: {
        excessiveCaps: {
            threshold: 0.5, // More than 50% caps
            risk: 'low',
            status: 'monitored',
            message: 'Excessive use of capital letters may reduce reach'
        },
        excessiveEmojis: {
            threshold: 10, // More than 10 emojis
            risk: 'low',
            status: 'monitored',
            message: 'High emoji count may trigger spam filters'
        },
        excessiveHashtags: {
            threshold: {
                twitter: 5,
                instagram: 15,
                linkedin: 5,
                tiktok: 5,
                facebook: 10,
                reddit: 0 // Reddit doesn't use hashtags
            },
            risk: 'medium',
            status: 'restricted',
            message: 'Too many hashtags may reduce visibility'
        },
        excessiveMentions: {
            threshold: 5,
            risk: 'medium',
            status: 'restricted',
            message: 'Mass mentioning may be flagged as spam'
        },
        repeatedChars: {
            pattern: /(.)\1{4,}/g, // Same char 5+ times
            risk: 'low',
            status: 'monitored',
            message: 'Repeated characters may trigger spam detection'
        },
        moneySymbols: {
            pattern: /[$€£¥₿]{2,}|💰{3,}|🤑{2,}/g,
            risk: 'low',
            status: 'monitored',
            message: 'Multiple money symbols may trigger promotional content filters'
        },
        allCapsWords: {
            threshold: 3, // More than 3 all-caps words in a row
            risk: 'low',
            status: 'monitored',
            message: 'Multiple consecutive all-caps words may appear spammy'
        }
    },
    
    // =========================================================================
    // RISK WEIGHTS FOR SCORING
    // =========================================================================
    riskWeights: {
        high: 25,
        medium: 10,
        low: 3,
        pattern: 5
    },
    
    // =========================================================================
    // SCANNING FUNCTIONS
    // =========================================================================
    
    /**
     * Scan text for flagged content
     * @param {string} text - Text to scan
     * @param {string} platform - Platform ID for context
     * @returns {object} Scan results with standardized format
     */
    scan: function(text, platform = 'twitter') {
        if (!text) {
            return { 
                score: 0, 
                flags: [], 
                riskLevel: 'none',
                summary: 'No content to scan'
            };
        }
        
        const lowerText = text.toLowerCase();
        const flags = [];
        let score = 0;
        
        // Scan against content database
        for (const item of this.content) {
            // Check if applies to this platform
            const appliesToPlatform = item.platforms.includes('all') || 
                                      item.platforms.includes(platform);
            
            if (!appliesToPlatform) continue;
            
            // Check if term exists in text
            if (lowerText.includes(item.term.toLowerCase())) {
                flags.push({
                    term: item.term,
                    type: item.type,
                    category: item.category,
                    status: item.status,
                    risk: item.risk,
                    notes: item.notes,
                    message: `${this._capitalize(item.risk)}-risk ${item.type}: "${item.term}"`
                });
                
                // Add to score based on risk
                score += this.riskWeights[item.risk] || 0;
            }
        }
        
        // Check patterns
        const patternFlags = this.checkPatterns(text, platform);
        flags.push(...patternFlags.flags);
        score += patternFlags.score;
        
        // Cap score at 100
        score = Math.min(score, 100);
        
        // Determine overall risk level
        let riskLevel = 'none';
        if (score >= 50) riskLevel = 'high';
        else if (score >= 20) riskLevel = 'medium';
        else if (score > 0) riskLevel = 'low';
        
        return {
            score: score,
            flags: flags,
            riskLevel: riskLevel,
            flagCount: flags.length,
            highRiskCount: flags.filter(f => f.risk === 'high').length,
            mediumRiskCount: flags.filter(f => f.risk === 'medium').length,
            lowRiskCount: flags.filter(f => f.risk === 'low').length,
            summary: this._generateSummary(flags, score)
        };
    },
    
    /**
     * Check text for pattern violations
     * @param {string} text - Text to check
     * @param {string} platform - Platform ID
     * @returns {object} Pattern check results
     */
    checkPatterns: function(text, platform = 'twitter') {
        const flags = [];
        let score = 0;
        
        // Check excessive caps
        if (text.length > 20) {
            const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
            if (capsRatio > this.patterns.excessiveCaps.threshold) {
                flags.push({
                    term: 'EXCESSIVE CAPS',
                    type: 'pattern',
                    category: 'pattern',
                    status: this.patterns.excessiveCaps.status,
                    risk: this.patterns.excessiveCaps.risk,
                    message: this.patterns.excessiveCaps.message
                });
                score += this.riskWeights.pattern;
            }
        }
        
        // Check excessive emojis
        const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
        const emojiCount = (text.match(emojiPattern) || []).length;
        if (emojiCount > this.patterns.excessiveEmojis.threshold) {
            flags.push({
                term: `${emojiCount} emojis`,
                type: 'pattern',
                category: 'pattern',
                status: this.patterns.excessiveEmojis.status,
                risk: this.patterns.excessiveEmojis.risk,
                message: this.patterns.excessiveEmojis.message
            });
            score += this.riskWeights.pattern;
        }
        
        // Check excessive hashtags
        const hashtagCount = (text.match(/#\w+/g) || []).length;
        const hashtagThreshold = this.patterns.excessiveHashtags.threshold[platform] || 5;
        if (hashtagCount > hashtagThreshold) {
            flags.push({
                term: `${hashtagCount} hashtags`,
                type: 'pattern',
                category: 'pattern',
                status: this.patterns.excessiveHashtags.status,
                risk: this.patterns.excessiveHashtags.risk,
                message: this.patterns.excessiveHashtags.message
            });
            score += this.riskWeights.pattern * 2;
        }
        
        // Check excessive mentions
        const mentionCount = (text.match(/@\w+/g) || []).length;
        if (mentionCount > this.patterns.excessiveMentions.threshold) {
            flags.push({
                term: `${mentionCount} mentions`,
                type: 'pattern',
                category: 'pattern',
                status: this.patterns.excessiveMentions.status,
                risk: this.patterns.excessiveMentions.risk,
                message: this.patterns.excessiveMentions.message
            });
            score += this.riskWeights.pattern * 2;
        }
        
        // Check repeated characters
        if (this.patterns.repeatedChars.pattern.test(text)) {
            flags.push({
                term: 'Repeated characters',
                type: 'pattern',
                category: 'pattern',
                status: this.patterns.repeatedChars.status,
                risk: this.patterns.repeatedChars.risk,
                message: this.patterns.repeatedChars.message
            });
            score += this.riskWeights.pattern;
        }
        
        // Check money symbols
        if (this.patterns.moneySymbols.pattern.test(text)) {
            flags.push({
                term: 'Multiple money symbols',
                type: 'pattern',
                category: 'pattern',
                status: this.patterns.moneySymbols.status,
                risk: this.patterns.moneySymbols.risk,
                message: this.patterns.moneySymbols.message
            });
            score += this.riskWeights.pattern;
        }
        
        return { flags, score };
    },
    
    /**
     * Check a single term
     * @param {string} term - Term to check
     * @param {string} platform - Platform ID
     * @returns {object|null} Matching entry or null
     */
    checkTerm: function(term, platform = 'twitter') {
        const lowerTerm = term.toLowerCase().trim();
        
        for (const item of this.content) {
            if (item.term.toLowerCase() === lowerTerm) {
                const appliesToPlatform = item.platforms.includes('all') || 
                                          item.platforms.includes(platform);
                if (appliesToPlatform) {
                    return { ...item };
                }
            }
        }
        
        return null;
    },
    
    /**
     * Get all flagged terms for a category
     * @param {string} category - Category name
     * @param {string} platform - Platform ID (optional)
     * @returns {array} Matching terms
     */
    getByCategory: function(category, platform = null) {
        return this.content.filter(item => {
            const matchesCategory = item.category === category;
            const matchesPlatform = !platform || 
                                    item.platforms.includes('all') || 
                                    item.platforms.includes(platform);
            return matchesCategory && matchesPlatform;
        });
    },
    
    /**
     * Get all terms by status
     * @param {string} status - Status (banned, restricted, monitored)
     * @param {string} platform - Platform ID (optional)
     * @returns {array} Matching terms
     */
    getByStatus: function(status, platform = null) {
        return this.content.filter(item => {
            const matchesStatus = item.status === status;
            const matchesPlatform = !platform || 
                                    item.platforms.includes('all') || 
                                    item.platforms.includes(platform);
            return matchesStatus && matchesPlatform;
        });
    },
    
    /**
     * Get database statistics
     * @returns {object} Stats
     */
    getStats: function() {
        const stats = {
            total: this.content.length,
            byStatus: {},
            byCategory: {},
            byRisk: {},
            version: this.version,
            lastUpdated: this.lastUpdated
        };
        
        // Count by status
        for (const item of this.content) {
            stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
            stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
            stats.byRisk[item.risk] = (stats.byRisk[item.risk] || 0) + 1;
        }
        
        return stats;
    },
    
    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    _capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    _generateSummary: function(flags, score) {
        if (flags.length === 0) {
            return 'No flagged content detected.';
        }
        
        const parts = [];
        const highCount = flags.filter(f => f.risk === 'high').length;
        const mediumCount = flags.filter(f => f.risk === 'medium').length;
        const lowCount = flags.filter(f => f.risk === 'low').length;
        
        if (highCount > 0) parts.push(`${highCount} high-risk`);
        if (mediumCount > 0) parts.push(`${mediumCount} medium-risk`);
        if (lowCount > 0) parts.push(`${lowCount} low-risk`);
        
        return `Found ${parts.join(', ')} term(s) that may affect visibility.`;
    }
};

// ============================================================================
// BACKWARDS COMPATIBILITY - Map to old function names
// ============================================================================
window.checkContentFlags = function(text, platform) {
    return window.FlaggedContent.scan(text, platform);
};

// ============================================================================
// INITIALIZATION
// ============================================================================
console.log('✅ FlaggedContent database loaded');
console.log('   📊 Stats:', window.FlaggedContent.getStats());

})();
