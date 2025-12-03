// ============================================================================
// FULL 5-FACTOR ENGINE TEST
// Tests all 5 agents with real database integration
// 
// Location: js/detection/tests/test-all-agents.js
// Run from tests folder:  node test-all-agents.js
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('  5-FACTOR ENGINE - FULL INTEGRATION TEST');
console.log('='.repeat(70) + '\n');

// Simulate browser window
global.window = global;

const fs = require('fs');
const path = require('path');

// Go up one level to js/detection/
const baseDir = path.join(__dirname, '..');

// ============================================================================
// LOAD ALL FILES IN ORDER
// ============================================================================

console.log('📦 Loading files...\n');

// 1. Databases first
console.log('   Databases:');
eval(fs.readFileSync(path.join(baseDir, 'databases/flagged-hashtags.js'), 'utf8'));
eval(fs.readFileSync(path.join(baseDir, 'databases/flagged-links.js'), 'utf8'));
eval(fs.readFileSync(path.join(baseDir, 'databases/flagged-content.js'), 'utf8'));
eval(fs.readFileSync(path.join(baseDir, 'databases/flagged-mentions.js'), 'utf8'));
eval(fs.readFileSync(path.join(baseDir, 'databases/flagged-emojis.js'), 'utf8'));

// 2. Platform handlers
console.log('\n   Platforms:');
eval(fs.readFileSync(path.join(baseDir, 'platforms/twitter.js'), 'utf8'));
eval(fs.readFileSync(path.join(baseDir, 'platforms/reddit.js'), 'utf8'));

// 3. Agent base (registry)
console.log('\n   Agent System:');
eval(fs.readFileSync(path.join(baseDir, 'agents/agent-base.js'), 'utf8'));

// 4. All 5 agents
eval(fs.readFileSync(path.join(baseDir, 'agents/agent-platform-api.js'), 'utf8'));
eval(fs.readFileSync(path.join(baseDir, 'agents/agent-web-analysis.js'), 'utf8'));
eval(fs.readFileSync(path.join(baseDir, 'agents/agent-historical.js'), 'utf8'));
eval(fs.readFileSync(path.join(baseDir, 'agents/agent-detection.js'), 'utf8'));
eval(fs.readFileSync(path.join(baseDir, 'agents/agent-predictive.js'), 'utf8'));

// ============================================================================
// VERIFY REGISTRY
// ============================================================================

console.log('\n' + '-'.repeat(70));
console.log('AGENT REGISTRY STATUS');
console.log('-'.repeat(70));

const status = window.AgentRegistry.getStatus();
console.log('\nRegistered Agents:', status.agentCount);
console.log('Factors Covered:', status.factorsCovered.join(', '));

