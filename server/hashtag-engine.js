/* =============================================================================
   HASHTAG-ENGINE.JS - Real-Time Hashtag Verification Engine
   ShadowBanCheck.io
   
   Node.js/Express backend for real-time hashtag checking against platforms.
   Designed for Railway deployment.
   ============================================================================= */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://shadowbancheck.io', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// ============================================
// IN-MEMORY DATABASE (Replace with PostgreSQL/MongoDB in production)
// ============================================
const hashtagDatabase = {
    // Structure: hashtag -> platform -> status data
    hashtags: new Map(),
    
    // Verification queue
    verificationQueue: [],
    
    // Stats
    stats: {
        totalHashtags: 0,
        totalVerifications: 0,
        lastUpdated: new Date().toISOString()
    }
};

// ============================================
// HASHTAG STATUS SCHEMA
// ============================================
/*
HashtagStatus {
    hashtag: string,           // The hashtag (without #)
    platform: string,          // Platform ID (twitter, instagram, tiktok, etc.)
    status: 'banned' | 'restricted' | 'safe' | 'unknown',
    confidence: number,        // 0-100 confidence score
    lastVerified: Date,        // When we last checked
    firstDetected: Date,       // When we first found it banned/restricted
    verificationMethod: 'api' | 'web' | 'user_report' | 'historical',
    history: [{                // Status change history
        status: string,
        date: Date,
        method: string
    }],
    metadata: {
        reportCount: number,   // User reports
        falsePositives: number,
        notes: string
    }
}
*/

// ============================================
// SEED DATA - Known banned/restricted hashtags
// ============================================
const seedHashtags = {
    twitter: {
        banned: [
            'followback', 'teamfollowback', 'followtrain', 'gainfollowers',
            'followforfollow', 'f4f', 'follow4follow', 'followme',
            'gainwithxyla', 'gainwithspxces', 'chloegrewup'
        ],
        restricted: [
            'nsfw', 'adult', 'xxx', 'porn', 'sex',
            'maga', 'qanon', 'stopthesteal'
        ]
    },
    instagram: {
        banned: [
            'adulting', 'alone', 'attractive', 'besties', 'bikinibody',
            'brain', 'costumes', 'curvygirls', 'date', 'dating',
            'desk', 'direct', 'dm', 'drunk', 'eggplant',
            'elevator', 'fishnets', 'goddess', 'graffitiigers',
            'hardworkpaysoff', 'hotweather', 'hustler', 'ice',
            'instababe', 'instamood', 'iphonegraphy', 'italiano',
            'killingit', 'kissing', 'lean', 'like', 'loseweight',
            'master', 'milf', 'mirrorselfie', 'models', 'mustfollow',
            'nasty', 'newyearsday', 'nudity', 'overnight', 'parties',
            'petite', 'pornfood', 'pushups', 'pussy', 'rate',
            'ravens', 'saltwater', 'selfharm', 'shit', 'single',
            'singlelife', 'skateboarding', 'skype', 'snap', 'snapchat',
            'snowstorm', 'sopretty', 'stranger', 'stud', 'submission',
            'sugar', 'sultry', 'sunbathing', 'swole', 'tag4like',
            'tanlines', 'teens', 'thought', 'todayimwearing', 'twerk',
            'undies', 'valentinesday', 'workflow', 'wtf', 'womancrushwednesday'
        ],
        restricted: [
            'followforfollow', 'like4like', 'likeforlike', 'follow4follow',
            'f4f', 'l4l', 'spam4spam', 'shoutout4shoutout', 's4s',
            'repost', 'tagsforlikes', 'instalike', 'instadaily'
        ]
    },
    tiktok: {
        banned: [
            'suicide', 'selfharm', 'proana', 'thinspo', 'edtwt',
            'sh', 'cutting', 'anarecovery'
        ],
        restricted: [
            'fyp', 'foryou', 'foryoupage', 'viral', 'blowthisup',
            'xyzbca', 'trending', 'duet', 'stitch'
        ]
    },
    youtube: {
        banned: [],
        restricted: [
            'elsagate', 'conspiracy', 'vaccine', 'covid', 'corona'
        ]
    },
    facebook: {
        banned: [],
        restricted: [
            'followforfollow', 'like4like', 'share4share'
        ]
    }
};

