/* =============================================================================
   FLAGGED-CONTENT.JS - Content Database
   ShadowBanCheck.io
   
   Content pattern scanning for spam, promotional, and policy-violating text.
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// BANNED TERMS (Immediate flag)
// =============================================================================

const BANNED_TERMS = [
    // Explicit spam
    { term: 'follow me back', category: 'spam', severity: 'high', weight: 25 },
    { term: 'follow 4 follow', category: 'spam', severity: 'high', weight: 25 },
    { term: 'like 4 like', category: 'spam', severity: 'high', weight: 25 },
    { term: 'gain followers', category: 'spam', severity: 'high', weight: 25 },
    { term: 'get followers', category: 'spam', severity: 'high', weight: 20 },
    { term: 'free followers', category: 'spam', severity: 'high', weight: 30 },
    { term: 'buy followers', category: 'spam', severity: 'critical', weight: 35 },
    
    // Scam indicators
    { term: 'double your money', category: 'scam', severity: 'critical', weight: 40 },
    { term: 'guaranteed profit', category: 'scam', severity: 'critical', weight: 40 },
    { term: 'get rich quick', category: 'scam', severity: 'critical', weight: 35 },
    { term: 'work from home', category: 'scam', severity: 'medium', weight: 15 },
    { term: 'make money fast', category: 'scam', severity: 'high', weight: 30 },
    { term: 'passive income', category: 'scam', severity: 'low', weight: 10 },
    { term: 'financial freedom', category: 'promotional', severity: 'low', weight: 8 },
    
    // Crypto spam
    { term: 'free bitcoin', category: 'scam', severity: 'critical', weight: 35 },
    { term: 'free crypto', category: 'scam', severity: 'high', weight: 30 },
    { term: 'crypto giveaway', category: 'scam', severity: 'high', weight: 30 },
    { term: 'airdrop', category: 'crypto', severity: 'medium', weight: 15 },
    { term: 'to the moon', category: 'crypto', severity: 'low', weight: 5 },
    
    // Aggressive sales
    { term: 'buy now', category: 'promotional', severity: 'medium', weight: 15 },
    { term: 'limited time', category: 'promotional', severity: 'low', weight: 10 },
    { term: 'act now', category: 'promotional', severity: 'medium', weight: 12 },
    { term: 'click here', category: 'promotional', severity: 'medium', weight: 15 },
    { term: 'order now', category: 'promotional', severity: 'medium', weight: 12 },
    { term: 'don\'t miss', category: 'promotional', severity: 'low', weight: 8 },
    { term: 'last chance', category: 'promotional', severity: 'low', weight: 8 }
];

// =============================================================================
// RESTRICTED PATTERNS (Regex patterns)
// =============================================================================

const RESTRICTED_PATTERNS = [
    // Spam patterns
    { pattern: /follow.*back/i, category: 'spam', severity: 'high', weight: 20 },
    { pattern: /retweet.*to.*win/i, category: 'spam', severity: 'high', weight: 25 },
    { pattern: /like.*and.*rt/i, category: 'spam', severity: 'medium', weight: 15 },
    { pattern: /dm\s*(me|us)\s*for/i, category: 'spam', severity: 'medium', weight: 15 },
    { pattern: /check.*bio/i, category: 'promotional', severity: 'low', weight: 8 },
    { pattern: /link.*in.*bio/i, category: 'promotional', severity: 'low', weight: 8 },
    
    // Scam patterns
    { pattern: /send.*\d+.*get.*\d+/i, category: 'scam', severity: 'critical', weight: 40 },
    { pattern: /invest.*guaranteed/i, category: 'scam', severity: 'critical', weight: 35 },
    { pattern: /\d+%.*return/i, category: 'scam', severity: 'high', weight: 25 },
    { pattern: /earn.*\$\d+.*day/i, category: 'scam', severity: 'high', weight: 25 },
    
    // Contact solicitation
    { pattern: /whatsapp.*\+?\d{10,}/i, category: 'spam', severity: 'high', weight: 20 },
    { pattern: /telegram.*@\w+/i, category: 'spam', severity: 'medium', weight: 15 },
    { pattern: /dm.*for.*price/i, category: 'promotional', severity: 'medium', weight: 12 },
    
    // Engagement bait
    { pattern: /who.*agrees/i, category: 'engagement_bait', severity: 'low', weight: 5 },
    { pattern: /retweet.*if/i, category: 'engagement_bait', severity: 'low', weight: 5 },
    { pattern: /like.*if.*you/i, category: 'engagement_bait', severity: 'low', weight: 5 }
];

// =============================================================================
// STYLE ISSUES
// =============================================================================

const STYLE_THRESHOLDS = {
    capsRatio: {
        warning: 0.3,  // 30% caps
        danger: 0.5    // 50% caps
    },
    exclamationCount: {
        warning: 3,
        danger: 5
    },
    emojiDensity: {
        warning: 0.1,  // 10% of text
        danger: 0.2    // 20% of text
    },
    repetition: {
        warning: 3,    // Same word 3x
        danger: 5      // Same word 5x
    }
};

// =============================================================================
// FLAGGED CONTENT API
// =============================================================================

const FlaggedContent = {
    
    /**
     * Scan text for all issues
     * @param {string} text - Text to scan
     * @param {string} platform - Platform ID
     * @returns {object} Scan results with score and flags
     */
    scan: function(text, platform = 'twitter') {
        if (!text || typeof text !== 'string') {
            return { score: 0, flags: [], patterns: [], style: {} };
        }
        
        const lower = text.toLowerCase();
        const results = {
            score: 0,
            flags: [],
            patterns: [],
            style: {},
            summary: {
                bannedTerms: 0,
                restrictedPatterns: 0,
                styleIssues: 0
            }
        };
        
        // Check banned terms
        for (const term of BANNED_TERMS) {
            if (lower.includes(term.term.toLowerCase())) {
                results.flags.push({
                    type: 'banned_term',
                    term: term.term,
                    category: term.category,
                    severity: term.severity,
                    weight: term.weight
                });
                results.score += term.weight;
                results.summary.bannedTerms++;
            }
        }
        
        // Check restricted patterns
        for (const pat of RESTRICTED_PATTERNS) {
            if (pat.pattern.test(text)) {
                results.patterns.push({
                    type: 'restricted_pattern',
                    category: pat.category,
                    severity: pat.severity,
                    weight: pat.weight
                });
                results.score += pat.weight;
                results.summary.restrictedPatterns++;
            }
        }
        
        // Check style issues
        const styleIssues = this.checkStyle(text);
        results.style = styleIssues;
        results.score += styleIssues.score;
        results.summary.styleIssues = styleIssues.issues.length;
        
        // Add style issues to flags
        for (const issue of styleIssues.issues) {
            results.flags.push({
                type: 'style_issue',
                ...issue
            });
        }
        
        // Cap score at 100
        results.score = Math.min(100, results.score);
        
        return results;
    },
    
    /**
     * Check text style (caps, exclamations, etc.)
     */
    checkStyle: function(text) {
        const result = {
            score: 0,
            issues: [],
            metrics: {}
        };
        
        // Calculate caps ratio
        const letters = text.replace(/[^a-zA-Z]/g, '');
        const caps = (text.match(/[A-Z]/g) || []).length;
        const capsRatio = letters.length > 0 ? caps / letters.length : 0;
        result.metrics.capsRatio = Math.round(capsRatio * 100) / 100;
        
        if (capsRatio >= STYLE_THRESHOLDS.capsRatio.danger) {
            result.issues.push({
                issue: 'excessive_caps',
                severity: 'high',
                message: `${Math.round(capsRatio * 100)}% caps (>50% is excessive)`,
                weight: 15
            });
            result.score += 15;
        } else if (capsRatio >= STYLE_THRESHOLDS.capsRatio.warning) {
            result.issues.push({
                issue: 'high_caps',
                severity: 'medium',
                message: `${Math.round(capsRatio * 100)}% caps`,
                weight: 8
            });
            result.score += 8;
        }
        
        // Count exclamation marks
        const exclamations = (text.match(/!/g) || []).length;
        result.metrics.exclamations = exclamations;
        
        if (exclamations >= STYLE_THRESHOLDS.exclamationCount.danger) {
            result.issues.push({
                issue: 'excessive_exclamations',
                severity: 'medium',
                message: `${exclamations} exclamation marks`,
                weight: 10
            });
            result.score += 10;
        } else if (exclamations >= STYLE_THRESHOLDS.exclamationCount.warning) {
            result.issues.push({
                issue: 'many_exclamations',
                severity: 'low',
                message: `${exclamations} exclamation marks`,
                weight: 5
            });
            result.score += 5;
        }
        
        // Check repeated words
        const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const wordCount = {};
        for (const word of words) {
            wordCount[word] = (wordCount[word] || 0) + 1;
        }
        
        const maxRepeat = Math.max(...Object.values(wordCount), 0);
        result.metrics.maxWordRepetition = maxRepeat;
        
        if (maxRepeat >= STYLE_THRESHOLDS.repetition.danger) {
            const repeatedWord = Object.keys(wordCount).find(w => wordCount[w] === maxRepeat);
            result.issues.push({
                issue: 'word_repetition',
                severity: 'medium',
                message: `"${repeatedWord}" repeated ${maxRepeat} times`,
                weight: 8
            });
            result.score += 8;
        }
        
        // Check for all caps words
        const allCapsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
        result.metrics.allCapsWords = allCapsWords.length;
        
        if (allCapsWords.length >= 3) {
            result.issues.push({
                issue: 'shouting',
                severity: 'medium',
                message: `${allCapsWords.length} ALL CAPS words`,
                weight: 10
            });
            result.score += 10;
        }
        
        return result;
    },
    
    /**
     * Check if text contains banned content
     */
    hasBannedContent: function(text) {
        if (!text) return false;
        const lower = text.toLowerCase();
        return BANNED_TERMS.some(t => lower.includes(t.term.toLowerCase()));
    },
    
    /**
     * Get severity level from score
     */
    getSeverity: function(score) {
        if (score >= 50) return 'high';
        if (score >= 25) return 'medium';
        if (score >= 10) return 'low';
        return 'none';
    },
    
    /**
     * Get all banned terms
     */
    getBannedTerms: function() {
        return BANNED_TERMS.map(t => t.term);
    },
    
    /**
     * Get stats
     */
    getStats: function() {
        return {
            bannedTerms: BANNED_TERMS.length,
            restrictedPatterns: RESTRICTED_PATTERNS.length,
            categories: [...new Set([
                ...BANNED_TERMS.map(t => t.category),
                ...RESTRICTED_PATTERNS.map(p => p.category)
            ])]
        };
    }
};

// =============================================================================
// EXPORT
// =============================================================================

window.FlaggedContent = FlaggedContent;
window.BANNED_TERMS = BANNED_TERMS;
window.RESTRICTED_PATTERNS = RESTRICTED_PATTERNS;
window.STYLE_THRESHOLDS = STYLE_THRESHOLDS;

console.log('✅ FlaggedContent database loaded');
console.log('   Stats:', FlaggedContent.getStats());

})();
