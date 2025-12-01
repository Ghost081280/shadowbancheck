/* =============================================================================
   SERVER/DETECTION-ENGINE.JS - Express API Routes
   ShadowBanCheck.io
   
   Backend API endpoints for the 5-Factor Detection Engine.
   Designed for Express.js on Railway deployment.
   
   Endpoints:
   - Health & Stats
   - Full Analysis (Power Check)
   - Account Check
   - Hashtag/Cashtag Check
   - Link Check
   - Content Check
   - Mention Check
   - Emoji Check
   - Platform-specific endpoints
   ============================================================================= */

const express = require('express');
const router = express.Router();

// ============================================================================
// INITIALIZATION
// ============================================================================

// In production, these would be imported properly
// For now, we'll check if they exist in the global scope (browser) or require them
let FlaggedHashtags, FlaggedLinks, FlaggedContent, FlaggedMentions, FlaggedEmojis;
let FlaggedImages, FlaggedVideos, FlaggedAudio;

// Try to load databases (will work in Node.js if files are converted to CommonJS)
try {
    // These would be require() statements in production
    // For demo, we'll create simple in-memory versions
    FlaggedHashtags = require('./flagged-hashtags') || null;
    FlaggedContent = require('./flagged-content') || null;
} catch (e) {
    console.log('Running in demo mode - databases not loaded as modules');
}

// Demo mode flag
let USE_DEMO = true;

// ============================================================================
// HEALTH & STATS ENDPOINTS
// ============================================================================

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        demo: USE_DEMO,
        factors: {
            platformApi: true,
            webAnalysis: true,
            historical: true,
            detection: true,
            predictive: true
        }
    });
});

/**
 * GET /api/stats
 * Get engine statistics
 */
