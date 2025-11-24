// NEW FEATURES TO ADD TO results.js

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================

function displayHowItWorks() {
    const howSimple = document.getElementById('how-simple');
    const howTechnical = document.getElementById('how-technical');
    
    if (!howSimple) return;
    
    const platform = checkResults.platform;
    
    // Simple explanation
    const simpleContent = getSimpleExplanation(platform);
    howSimple.innerHTML = simpleContent;
    
    // Technical explanation
    const technicalContent = getTechnicalExplanation(platform);
    if (howTechnical) {
        howTechnical.innerHTML = technicalContent;
    }
    
    // Setup expand/collapse button
    const expandBtn = document.getElementById('expand-how');
    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            const technical = document.getElementById('how-technical');
            if (technical.style.display === 'none') {
                technical.style.display = 'block';
                expandBtn.querySelector('span').textContent = 'Hide Details';
                expandBtn.classList.add('expanded');
            } else {
                technical.style.display = 'none';
                expandBtn.querySelector('span').textContent = 'Show Details';
                expandBtn.classList.remove('expanded');
            }
        });
    }
}

function getSimpleExplanation(platform) {
    const explanations = {
        twitter: `
            <p>We analyzed your Twitter account to check if you're shadow banned by testing:</p>
            <ul>
                <li>Whether your tweets appear in search results</li>
                <li>If your profile shows up in search suggestions</li>
                <li>Whether your replies are visible to others</li>
                <li>If your content is being suppressed or "deboosted"</li>
            </ul>
            <p>The check simulates real user behavior to detect any visibility restrictions that Twitter may have placed on your account.</p>
        `,
        reddit: `
            <p>We analyzed your Reddit account by checking:</p>
            <ul>
                <li>Site-wide shadow ban status</li>
                <li>Profile visibility to other users</li>
                <li>Whether your posts and comments appear publicly</li>
                <li>Overall account standing with Reddit</li>
            </ul>
            <p>Our system tests your account from multiple angles to identify any restrictions Reddit may have applied.</p>
        `,
        email: `
            <p>We analyzed your email domain and sender reputation by checking:</p>
            <ul>
                <li>25+ major spam blacklists</li>
                <li>SPF, DKIM, and DMARC authentication records</li>
                <li>Your sender reputation score</li>
                <li>Mail server configuration</li>
            </ul>
            <p>These checks help identify issues that could cause your emails to land in spam folders or be blocked entirely.</p>
        `
    };
    
    return explanations[platform] || '<p>We performed a comprehensive analysis of your account visibility.</p>';
}

function getTechnicalExplanation(platform) {
    const explanations = {
        twitter: `
            <h4>Technical Details</h4>
            <p>Our checker uses a multi-point verification system:</p>
            <p><strong>Search Indexing:</strong> We query Twitter's search API to verify if your tweets are properly indexed. Shadow banned accounts typically don't appear in search results.</p>
            <p><strong>Profile Visibility:</strong> We check if your profile appears in <code>typeahead</code> suggestions when users search for similar usernames.</p>
            <p><strong>Reply Threading:</strong> We analyze whether your replies are properly threaded and visible in conversations, or if they're being hidden.</p>
            <p><strong>Quality Filters:</strong> We test if your content triggers Twitter's quality filters that can hide tweets from users who don't follow you.</p>
        `,
        reddit: `
            <h4>Technical Details</h4>
            <p>Our verification process includes:</p>
            <p><strong>Profile API Check:</strong> We verify your profile is accessible via Reddit's public API using <code>/user/USERNAME/about.json</code></p>
            <p><strong>Content Visibility:</strong> We check if your recent posts appear in subreddit listings and can be accessed by non-logged-in users.</p>
            <p><strong>Shadow Ban Detection:</strong> We use Reddit's shadow ban checker endpoint to verify your account status.</p>
            <p><strong>Karma Consistency:</strong> We verify that your karma counts match between your profile and individual posts.</p>
        `,
        email: `
            <h4>Technical Details</h4>
            <p>Our deliverability check performs:</p>
            <p><strong>DNS Record Analysis:</strong> We query your domain's <code>TXT</code> records to verify SPF, DKIM, and DMARC configurations.</p>
            <p><strong>Blacklist Lookup:</strong> We check 25+ RBLs (Realtime Blackhole Lists) including Spamhaus, Barracuda, and SORBS.</p>
            <p><strong>MX Record Validation:</strong> We verify your mail server configuration and SSL certificate validity.</p>
            <p><strong>Reputation Scoring:</strong> We calculate your sender score based on historical sending patterns and complaint rates.</p>
        `
    };
    
    return explanations[platform] || '<h4>Technical Details</h4><p>Detailed technical analysis performed.</p>';
}

// ============================================================================
// SHARE MODAL FUNCTIONALITY
// ============================================================================

function setupShareModal() {
    const shareBtn = document.getElementById('share-results');
    const shareModal = document.getElementById('share-modal');
    const closeModal = document.querySelector('.close-share-modal');
    const shareButtons = document.querySelectorAll('.share-btn');
    
    if (!shareBtn || !shareModal) return;
    
    // Open modal
    shareBtn.addEventListener('click', () => {
        shareModal.classList.remove('hidden');
    });
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            shareModal.classList.add('hidden');
        });
    }
    
    // Close on overlay click
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.classList.add('hidden');
        }
    });
    
    // Share buttons
    shareButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.dataset.platform;
            shareToSocial(platform);
        });
    });
}

function shareToSocial(platform) {
    const text = `I just checked my ${getPlatformName(checkResults.platform)} for shadow bans. Status: ${checkResults.status === 'clean' ? '✅ All Clear' : '⚠️ Issues Found'}`;
    const url = window.location.origin;
    
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

// ============================================================================
// PDF EXPORT FUNCTIONALITY
// ============================================================================

function setupPDFExport() {
    const exportBtn = document.getElementById('export-pdf');
    if (!exportBtn) return;
    
    exportBtn.addEventListener('click', () => {
        // Simple print-based PDF export
        window.print();
    });
}
