/* =============================================================================
   BANNED-HASHTAGS.JS - HASHTAG DATABASE
   ShadowBanCheck.io
   
   Database of banned, restricted, and risky hashtags across platforms.
   Platform-specific restrictions where applicable.
   
   Status Types:
   - banned: Completely blocked, will severely limit visibility
   - restricted: Limited reach, may trigger filters
   - caution: Overused or associated with spam
   - safe: No known issues
   
   Last Updated: 2025
   ============================================================================= */

window.BannedHashtags = {
    
    // =========================================================================
    // BANNED HASHTAGS - Will severely limit post visibility
    // =========================================================================
    banned: {
        // Adult/NSFW
        adult: [
            'porn', 'xxx', 'nsfw', 'nude', 'nudes', 'naked', 'sex',
            'sexy', 'hot', 'boobs', 'ass', 'dick', 'pussy', 
            'onlyfans', 'fansonly', 'linkinbio', 'lewd', 'hentai',
            'rule34', 'r34', 'adult', 'adulting', '18plus', '18+',
            'horny', 'thot', 'thicc', 'bikini', 'lingerie',
            'boudoir', 'implied', 'suggestive'
        ],
        
        // Violence
        violence: [
            'death', 'kill', 'murder', 'blood', 'gore', 'violence',
            'fight', 'attack', 'bomb', 'shooting', 'terrorist',
            'terrorism', 'massacre', 'genocide', 'execution'
        ],
        
        // Hate
        hate: [
            'nazi', 'nazis', 'hitler', 'whitepride', 'whitepower',
            'kkk', 'hategroup', 'racial', 'racist', 'racism',
            'supremacy', 'supremacist'
        ],
        
        // Drugs
        drugs: [
            'drugs', 'cocaine', 'heroin', 'meth', 'weed', 'marijuana',
            'cannabis', '420', 'stoner', 'high', 'gethi', 'blunt',
            'joint', 'bong', 'edibles', 'thc', 'cbd'
        ],
        
        // Illegal
        illegal: [
            'illegal', 'blackmarket', 'counterfeit', 'fake', 'stolen',
            'hack', 'hacking', 'ddos', 'malware', 'virus'
        ]
    },
    
    // =========================================================================
    // RESTRICTED HASHTAGS - Will reduce reach
    // =========================================================================
    restricted: {
        // Suggestive (not banned but limited)
        suggestive: [
            'babe', 'beautiful', 'gorgeous', 'hottie', 'curves',
            'booty', 'fitness', 'fitgirl', 'gymshark', 'yoga',
            'yogapants', 'leggings', 'model', 'models', 'modeling',
            'photoshoot', 'shoot', 'portrait', 'selfie'
        ],
        
        // Controversial
        controversial: [
            'politics', 'political', 'trump', 'biden', 'election',
            'vote', 'voting', 'democrat', 'republican', 'liberal',
            'conservative', 'leftist', 'rightist', 'protest',
            'blm', 'maga', 'qanon', 'conspiracy', 'woke'
        ],
        
        // Spam-associated
        spamAssociated: [
            'followme', 'followforfollow', 'f4f', 'follow4follow',
            'likeforlike', 'l4l', 'like4like', 'gainwithxena',
            'followtrain', 'followback', 'teamfollowback',
            'instagood', 'instadaily', 'instalike', 'instafollow',
            'gaintrick', 'gainpost', 'sdv', 'chuva'
        ],
        
        // Overused
        overused: [
            'love', 'happy', 'fun', 'life', 'lifestyle', 'mood',
            'vibes', 'blessed', 'goals', 'ootd', 'potd', 'photooftheday',
            'picoftheday', 'inspo', 'inspiration', 'motivation',
            'mindset', 'hustle', 'grind', 'success', 'entrepreneur'
        ],
        
        // Crypto (restricted on many platforms)
        crypto: [
            'crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'nft',
            'nfts', 'nftart', 'nftcommunity', 'cryptoart', 'defi',
            'web3', 'blockchain', 'altcoin', 'hodl', 'moon',
            'tothemoon', 'diamondhands', 'ape', 'degen'
        ],
        
        // Health misinformation risk
        healthRisk: [
            'vaccine', 'vaccination', 'covid', 'coronavirus', 'pandemic',
            'plandemic', 'antivax', 'novax', 'naturalimmunity',
            'ivermectin', 'hydroxychloroquine', 'cure'
        ]
    },
    
    // =========================================================================
    // PLATFORM-SPECIFIC RESTRICTIONS
    // =========================================================================
    platformSpecific: {
        twitter: {
            banned: ['shadowban', 'shadowbanned'],
            restricted: ['twitter', 'elonmusk', 'x'],
            notes: 'Twitter/X restricts some meta-hashtags about the platform itself'
        },
        
        instagram: {
            banned: [
                'alone', 'armparty', 'asiangirl', 'ass', 'assday',
                'beautyblogger', 'besties', 'bikinibody', 'boho',
                'brain', 'brandy', 'costumes', 'curvy', 'date',
                'dating', 'desk', 'direct', 'dm', 'easter',
                'edm', 'elevator', 'fishnets', 'freak', 'girlsonly',
                'gloves', 'goddess', 'graffitiigers', 'happythanksgiving',
                'hardworkpaysoff', 'hawks', 'humpday', 'hustler',
                'ice', 'ig', 'instababy', 'instamood', 'italiano',
                'kansas', 'killingit', 'kissing', 'lean', 'leaves',
                'like', 'lulu', 'master', 'mileycyrus', 'milf',
                'mirrorselfie', 'models', 'mustfollow', 'nasty',
                'newyears', 'newyearsday', 'overnight', 'parties',
                'petite', 'pornfood', 'prettygirl', 'pushups',
                'rate', 'ravens', 'selfharm', 'single', 'singlelife',
                'skateboarding', 'skype', 'snap', 'snapchat',
                'snowstorm', 'sopretty', 'stranger', 'streetphoto',
                'stud', 'sunbathing', 'swole', 'tag4like', 'tagsforlikes',
                'tanlines', 'teen', 'teens', 'thought', 'todayimwearing',
                'twerk', 'underage', 'valentinesday', 'workflow', 'wtf'
            ],
            restricted: [
                'beautyblogger', 'fitnessgirl', 'instafamous',
                'influencer', 'sponsored', 'ad', 'gifted'
            ],
            notes: 'Instagram has extensive banned hashtag list - over 500 known'
        },
        
        tiktok: {
            banned: [
                'suicide', 'selfharm', 'proana', 'promia',
                'thinspo', 'bonespo', 'edtwt', 'sh'
            ],
            restricted: [
                'fyp', 'foryou', 'foryoupage', 'viral', 'trending',
                'blowthisup', 'makemefamous'
            ],
            notes: 'TikTok restricts meta-tags about the algorithm'
        },
        
        linkedin: {
            restricted: [
                'crypto', 'bitcoin', 'nft', 'web3', 'blockchain',
                'hiring', 'jobsearch', 'opentowork', 'layoffs'
            ],
            notes: 'LinkedIn suppresses crypto content and some job-related spam'
        },
        
        youtube: {
            restricted: [
                'elsagate', 'challenge', 'prank', 'gone wrong',
                'shocking', 'exposed'
            ],
            notes: 'YouTube restricts sensational and potentially harmful challenge content'
        }
    },
    
    // =========================================================================
    // SAFE ALTERNATIVES - Suggestions for restricted hashtags
    // =========================================================================
    safeAlternatives: {
        'crypto': ['digitalassets', 'fintech', 'techfinance'],
        'bitcoin': ['digitalcurrency', 'btcnews', 'cryptonews'],
        'nft': ['digitalart', 'cryptoart', 'collectibles'],
        'followforfollow': ['community', 'connect', 'networking'],
        'f4f': ['supportsmallbusiness', 'smallbusiness'],
        'sexy': ['stylish', 'confident', 'aesthetic'],
        'hot': ['trending', 'viral', 'mustread'],
        'fitness': ['healthylifestyle', 'wellness', 'activelife'],
        'entrepreneur': ['founder', 'smallbusinessowner', 'startup'],
        'hustle': ['dedication', 'workethic', 'persistence'],
        'grind': ['consistency', 'progress', 'journey'],
        'money': ['finance', 'investing', 'wealthbuilding'],
    },
    
    // =========================================================================
    // RISK WEIGHTS
    // =========================================================================
    riskWeights: {
        banned: 40,      // Each banned hashtag adds 40 to risk score
        restricted: 15,  // Each restricted hashtag adds 15
        caution: 5,      // Each caution hashtag adds 5
        platformBan: 50, // Platform-specific ban adds 50
    },
    
    // =========================================================================
    // SCANNING FUNCTIONS
    // =========================================================================
    
    /**
     * Check a single hashtag
     * @param {string} hashtag - Hashtag to check (with or without #)
     * @param {string} platform - Platform ID
     * @returns {object} Check result
     */
    check: function(hashtag, platform = 'twitter') {
        // Normalize: remove # and lowercase
        const tag = hashtag.replace(/^#/, '').toLowerCase();
        
        // Check platform-specific bans first
        const platformData = this.platformSpecific[platform];
        if (platformData) {
            if (platformData.banned && platformData.banned.includes(tag)) {
                return {
                    hashtag: '#' + tag,
                    status: 'banned',
                    risk: 'high',
                    reason: `Banned on ${platform}`,
                    alternative: this.safeAlternatives[tag] || null,
                    platformSpecific: true
                };
            }
            if (platformData.restricted && platformData.restricted.includes(tag)) {
                return {
                    hashtag: '#' + tag,
                    status: 'restricted',
                    risk: 'medium',
                    reason: `Restricted on ${platform}`,
                    alternative: this.safeAlternatives[tag] || null,
                    platformSpecific: true
                };
            }
        }
        
        // Check global banned
        for (const category in this.banned) {
            if (this.banned[category].includes(tag)) {
                return {
                    hashtag: '#' + tag,
                    status: 'banned',
                    risk: 'high',
                    reason: `Banned (${category})`,
                    category: category,
                    alternative: this.safeAlternatives[tag] || null
                };
            }
        }
        
        // Check global restricted
        for (const category in this.restricted) {
            if (this.restricted[category].includes(tag)) {
                return {
                    hashtag: '#' + tag,
                    status: 'restricted',
                    risk: 'medium',
                    reason: `Restricted (${category})`,
                    category: category,
                    alternative: this.safeAlternatives[tag] || null
                };
            }
        }
        
        // Safe
        return {
            hashtag: '#' + tag,
            status: 'safe',
            risk: 'none',
            reason: null,
            alternative: null
        };
    },
    
    /**
     * Check multiple hashtags
     * @param {string|array} input - Hashtags as string or array
     * @param {string} platform - Platform ID
     * @returns {object} Full analysis results
     */
    checkMultiple: function(input, platform = 'twitter') {
        // Parse input
        let hashtags = [];
        if (typeof input === 'string') {
            // Extract hashtags from string
            const matches = input.match(/#\w+/g) || [];
            hashtags = matches.map(h => h.replace('#', ''));
            
            // Also try comma/space separated
            if (hashtags.length === 0) {
                hashtags = input.split(/[\s,]+/)
                    .map(h => h.replace(/^#/, '').trim())
                    .filter(h => h.length > 0);
            }
        } else if (Array.isArray(input)) {
            hashtags = input.map(h => h.replace(/^#/, '').trim());
        }
        
        // Check each hashtag
        const results = hashtags.map(tag => this.check(tag, platform));
        
        // Calculate overall score
        let score = 0;
        const summary = {
            safe: 0,
            caution: 0,
            restricted: 0,
            banned: 0
        };
        
        results.forEach(result => {
            if (result.status === 'banned') {
                score += result.platformSpecific ? 
                    this.riskWeights.platformBan : 
                    this.riskWeights.banned;
                summary.banned++;
            } else if (result.status === 'restricted') {
                score += this.riskWeights.restricted;
                summary.restricted++;
            } else if (result.status === 'caution') {
                score += this.riskWeights.caution;
                summary.caution++;
            } else {
                summary.safe++;
            }
        });
        
        // Determine overall risk level
        let overallRisk = 'none';
        if (summary.banned > 0) overallRisk = 'high';
        else if (summary.restricted > 0) overallRisk = 'medium';
        else if (summary.caution > 0) overallRisk = 'low';
        
        // Generate probability score (0-100)
        const probability = Math.min(score, 100);
        
        return {
            platform: platform,
            hashtagsChecked: hashtags.length,
            results: results,
            summary: summary,
            score: score,
            probability: probability,
            overallRisk: overallRisk,
            
            // Convenience getters
            bannedTags: results.filter(r => r.status === 'banned'),
            restrictedTags: results.filter(r => r.status === 'restricted'),
            safeTags: results.filter(r => r.status === 'safe'),
            
            // Recommendations
            recommendations: this.generateRecommendations(results)
        };
    },
    
    /**
     * Generate recommendations based on results
     * @param {array} results - Array of check results
     * @returns {array} Array of recommendation strings
     */
    generateRecommendations: function(results) {
        const recommendations = [];
        
        const banned = results.filter(r => r.status === 'banned');
        const restricted = results.filter(r => r.status === 'restricted');
        
        // Recommendations for banned
        banned.forEach(result => {
            if (result.alternative && result.alternative.length > 0) {
                recommendations.push(
                    `Remove ${result.hashtag} (banned). Try: #${result.alternative[0]} instead.`
                );
            } else {
                recommendations.push(
                    `Remove ${result.hashtag} - this hashtag is banned and will limit your post visibility.`
                );
            }
        });
        
        // Recommendations for restricted
        restricted.forEach(result => {
            if (result.alternative && result.alternative.length > 0) {
                recommendations.push(
                    `Consider replacing ${result.hashtag} with #${result.alternative[0]} for better reach.`
                );
            } else {
                recommendations.push(
                    `${result.hashtag} is restricted and may reduce your reach.`
                );
            }
        });
        
        // General recommendations
        if (results.length > 10) {
            recommendations.push(
                'Using too many hashtags can trigger spam filters. Consider using 5-10 targeted hashtags.'
            );
        }
        
        return recommendations;
    },
    
    /**
     * Get safe hashtags only (filter out risky ones)
     * @param {array} results - Results from checkMultiple
     * @returns {array} Array of safe hashtag strings
     */
    getSafeOnly: function(results) {
        if (!results || !results.results) return [];
        return results.results
            .filter(r => r.status === 'safe')
            .map(r => r.hashtag);
    },
    
    /**
     * Get platform notes
     * @param {string} platform - Platform ID
     * @returns {string|null} Platform-specific notes
     */
    getPlatformNotes: function(platform) {
        const data = this.platformSpecific[platform];
        return data ? data.notes : null;
    },
    
    /**
     * Count total known banned/restricted hashtags
     * @returns {object} Counts object
     */
    getCounts: function() {
        let banned = 0;
        let restricted = 0;
        
        for (const category in this.banned) {
            banned += this.banned[category].length;
        }
        for (const category in this.restricted) {
            restricted += this.restricted[category].length;
        }
        
        // Add platform-specific
        for (const platform in this.platformSpecific) {
            const p = this.platformSpecific[platform];
            if (p.banned) banned += p.banned.length;
            if (p.restricted) restricted += p.restricted.length;
        }
        
        return {
            banned: banned,
            restricted: restricted,
            total: banned + restricted
        };
    }
};

// Log loaded
const counts = window.BannedHashtags.getCounts();
console.log(`✅ Banned hashtags database loaded: ${counts.banned} banned, ${counts.restricted} restricted (${counts.total} total)`);