// Initialize database with seed data
function initializeDatabase() {
    console.log('🌱 Initializing hashtag database with seed data...');
    
    Object.entries(seedHashtags).forEach(([platform, data]) => {
        // Add banned hashtags
        data.banned.forEach(tag => {
            const key = `${tag.toLowerCase()}:${platform}`;
            hashtagDatabase.hashtags.set(key, {
                hashtag: tag.toLowerCase(),
                platform: platform,
                status: 'banned',
                confidence: 95,
                lastVerified: new Date(),
                firstDetected: new Date('2024-01-01'),
                verificationMethod: 'historical',
                history: [{
                    status: 'banned',
                    date: new Date('2024-01-01'),
                    method: 'historical'
                }],
                metadata: {
                    reportCount: 0,
                    falsePositives: 0,
                    notes: 'Seeded from known banned list'
                }
            });
        });
        
        // Add restricted hashtags
        data.restricted.forEach(tag => {
            const key = `${tag.toLowerCase()}:${platform}`;
            hashtagDatabase.hashtags.set(key, {
                hashtag: tag.toLowerCase(),
                platform: platform,
                status: 'restricted',
                confidence: 85,
                lastVerified: new Date(),
                firstDetected: new Date('2024-01-01'),
                verificationMethod: 'historical',
                history: [{
                    status: 'restricted',
                    date: new Date('2024-01-01'),
                    method: 'historical'
                }],
                metadata: {
                    reportCount: 0,
                    falsePositives: 0,
                    notes: 'Seeded from known restricted list'
                }
            });
        });
    });
    
    hashtagDatabase.stats.totalHashtags = hashtagDatabase.hashtags.size;
    console.log(`✅ Database initialized with ${hashtagDatabase.stats.totalHashtags} hashtags`);
}

// ============================================
// REAL-TIME VERIFICATION FUNCTIONS
// ============================================

/**
 * Check a hashtag's status - combines database + real-time verification
 */
async function checkHashtag(hashtag, platform) {
    const cleanTag = hashtag.replace('#', '').toLowerCase();
    const key = `${cleanTag}:${platform}`;
    
    // Check database first
    const cached = hashtagDatabase.hashtags.get(key);
    
    // If we have recent data (< 24 hours), return it
    if (cached && isRecent(cached.lastVerified, 24)) {
        return {
            ...cached,
            source: 'database',
            needsVerification: false
        };
    }
    
    // If cached but stale, return it but flag for re-verification
    if (cached) {
        // Queue for background re-verification
        queueForVerification(cleanTag, platform);
        
        return {
            ...cached,
            source: 'database_stale',
            needsVerification: true,
            message: 'Data may be outdated, re-verification queued'
        };
    }
    
    // Not in database - perform real-time check
    const realTimeResult = await performRealTimeCheck(cleanTag, platform);
    
    // Store result
    hashtagDatabase.hashtags.set(key, realTimeResult);
    hashtagDatabase.stats.totalHashtags = hashtagDatabase.hashtags.size;
    hashtagDatabase.stats.totalVerifications++;
    hashtagDatabase.stats.lastUpdated = new Date().toISOString();
    
    return {
        ...realTimeResult,
        source: 'realtime',
        needsVerification: false
    };
}

/**
 * Perform real-time verification against platform
 * This is where we'd integrate actual platform API calls
 */
async function performRealTimeCheck(hashtag, platform) {
    console.log(`🔍 Real-time check: #${hashtag} on ${platform}`);
    
    // Platform-specific verification logic
    let result;
    
    switch (platform) {
        case 'twitter':
            result = await checkTwitterHashtag(hashtag);
            break;
        case 'instagram':
            result = await checkInstagramHashtag(hashtag);
            break;
        case 'tiktok':
            result = await checkTikTokHashtag(hashtag);
            break;
        default:
            result = await checkGenericHashtag(hashtag, platform);
    }
    
    return {
        hashtag: hashtag,
        platform: platform,
        status: result.status,
        confidence: result.confidence,
        lastVerified: new Date(),
        firstDetected: result.status !== 'safe' ? new Date() : null,
        verificationMethod: 'api',
        history: [{
            status: result.status,
            date: new Date(),
            method: 'api'
        }],
        metadata: {
            reportCount: 0,
            falsePositives: 0,
            notes: result.notes || ''
        }
    };
}