for (const agent of status.agents) {
    console.log(`   Factor ${agent.factor}: ${agent.name} (${agent.id})`);
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

async function runTest(name, input) {
    console.log('\n' + '='.repeat(70));
    console.log(`TEST: ${name}`);
    console.log('='.repeat(70));
    
    console.log('\nInput:');
    console.log('   Platform:', input.platform);
    if (input.username) console.log('   Username:', input.username);
    if (input.postId) console.log('   Post ID:', input.postId);
    if (input.text) console.log('   Text:', input.text.substring(0, 60) + (input.text.length > 60 ? '...' : ''));
    
    // Run all agents
    console.log('\n📊 Running all 5 agents...\n');
    const results = await window.AgentRegistry.runAll(input);
    
    // Display results by factor
    console.log('-'.repeat(50));
    console.log('AGENT RESULTS');
    console.log('-'.repeat(50));
    
    let totalWeightedScore = 0;
    
    for (const result of results.sort((a, b) => a.factor - b.factor)) {
        const icon = result.rawScore >= 50 ? '🔴' : result.rawScore >= 25 ? '🟡' : '🟢';
        console.log(`\n${icon} Factor ${result.factor}: ${result.agent}`);
        console.log(`   Raw Score: ${result.rawScore}`);
        console.log(`   Weighted: ${result.weightedScore} (weight: ${result.weight}%)`);
        console.log(`   Confidence: ${result.confidence}%`);
        console.log(`   Status: ${result.status}`);
        
        totalWeightedScore += result.weightedScore;
        
        // Show findings
        if (result.findings && result.findings.length > 0) {
            console.log('   Findings:');
            for (const f of result.findings.slice(0, 3)) {
                const fIcon = f.type === 'danger' ? '❌' : f.type === 'warning' ? '⚠️' : f.type === 'good' ? '✅' : 'ℹ️';
                console.log(`      ${fIcon} ${f.message}`);
            }
            if (result.findings.length > 3) {
                console.log(`      ... and ${result.findings.length - 3} more`);
            }
        }
    }
    
    // Summary
    console.log('\n' + '-'.repeat(50));
    console.log('SYNTHESIS');
    console.log('-'.repeat(50));
    
    const predictiveResult = results.find(r => r.agentId === 'predictive');
    if (predictiveResult?.predictions) {
        console.log(`\n   Final Probability: ${predictiveResult.predictions.probability}%`);
        console.log(`   Reach Score: ${predictiveResult.predictions.reachScore}%`);
        console.log(`   Verdict: ${predictiveResult.predictions.verdict}`);
        console.log(`   Confidence: ${predictiveResult.predictions.confidence}%`);
        console.log(`   Recovery: ${predictiveResult.predictions.recoveryTimeline}`);
        
        if (predictiveResult.recommendations?.length > 0) {
            console.log('\n   Top Recommendations:');
            for (const rec of predictiveResult.recommendations.slice(0, 3)) {
                console.log(`      [${rec.priority}] ${rec.action}`);
            }
        }
    }
    
    return { results, totalWeightedScore };
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function main() {
    
    // TEST 1: Twitter Heavy Spam
    const test1 = await runTest('Twitter Heavy Spam', {
        platform: 'twitter',
        username: 'spamuser123',
        postId: '1234567890111',
        text: 'Follow me! #followback #f4f #teamfollowback! BUY NOW! 💰🚀🔥 https://bit.ly/spam https://facebook.com/page @botuser12345',
        urls: ['https://bit.ly/spam', 'https://facebook.com/page']
    });
    
    // TEST 2: Twitter Shadowbanned User
    const test2 = await runTest('Twitter Shadowbanned User', {
        platform: 'twitter',
        username: 'shadowbanned_user',
        postId: '9876543210222',
        text: 'Check out my article! https://substack.com/mypost #tech',
        urls: ['https://substack.com/mypost']
    });
    
    // TEST 3: Reddit New Account Self-Promo
    const test3 = await runTest('Reddit New Account', {
        platform: 'reddit',
        username: 'newuser_promo',
        postId: 'abc333',
        text: 'Just made this cool project, check it out at https://bit.ly/myproject! u/spambot123',
        urls: ['https://bit.ly/myproject']
    });
    
    // TEST 4: Clean Account
    const test4 = await runTest('Clean Healthy Account', {
        platform: 'twitter',
        username: 'healthy_account',
        postId: '5555555550000',
        text: 'Just shared my thoughts on the latest tech trends. What do you think? #tech',
        urls: []
    });
    
    // ============================================================================
    // FINAL SUMMARY
    // ============================================================================
    
    console.log('\n\n' + '='.repeat(70));
    console.log('  TEST SUMMARY');
    console.log('='.repeat(70));
    
    console.log('\n   Test 1 (Heavy Spam):');
    const p1 = test1.results.find(r => r.agentId === 'predictive');
    console.log(`      Score: ${p1?.predictions?.probability || 'N/A'}% | Verdict: ${p1?.predictions?.verdict || 'N/A'}`);
    
    console.log('\n   Test 2 (Shadowbanned):');
    const p2 = test2.results.find(r => r.agentId === 'predictive');
    console.log(`      Score: ${p2?.predictions?.probability || 'N/A'}% | Verdict: ${p2?.predictions?.verdict || 'N/A'}`);
    
    console.log('\n   Test 3 (Reddit New):');
    const p3 = test3.results.find(r => r.agentId === 'predictive');
    console.log(`      Score: ${p3?.predictions?.probability || 'N/A'}% | Verdict: ${p3?.predictions?.verdict || 'N/A'}`);
    
    console.log('\n   Test 4 (Healthy):');
    const p4 = test4.results.find(r => r.agentId === 'predictive');
    console.log(`      Score: ${p4?.predictions?.probability || 'N/A'}% | Verdict: ${p4?.predictions?.verdict || 'N/A'}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('  ✅ ALL TESTS COMPLETE');
    console.log('='.repeat(70) + '\n');
    
    // Verify expected behavior
    console.log('Verification:');
    console.log(`   ✓ Heavy spam detected: ${(p1?.predictions?.probability || 0) >= 40 ? 'PASS' : 'FAIL'}`);
    console.log(`   ✓ Shadowban detected: ${(p2?.predictions?.probability || 0) >= 40 ? 'PASS' : 'FAIL'}`);
    console.log(`   ✓ Reddit issues found: ${(p3?.predictions?.probability || 0) >= 20 ? 'PASS' : 'FAIL'}`);
    console.log(`   ✓ Clean account clear: ${(p4?.predictions?.probability || 0) <= 20 ? 'PASS' : 'FAIL'}`);
}

main().catch(console.error);
