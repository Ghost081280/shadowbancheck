/* =============================================================================
   FLAGGED-MENTIONS.JS - Mention Database
   ShadowBanCheck.io
   
   Patterns for detecting bot accounts, spam networks, and suspicious mentions.
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// BOT PATTERNS
// =============================================================================

const BOT_PATTERNS = [
    // Numeric suffix patterns (likely automated)
    { pattern: /^[a-z]+\d{5,}$/i, type: 'numeric_suffix', severity: 'high', notes: 'Username with 5+ digits' },
    { pattern: /^\d+[a-z]+\d+$/i, type: 'numeric_sandwich', severity: 'high', notes: 'Numbers surrounding letters' },
    
    // Default Twitter names
    { pattern: /^user\d+$/i, type: 'default_name', severity: 'high', notes: 'Default username pattern' },
    { pattern: /^newuser\d+$/i, type: 'default_name', severity: 'high', notes: 'New user pattern' },
    
    // Explicit bot indicators
    { pattern: /bot$/i, type: 'explicit_bot', severity: 'medium', notes: 'Ends with "bot"' },
    { pattern: /^bot/i, type: 'explicit_bot', severity: 'medium', notes: 'Starts with "bot"' },
    { pattern: /_bot_/i, type: 'explicit_bot', severity: 'medium', notes: 'Contains "_bot_"' },
    
    // Automated posting patterns
    { pattern: /autopost/i, type: 'automation', severity: 'medium' },
    { pattern: /autopilot/i, type: 'automation', severity: 'medium' },
    { pattern: /scheduler/i, type: 'automation', severity: 'low' },
    
    // Random character patterns
    { pattern: /^[a-z]{2,3}\d[a-z]\d[a-z]\d+$/i, type: 'random', severity: 'high', notes: 'Random character pattern' },
    { pattern: /^[bcdfghjklmnpqrstvwxz]{5,}$/i, type: 'random', severity: 'medium', notes: 'No vowels - likely generated' }
];

// =============================================================================
// SPAM ACCOUNT PATTERNS
// =============================================================================

const SPAM_PATTERNS = [
    // Promotional accounts
    { pattern: /promo$/i, type: 'promotional', severity: 'medium' },
    { pattern: /deals$/i, type: 'promotional', severity: 'low' },
    { pattern: /offers$/i, type: 'promotional', severity: 'low' },
    { pattern: /discount/i, type: 'promotional', severity: 'low' },
    
    // Spam networks
    { pattern: /followback/i, type: 'spam_network', severity: 'high' },
    { pattern: /follow4follow/i, type: 'spam_network', severity: 'high' },
    { pattern: /f4f/i, type: 'spam_network', severity: 'high' },
    { pattern: /gainwith/i, type: 'spam_network', severity: 'high' },
    { pattern: /teamfollow/i, type: 'spam_network', severity: 'high' },
    
    // Fake engagement
    { pattern: /freelikes/i, type: 'fake_engagement', severity: 'critical' },
    { pattern: /buyfollowers/i, type: 'fake_engagement', severity: 'critical' },
    { pattern: /getfollowers/i, type: 'fake_engagement', severity: 'critical' },
    
    // Adult spam
    { pattern: /nsfw/i, type: 'adult', severity: 'high' },
    { pattern: /xxx/i, type: 'adult', severity: 'high' },
    { pattern: /onlyfans/i, type: 'adult', severity: 'medium' }
];

// =============================================================================
// KNOWN SPAM ACCOUNTS (would be populated from database)
// =============================================================================

const KNOWN_SPAM_ACCOUNTS = [
    // Placeholder - real implementation would check against database
];

// =============================================================================
// FLAGGED MENTIONS API
// =============================================================================

const FlaggedMentions = {
    
    /**
     * Check multiple mentions at once
     * @param {array} mentions - Array of usernames to check
     * @param {string} platform - Platform ID
     * @returns {object} Results
     */
    checkBulk: function(mentions, platform = 'twitter') {
        const results = {
            bots: [],
            spam: [],
            suspicious: [],
            safe: [],
            summary: {
                total: mentions.length,
                riskScore: 0
            }
        };
        
        for (let mention of mentions) {
            // Normalize mention
            mention = mention.replace(/^@/, '').toLowerCase().trim();
            if (!mention) continue;
            
            let categorized = false;
            
            // Check bot patterns
            for (const pattern of BOT_PATTERNS) {
                if (pattern.pattern.test(mention)) {
                    results.bots.push({
                        mention,
                        type: pattern.type,
                        severity: pattern.severity,
                        notes: pattern.notes || 'Bot pattern detected'
                    });
                    results.summary.riskScore += this.getSeverityScore(pattern.severity);
                    categorized = true;
                    break;
                }
            }
            if (categorized) continue;
            
            // Check spam patterns
            for (const pattern of SPAM_PATTERNS) {
                if (pattern.pattern.test(mention)) {
                    results.spam.push({
                        mention,
                        type: pattern.type,
                        severity: pattern.severity
                    });
                    results.summary.riskScore += this.getSeverityScore(pattern.severity);
                    categorized = true;
                    break;
                }
            }
            if (categorized) continue;
            
            // Check known spam accounts
            if (KNOWN_SPAM_ACCOUNTS.includes(mention)) {
                results.spam.push({
                    mention,
                    type: 'known_spam',
                    severity: 'high'
                });
                results.summary.riskScore += 25;
                continue;
            }
            
            // Check for suspicious patterns (weaker signals)
            if (this.hasSuspiciousPattern(mention)) {
                results.suspicious.push({
                    mention,
                    type: 'suspicious_pattern',
                    severity: 'low'
                });
                results.summary.riskScore += 5;
                continue;
            }
            
            // Safe
            results.safe.push(mention);
        }
        
        return results;
    },
    
    /**
     * Check a single mention
     */
    check: function(mention, platform = 'twitter') {
        const result = this.checkBulk([mention], platform);
        
        if (result.bots.length > 0) return { status: 'bot', ...result.bots[0] };
        if (result.spam.length > 0) return { status: 'spam', ...result.spam[0] };
        if (result.suspicious.length > 0) return { status: 'suspicious', ...result.suspicious[0] };
        return { status: 'safe', mention };
    },
    
    /**
     * Check for weaker suspicious patterns
     */
    hasSuspiciousPattern: function(mention) {
        // Very short usernames
        if (mention.length <= 2) return true;
        
        // Too many underscores
        if ((mention.match(/_/g) || []).length >= 4) return true;
        
        // Ends with many numbers (3-4 digits)
        if (/\d{3,4}$/.test(mention)) return true;
        
        return false;
    },
    
    /**
     * Get severity score
     */
    getSeverityScore: function(severity) {
        switch (severity) {
            case 'critical': return 30;
            case 'high': return 20;
            case 'medium': return 12;
            case 'low': return 5;
            default: return 8;
        }
    },
    
    /**
     * Check if mention is likely a bot
     */
    isLikelyBot: function(mention) {
        const clean = mention.replace(/^@/, '').toLowerCase();
        return BOT_PATTERNS.some(p => p.pattern.test(clean));
    },
    
    /**
     * Get stats
     */
    getStats: function() {
        return {
            botPatterns: BOT_PATTERNS.length,
            spamPatterns: SPAM_PATTERNS.length,
            knownSpamAccounts: KNOWN_SPAM_ACCOUNTS.length
        };
    }
};

// =============================================================================
// EXPORT
// =============================================================================

window.FlaggedMentions = FlaggedMentions;
window.BOT_PATTERNS = BOT_PATTERNS;
window.SPAM_PATTERNS = SPAM_PATTERNS;

console.log('✅ FlaggedMentions database loaded');
console.log('   Stats:', FlaggedMentions.getStats());

})();
