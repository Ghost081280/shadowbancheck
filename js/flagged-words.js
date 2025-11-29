/* =============================================================================
   FLAGGED-WORDS.JS - CONTENT SCANNING DATABASE
   ShadowBanCheck.io
   
   Database of terms and patterns that may trigger platform content filters.
   Used as a SIGNAL within the Web Analysis factor, not a separate factor.
   
   Risk Levels:
   - high: Likely to trigger immediate restrictions or removal
   - medium: May reduce reach or trigger manual review
   - low: May slightly affect algorithm ranking
   
   Last Updated: 2025
   ============================================================================= */

window.FlaggedWords = {
    
    // =========================================================================
    // HIGH RISK TERMS - Likely to trigger restrictions
    // =========================================================================
    highRisk: {
        // Violence-related
        violence: [
            'kill', 'murder', 'attack', 'bomb', 'shoot', 'stab', 'assault',
            'terrorism', 'terrorist', 'jihad', 'execute', 'massacre',
            'genocide', 'ethnic cleansing', 'death threat'
        ],
        
        // Hate speech indicators
        hate: [
            // Note: Actual slurs not included - pattern detection instead
            'nazi', 'white power', 'white supremacy', 'racial purity',
            'hate group', 'master race', 'subhuman', 'exterminate'
        ],
        
        // Adult/NSFW content
        adult: [
            'porn', 'xxx', 'nsfw', 'nude', 'naked', 'sex tape',
            'onlyfans', 'adult content', 'explicit', '18+',
            'hentai', 'rule34', 'lewd'
        ],
        
        // Spam/Scam indicators
        spam: [
            'free money', 'guaranteed returns', 'get rich quick',
            'double your', 'send btc', 'giveaway winner',
            'claim your prize', 'wire transfer', 'nigerian prince',
            'lottery winner', 'inheritance claim'
        ],
        
        // Crypto scams
        cryptoScams: [
            'pump and dump', 'rug pull', 'guaranteed profits',
            'airdrop claim', 'connect wallet', 'approve contract',
            '100x gains', '1000x', 'moon guaranteed', 'cant lose',
            'free tokens', 'seed phrase', 'private key'
        ],
        
        // Illegal activities
        illegal: [
            'drugs for sale', 'buy drugs', 'cocaine', 'heroin',
            'meth', 'fentanyl', 'illegal weapons', 'fake id',
            'counterfeit', 'stolen credit', 'hacking service',
            'ddos service', 'malware', 'ransomware'
        ]
    },
    
    // =========================================================================
    // MEDIUM RISK TERMS - May reduce reach
    // =========================================================================
    mediumRisk: {
        // Political/Controversial
        political: [
            'election fraud', 'rigged election', 'stolen election',
            'deep state', 'qanon', 'pizzagate', 'false flag',
            'crisis actor', 'government conspiracy', 'new world order',
            'illuminati', 'shadow government'
        ],
        
        // Health misinformation
        healthMisinfo: [
            'vaccine injury', 'vaccine death', 'microchip vaccine',
            'covid hoax', 'plandemic', '5g covid', 'ivermectin cure',
            'miracle cure', 'doctors hate this', 'big pharma hiding',
            'natural immunity only', 'dont get tested'
        ],
        
        // Promotional/Marketing
        promotional: [
            'buy now', 'limited time', 'act fast', 'dont miss out',
            'exclusive offer', 'best deal', 'lowest price',
            'discount code', 'affiliate link', 'sponsored',
            'dm for details', 'link in bio'
        ],
        
        // Crypto/Finance (not scams, but flagged)
        cryptoFinance: [
            'crypto', 'bitcoin', 'ethereum', 'nft', 'token sale',
            'ico', 'presale', 'whitelist', 'mint', 'airdrop',
            'defi', 'yield farming', 'staking rewards',
            'financial advice', 'investment opportunity'
        ],
        
        // Sensitive topics
        sensitive: [
            'suicide', 'self harm', 'cutting', 'eating disorder',
            'anorexia', 'bulimia', 'depression', 'overdose',
            // Note: These may be flagged even in supportive contexts
        ]
    },
    
    // =========================================================================
    // LOW RISK TERMS - May slightly affect reach
    // =========================================================================
    lowRisk: {
        // Engagement bait
        engagementBait: [
            'follow for follow', 'f4f', 'like for like', 'l4l',
            'comment if you agree', 'share if you', 'tag someone who',
            'drop a emoji', 'who else', 'anyone else think',
            'unpopular opinion', 'hot take', 'controversial opinion',
            'nobody talks about', 'they dont want you to know'
        ],
        
        // Clickbait
        clickbait: [
            'you wont believe', 'shocking', 'mind blowing',
            'game changer', 'life hack', 'secret revealed',
            'what happened next', 'wait for it', 'watch till end',
            'number 5 will shock you', 'doctors hate this trick'
        ],
        
        // Overused phrases
        overused: [
            'thread', 'breaking', 'developing', 'just in',
            'exclusive', 'leaked', 'exposed', 'cancelled'
        ]
    },
    
    // =========================================================================
    // PATTERN DETECTION - Behavioral signals
    // =========================================================================
    patterns: {
        // Excessive caps (percentage of caps in text)
        excessiveCaps: {
            threshold: 0.5, // More than 50% caps
            risk: 'low',
            message: 'Excessive use of capital letters may reduce reach'
        },
        
        // Excessive emojis
        excessiveEmojis: {
            threshold: 10, // More than 10 emojis
            risk: 'low',
            message: 'High emoji count may trigger spam filters'
        },
        
        // Excessive hashtags
        excessiveHashtags: {
            threshold: {
                twitter: 5,
                instagram: 15,
                linkedin: 5,
                tiktok: 5
            },
            risk: 'medium',
            message: 'Too many hashtags may reduce visibility'
        },
        
        // Excessive mentions
        excessiveMentions: {
            threshold: 5,
            risk: 'medium',
            message: 'Mass mentioning may be flagged as spam'
        },
        
        // Repeated characters
        repeatedChars: {
            pattern: /(.)\1{4,}/g, // Same char 5+ times
            risk: 'low',
            message: 'Repeated characters may trigger spam detection'
        },
        
        // URL patterns
        suspiciousUrls: {
            patterns: [
                /bit\.ly/i,
                /tinyurl/i,
                /t\.co/i, // Actually fine on Twitter
                /goo\.gl/i,
                /shorturl/i,
            ],
            risk: 'low',
            message: 'Shortened URLs may reduce trust signals'
        },
        
        // Money/financial symbols
        moneySymbols: {
            pattern: /[$€£¥₿]{2,}|💰{3,}|🤑{2,}/g,
            risk: 'low',
            message: 'Multiple money symbols may trigger promotional content filters'
        }
    },
    
    // =========================================================================
    // RISK WEIGHTS FOR SCORING
    // =========================================================================
    riskWeights: {
        high: 25,    // Each high-risk term adds 25 to risk score
        medium: 10,  // Each medium-risk term adds 10
        low: 3,      // Each low-risk term adds 3
        pattern: 5,  // Each pattern violation adds 5
    },
    
    // =========================================================================
    // SCANNING FUNCTIONS
    // =========================================================================
    
    /**
     * Scan text for flagged content
     * @param {string} text - Text to scan
     * @param {string} platform - Platform ID for context
     * @returns {object} Scan results
     */
    scan: function(text, platform = 'twitter') {
        if (!text) return { score: 0, flags: [], riskLevel: 'none' };
        
        const lowerText = text.toLowerCase();
        const flags = [];
        let score = 0;
        
        // Scan high risk
        for (const category in this.highRisk) {
            for (const term of this.highRisk[category]) {
                if (lowerText.includes(term.toLowerCase())) {
                    flags.push({
                        term: term,
                        category: category,
                        risk: 'high',
                        message: `High-risk term detected: "${term}"`
                    });
                    score += this.riskWeights.high;
                }
            }
        }
        
        // Scan medium risk
        for (const category in this.mediumRisk) {
            for (const term of this.mediumRisk[category]) {
                if (lowerText.includes(term.toLowerCase())) {
                    flags.push({
                        term: term,
                        category: category,
                        risk: 'medium',
                        message: `Medium-risk term detected: "${term}"`
                    });
                    score += this.riskWeights.medium;
                }
            }
        }
        
        // Scan low risk
        for (const category in this.lowRisk) {
            for (const term of this.lowRisk[category]) {
                if (lowerText.includes(term.toLowerCase())) {
                    flags.push({
                        term: term,
                        category: category,
                        risk: 'low',
                        message: `Low-risk term detected: "${term}"`
                    });
                    score += this.riskWeights.low;
                }
            }
        }
        
        // Check patterns
        const patternFlags = this.checkPatterns(text, platform);
        flags.push(...patternFlags.flags);
        score += patternFlags.score;
        
        // Determine overall risk level
        let riskLevel = 'none';
        if (score >= 50) riskLevel = 'high';
        else if (score >= 20) riskLevel = 'medium';
        else if (score > 0) riskLevel = 'low';
        
        return {
            score: Math.min(score, 100), // Cap at 100
            flags: flags,
            riskLevel: riskLevel,
            flagCount: flags.length,
            highRiskCount: flags.filter(f => f.risk === 'high').length,
            mediumRiskCount: flags.filter(f => f.risk === 'medium').length,
            lowRiskCount: flags.filter(f => f.risk === 'low').length,
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
        const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
        if (capsRatio > this.patterns.excessiveCaps.threshold && text.length > 20) {
            flags.push({
                term: 'EXCESSIVE CAPS',
                category: 'pattern',
                risk: this.patterns.excessiveCaps.risk,
                message: this.patterns.excessiveCaps.message
            });
            score += this.riskWeights.pattern;
        }
        
        // Check excessive emojis
        const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu) || []).length;
        if (emojiCount > this.patterns.excessiveEmojis.threshold) {
            flags.push({
                term: `${emojiCount} emojis`,
                category: 'pattern',
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
                category: 'pattern',
                risk: this.patterns.excessiveHashtags.risk,
                message: this.patterns.excessiveHashtags.message
            });
            score += this.riskWeights.pattern * 2; // Hashtags weighted higher
        }
        
        // Check excessive mentions
        const mentionCount = (text.match(/@\w+/g) || []).length;
        if (mentionCount > this.patterns.excessiveMentions.threshold) {
            flags.push({
                term: `${mentionCount} mentions`,
                category: 'pattern',
                risk: this.patterns.excessiveMentions.risk,
                message: this.patterns.excessiveMentions.message
            });
            score += this.riskWeights.pattern * 2;
        }
        
        // Check repeated characters
        if (this.patterns.repeatedChars.pattern.test(text)) {
            flags.push({
                term: 'Repeated characters',
                category: 'pattern',
                risk: this.patterns.repeatedChars.risk,
                message: this.patterns.repeatedChars.message
            });
            score += this.riskWeights.pattern;
        }
        
        // Check money symbols
        if (this.patterns.moneySymbols.pattern.test(text)) {
            flags.push({
                term: 'Multiple money symbols',
                category: 'pattern',
                risk: this.patterns.moneySymbols.risk,
                message: this.patterns.moneySymbols.message
            });
            score += this.riskWeights.pattern;
        }
        
        return { flags, score };
    },
    
    /**
     * Get clean text summary (for display)
     * @param {object} scanResult - Result from scan()
     * @returns {string} Human-readable summary
     */
    getSummary: function(scanResult) {
        if (scanResult.flagCount === 0) {
            return 'No flagged content detected.';
        }
        
        const parts = [];
        if (scanResult.highRiskCount > 0) {
            parts.push(`${scanResult.highRiskCount} high-risk`);
        }
        if (scanResult.mediumRiskCount > 0) {
            parts.push(`${scanResult.mediumRiskCount} medium-risk`);
        }
        if (scanResult.lowRiskCount > 0) {
            parts.push(`${scanResult.lowRiskCount} low-risk`);
        }
        
        return `Found ${parts.join(', ')} term(s) that may affect visibility.`;
    }
};

// Log loaded
console.log('✅ Flagged words database loaded');
