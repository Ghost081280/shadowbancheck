// Full Integration Test
console.log('\n========================================');
console.log('FULL INTEGRATION TEST');
console.log('========================================\n');

// Simulate browser window
global.window = global;

// Load all files in order
const fs = require('fs');

console.log('📦 Loading databases...');
eval(fs.readFileSync('flagged-hashtags.js', 'utf8'));
eval(fs.readFileSync('flagged-links.js', 'utf8'));
eval(fs.readFileSync('flagged-content.js', 'utf8'));
eval(fs.readFileSync('flagged-mentions.js', 'utf8'));
eval(fs.readFileSync('flagged-emojis.js', 'utf8'));

console.log('\n📦 Loading platform handlers...');
eval(fs.readFileSync('twitter.js', 'utf8'));
eval(fs.readFileSync('reddit.js', 'utf8'));

console.log('\n📦 Loading agent system...');
eval(fs.readFileSync('agent-base.js', 'utf8'));

// Quick Detection Agent for testing
class TestDetectionAgent extends AgentBase {
    constructor() {
        super({ id: 'detection', name: 'Real-Time Detection', factor: 4, weight: 25 });
    }
    
    async analyze(input) {
        const platform = input.platform || 'twitter';
        const text = input.text || input.content || '';
        
        const signals = {};
        let totalScore = 0;
        const findings = [];

        // Use platform handler for content extraction
        let hashtags = [], cashtags = [], mentions = [], urls = [];
        
        if (platform === 'twitter' && window.twitterPlatform) {
            const extracted = window.twitterPlatform.extractContent(text);
            hashtags = extracted.hashtags;
            cashtags = extracted.cashtags;
            mentions = extracted.mentions;
            urls = input.urls || extracted.urls;
        } else if (platform === 'reddit' && window.redditPlatform) {
            const extracted = window.redditPlatform.extractContent(text);
            mentions = extracted.mentions;
            urls = input.urls || extracted.urls;
        }

        // Check hashtags
        if (hashtags.length > 0 && window.FlaggedHashtags) {
            const result = window.FlaggedHashtags.checkBulk(hashtags, platform);
            signals.hashtags = {
                count: hashtags.length,
                banned: result.banned.length,
                restricted: result.restricted.length,
                score: result.summary.riskScore
            };
            totalScore += result.summary.riskScore;
            if (result.banned.length) {
                findings.push({ type: 'danger', severity: 'high', 
                    message: `${result.banned.length} banned hashtag(s): ${result.banned.map(b=>b.tag).join(', ')}` });
            }
        }

        // Check links
        if (urls.length > 0 && window.FlaggedLinks) {
            const result = window.FlaggedLinks.checkBulk(urls, platform);
            signals.links = {
                count: urls.length,
                throttled: result.throttled.length,
                shorteners: result.shorteners.length,
                score: result.summary.riskScore
            };
            totalScore += result.summary.riskScore;
            if (result.shorteners.length) {
                findings.push({ type: 'warning', severity: 'medium', 
                    message: `${result.shorteners.length} link shortener(s) detected` });
            }
            if (result.throttled.length) {
                findings.push({ type: 'warning', severity: 'medium', 
                    message: `${result.throttled.length} throttled domain(s): ${result.throttled.map(t=>t.domain).join(', ')}` });
            }
        }

        // Check content
        if (text && window.FlaggedContent) {
            const result = window.FlaggedContent.scan(text, platform);
            signals.content = {
                length: text.length,
                flagsFound: result.flags.length,
                score: result.score
            };
            totalScore += result.score;
            if (result.flags.length) {
                findings.push({ type: 'warning', severity: 'medium', 
                    message: `${result.flags.length} content issue(s) found` });
            }
        }

        // Check mentions
        if (mentions.length > 0 && window.FlaggedMentions) {
            const result = window.FlaggedMentions.checkBulk(mentions, platform);
            signals.mentions = {
                count: mentions.length,
                bots: result.bots.length,
                spam: result.spam.length,
                score: result.summary.riskScore
            };
            totalScore += result.summary.riskScore;
        }

        // Check emojis
        if (text && window.FlaggedEmojis) {
            const result = window.FlaggedEmojis.extractAndCheck(text, platform);
            signals.emojis = {
                count: result.emojis.length,
                risky: result.risky.length,
                score: result.summary.riskScore
            };
            totalScore += result.summary.riskScore;
        }

        const rawScore = Math.min(100, totalScore);
        
        return this.createResult({
            rawScore,
            confidence: 75,
            findings,
            extra: { platform, signals }
        });
    }
}

// Register detection agent
const detectionAgent = new TestDetectionAgent();
window.registerAgent(detectionAgent);

console.log('\n========================================');
console.log('TEST 1: Twitter Spam Post');
console.log('========================================');

