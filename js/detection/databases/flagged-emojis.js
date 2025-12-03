/* =============================================================================
   FLAGGED-EMOJIS.JS - Emoji Database
   ShadowBanCheck.io
   
   Analysis of emoji usage patterns that may indicate spam or promotional content.
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// RISKY EMOJIS (Often associated with spam/scams)
// =============================================================================

const RISKY_EMOJIS = [
    // Money/finance emojis (crypto spam)
    { emoji: '💰', category: 'money', severity: 'medium', context: 'financial_spam', notes: 'Common in crypto scams' },
    { emoji: '💵', category: 'money', severity: 'medium', context: 'financial_spam' },
    { emoji: '💲', category: 'money', severity: 'medium', context: 'financial_spam' },
    { emoji: '🤑', category: 'money', severity: 'medium', context: 'financial_spam' },
    { emoji: '💎', category: 'money', severity: 'medium', context: 'crypto', notes: 'Diamond hands/crypto' },
    
    // Urgency emojis (promotional spam)
    { emoji: '🚀', category: 'urgency', severity: 'low', context: 'promotional', notes: 'To the moon - crypto' },
    { emoji: '🔥', category: 'urgency', severity: 'low', context: 'promotional', notes: 'Hype indicator' },
    { emoji: '⚡', category: 'urgency', severity: 'low', context: 'promotional' },
    { emoji: '💥', category: 'urgency', severity: 'low', context: 'promotional' },
    { emoji: '⏰', category: 'urgency', severity: 'low', context: 'promotional', notes: 'Limited time' },
    { emoji: '⏳', category: 'urgency', severity: 'low', context: 'promotional' },
    
    // Attention grabbers
    { emoji: '‼️', category: 'attention', severity: 'medium', context: 'spam' },
    { emoji: '❗', category: 'attention', severity: 'low', context: 'emphasis' },
    { emoji: '❓', category: 'attention', severity: 'low', context: 'engagement_bait' },
    { emoji: '⚠️', category: 'attention', severity: 'medium', context: 'clickbait' },
    { emoji: '🔴', category: 'attention', severity: 'low', context: 'live/urgent' },
    
    // Gift/giveaway (scam indicators)
    { emoji: '🎁', category: 'giveaway', severity: 'medium', context: 'scam', notes: 'Common in fake giveaways' },
    { emoji: '🎉', category: 'giveaway', severity: 'low', context: 'promotional' },
    { emoji: '🎊', category: 'giveaway', severity: 'low', context: 'promotional' },
    { emoji: '🏆', category: 'giveaway', severity: 'low', context: 'promotional' },
    
    // Pointing/direction (click bait)
    { emoji: '👇', category: 'direction', severity: 'low', context: 'engagement_bait' },
    { emoji: '👆', category: 'direction', severity: 'low', context: 'engagement_bait' },
    { emoji: '👉', category: 'direction', severity: 'low', context: 'promotional' },
    { emoji: '➡️', category: 'direction', severity: 'low', context: 'promotional' },
    { emoji: '⬇️', category: 'direction', severity: 'low', context: 'engagement_bait' }
];

// =============================================================================
// RISKY COMBINATIONS (Multiple emojis together)
// =============================================================================

const RISKY_COMBINATIONS = [
    // Crypto scam patterns
    { 
        emojis: ['💰', '🚀'], 
        category: 'crypto_spam', 
        severity: 'high',
        notes: 'Classic crypto pump signal'
    },
    { 
        emojis: ['💎', '🙌'], 
        category: 'crypto', 
        severity: 'medium',
        notes: 'Diamond hands'
    },
    { 
        emojis: ['🚀', '🌙'], 
        category: 'crypto', 
        severity: 'medium',
        notes: 'To the moon'
    },
    { 
        emojis: ['💰', '💵', '💲'], 
        category: 'money_spam', 
        severity: 'high',
        notes: 'Multiple money emojis'
    },
    
    // Urgency spam
    { 
        emojis: ['🔥', '🔥', '🔥'], 
        category: 'spam', 
        severity: 'medium',
        notes: 'Repeated fire emojis'
    },
    { 
        emojis: ['⚠️', '‼️'], 
        category: 'clickbait', 
        severity: 'high',
        notes: 'Warning/attention combo'
    },
    
    // Giveaway scam
    { 
        emojis: ['🎁', '🎉'], 
        category: 'giveaway_spam', 
        severity: 'medium',
        notes: 'Common in fake giveaways'
    }
];

// =============================================================================
// EMOJI EXTRACTION PATTERN
// =============================================================================

const EMOJI_PATTERN = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{203C}\u{2049}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu;

// =============================================================================
// FLAGGED EMOJIS API
// =============================================================================

const FlaggedEmojis = {
    
    /**
     * Extract emojis from text and check them
     * @param {string} text - Text to analyze
     * @param {string} platform - Platform ID
     * @returns {object} Results
     */
    extractAndCheck: function(text, platform = 'twitter') {
        if (!text) {
            return {
                emojis: [],
                risky: [],
                combinations: [],
                safe: [],
                summary: { total: 0, riskScore: 0 }
            };
        }
        
        // Extract all emojis
        const emojis = text.match(EMOJI_PATTERN) || [];
        
        const results = {
            emojis: emojis,
            risky: [],
            combinations: [],
            safe: [],
            summary: {
                total: emojis.length,
                unique: [...new Set(emojis)].length,
                riskScore: 0,
                density: text.length > 0 ? (emojis.length / text.length).toFixed(3) : 0
            }
        };
        
        // Check each emoji
        const emojiSet = new Set(emojis);
        for (const emoji of emojiSet) {
            const risky = RISKY_EMOJIS.find(r => r.emoji === emoji);
            if (risky) {
                const count = emojis.filter(e => e === emoji).length;
                results.risky.push({
                    emoji,
                    count,
                    ...risky
                });
                results.summary.riskScore += this.getSeverityScore(risky.severity) * Math.min(count, 3);
            } else {
                results.safe.push(emoji);
            }
        }
        
        // Check combinations
        for (const combo of RISKY_COMBINATIONS) {
            if (combo.emojis.every(e => emojiSet.has(e))) {
                results.combinations.push({
                    ...combo,
                    found: combo.emojis
                });
                results.summary.riskScore += this.getSeverityScore(combo.severity);
            }
        }
        
        // Check for excessive emoji usage
        if (emojis.length >= 10) {
            results.summary.riskScore += 10;
            results.combinations.push({
                category: 'excessive_emojis',
                severity: 'medium',
                notes: `${emojis.length} emojis in text`
            });
        } else if (emojis.length >= 5) {
            results.summary.riskScore += 5;
        }
        
        // Check for repeated emojis
        for (const emoji of emojiSet) {
            const count = emojis.filter(e => e === emoji).length;
            if (count >= 4) {
                results.summary.riskScore += 8;
                if (!results.combinations.find(c => c.category === 'emoji_spam')) {
                    results.combinations.push({
                        category: 'emoji_spam',
                        severity: 'medium',
                        notes: `"${emoji}" repeated ${count} times`
                    });
                }
            }
        }
        
        return results;
    },
    
    /**
     * Check specific emojis
     */
    checkBulk: function(emojis, platform = 'twitter') {
        return this.extractAndCheck(emojis.join(''), platform);
    },
    
    /**
     * Check if emoji is risky
     */
    isRisky: function(emoji) {
        return RISKY_EMOJIS.some(r => r.emoji === emoji);
    },
    
    /**
     * Get risk info for emoji
     */
    getRiskInfo: function(emoji) {
        return RISKY_EMOJIS.find(r => r.emoji === emoji);
    },
    
    /**
     * Get severity score
     */
    getSeverityScore: function(severity) {
        switch (severity) {
            case 'high': return 15;
            case 'medium': return 8;
            case 'low': return 3;
            default: return 5;
        }
    },
    
    /**
     * Get all risky emojis
     */
    getRiskyEmojis: function() {
        return RISKY_EMOJIS.map(r => r.emoji);
    },
    
    /**
     * Get stats
     */
    getStats: function() {
        return {
            riskyEmojis: RISKY_EMOJIS.length,
            riskyCombinations: RISKY_COMBINATIONS.length,
            categories: [...new Set(RISKY_EMOJIS.map(e => e.category))]
        };
    }
};

// =============================================================================
// EXPORT
// =============================================================================

window.FlaggedEmojis = FlaggedEmojis;
window.RISKY_EMOJIS = RISKY_EMOJIS;
window.RISKY_COMBINATIONS = RISKY_COMBINATIONS;

console.log('✅ FlaggedEmojis database loaded');
console.log('   Stats:', FlaggedEmojis.getStats());

})();