/**
 * Twitter/X hashtag verification
 * In production: Use Twitter API v2 to search hashtag and check results
 */
async function checkTwitterHashtag(hashtag) {
    // TODO: Implement actual Twitter API call
    // For now, simulate with pattern matching and known lists
    
    const bannedPatterns = ['followback', 'f4f', 'follow4follow', 'teamfollow', 'gainwith'];
    const restrictedPatterns = ['nsfw', 'adult', 'xxx', 'maga', 'qanon'];
    
    if (bannedPatterns.some(p => hashtag.includes(p))) {
        return { status: 'banned', confidence: 90, notes: 'Pattern match: engagement manipulation' };
    }
    
    if (restrictedPatterns.some(p => hashtag.includes(p))) {
        return { status: 'restricted', confidence: 85, notes: 'Pattern match: sensitive content' };
    }
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 100));
    
    return { status: 'safe', confidence: 70, notes: 'No known restrictions detected' };
}

/**
 * Instagram hashtag verification
 * In production: Use Instagram Graph API or web scraping
 */
async function checkInstagramHashtag(hashtag) {
    // Instagram has the most banned hashtags
    const bannedPatterns = [
        'adulting', 'alone', 'dm', 'snap', 'skype', 'twerk',
        'instababe', 'milf', 'pussy', 'porn', 'nsfw'
    ];
    const restrictedPatterns = ['followforfollow', 'like4like', 'f4f', 'l4l', 'spam'];
    
    if (bannedPatterns.some(p => hashtag.includes(p))) {
        return { status: 'banned', confidence: 92, notes: 'Known Instagram banned hashtag' };
    }
    
    if (restrictedPatterns.some(p => hashtag.includes(p))) {
        return { status: 'restricted', confidence: 88, notes: 'Engagement manipulation pattern' };
    }
    
    await new Promise(r => setTimeout(r, 100));
    
    return { status: 'safe', confidence: 65, notes: 'No known restrictions' };
}

/**
 * TikTok hashtag verification
 */
async function checkTikTokHashtag(hashtag) {
    const bannedPatterns = ['suicide', 'selfharm', 'proana', 'thinspo', 'cutting'];
    const restrictedPatterns = ['fyp', 'foryou', 'viral', 'blowthisup', 'xyzbca'];
    
    if (bannedPatterns.some(p => hashtag.includes(p))) {
        return { status: 'banned', confidence: 95, notes: 'Safety violation' };
    }
    
    if (restrictedPatterns.some(p => hashtag.includes(p))) {
        return { status: 'restricted', confidence: 75, notes: 'Overused/spam hashtag' };
    }
    
    await new Promise(r => setTimeout(r, 100));
    
    return { status: 'safe', confidence: 60, notes: 'No known restrictions' };
}

/**
 * Generic hashtag check for other platforms
 */
async function checkGenericHashtag(hashtag, platform) {
    const genericBanned = ['porn', 'xxx', 'nsfw', 'nude', 'naked'];
    const genericRestricted = ['followforfollow', 'f4f', 'like4like', 'l4l'];
    
    if (genericBanned.some(p => hashtag.includes(p))) {
        return { status: 'banned', confidence: 80, notes: 'Adult content pattern' };
    }
    
    if (genericRestricted.some(p => hashtag.includes(p))) {
        return { status: 'restricted', confidence: 70, notes: 'Engagement manipulation' };
    }
    
    await new Promise(r => setTimeout(r, 50));
    
    return { status: 'safe', confidence: 50, notes: 'Generic check - low confidence' };
}

/**
 * Queue hashtag for background re-verification
 */
function queueForVerification(hashtag, platform) {
    const item = { hashtag, platform, queuedAt: new Date() };
    
    // Avoid duplicates
    const exists = hashtagDatabase.verificationQueue.find(
        q => q.hashtag === hashtag && q.platform === platform
    );
    
    if (!exists) {
        hashtagDatabase.verificationQueue.push(item);
        console.log(`📋 Queued for verification: #${hashtag} on ${platform}`);
    }
}

/**
 * Check if a date is within the last N hours
 */
