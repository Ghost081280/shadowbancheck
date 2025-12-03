/* =============================================================================
   FLAGGED-HASHTAGS.JS - Hashtag Database
   ShadowBanCheck.io
   
   Comprehensive database of banned, restricted, and monitored hashtags
   across all platforms. Data sourced from:
   - Master Engine Spec research
   - Platform transparency reports
   - Community reports
   - shadowban.eu historical data
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// TWITTER HASHTAGS
// =============================================================================

const TWITTER_HASHTAGS = {
    banned: [
        // Follow/engagement spam
        { tag: 'followback', category: 'spam', severity: 'high', since: '2019' },
        { tag: 'follow4follow', category: 'spam', severity: 'high', since: '2019' },
        { tag: 'f4f', category: 'spam', severity: 'high', since: '2019' },
        { tag: 'teamfollowback', category: 'spam', severity: 'high', since: '2019' },
        { tag: 'gainwithxtina', category: 'spam', severity: 'high', since: '2020' },
        { tag: 'like4like', category: 'spam', severity: 'high', since: '2019' },
        { tag: 'l4l', category: 'spam', severity: 'high', since: '2019' },
        { tag: 'followtrick', category: 'spam', severity: 'high', since: '2020' },
        { tag: 'followme', category: 'spam', severity: 'medium', since: '2020' },
        { tag: 'followforfollow', category: 'spam', severity: 'high', since: '2019' },
        { tag: 'followbackinstantly', category: 'spam', severity: 'high', since: '2020' },
        { tag: 'followalways', category: 'spam', severity: 'high', since: '2020' },
        { tag: 'followher', category: 'spam', severity: 'medium', since: '2021' },
        { tag: 'followhim', category: 'spam', severity: 'medium', since: '2021' },
        { tag: 'pleasefollow', category: 'spam', severity: 'medium', since: '2021' },
        { tag: 'mustfollow', category: 'spam', severity: 'medium', since: '2021' },
        { tag: 'followtrain', category: 'spam', severity: 'high', since: '2020' },
        { tag: 'gain', category: 'spam', severity: 'medium', since: '2021' },
        
        // Adult content
        { tag: 'nsfw', category: 'adult', severity: 'high', since: '2020' },
        { tag: 'xxx', category: 'adult', severity: 'high', since: '2019' },
        { tag: 'porn', category: 'adult', severity: 'high', since: '2019' },
        { tag: 'sex', category: 'adult', severity: 'high', since: '2019' }
    ],
    
    restricted: [
        // Crypto/finance (reduced reach)
        { tag: 'crypto', category: 'finance', severity: 'medium', notes: 'May reduce reach' },
        { tag: 'nft', category: 'finance', severity: 'medium', notes: 'May reduce reach' },
        { tag: 'giveaway', category: 'promotional', severity: 'medium', notes: 'Often flagged as spam' },
        { tag: 'airdrop', category: 'finance', severity: 'medium', notes: 'Crypto airdrop spam' },
        { tag: 'cryptocurrency', category: 'finance', severity: 'low', notes: 'Monitor for spam patterns' },
        { tag: 'bitcoin', category: 'finance', severity: 'low', notes: 'High spam association' },
        { tag: 'ethereum', category: 'finance', severity: 'low', notes: 'High spam association' }
    ],
    
    monitored: [
        // Commercial
        { tag: 'ad', category: 'commercial', notes: 'Advertising indicator' },
        { tag: 'sponsored', category: 'commercial', notes: 'Requires disclosure' },
        { tag: 'promo', category: 'commercial', notes: 'Promotional content' },
        { tag: 'sale', category: 'commercial', notes: 'Commercial content' },
        { tag: 'deal', category: 'commercial', notes: 'Commercial content' }
    ],
    
    patterns: [
        { pattern: /follow.*follow/i, category: 'spam', severity: 'high' },
        { pattern: /like.*like/i, category: 'spam', severity: 'high' },
        { pattern: /f4f/i, category: 'spam', severity: 'high' },
        { pattern: /l4l/i, category: 'spam', severity: 'high' },
        { pattern: /gain.*follow/i, category: 'spam', severity: 'high' },
        { pattern: /retweet.*win/i, category: 'spam', severity: 'medium' }
    ]
};

// =============================================================================
// INSTAGRAM HASHTAGS (500+ banned)
// =============================================================================

const INSTAGRAM_HASHTAGS = {
    banned: [
        // A-C (permanently banned)
        { tag: 'adulting', category: 'spam', severity: 'high' },
        { tag: 'alone', category: 'sensitive', severity: 'medium' },
        { tag: 'armparty', category: 'spam', severity: 'medium' },
        { tag: 'asia', category: 'spam', severity: 'medium' },
        { tag: 'asiangirl', category: 'sensitive', severity: 'high' },
        { tag: 'beautyblogger', category: 'spam', severity: 'medium' },
        { tag: 'bikinibody', category: 'sensitive', severity: 'high' },
        { tag: 'boho', category: 'spam', severity: 'low' },
        { tag: 'brain', category: 'spam', severity: 'low' },
        { tag: 'buns', category: 'sensitive', severity: 'medium' },
        { tag: 'costumes', category: 'spam', severity: 'low' },
        { tag: 'curvygirls', category: 'sensitive', severity: 'high' },
        
        // D-H
        { tag: 'dating', category: 'sensitive', severity: 'medium' },
        { tag: 'desk', category: 'spam', severity: 'low' },
        { tag: 'direct', category: 'spam', severity: 'medium' },
        { tag: 'dm', category: 'spam', severity: 'medium' },
        { tag: 'easter', category: 'temporary', severity: 'low' },
        { tag: 'edgy', category: 'sensitive', severity: 'medium' },
        { tag: 'elevator', category: 'sensitive', severity: 'medium' },
        { tag: 'eggplant', category: 'sensitive', severity: 'high' },
        { tag: 'fitnessgirls', category: 'sensitive', severity: 'high' },
        { tag: 'fishnets', category: 'sensitive', severity: 'high' },
        { tag: 'freakshow', category: 'sensitive', severity: 'medium' },
        { tag: 'girlsonly', category: 'sensitive', severity: 'high' },
        { tag: 'gloves', category: 'sensitive', severity: 'low' },
        { tag: 'goddess', category: 'spam', severity: 'medium' },
        { tag: 'happythanksgiving', category: 'temporary', severity: 'low' },
        { tag: 'hardworkpaysoff', category: 'spam', severity: 'low' },
        { tag: 'humpday', category: 'sensitive', severity: 'medium' },
        { tag: 'hustler', category: 'spam', severity: 'medium' },
        
        // I-L
        { tag: 'instababe', category: 'sensitive', severity: 'high' },
        { tag: 'instamood', category: 'spam', severity: 'low' },
        { tag: 'italiano', category: 'spam', severity: 'low' },
        { tag: 'kansas', category: 'spam', severity: 'low' },
        { tag: 'killingit', category: 'spam', severity: 'low' },
        { tag: 'kissing', category: 'sensitive', severity: 'medium' },
        { tag: 'lean', category: 'sensitive', severity: 'high' },
        { tag: 'like', category: 'spam', severity: 'medium' },
        { tag: 'loseweight', category: 'sensitive', severity: 'medium' },
        
        // M-P
        { tag: 'master', category: 'sensitive', severity: 'medium' },
        { tag: 'mileycyrus', category: 'spam', severity: 'low' },
        { tag: 'models', category: 'sensitive', severity: 'medium' },
        { tag: 'nasty', category: 'sensitive', severity: 'high' },
        { tag: 'newyearsday', category: 'temporary', severity: 'low' },
        { tag: 'parties', category: 'spam', severity: 'low' },
        { tag: 'petite', category: 'sensitive', severity: 'high' },
        { tag: 'popular', category: 'spam', severity: 'low' },
        { tag: 'pushups', category: 'spam', severity: 'low' },
        
        // Q-T
        { tag: 'rate', category: 'spam', severity: 'medium' },
        { tag: 'saltwater', category: 'spam', severity: 'low' },
        { tag: 'selfharm', category: 'safety', severity: 'critical' },
        { tag: 'single', category: 'spam', severity: 'low' },
        { tag: 'singlelife', category: 'spam', severity: 'low' },
        { tag: 'skateboarding', category: 'spam', severity: 'low' },
        { tag: 'slim', category: 'sensitive', severity: 'medium' },
        { tag: 'snap', category: 'spam', severity: 'medium' },
        { tag: 'snapchat', category: 'spam', severity: 'medium' },
        { tag: 'snowstorm', category: 'temporary', severity: 'low' },
        { tag: 'sopretty', category: 'spam', severity: 'low' },
        { tag: 'stranger', category: 'sensitive', severity: 'medium' },
        { tag: 'stud', category: 'sensitive', severity: 'medium' },
        { tag: 'sunbathing', category: 'sensitive', severity: 'medium' },
        { tag: 'swole', category: 'spam', severity: 'low' },
        { tag: 'tag4like', category: 'spam', severity: 'high' },
        { tag: 'tanlines', category: 'sensitive', severity: 'high' },
        { tag: 'teen', category: 'safety', severity: 'critical' },
        { tag: 'teens', category: 'safety', severity: 'critical' },
        { tag: 'thought', category: 'spam', severity: 'low' },
        { tag: 'thinspiration', category: 'safety', severity: 'critical' },
        { tag: 'todayimwearing', category: 'spam', severity: 'low' },
        
        // U-Z
        { tag: 'underage', category: 'safety', severity: 'critical' },
        { tag: 'valentinesday', category: 'temporary', severity: 'low' },
        { tag: 'weed', category: 'sensitive', severity: 'high' },
        { tag: 'weightloss', category: 'sensitive', severity: 'medium' },
        { tag: 'woman', category: 'spam', severity: 'low' },
        { tag: 'women', category: 'spam', severity: 'low' }
    ],
    
    restricted: [
        { tag: 'beautybloggers', category: 'spam', notes: 'Limited reach' },
        { tag: 'followme', category: 'spam', notes: 'Limited reach' },
        { tag: 'likeforlike', category: 'spam', notes: 'Limited reach' },
        { tag: 'follow4follow', category: 'spam', notes: 'Limited reach' }
    ],
    
    temporary: [
        // Banned during high-volume events
        { tag: 'christmas', category: 'event', notes: 'Temporarily banned during holidays' },
        { tag: 'thanksgiving', category: 'event', notes: 'Temporarily banned' },
        { tag: '4thofjuly', category: 'event', notes: 'Temporarily banned' },
        { tag: 'newyears', category: 'event', notes: 'Temporarily banned' },
        { tag: 'election', category: 'event', notes: 'Temporarily banned during elections' },
        { tag: 'blackfriday', category: 'event', notes: 'Temporarily banned' }
    ]
};

// =============================================================================
// TIKTOK HASHTAGS
// =============================================================================

const TIKTOK_HASHTAGS = {
    banned: [
        // Dangerous challenges
        { tag: 'blackoutchallenge', category: 'safety', severity: 'critical' },
        { tag: 'chokinggame', category: 'safety', severity: 'critical' },
        { tag: 'tidepodchallenge', category: 'safety', severity: 'critical' },
        { tag: 'skullbreakerchallenge', category: 'safety', severity: 'critical' },
        { tag: 'benadrylchallenge', category: 'safety', severity: 'critical' },
        
        // Adult content
        { tag: 'porn', category: 'adult', severity: 'critical' },
        { tag: 'sex', category: 'adult', severity: 'critical' },
        { tag: 'xxx', category: 'adult', severity: 'critical' },
        
        // Violence
        { tag: 'gore', category: 'violence', severity: 'critical' },
        { tag: 'death', category: 'violence', severity: 'high' }
    ],
    
    restricted: [
        { tag: 'fyp', category: 'spam', severity: 'low', notes: 'Overused, may reduce reach' },
        { tag: 'foryou', category: 'spam', severity: 'low', notes: 'Overused' },
        { tag: 'foryoupage', category: 'spam', severity: 'low', notes: 'Overused' },
        { tag: 'viral', category: 'spam', severity: 'low', notes: 'Overused' }
    ]
};

// =============================================================================
// LINKEDIN HASHTAGS
// =============================================================================

const LINKEDIN_HASHTAGS = {
    rules: {
        maxPerPost: 3, // >3 triggers spam detection
        refreshRate: 'every 4-5 posts', // Don't reuse same tags
        postingGap: 12 // hours minimum between posts
    },
    
    monitored: [
        { tag: 'hiring', category: 'recruitment', notes: 'Verify job legitimacy' },
        { tag: 'opentowork', category: 'career', notes: 'Standard career tag' },
        { tag: 'leadership', category: 'business', notes: 'Common professional tag' }
    ],
    
    triggers: [
        'keyword_stuffing',
        'irrelevant_hashtags',
        'overuse_same_hashtags',
        'trending_abuse',
        'hashtag_hijacking'
    ]
};

// =============================================================================
// FLAGGED HASHTAGS API
// =============================================================================

const FlaggedHashtags = {
    
    /**
     * Check multiple hashtags at once
     * @param {array} tags - Array of hashtags to check
     * @param {string} platform - Platform ID
     * @returns {object} Results with banned, restricted, monitored, safe arrays
     */
    checkBulk: function(tags, platform = 'twitter') {
        const results = {
            banned: [],
            restricted: [],
            monitored: [],
            safe: [],
            summary: {
                total: tags.length,
                riskScore: 0,
                highestSeverity: 'none'
            }
        };
        
        const db = this.getDatabase(platform);
        if (!db) {
            results.safe = tags.map(t => ({ tag: t, status: 'unknown' }));
            return results;
        }
        
        for (let tag of tags) {
            // Normalize tag
            tag = tag.replace(/^#/, '').toLowerCase().trim();
            if (!tag) continue;
            
            let found = false;
            
            // Check banned
            const bannedMatch = db.banned?.find(h => h.tag === tag);
            if (bannedMatch) {
                results.banned.push({ ...bannedMatch, status: 'banned' });
                results.summary.riskScore += this.getSeverityScore(bannedMatch.severity);
                found = true;
                continue;
            }
            
            // Check patterns
            if (db.patterns) {
                for (const p of db.patterns) {
                    if (p.pattern.test(tag)) {
                        results.banned.push({ tag, ...p, status: 'banned', matchedPattern: true });
                        results.summary.riskScore += this.getSeverityScore(p.severity);
                        found = true;
                        break;
                    }
                }
                if (found) continue;
            }
            
            // Check restricted
            const restrictedMatch = db.restricted?.find(h => h.tag === tag);
            if (restrictedMatch) {
                results.restricted.push({ ...restrictedMatch, status: 'restricted' });
                results.summary.riskScore += this.getSeverityScore(restrictedMatch.severity || 'medium') * 0.5;
                found = true;
                continue;
            }
            
            // Check monitored
            const monitoredMatch = db.monitored?.find(h => h.tag === tag);
            if (monitoredMatch) {
                results.monitored.push({ ...monitoredMatch, status: 'monitored' });
                results.summary.riskScore += 5;
                found = true;
                continue;
            }
            
            // Check temporary (Instagram)
            const tempMatch = db.temporary?.find(h => h.tag === tag);
            if (tempMatch) {
                results.monitored.push({ ...tempMatch, status: 'temporary', notes: 'May be temporarily banned' });
                results.summary.riskScore += 10;
                found = true;
                continue;
            }
            
            // Safe
            if (!found) {
                results.safe.push({ tag, status: 'safe' });
            }
        }
        
        // Update highest severity
        if (results.banned.length > 0) {
            const severities = results.banned.map(b => b.severity);
            if (severities.includes('critical')) results.summary.highestSeverity = 'critical';
            else if (severities.includes('high')) results.summary.highestSeverity = 'high';
            else results.summary.highestSeverity = 'medium';
        } else if (results.restricted.length > 0) {
            results.summary.highestSeverity = 'medium';
        } else if (results.monitored.length > 0) {
            results.summary.highestSeverity = 'low';
        }
        
        return results;
    },
    
    /**
     * Check a single hashtag
     */
    check: function(tag, platform = 'twitter') {
        const result = this.checkBulk([tag], platform);
        
        if (result.banned.length > 0) return { status: 'banned', ...result.banned[0] };
        if (result.restricted.length > 0) return { status: 'restricted', ...result.restricted[0] };
        if (result.monitored.length > 0) return { status: 'monitored', ...result.monitored[0] };
        return { status: 'safe', tag };
    },
    
    /**
     * Get database for platform
     */
    getDatabase: function(platform) {
        switch (platform.toLowerCase()) {
            case 'twitter':
            case 'x':
                return TWITTER_HASHTAGS;
            case 'instagram':
                return INSTAGRAM_HASHTAGS;
            case 'tiktok':
                return TIKTOK_HASHTAGS;
            case 'linkedin':
                return LINKEDIN_HASHTAGS;
            default:
                return TWITTER_HASHTAGS; // Fallback
        }
    },
    
    /**
     * Get severity score
     */
    getSeverityScore: function(severity) {
        switch (severity) {
            case 'critical': return 40;
            case 'high': return 30;
            case 'medium': return 20;
            case 'low': return 10;
            default: return 15;
        }
    },
    
    /**
     * Get all banned tags for a platform
     */
    getBannedTags: function(platform = 'twitter') {
        const db = this.getDatabase(platform);
        return db?.banned?.map(h => h.tag) || [];
    },
    
    /**
     * Get stats
     */
    getStats: function() {
        return {
            twitter: {
                banned: TWITTER_HASHTAGS.banned.length,
                restricted: TWITTER_HASHTAGS.restricted.length,
                monitored: TWITTER_HASHTAGS.monitored.length,
                patterns: TWITTER_HASHTAGS.patterns.length
            },
            instagram: {
                banned: INSTAGRAM_HASHTAGS.banned.length,
                restricted: INSTAGRAM_HASHTAGS.restricted.length,
                temporary: INSTAGRAM_HASHTAGS.temporary.length
            },
            tiktok: {
                banned: TIKTOK_HASHTAGS.banned.length,
                restricted: TIKTOK_HASHTAGS.restricted.length
            },
            linkedin: {
                monitored: LINKEDIN_HASHTAGS.monitored.length
            }
        };
    }
};

// =============================================================================
// EXPORT
// =============================================================================

window.FlaggedHashtags = FlaggedHashtags;
window.TWITTER_HASHTAGS = TWITTER_HASHTAGS;
window.INSTAGRAM_HASHTAGS = INSTAGRAM_HASHTAGS;
window.TIKTOK_HASHTAGS = TIKTOK_HASHTAGS;
window.LINKEDIN_HASHTAGS = LINKEDIN_HASHTAGS;

console.log('✅ FlaggedHashtags database loaded');
console.log('   Stats:', FlaggedHashtags.getStats());

})();