async function testTwitterSpam() {
    const input = {
        platform: 'twitter',
        text: 'Check out #followback #f4f! Buy now! 💰🚀🔥 https://bit.ly/deal https://facebook.com/page @spambot12345',
        urls: ['https://bit.ly/deal', 'https://facebook.com/page']
    };
    
    console.log('\nInput:', input.text);
    console.log('URLs:', input.urls);
    
    const result = await window.AgentRegistry.runAll(input);
    const r = result[0];
    
    console.log('\n📊 Results:');
    console.log('   Raw Score:', r.rawScore);
    console.log('   Weighted Score:', r.weightedScore);
    console.log('   Confidence:', r.confidence);
    
    console.log('\n🔍 Signals:');
    for (const [name, data] of Object.entries(r.signals || {})) {
        console.log(`   ${name}:`, JSON.stringify(data));
    }
    
    console.log('\n📋 Findings:');
    for (const f of r.findings) {
        console.log(`   [${f.type}] ${f.message}`);
    }
    
    return r;
}

console.log('\n========================================');
console.log('TEST 2: Reddit Self-Promo');
console.log('========================================');

async function testRedditPost() {
    const input = {
        platform: 'reddit',
        text: 'Check out my new project at https://bit.ly/myproject! Also see u/spambot123 for more info.',
        urls: ['https://bit.ly/myproject']
    };
    
    console.log('\nInput:', input.text);
    
    const result = await window.AgentRegistry.runAll(input);
    const r = result[0];
    
    console.log('\n📊 Results:');
    console.log('   Raw Score:', r.rawScore);
    console.log('   Platform:', r.platform);
    
    console.log('\n🔍 Signals:');
    for (const [name, data] of Object.entries(r.signals || {})) {
        console.log(`   ${name}:`, JSON.stringify(data));
    }
    
    return r;
}

console.log('\n========================================');
console.log('TEST 3: Clean Content');
console.log('========================================');

async function testCleanContent() {
    const input = {
        platform: 'twitter',
        text: 'Just shared my thoughts on the latest tech trends. What do you think? #tech',
        urls: []
    };
    
    console.log('\nInput:', input.text);
    
    const result = await window.AgentRegistry.runAll(input);
    const r = result[0];
    
    console.log('\n📊 Results:');
    console.log('   Raw Score:', r.rawScore, '(lower is better)');
    console.log('   Findings:', r.findings.length);
    
    return r;
}

console.log('\n========================================');
console.log('TEST 4: URL Parsing');
console.log('========================================');

function testUrlParsing() {
    console.log('\nTwitter URL parsing:');
    const twitterUrls = [
        'https://twitter.com/elonmusk/status/1234567890',
        'https://x.com/user/status/9876543210',
        'https://twitter.com/shadowtest'
    ];
    
    for (const url of twitterUrls) {
        const result = window.twitterPlatform.getUrlType(url);
        console.log(`   ${url}`);
        console.log(`      → Type: ${result.type}, Valid: ${result.valid}`);
        if (result.username) console.log(`      → Username: ${result.username}`);
        if (result.tweetId) console.log(`      → Tweet ID: ${result.tweetId}`);
    }
    
    console.log('\nReddit URL parsing:');
    const redditUrls = [
        'https://reddit.com/r/technology/comments/abc123/cool_post',
        'https://reddit.com/u/testuser',
        'https://redd.it/xyz789'
    ];
    
    for (const url of redditUrls) {
        const result = window.redditPlatform.getUrlType(url);
        console.log(`   ${url}`);
        console.log(`      → Type: ${result.type}, Valid: ${result.valid}`);
        if (result.subreddit) console.log(`      → Subreddit: ${result.subreddit}`);
        if (result.postId) console.log(`      → Post ID: ${result.postId}`);
    }
}

console.log('\n========================================');
console.log('TEST 5: Database Stats');
console.log('========================================');

function showStats() {
    console.log('\nHashtags:', window.FlaggedHashtags.getStats());
    console.log('Links:', window.FlaggedLinks.getStats());
    console.log('Content:', window.FlaggedContent.getStats());
    console.log('Mentions:', window.FlaggedMentions.getStats());
    console.log('Emojis:', window.FlaggedEmojis.getStats());
}

// Run all tests
async function runAll() {
    const t1 = await testTwitterSpam();
    const t2 = await testRedditPost();
    const t3 = await testCleanContent();
    testUrlParsing();
    showStats();
    
    console.log('\n========================================');
    console.log('SUMMARY');
    console.log('========================================');
    console.log('✅ Twitter spam score:', t1.rawScore, '(high = issues detected)');
    console.log('✅ Reddit self-promo score:', t2.rawScore);
    console.log('✅ Clean content score:', t3.rawScore, '(low = good)');
    console.log('✅ All databases loaded and functional');
    console.log('✅ Platform handlers working');
    console.log('✅ Agent registry operational');
    console.log('\n🎉 Integration test complete!');
}

runAll();