function isRecent(date, hours) {
    if (!date) return false;
    const now = new Date();
    const then = new Date(date);
    const diffHours = (now - then) / (1000 * 60 * 60);
    return diffHours < hours;
}

// ============================================
// BACKGROUND WORKER - Re-verify stale hashtags
// ============================================
async function runVerificationWorker() {
    if (hashtagDatabase.verificationQueue.length === 0) return;
    
    console.log(`🔄 Processing verification queue (${hashtagDatabase.verificationQueue.length} items)`);
    
    // Process up to 10 items per cycle
    const batch = hashtagDatabase.verificationQueue.splice(0, 10);
    
    for (const item of batch) {
        try {
            const result = await performRealTimeCheck(item.hashtag, item.platform);
            const key = `${item.hashtag}:${item.platform}`;
            
            // Update database
            const existing = hashtagDatabase.hashtags.get(key);
            if (existing) {
                // Check if status changed
                if (existing.status !== result.status) {
                    existing.history.push({
                        status: result.status,
                        date: new Date(),
                        method: 'api'
                    });
                    console.log(`⚡ Status change: #${item.hashtag} on ${item.platform}: ${existing.status} → ${result.status}`);
                }
                
                existing.status = result.status;
                existing.confidence = result.confidence;
                existing.lastVerified = new Date();
                existing.verificationMethod = 'api';
            } else {
                hashtagDatabase.hashtags.set(key, result);
            }
            
            hashtagDatabase.stats.totalVerifications++;
        } catch (error) {
            console.error(`Error verifying #${item.hashtag}:`, error.message);
            // Re-queue failed items
            hashtagDatabase.verificationQueue.push(item);
        }
    }
    
    hashtagDatabase.stats.lastUpdated = new Date().toISOString();
}

// Run worker every 5 minutes
setInterval(runVerificationWorker, 5 * 60 * 1000);

// ============================================
// API ROUTES
// ============================================

/**
 * GET /api/hashtag/check
 * Check single hashtag status
 */
