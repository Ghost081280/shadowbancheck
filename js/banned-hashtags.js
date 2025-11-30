/* =============================================================================
   BANNED-HASHTAGS.JS - Local Hashtag Database
   ShadowBanCheck.io
   
   Local fallback database for when the real-time API is unavailable.
   This is a subset of the full database - the API has more comprehensive data.
   
   Structure: { platform: { banned: [], restricted: [] } }
   ============================================================================= */

(function() {
'use strict';

window.bannedHashtags = {
    
    // ========================================
    // TWITTER/X
    // ========================================
    twitter: {
        banned: [
            // Engagement manipulation
            'followback',
            'teamfollowback',
            'tfb',
            'followtrain',
            'gainfollowers',
            'followforfollow',
            'f4f',
            'follow4follow',
            'followme',
            'followalways',
            'instantfollow',
            'autofollow',
            // Growth schemes
            'gainwithxyla',
            'gainwithspxces',
            'gainwiththepit',
            'gainwithcali',
            'chloegrewup',
            'kyliegrewup',
            // Spam indicators
            'openfollow',
            'mustfollow',
            'followgain',
            'followloop',
            'followparty'
        ],
        restricted: [
            // Adult/NSFW
            'nsfw',
            'nsfwtwt',
            'adult',
            'xxx',
            'porn',
            'sex',
            'onlyfans',
            // Political (often restricted during elections)
            'maga',
            'qanon',
            'stopthesteal',
            'wwg1wga',
            // Engagement bait
            'like4like',
            'l4l',
            'rt4rt',
            'retweet4retweet',
            'spam4spam',
            's4s'
        ]
    },
    
    // ========================================
    // INSTAGRAM
    // Instagram has the most banned hashtags of any platform
    // ========================================
    instagram: {
        banned: [
            // Known permanent bans
            'adulting',
            'alone',
            'always',
            'americangirl',
            'arms',
            'attractive',
            'beautyblogger',
            'besties',
            'bikinibody',
            'boho',
            'brain',
            'costumes',
            'curvygirls',
            'czechgirl',
            'date',
            'dating',
            'desk',
            'direct',
            'dm',
            'dogsofinstagram',
            'drunk',
            'eggplant',
            'elevator',
            'fishnets',
            'fitnessgirls',
            'followforfollow',
            'girlsonly',
            'gloves',
            'goddess',
            'graffitiigers',
            'hardworkpaysoff',
            'hotweather',
            'hustler',
            'ice',
            'instababe',
            'instagrammers',
            'instamood',
            'iphonegraphy',
            'italiano',
            'kansas',
            'killingit',
            'kissing',
            'lean',
            'like',
            'likeforlike',
            'loseweight',
            'master',
            'milf',
            'mirrorselfie',
            'models',
            'mustfollow',
            'nasty',
            'newyears',
            'newyearsday',
            'nudity',
            'overnight',
            'parties',
            'petite',
            'pornfood',
            'prettygirl',
            'puberty',
            'pushups',
            'pussy',
            'rate',
            'ravens',
            'saltwater',
            'selfharm',
            'shit',
            'single',
            'singlelife',
            'skateboarding',
            'skype',
            'snap',
            'snapchat',
            'snowstorm',
            'sopretty',
            'stranger',
            'stud',
            'submission',
            'sugar',
            'sugardaddy',
            'sultry',
            'sunbathing',
            'swole',
            'tag4like',
            'tanlines',
            'teen',
            'teens',
            'thought',
            'todayimwearing',
            'twerk',
            'underage',
            'undies',
            'valentinesday',
            'workflow',
            'wtf',
            'womancrushwednesday'
        ],
        restricted: [
            // Engagement manipulation (reduced reach)
            'follow4follow',
            'f4f',
            'like4like',
            'l4l',
            'spam4spam',
            'shoutout4shoutout',
            's4s',
            'followback',
            'likeforfollow',
            'followforlike',
            // Overused tags (shadowbanned periodically)
            'repost',
            'tagsforlikes',
            'instalike',
            'instadaily',
            'photooftheday',
            'instagood',
            'followme',
            'picoftheday',
            'instapic',
            // Potentially problematic
            'curvy',
            'curves',
            'thicc',
            'thickthighs',
            'belfie',
            'bootygains'
        ]
    },
    
    // ========================================
    // TIKTOK
    // ========================================
    tiktok: {
        banned: [
            // Self-harm/suicide (strictly enforced)
            'suicide',
            'selfharm',
            'sh',
            'cutting',
            'suicidal',
            'kms',
            'kys',
            // Eating disorders
            'proana',
            'promia',
            'thinspo',
            'bonespo',
            'edtwt',
            'anarexia',
            'bulimia',
            'anarecovery',
            // Adult content
            'porn',
            'xxx',
            'nsfw',
            'sex',
            'nude',
            'naked'
        ],
        restricted: [
            // Overused/spam (reduced distribution)
            'fyp',
            'foryou',
            'foryoupage',
            'viral',
            'blowthisup',
            'goviral',
            'trending',
            'xyzbca',
            'xyz',
            'fypシ',
            // Engagement bait
            'duet',
            'stitch',
            'greenscreen',
            'pov',
            // Potentially sensitive
            'drama',
            'cancelled',
            'exposed',
            'storytime'
        ]
    },
    
    // ========================================
    // YOUTUBE
    // YouTube doesn't have traditional hashtag bans but restricts some topics
    // ========================================
    youtube: {
        banned: [
            // Dangerous content
            'elsagate',
            'challenge',
            'prank',
            // Misinformation categories
            'flatearth',
            'antivax'
        ],
        restricted: [
            // Demonetization triggers
            'covid',
            'coronavirus',
            'corona',
            'pandemic',
            'vaccine',
            'vaccination',
            // Controversial
            'conspiracy',
            'exposed',
            'drama',
            // Political
            'election',
            'politics',
            'trump',
            'biden'
        ]
    },
    
    // ========================================
    // FACEBOOK
    // ========================================
    facebook: {
        banned: [
            // Adult
            'porn',
            'xxx',
            'nsfw',
            'nude',
            // Hate speech indicators
            'nazi',
            'kkk'
        ],
        restricted: [
            // Engagement manipulation
            'followforfollow',
            'like4like',
            'share4share',
            'followback',
            // Spam
            'clickhere',
            'linkinbio',
            'dm',
            'promo'
        ]
    },
    
    // ========================================
    // CROSS-PLATFORM (applies to all)
    // ========================================
    all: {
        banned: [
            // Universal adult content
            'porn',
            'xxx',
            'nsfw',
            'nude',
            'naked',
            'sex',
            // Self-harm (universal policy)
            'suicide',
            'selfharm',
            'cutting',
            // Illegal
            'drugs',
            'cocaine',
            'heroin',
            'meth'
        ],
        restricted: [
            // Universal engagement manipulation
            'followforfollow',
            'f4f',
            'follow4follow',
            'like4like',
            'l4l',
            'followback',
            'likeforlike',
            'spam4spam'
        ]
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a hashtag is banned on a platform
 * @param {string} hashtag - Hashtag without #
 * @param {string} platform - Platform ID
 * @returns {string} 'banned', 'restricted', or 'safe'
 */
window.checkHashtagLocal = function(hashtag, platform) {
    const tag = hashtag.toLowerCase().replace('#', '');
    
    // Check platform-specific
    const platformData = window.bannedHashtags[platform];
    if (platformData) {
        if (platformData.banned && platformData.banned.includes(tag)) {
            return 'banned';
        }
        if (platformData.restricted && platformData.restricted.includes(tag)) {
            return 'restricted';
        }
    }
    
    // Check cross-platform
    const allData = window.bannedHashtags.all;
    if (allData) {
        if (allData.banned && allData.banned.includes(tag)) {
            return 'banned';
        }
        if (allData.restricted && allData.restricted.includes(tag)) {
            return 'restricted';
        }
    }
    
    return 'safe';
};

/**
 * Get all banned hashtags for a platform
 * @param {string} platform - Platform ID
 * @returns {Array} Array of banned hashtag strings
 */
window.getBannedHashtags = function(platform) {
    const result = [];
    
    const platformData = window.bannedHashtags[platform];
    if (platformData && platformData.banned) {
        result.push(...platformData.banned);
    }
    
    const allData = window.bannedHashtags.all;
    if (allData && allData.banned) {
        result.push(...allData.banned);
    }
    
    return [...new Set(result)]; // Remove duplicates
};

/**
 * Get statistics about the local database
 * @returns {Object} Stats object
 */
window.getLocalHashtagStats = function() {
    let totalBanned = 0;
    let totalRestricted = 0;
    const byPlatform = {};
    
    Object.entries(window.bannedHashtags).forEach(([platform, data]) => {
        const banned = data.banned ? data.banned.length : 0;
        const restricted = data.restricted ? data.restricted.length : 0;
        
        totalBanned += banned;
        totalRestricted += restricted;
        
        byPlatform[platform] = { banned, restricted, total: banned + restricted };
    });
    
    return {
        totalBanned,
        totalRestricted,
        total: totalBanned + totalRestricted,
        byPlatform,
        lastUpdated: '2024-11-01', // Update this when editing
        note: 'Local fallback database - real-time API has more comprehensive data'
    };
};

console.log('✅ Local hashtag database loaded');
console.log(`   📊 Stats:`, window.getLocalHashtagStats());

})();
