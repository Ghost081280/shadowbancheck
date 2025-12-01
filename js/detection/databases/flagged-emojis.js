/* =============================================================================
   FLAGGED-EMOJIS.JS - Emoji Risk Database
   ShadowBanCheck.io
   
   Database of emojis that may trigger platform content filters or affect
   post visibility. Some emojis have been co-opted for inappropriate content
   or are associated with spam/scam patterns.
   
   Structure: { emoji, name, status, platforms, category, risk, context, notes }
   
   Status Levels:
   - banned: Emoji triggers content removal
   - restricted: Emoji may reduce reach
   - monitored: Emoji is being watched, context-dependent
   - contextual: Safe alone, risky in combinations
   - safe: No known issues
   
   Last Updated: 2025-01
   ============================================================================= */

(function() {
'use strict';

// ============================================================================
// MAIN DATABASE
// ============================================================================
window.FlaggedEmojis = {
    
    // Version for cache busting and tracking
    version: '1.0.0',
    lastUpdated: '2025-01-01',
    
    // =========================================================================
    // EMOJI DATABASE
    // =========================================================================
    emojis: [
        // =====================================================================
        // VIOLENCE/WEAPONS - May trigger filters
        // =====================================================================
        { 
            emoji: '🔫', 
            name: 'pistol',
            status: 'monitored', 
            platforms: ['all'], 
            category: 'weapon',
            risk: 'medium',
            context: 'Context-dependent',
            notes: 'Apple changed to water gun, but still flagged on some platforms'
        },
        { 
            emoji: '💣', 
            name: 'bomb',
            status: 'restricted', 
            platforms: ['all'], 
            category: 'weapon',
            risk: 'medium',
            context: 'Even in playful context, may trigger review',
            notes: null
        },
        { 
            emoji: '🔪', 
            name: 'kitchen knife',
            status: 'monitored', 
            platforms: ['all'], 
            category: 'weapon',
            risk: 'low',
            context: 'Usually fine for cooking content',
            notes: null
        },
        { 
            emoji: '⚔️', 
            name: 'crossed swords',
            status: 'monitored', 
            platforms: ['all'], 
            category: 'weapon',
            risk: 'low',
            context: 'Gaming/fantasy context usually safe',
            notes: null
        },
        { 
            emoji: '🗡️', 
            name: 'dagger',
            status: 'monitored', 
            platforms: ['all'], 
            category: 'weapon',
            risk: 'low',
            context: null,
            notes: null
        },
        { 
            emoji: '💀', 
            name: 'skull',
            status: 'monitored', 
            platforms: ['tiktok'], 
            category: 'death',
            risk: 'low',
            context: 'Usually fine, but death-related content flagged',
            notes: 'TikTok more sensitive'
        },
        { 
            emoji: '☠️', 
            name: 'skull and crossbones',
            status: 'monitored', 
            platforms: ['all'], 
            category: 'death',
            risk: 'low',
            context: null,
            notes: null
        },
        
        // =====================================================================
        // SUGGESTIVE/ADULT - Often co-opted for inappropriate content
        // =====================================================================
        { 
            emoji: '🍆', 
            name: 'eggplant',
            status: 'restricted', 
            platforms: ['instagram', 'tiktok'], 
            category: 'suggestive',
            risk: 'high',
            context: 'Sexual connotation in Western culture',
            notes: '#eggplant banned on Instagram'
        },
        { 
            emoji: '🍑', 
            name: 'peach',
            status: 'restricted', 
            platforms: ['instagram', 'tiktok'], 
            category: 'suggestive',
            risk: 'high',
            context: 'Sexual connotation',
            notes: 'Often filtered in bios'
        },
        { 
            emoji: '💦', 
            name: 'sweat droplets',
            status: 'restricted', 
            platforms: ['instagram', 'tiktok'], 
            category: 'suggestive',
            risk: 'medium',
            context: 'Sexual connotation when combined with other emojis',
            notes: null
        },
        { 
            emoji: '🍌', 
            name: 'banana',
            status: 'monitored', 
            platforms: ['instagram', 'tiktok'], 
            category: 'suggestive',
            risk: 'medium',
            context: 'Can be flagged in suggestive context',
            notes: null
        },
        { 
            emoji: '🌶️', 
            name: 'hot pepper',
            status: 'monitored', 
            platforms: ['instagram', 'tiktok'], 
            category: 'suggestive',
            risk: 'low',
            context: 'Spicy content context',
            notes: null
        },
        { 
            emoji: '👅', 
            name: 'tongue',
            status: 'monitored', 
            platforms: ['instagram', 'tiktok'], 
            category: 'suggestive',
            risk: 'medium',
            context: 'Can be suggestive',
            notes: null
        },
        { 
            emoji: '🥵', 
            name: 'hot face',
            status: 'monitored', 
            platforms: ['tiktok'], 
            category: 'suggestive',
            risk: 'low',
            context: null,
            notes: null
        },
        { 
            emoji: '😏', 
            name: 'smirking face',
            status: 'monitored', 
            platforms: ['tiktok'], 
            category: 'suggestive',
            risk: 'low',
            context: 'Suggestive implication',
            notes: null
        },
        { 
            emoji: '🔥', 
            name: 'fire',
            status: 'safe', 
            platforms: ['all'], 
            category: 'suggestive',
            risk: 'low',
            context: 'Generally safe but overused',
            notes: 'Spam signal when excessive'
        },
        
        // =====================================================================
        // DRUGS/SUBSTANCES
        // =====================================================================
        { 
            emoji: '💊', 
            name: 'pill',
            status: 'restricted', 
            platforms: ['all'], 
            category: 'drugs',
            risk: 'high',
            context: 'Drug-related content often flagged',
            notes: null
        },
        { 
            emoji: '💉', 
            name: 'syringe',
            status: 'restricted', 
            platforms: ['all'], 
            category: 'drugs',
            risk: 'high',
            context: 'Drug or medical context',
            notes: 'Vaccine discussions may be affected'
        },
        { 
            emoji: '🍄', 
            name: 'mushroom',
            status: 'monitored', 
            platforms: ['all'], 
            category: 'drugs',
            risk: 'medium',
            context: 'Can imply psychedelics',
            notes: null
        },
        { 
            emoji: '🌿', 
            name: 'herb',
            status: 'monitored', 
            platforms: ['instagram', 'tiktok'], 
            category: 'drugs',
            risk: 'medium',
            context: 'Often used for cannabis',
            notes: null
        },
        { 
            emoji: '🍃', 
            name: 'leaf fluttering',
            status: 'monitored', 
            platforms: ['instagram', 'tiktok'], 
            category: 'drugs',
            risk: 'low',
            context: 'Cannabis association',
            notes: null
        },
        { 
            emoji: '🚬', 
            name: 'cigarette',
            status: 'restricted', 
            platforms: ['tiktok'], 
            category: 'drugs',
            risk: 'medium',
            context: 'Tobacco/smoking content restricted',
            notes: 'TikTok strict on tobacco'
        },
        { 
            emoji: '🍺', 
            name: 'beer mug',
            status: 'monitored', 
            platforms: ['tiktok'], 
            category: 'alcohol',
            risk: 'low',
            context: 'Alcohol content age-gated',
            notes: null
        },
        { 
            emoji: '🍷', 
            name: 'wine glass',
            status: 'monitored', 
            platforms: ['tiktok'], 
            category: 'alcohol',
            risk: 'low',
            context: 'Alcohol content age-gated',
            notes: null
        },
        { 
            emoji: '🥃', 
            name: 'tumbler glass',
            status: 'monitored', 
            platforms: ['tiktok'], 
            category: 'alcohol',
            risk: 'low',
            context: null,
            notes: null
        },
        
        // =====================================================================
        // MONEY/FINANCIAL - Spam indicators
        // =====================================================================
        { 
            emoji: '💰', 
            name: 'money bag',
            status: 'monitored', 
            platforms: ['all'], 
            category: 'money',
            risk: 'medium',
            context: 'Spam signal when excessive',
            notes: 'Common in scam content'
        },
        { 
            emoji: '💵', 
            name: 'dollar banknote',
            status: 'monitored', 
            platforms: ['all'], 
            category: 'money',
            risk: 'medium',
            context: 'Spam signal when excessive',
            notes: null
        },
        { 
            emoji: '💸', 
            name: 'money with wings',
            status: 'monitored', 
            platforms: ['all'], 
            category: 'money',
            risk: 'medium',
            context: 'Spam signal',
            notes: null
        },
        { 
            emoji: '🤑', 
            name: 'money-mouth face',
            status: 'monitored', 
            platforms: ['all'], 
            category: 'money',
            risk: 'medium',
            context: 'Get rich quick spam',
            notes: null
        },
        { 
            emoji: '📈', 
            name: 'chart increasing',
            status: 'monitored', 
            platforms: ['twitter'], 
            category: 'money',
            risk: 'low',
            context: 'Crypto/stock spam when combined with money emojis',
            notes: null
        },
        { 
            emoji: '🚀', 
            name: 'rocket',
            status: 'monitored', 
            platforms: ['twitter'], 
            category: 'money',
            risk: 'low',
            context: 'To the moon - crypto hype',
            notes: 'Safe in space/tech context'
        },
        { 
            emoji: '🌙', 
            name: 'crescent moon',
            status: 'safe', 
            platforms: ['all'], 
            category: 'money',
            risk: 'low',
            context: 'Moon/crypto context may be flagged',
            notes: null
        },
        { 
            emoji: '💎', 
            name: 'gem stone',
            status: 'monitored', 
            platforms: ['twitter'], 
            category: 'money',
            risk: 'low',
            context: 'Diamond hands - crypto culture',
            notes: null
        },
        
        // =====================================================================
        // RISKY COMBINATIONS
        // These are safe alone but risky when combined
        // =====================================================================
    ],
    
    // =========================================================================
    // RISKY EMOJI COMBINATIONS
    // =========================================================================
    combinations: [
        {
            emojis: ['🍆', '💦'],
            status: 'banned',
            platforms: ['instagram', 'tiktok'],
            risk: 'high',
            reason: 'Sexual implication'
        },
        {
            emojis: ['🍑', '💦'],
            status: 'banned',
            platforms: ['instagram', 'tiktok'],
            risk: 'high',
            reason: 'Sexual implication'
        },
        {
            emojis: ['🍆', '🍑'],
            status: 'restricted',
            platforms: ['instagram', 'tiktok'],
            risk: 'high',
            reason: 'Sexual implication'
        },
        {
            emojis: ['💰', '💰', '💰'],
            status: 'monitored',
            platforms: ['all'],
            risk: 'medium',
            reason: 'Spam/scam indicator'
        },
        {
            emojis: ['🚀', '📈', '💰'],
            status: 'monitored',
            platforms: ['twitter'],
            risk: 'medium',
            reason: 'Crypto pump pattern'
        },
        {
            emojis: ['🔥', '🔥', '🔥'],
            status: 'monitored',
            platforms: ['all'],
            risk: 'low',
            reason: 'Spam signal when excessive'
        },
        {
            emojis: ['💊', '💊', '💊'],
            status: 'restricted',
            platforms: ['all'],
            risk: 'high',
            reason: 'Drug-related spam'
        },
        {
            emojis: ['👅', '💦'],
            status: 'restricted',
            platforms: ['instagram', 'tiktok'],
            risk: 'high',
            reason: 'Sexual implication'
        },
    ],
    
    // =========================================================================
    // RISK WEIGHTS FOR SCORING
    // =========================================================================
    riskWeights: {
        high: 25,
        medium: 10,
        low: 3,
        combination: 15,
        excessive: 10
    },
    
    // =========================================================================
    // THRESHOLDS
    // =========================================================================
    thresholds: {
        // Max same emoji before spam signal
        sameEmojiLimit: 5,
        // Max total emojis before spam signal
        totalEmojiLimit: {
            twitter: 10,
            instagram: 15,
            tiktok: 10,
            reddit: 5,
            facebook: 15
        }
    },
    
    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================
    
    /**
     * Check a single emoji
     * @param {string} emoji - Emoji to check
     * @param {string} platform - Platform ID
     * @returns {object} Check result
     */
    checkEmoji: function(emoji, platform = 'twitter') {
        if (!emoji) return { status: 'safe', found: false };
        
        // Search database
        for (const entry of this.emojis) {
            if (entry.emoji === emoji) {
                const appliesToPlatform = entry.platforms.includes('all') || 
                                          entry.platforms.includes(platform);
                if (appliesToPlatform) {
                    return {
                        ...entry,
                        found: true
                    };
                }
            }
        }
        
        return { 
            emoji: emoji,
            status: 'safe', 
            found: false,
            risk: 'low',
            notes: 'Not in flagged database'
        };
    },
    
    /**
     * Check for risky emoji combinations in text
     * @param {string} text - Text containing emojis
     * @param {string} platform - Platform ID
     * @returns {array} Found risky combinations
     */
    checkCombinations: function(text, platform = 'twitter') {
        if (!text) return [];
        
        const foundCombinations = [];
        
        for (const combo of this.combinations) {
            const appliesToPlatform = combo.platforms.includes('all') || 
                                      combo.platforms.includes(platform);
            if (!appliesToPlatform) continue;
            
            // Check if all emojis in combination are present
            let allPresent = true;
            for (const emoji of combo.emojis) {
                if (!text.includes(emoji)) {
                    allPresent = false;
                    break;
                }
            }
            
            if (allPresent) {
                foundCombinations.push({
                    ...combo,
                    found: true
                });
            }
        }
        
        return foundCombinations;
    },
    
    /**
     * Extract and check all emojis from text
     * @param {string} text - Text to scan
     * @param {string} platform - Platform ID
     * @returns {object} Full analysis
     */
    extractAndCheck: function(text, platform = 'twitter') {
        if (!text) return { emojis: [], results: null };
        
        // Extract all emojis using comprehensive regex
        const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
        const emojis = text.match(emojiRegex) || [];
        
        // Count occurrences
        const emojiCounts = {};
        for (const emoji of emojis) {
            emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
        }
        
        // Check each unique emoji
        const flagged = [];
        const safe = [];
        const uniqueEmojis = [...new Set(emojis)];
        
        for (const emoji of uniqueEmojis) {
            const check = this.checkEmoji(emoji, platform);
            check.count = emojiCounts[emoji];
            
            if (check.status !== 'safe') {
                flagged.push(check);
            } else {
                safe.push(check);
            }
        }
        
        // Check combinations
        const combinations = this.checkCombinations(text, platform);
        
        // Check for excessive emojis
        const totalLimit = this.thresholds.totalEmojiLimit[platform] || 10;
        const excessive = emojis.length > totalLimit;
        
        // Check for repeated same emoji
        const repeatedEmoji = Object.entries(emojiCounts)
            .filter(([_, count]) => count >= this.thresholds.sameEmojiLimit)
            .map(([emoji, count]) => ({ emoji, count }));
        
        const results = {
            total: emojis.length,
            unique: uniqueEmojis.length,
            flagged,
            safe,
            combinations,
            excessive,
            repeatedEmoji,
            summary: {
                flaggedCount: flagged.length,
                safeCount: safe.length,
                combinationsCount: combinations.length,
                isExcessive: excessive,
                hasRepeated: repeatedEmoji.length > 0,
                riskScore: this._calculateRiskScore({
                    flagged,
                    combinations,
                    excessive,
                    repeatedEmoji
                })
            }
        };
        
        return {
            emojis,
            uniqueEmojis,
            emojiCounts,
            results
        };
    },
    
    /**
     * Get all emojis by category
     * @param {string} category - Category name
     * @param {string} platform - Platform ID (optional)
     * @returns {array} Matching emojis
     */
    getByCategory: function(category, platform = null) {
        return this.emojis.filter(entry => {
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
            total: this.emojis.length,
            combinations: this.combinations.length,
            byStatus: {},
            byCategory: {},
            byRisk: {},
            version: this.version,
            lastUpdated: this.lastUpdated
        };
        
        for (const entry of this.emojis) {
            stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
            stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
            stats.byRisk[entry.risk] = (stats.byRisk[entry.risk] || 0) + 1;
        }
        
        return stats;
    },
    
    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================
    
    _calculateRiskScore: function(data) {
        let score = 0;
        
        // Add points for flagged emojis
        for (const entry of data.flagged) {
            score += this.riskWeights[entry.risk] || 5;
        }
        
        // Add points for risky combinations
        score += data.combinations.length * this.riskWeights.combination;
        
        // Add points for excessive emojis
        if (data.excessive) {
            score += this.riskWeights.excessive;
        }
        
        // Add points for repeated emojis
        score += data.repeatedEmoji.length * 5;
        
        // Normalize to 0-100
        return Math.min(100, score);
    }
};

// ============================================================================
// BACKWARDS COMPATIBILITY
// ============================================================================
window.flaggedEmojis = window.FlaggedEmojis;

// ============================================================================
// INITIALIZATION
// ============================================================================
console.log('✅ FlaggedEmojis database loaded');
console.log('   📊 Stats:', window.FlaggedEmojis.getStats());

})();