router.get('/stats', (req, res) => {
    res.json({
        version: '1.0.0',
        demo: USE_DEMO,
        databases: {
            hashtags: FlaggedHashtags ? 'loaded' : 'not loaded',
            content: FlaggedContent ? 'loaded' : 'not loaded',
            links: FlaggedLinks ? 'loaded' : 'not loaded',
            mentions: FlaggedMentions ? 'loaded' : 'not loaded',
            emojis: FlaggedEmojis ? 'loaded' : 'not loaded',
            images: 'placeholder (Phase 2)',
            videos: 'placeholder (Phase 3)',
            audio: 'placeholder (Phase 3)'
        },
        supportedPlatforms: ['twitter', 'reddit'],
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// FULL ANALYSIS ENDPOINTS
// ============================================================================

/**
 * POST /api/analyze/post
 * Full power check on a post URL
 * Body: { url: string, platform?: string }
 */
router.post('/analyze/post', async (req, res) => {
    try {
        const { url, platform } = req.body;
        
        if (!url) {
            return res.status(400).json({
                error: true,
                message: 'URL is required'
            });
        }
        
        // In production, this would call the actual engine
        // For now, return demo result
        const result = await analyzePost(url, platform);
        res.json(result);
        
    } catch (error) {
        console.error('Analyze post error:', error);
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

/**
 * POST /api/analyze/account
 * Account-only analysis
 * Body: { username: string, platform: string }
 */
router.post('/analyze/account', async (req, res) => {
    try {
        const { username, platform = 'twitter' } = req.body;
        
        if (!username) {
            return res.status(400).json({
                error: true,
                message: 'Username is required'
            });
        }
        
        const result = await analyzeAccount(username, platform);
        res.json(result);
        
    } catch (error) {
        console.error('Analyze account error:', error);
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// ============================================================================
// HASHTAG & CASHTAG ENDPOINTS
// ============================================================================

/**
 * POST /api/hashtag/check-bulk
 * Check multiple hashtags/cashtags
 * Body: { tags: string[], platform?: string }
 */
router.post('/hashtag/check-bulk', (req, res) => {
    try {
        const { tags, platform = 'twitter' } = req.body;
        
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return res.status(400).json({
                error: true,
                message: 'Tags array is required'
            });
        }
        
        const result = checkHashtagsBulk(tags, platform);
        res.json(result);
        
    } catch (error) {
        console.error('Hashtag check error:', error);
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

/**
 * GET /api/hashtag/search
 * Search hashtag database
 * Query: ?q=search&platform=twitter
 */
router.get('/hashtag/search', (req, res) => {
    try {
        const { q, platform } = req.query;
        
        if (!q) {
            return res.status(400).json({
                error: true,
                message: 'Search query (q) is required'
            });
        }
        
        const results = searchHashtags(q, platform);
        res.json(results);
        
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

/**
 * POST /api/hashtag/report
 * Report a hashtag (user feedback)
 * Body: { tag: string, platform: string, status: string, reason?: string }
 */
router.post('/hashtag/report', (req, res) => {
    try {
        const { tag, platform, status, reason } = req.body;
        
        // In production, this would store the report
        res.json({
            success: true,
            message: 'Report received - thank you for your feedback',
            tag: tag,
            reportId: `RPT-${Date.now()}`
        });
        
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

/**
 * GET /api/hashtag/stats
 * Get hashtag database statistics
 */
router.get('/hashtag/stats', (req, res) => {
    res.json({
        total: 150, // Demo value
        byStatus: {
            banned: 45,
            restricted: 55,
            monitored: 40,
            safe: 10
        },
        byType: {
            hashtag: 120,
            cashtag: 30
        },
        demo: USE_DEMO
    });
});

// ============================================================================
// LINK ENDPOINTS
// ============================================================================

/**
 * POST /api/link/check-bulk
 * Check multiple links
 * Body: { urls: string[], platform?: string }
 */
router.post('/link/check-bulk', (req, res) => {
    try {
        const { urls, platform = 'twitter' } = req.body;
        
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                error: true,
                message: 'URLs array is required'
            });
        }
        
        const result = checkLinksBulk(urls, platform);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

/**
 * GET /api/link/search
 * Search link database
 */
router.get('/link/search', (req, res) => {
    const { q, platform } = req.query;
    
    res.json({
        query: q,
        results: [],
        demo: USE_DEMO,
        message: 'Link search coming soon'
    });
});

/**
 * POST /api/link/report
 * Report a link
 */
router.post('/link/report', (req, res) => {
    const { url, platform, status, reason } = req.body;
    
    res.json({
        success: true,
        message: 'Link report received',
        reportId: `LNK-${Date.now()}`
    });
});

/**
 * GET /api/link/stats
 * Get link database statistics
 */
router.get('/link/stats', (req, res) => {
    res.json({
        total: 200,
        byStatus: {
            banned: 50,
            restricted: 80,
            monitored: 50,
            safe: 20
        },
        demo: USE_DEMO
    });
});

// ============================================================================
// CONTENT ENDPOINTS
// ============================================================================

/**
 * POST /api/content/analyze
 * Analyze text content for flagged terms
 * Body: { text: string, platform?: string }
 */
router.post('/content/analyze', (req, res) => {
    try {
        const { text, platform = 'twitter' } = req.body;
        
        if (!text) {
            return res.status(400).json({
                error: true,
                message: 'Text is required'
            });
        }
        
        const result = analyzeContent(text, platform);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

/**
 * GET /api/content/search
 * Search content database
 */
router.get('/content/search', (req, res) => {
    const { q, platform } = req.query;
    
    res.json({
        query: q,
        results: [],
        demo: USE_DEMO
    });
});

/**
 * POST /api/content/report
 * Report a content term
 */
router.post('/content/report', (req, res) => {
    res.json({
        success: true,
        message: 'Content report received',
        reportId: `CNT-${Date.now()}`
    });
});

/**
 * GET /api/content/stats
 */
router.get('/content/stats', (req, res) => {
    res.json({
        total: 100,
        byCategory: {
            violence: 15,
            spam: 20,
            adult: 10,
            political: 15,
            other: 40
        },
        demo: USE_DEMO
    });
});

// ============================================================================
// MENTION ENDPOINTS
// ============================================================================

/**
 * POST /api/mention/check-bulk
 */
router.post('/mention/check-bulk', (req, res) => {
    const { mentions, platform = 'twitter' } = req.body;
    
    res.json({
        total: mentions ? mentions.length : 0,
        flagged: [],
        safe: mentions || [],
        demo: USE_DEMO
    });
});

/**
 * GET /api/mention/search
 */
router.get('/mention/search', (req, res) => {
    res.json({ results: [], demo: USE_DEMO });
});

/**
 * POST /api/mention/report
 */
router.post('/mention/report', (req, res) => {
    res.json({ success: true, reportId: `MNT-${Date.now()}` });
});

/**
 * GET /api/mention/stats
 */
router.get('/mention/stats', (req, res) => {
    res.json({ total: 50, demo: USE_DEMO });
});

// ============================================================================
// EMOJI ENDPOINTS
// ============================================================================

/**
 * POST /api/emoji/check-bulk
 */
router.post('/emoji/check-bulk', (req, res) => {
    const { emojis, platform = 'twitter' } = req.body;
    
    res.json({
        total: emojis ? emojis.length : 0,
        flagged: [],
        safe: emojis || [],
        demo: USE_DEMO
    });
});

/**
 * GET /api/emoji/search
 */
router.get('/emoji/search', (req, res) => {
    res.json({ results: [], demo: USE_DEMO });
});

/**
 * POST /api/emoji/report
 */
router.post('/emoji/report', (req, res) => {
    res.json({ success: true, reportId: `EMJ-${Date.now()}` });
});

/**
 * GET /api/emoji/stats
 */
router.get('/emoji/stats', (req, res) => {
    res.json({ total: 40, demo: USE_DEMO });
});

// ============================================================================
// PLACEHOLDER ENDPOINTS (Phase 2 & 3)
// ============================================================================

/**
 * POST /api/image/analyze
 * Placeholder for Phase 2
 */
router.post('/image/analyze', (req, res) => {
    res.json({
        enabled: false,
        message: 'Image analysis coming in Phase 2',
        phase: 2
    });
});

/**
 * POST /api/video/analyze
 * Placeholder for Phase 3
 */
router.post('/video/analyze', (req, res) => {
    res.json({
        enabled: false,
        message: 'Video analysis coming in Phase 3',
        phase: 3
    });
});

/**
 * POST /api/audio/analyze
 * Placeholder for Phase 3
 */
router.post('/audio/analyze', (req, res) => {
    res.json({
        enabled: false,
        message: 'Audio analysis coming in Phase 3',
        phase: 3
    });
});

// ============================================================================
// PLATFORM-SPECIFIC ENDPOINTS
// ============================================================================

/**
 * GET /api/platform/twitter/check/:username
 */
router.get('/platform/twitter/check/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await analyzeAccount(username, 'twitter');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

/**
 * GET /api/platform/reddit/check/:username
 */
router.get('/platform/reddit/check/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await analyzeAccount(username, 'reddit');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

// ============================================================================
// HELPER FUNCTIONS (Demo implementations)
// ============================================================================

async function analyzePost(url, platform) {
    // Demo implementation
    const detectedPlatform = detectPlatform(url);
    
    return {
        checkType: '3-in-1 Power Check',
        platform: detectedPlatform || platform || 'twitter',
        inputUrl: url,
        timestamp: new Date().toISOString(),
        demo: USE_DEMO,
        
        post: {
            exists: true,
            showingUp: true,
            probability: Math.floor(Math.random() * 40) + 10,
            verdict: 'Post appears to be showing normally'
        },
        
        account: {
            exists: true,
            showingUp: true,
            probability: Math.floor(Math.random() * 30) + 5,
            verdict: 'Account appears healthy'
        },
        
        overallProbability: Math.floor(Math.random() * 35) + 10,
        overallConfidence: 70,
        verdict: 'LIKELY CLEAR',
        
        message: USE_DEMO ? 'Demo data - connect real APIs for live results' : null
    };
}

async function analyzeAccount(username, platform) {
    return {
        checkType: 'Account Check',
        platform: platform,
        username: username.replace(/^@/, ''),
        timestamp: new Date().toISOString(),
        demo: USE_DEMO,
        
        account: {
            username: username.replace(/^@/, ''),
            exists: true,
            suspended: false,
            protected: false,
            verifiedType: 'none',
            probability: Math.floor(Math.random() * 30) + 5,
            verdict: 'Account appears healthy'
        },
        
        overallProbability: Math.floor(Math.random() * 25) + 5,
        verdict: 'LIKELY CLEAR',
        
        message: USE_DEMO ? 'Demo data - connect real APIs for live results' : null
    };
}

function checkHashtagsBulk(tags, platform) {
    const results = {
        banned: [],
        restricted: [],
        monitored: [],
        safe: []
    };
    
    // Demo: randomly categorize tags
    for (const tag of tags) {
        const normalizedTag = tag.startsWith('#') || tag.startsWith('$') ? tag : `#${tag}`;
        const rand = Math.random();
        
        if (rand < 0.1) {
            results.banned.push({ tag: normalizedTag, reason: 'Demo: flagged as banned' });
        } else if (rand < 0.3) {
            results.restricted.push({ tag: normalizedTag, reason: 'Demo: flagged as restricted' });
        } else if (rand < 0.5) {
            results.monitored.push({ tag: normalizedTag, reason: 'Demo: being monitored' });
        } else {
            results.safe.push({ tag: normalizedTag });
        }
    }
    
    return {
        ...results,
        summary: {
            total: tags.length,
            banned: results.banned.length,
            restricted: results.restricted.length,
            monitored: results.monitored.length,
            safe: results.safe.length,
            riskScore: (results.banned.length * 30 + results.restricted.length * 15 + results.monitored.length * 5)
        },
        demo: USE_DEMO
    };
}

function searchHashtags(query, platform) {
    return {
        query: query,
        results: [
            { tag: `#${query}`, status: 'safe', platform: platform || 'all' }
        ],
        demo: USE_DEMO
    };
}

function checkLinksBulk(urls, platform) {
    return {
        total: urls.length,
        flagged: [],
        safe: urls.map(u => ({ url: u, status: 'safe' })),
        demo: USE_DEMO
    };
}

function analyzeContent(text, platform) {
    // Demo: simple keyword check
    const flaggedTerms = [];
    const testTerms = ['spam', 'scam', 'free money', 'click here'];
    
    for (const term of testTerms) {
        if (text.toLowerCase().includes(term)) {
            flaggedTerms.push({ term, status: 'restricted', risk: 'medium' });
        }
    }
    
    return {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        platform: platform,
        flagged: flaggedTerms,
        riskScore: flaggedTerms.length * 15,
        riskLevel: flaggedTerms.length > 2 ? 'high' : flaggedTerms.length > 0 ? 'medium' : 'low',
        demo: USE_DEMO
    };
}

function detectPlatform(url) {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
    if (lower.includes('reddit.com')) return 'reddit';
    return null;
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = router;
module.exports.setDemoMode = (demo) => { USE_DEMO = demo; };
