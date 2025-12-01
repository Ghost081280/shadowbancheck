/* =============================================================================
   FLAGGED-MENTIONS.JS - @User Mentions Database
   ShadowBanCheck.io
   
   Database of @user mentions that may trigger platform filters or affect
   post visibility. Mentioning shadowbanned, suspended, or controversial
   accounts can reduce your own reach.
   
   Structure: { username, status, platforms, category, risk, reason, notes }
   
   Status Levels:
   - shadowbanned: Account is shadowbanned (mentioning may affect you)
   - suspended: Account is suspended (@ becomes dead link)
   - controversial: Account is known to trigger filters
   - monitored: Account is being watched by platform
   - bot: Known bot account
   - safe: Normal account
   
   Risk Levels:
   - high: Mentioning will likely affect your visibility
   - medium: May affect your visibility
   - low: Minimal impact
   
   Last Updated: 2025-01
   ============================================================================= */

(function() {
'use strict';

// ============================================================================
// MAIN DATABASE
// ============================================================================
window.FlaggedMentions = {
    
    // Version for cache busting and tracking
    version: '1.0.0',
    lastUpdated: '2025-01-01',
    
    // =========================================================================
    // MENTIONS DATABASE
    // Note: This is a sample database. In production, this would be
    // dynamically updated based on real-time account status checks.
    // =========================================================================
    mentions: [
        // =====================================================================
        // KNOWN SUSPENDED ACCOUNTS (Examples - Status may change)
        // =====================================================================
        // Note: We don't list specific real suspended accounts here for legal reasons
        // The engine will check account status in real-time via API
        
        // =====================================================================
        // BOT/SPAM ACCOUNT PATTERNS
        // =====================================================================
        { 
            username: '@follow4follow', 
            type: 'pattern',
            status: 'bot', 
            platforms: ['twitter', 'instagram'], 
            category: 'spam_bot',
            risk: 'high',
            reason: 'Follow-back bot pattern',
            notes: 'Accounts with this pattern are typically bots'
        },
        { 
            username: '@gain_', 
            type: 'pattern',
            status: 'bot', 
            platforms: ['twitter'], 
            category: 'spam_bot',
            risk: 'high',
            reason: 'Growth scheme bot pattern',
            notes: 'Prefix pattern for growth scheme bots'
        },
        { 
            username: '@free_followers', 
            type: 'pattern',
            status: 'bot', 
            platforms: ['twitter', 'instagram'], 
            category: 'spam_bot',
            risk: 'high',
            reason: 'Fake follower seller pattern',
            notes: null
        },
        { 
            username: '@crypto_signals', 
            type: 'pattern',
            status: 'bot', 
            platforms: ['twitter'], 
            category: 'spam_bot',
            risk: 'high',
            reason: 'Crypto scam signal bot pattern',
            notes: null
        },
        
        // =====================================================================
        // CONTROVERSIAL ACCOUNT PATTERNS
        // These are patterns, not specific accounts
        // =====================================================================
        { 
            username: '@anon', 
            type: 'pattern',
            status: 'monitored', 
            platforms: ['twitter'], 
            category: 'anonymous',
            risk: 'medium',
            reason: 'Anonymous accounts often monitored',
            notes: 'Not all anon accounts are problematic'
        },
        
        // =====================================================================
        // PLATFORM-SPECIFIC RISKY MENTIONS
        // =====================================================================
        { 
            username: '@everyone', 
            type: 'special',
            status: 'restricted', 
            platforms: ['discord'], 
            category: 'mass_mention',
            risk: 'medium',
            reason: 'Mass mention - often disabled',
            notes: 'Discord-specific'
        },
        { 
            username: '@here', 
            type: 'special',
            status: 'restricted', 
            platforms: ['discord'], 
            category: 'mass_mention',
            risk: 'low',
            reason: 'Online user mention',
            notes: 'Discord-specific'
        },
    ],
    
    // =========================================================================
    // MENTION PATTERNS TO FLAG
    // =========================================================================
    patterns: {
        // Patterns that suggest spam/bot behavior
        spamPatterns: [
            /^@\d{5,}$/,                    // All numbers (5+ digits)
            /^@[a-z]+\d{4,}$/i,             // Name + 4+ numbers
            /^@(follow|gain|free|crypto|nft|airdrop)_?\d*/i,  // Spam keywords
            /^@[a-z]{2,3}\d{6,}$/i,         // 2-3 letters + 6+ numbers
        ],
        
        // Patterns that suggest bot accounts
        botPatterns: [
            /bot$/i,                         // Ends with "bot"
            /_bot_/i,                        // Contains "_bot_"
            /^@(rt|retweet|like|follow)(4|for)/i,  // Engagement bait bots
        ],
        
        // Excessive mention patterns
        excessiveMentions: {
            twitter: 5,      // More than 5 mentions = spam signal
            instagram: 10,   // Instagram allows more
            reddit: 3,       // Reddit is stricter
            tiktok: 5,
            facebook: 10
        }
    },
    
    // =========================================================================
    // RISK WEIGHTS FOR SCORING
    // =========================================================================
    riskWeights: {
        high: 25,
        medium: 10,
        low: 3,
        pattern: 5,
        excessive: 15
    },
    
    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================
    
    /**
     * Check a single mention
     * @param {string} mention - Username to check (with or without @)
     * @param {string} platform - Platform ID
     * @returns {object} Check result
     */
    checkMention: function(mention, platform = 'twitter') {
        if (!mention) return { status: 'safe', found: false };
        
        // Normalize mention
        let normalized = mention.trim().toLowerCase();
        if (!normalized.startsWith('@')) {
            normalized = '@' + normalized;
        }
        
        // Check against database
        for (const entry of this.mentions) {
            if (entry.type === 'pattern') {
                // Check if mention matches pattern
                if (normalized.includes(entry.username.replace('@', ''))) {
                    const appliesToPlatform = entry.platforms.includes('all') || 
                                              entry.platforms.includes(platform);
                    if (appliesToPlatform) {
                        return {
                            ...entry,
                            matchedUsername: normalized,
                            found: true,
                            matchType: 'pattern'
                        };
                    }
                }
            } else {
                // Exact match
                if (entry.username.toLowerCase() === normalized) {
                    const appliesToPlatform = entry.platforms.includes('all') || 
                                              entry.platforms.includes(platform);
                    if (appliesToPlatform) {
                        return {
                            ...entry,
                            found: true,
                            matchType: 'exact'
                        };
                    }
                }
            }
        }
        
        // Check against regex patterns
        const patternCheck = this._checkPatterns(normalized);
        if (patternCheck.flagged) {
            return {
                username: normalized,
                type: 'pattern',
                status: patternCheck.status,
                platforms: ['all'],
                category: patternCheck.category,
                risk: patternCheck.risk,
                reason: patternCheck.reason,
                found: true,
                matchType: 'regex'
            };
        }
        
        return { 
            username: normalized,
            status: 'safe', 
            found: false,
            risk: 'low',
            notes: 'Not in flagged database - will check status via API'
        };
    },
    
    /**
     * Check multiple mentions at once
     * @param {array} mentions - Array of usernames
     * @param {string} platform - Platform ID
     * @returns {object} Bulk check results
     */
    checkBulk: function(mentions, platform = 'twitter') {
        const results = {
            total: mentions.length,
            flagged: [],
            safe: [],
            excessive: false,
            summary: {}
        };
        
        // Check if excessive mentions
        const threshold = this.patterns.excessiveMentions[platform] || 5;
        if (mentions.length > threshold) {
            results.excessive = true;
            results.excessiveMessage = `${mentions.length} mentions exceeds ${platform} threshold of ${threshold}`;
        }
        
        // Check each mention
        for (const mention of mentions) {
            const check = this.checkMention(mention, platform);
            
            if (check.status !== 'safe') {
                results.flagged.push(check);
            } else {
                results.safe.push(check);
            }
        }
        
        results.summary = {
            flaggedCount: results.flagged.length,
            safeCount: results.safe.length,
            excessiveMentions: results.excessive,
            riskScore: this._calculateRiskScore(results)
        };
        
        return results;
    },
    
    /**
     * Extract and check all mentions from text
     * @param {string} text - Text to scan
     * @param {string} platform - Platform ID
     * @returns {object} Extraction and check results
     */
    extractAndCheck: function(text, platform = 'twitter') {
        if (!text) return { mentions: [], results: null };
        
        // Extract mentions (handles @username format)
        const mentions = text.match(/@\w+/g) || [];
        
        // Also handle u/username for Reddit
        if (platform === 'reddit') {
            const redditMentions = text.match(/u\/\w+/g) || [];
            mentions.push(...redditMentions.map(m => '@' + m.replace('u/', '')));
        }
        
        // Check all mentions
        const results = this.checkBulk(mentions, platform);
        
        return {
            mentions,
            results
        };
    },
    
    /**
     * Get all flagged mentions for a category
     * @param {string} category - Category name
     * @param {string} platform - Platform ID (optional)
     * @returns {array} Matching entries
     */
    getByCategory: function(category, platform = null) {
        return this.mentions.filter(entry => {
            const matchesCategory = entry.category === category;
            const matchesPlatform = !platform || 
                                    entry.platforms.includes('all') || 
                                    entry.platforms.includes(platform);
            return matchesCategory && matchesPlatform;
        });
    },
    
    /**
     * Get database statistics
     * @returns {object} Stats
     */
    getStats: function() {
        const stats = {
            total: this.mentions.length,
            byStatus: {},
            byCategory: {},
            byRisk: {},
            patterns: {
                spam: this.patterns.spamPatterns.length,
                bot: this.patterns.botPatterns.length
            },
            version: this.version,
            lastUpdated: this.lastUpdated
        };
        
        for (const entry of this.mentions) {
            stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
            stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
            stats.byRisk[entry.risk] = (stats.byRisk[entry.risk] || 0) + 1;
        }
        
        return stats;
    },
    
    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================
    
    _checkPatterns: function(username) {
        // Check spam patterns
        for (const pattern of this.patterns.spamPatterns) {
            if (pattern.test(username)) {
                return {
                    flagged: true,
                    status: 'bot',
                    category: 'spam_bot',
                    risk: 'medium',
                    reason: 'Username matches spam pattern'
                };
            }
        }
        
        // Check bot patterns
        for (const pattern of this.patterns.botPatterns) {
            if (pattern.test(username)) {
                return {
                    flagged: true,
                    status: 'bot',
                    category: 'bot_account',
                    risk: 'low',
                    reason: 'Username matches bot pattern'
                };
            }
        }
        
        return { flagged: false };
    },
    
    _calculateRiskScore: function(results) {
        let score = 0;
        
        // Add points for flagged mentions
        for (const entry of results.flagged) {
            score += this.riskWeights[entry.risk] || 5;
        }
        
        // Add points for excessive mentions
        if (results.excessive) {
            score += this.riskWeights.excessive;
        }
        
        // Normalize to 0-100
        return Math.min(100, score);
    }
};

// ============================================================================
// BACKWARDS COMPATIBILITY
// ============================================================================
window.flaggedMentions = window.FlaggedMentions;

// ============================================================================
// INITIALIZATION
// ============================================================================
console.log('✅ FlaggedMentions database loaded');
console.log('   📊 Stats:', window.FlaggedMentions.getStats());

})();