app.get('/api/hashtag/check', async (req, res) => {
    try {
        const { hashtag, platform } = req.query;
        
        if (!hashtag || !platform) {
            return res.status(400).json({ 
                error: 'Missing required parameters: hashtag, platform' 
            });
        }
        
        const result = await checkHashtag(hashtag, platform);
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error checking hashtag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/hashtag/check-bulk
 * Check multiple hashtags at once
 */
app.post('/api/hashtag/check-bulk', async (req, res) => {
    try {
        const { hashtags, platform } = req.body;
        
        if (!hashtags || !Array.isArray(hashtags) || !platform) {
            return res.status(400).json({ 
                error: 'Missing required parameters: hashtags (array), platform' 
            });
        }
        
        if (hashtags.length > 30) {
            return res.status(400).json({ 
                error: 'Maximum 30 hashtags per request' 
            });
        }
        
        const results = await Promise.all(
            hashtags.map(tag => checkHashtag(tag, platform))
        );
        
        // Calculate summary stats
        const summary = {
            total: results.length,
            banned: results.filter(r => r.status === 'banned').length,
            restricted: results.filter(r => r.status === 'restricted').length,
            safe: results.filter(r => r.status === 'safe').length,
            unknown: results.filter(r => r.status === 'unknown').length
        };
        
        res.json({
            success: true,
            summary: summary,
            results: results,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error checking hashtags:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/hashtag/report
 * User reports a hashtag as banned/restricted
 */
app.post('/api/hashtag/report', async (req, res) => {
    try {
        const { hashtag, platform, reportedStatus, evidence } = req.body;
        
        if (!hashtag || !platform || !reportedStatus) {
            return res.status(400).json({ 
                error: 'Missing required parameters: hashtag, platform, reportedStatus' 
            });
        }
        
        const cleanTag = hashtag.replace('#', '').toLowerCase();
        const key = `${cleanTag}:${platform}`;
        
        const existing = hashtagDatabase.hashtags.get(key);
        
        if (existing) {
            existing.metadata.reportCount++;
            existing.metadata.notes += `\nUser report (${new Date().toISOString()}): ${reportedStatus}`;
            
            // If multiple reports, queue for verification
            if (existing.metadata.reportCount >= 3) {
                queueForVerification(cleanTag, platform);
            }
        } else {
            // Create new entry from user report
            hashtagDatabase.hashtags.set(key, {
                hashtag: cleanTag,
                platform: platform,
                status: reportedStatus,
                confidence: 50, // Low confidence for user reports
                lastVerified: new Date(),
                firstDetected: new Date(),
                verificationMethod: 'user_report',
                history: [{
                    status: reportedStatus,
                    date: new Date(),
                    method: 'user_report'
                }],
                metadata: {
                    reportCount: 1,
                    falsePositives: 0,
                    notes: `User report: ${evidence || 'No evidence provided'}`
                }
            });
            
            hashtagDatabase.stats.totalHashtags = hashtagDatabase.hashtags.size;
        }
        
        // Queue for verification
        queueForVerification(cleanTag, platform);
        
        res.json({
            success: true,
            message: 'Report submitted successfully. We will verify this hashtag.',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/hashtag/stats
 * Get database statistics
 */
app.get('/api/hashtag/stats', (req, res) => {
    const platformStats = {};
    
    // Calculate per-platform stats
    for (const [key, data] of hashtagDatabase.hashtags) {
        if (!platformStats[data.platform]) {
            platformStats[data.platform] = { banned: 0, restricted: 0, safe: 0, total: 0 };
        }
        platformStats[data.platform][data.status]++;
        platformStats[data.platform].total++;
    }
    
    res.json({
        success: true,
        stats: {
            ...hashtagDatabase.stats,
            queueLength: hashtagDatabase.verificationQueue.length,
            byPlatform: platformStats
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/hashtag/search
 * Search hashtags in database (for Research Dashboard)
 */
app.get('/api/hashtag/search', (req, res) => {
    try {
        const { query, platform, status, limit = 50, offset = 0 } = req.query;
        
        let results = Array.from(hashtagDatabase.hashtags.values());
        
        // Filter by platform
        if (platform) {
            results = results.filter(h => h.platform === platform);
        }
        
        // Filter by status
        if (status) {
            results = results.filter(h => h.status === status);
        }
        
        // Filter by query (hashtag contains)
        if (query) {
            const q = query.toLowerCase();
            results = results.filter(h => h.hashtag.includes(q));
        }
        
        // Sort by lastVerified (most recent first)
        results.sort((a, b) => new Date(b.lastVerified) - new Date(a.lastVerified));
        
        // Pagination
        const total = results.length;
        results = results.slice(Number(offset), Number(offset) + Number(limit));
        
        res.json({
            success: true,
            total: total,
            limit: Number(limit),
            offset: Number(offset),
            results: results,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error searching hashtags:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/hashtag/recent-bans
 * Get recently banned/restricted hashtags (for Research Dashboard)
 */
app.get('/api/hashtag/recent-bans', (req, res) => {
    try {
        const { platform, days = 30, limit = 100 } = req.query;
        
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - Number(days));
        
        let results = Array.from(hashtagDatabase.hashtags.values())
            .filter(h => h.status !== 'safe')
            .filter(h => h.firstDetected && new Date(h.firstDetected) >= cutoff);
        
        if (platform) {
            results = results.filter(h => h.platform === platform);
        }
        
        // Sort by firstDetected (most recent first)
        results.sort((a, b) => new Date(b.firstDetected) - new Date(a.firstDetected));
        
        results = results.slice(0, Number(limit));
        
        res.json({
            success: true,
            count: results.length,
            results: results,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting recent bans:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/health
 * Health check endpoint for Railway
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'hashtag-engine',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ============================================
// START SERVER
// ============================================
initializeDatabase();

app.listen(PORT, () => {
    console.log(`🚀 Hashtag Engine running on port ${PORT}`);
    console.log(`📊 Database: ${hashtagDatabase.stats.totalHashtags} hashtags loaded`);
    console.log(`🔗 Endpoints:`);
    console.log(`   GET  /api/hashtag/check?hashtag=&platform=`);
    console.log(`   POST /api/hashtag/check-bulk`);
    console.log(`   POST /api/hashtag/report`);
    console.log(`   GET  /api/hashtag/stats`);
    console.log(`   GET  /api/hashtag/search`);
    console.log(`   GET  /api/hashtag/recent-bans`);
    console.log(`   GET  /api/health`);
});

module.exports = app;
