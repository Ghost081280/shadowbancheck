// Shadow Ban Checker - New Modal System

let checksRemaining = 3;
let selectedPlatform = null;

// Platform data with check details
const platformData = {
    twitter: {
        name: 'Twitter / X',
        icon: '🐦',
        inputLabel: 'Username',
        inputPlaceholder: 'elonmusk',
        inputHint: 'Example: elonmusk (without @)',
        checks: [
            '✓ Search visibility',
            '✓ Search suggestions',
            '✓ Reply visibility',
            '✓ Thread participation'
        ]
    },
    reddit: {
        name: 'Reddit',
        icon: '🤖',
        inputLabel: 'Username',
        inputPlaceholder: 'spez',
        inputHint: 'Example: spez (without u/)',
        checks: [
            '✓ Site-wide shadow ban',
            '✓ Profile visibility',
            '✓ Post/comment visibility',
            '✓ Account status'
        ]
    },
    email: {
        name: 'Email / Domain',
        icon: '📧',
        inputLabel: 'Email or Domain',
        inputPlaceholder: 'hello@example.com',
        inputHint: 'Example: yourname@company.com or company.com',
        checks: [
            '✓ Blacklist status (25+ databases)',
            '✓ SPF/DKIM/DMARC records',
            '✓ Sender reputation score',
            '✓ Spam trap presence'
        ]
    }
};

// Initialize checker page
document.addEventListener('DOMContentLoaded', () => {
    loadChecksCounter();
    setupPlatformClicks();
    setupFormSubmissions();
});

// Setup form submissions
function setupFormSubmissions() {
    // Twitter form
    const twitterForm = document.getElementById('twitter-form');
    if (twitterForm) {
        twitterForm.addEventListener('submit', (e) => handleFormSubmit(e, 'twitter', 'twitter-username'));
    }
    
    // Reddit form
    const redditForm = document.getElementById('reddit-form');
    if (redditForm) {
        redditForm.addEventListener('submit', (e) => handleFormSubmit(e, 'reddit', 'reddit-username'));
    }
    
    // Email form
    const emailForm = document.getElementById('email-form');
    if (emailForm) {
        emailForm.addEventListener('submit', (e) => handleFormSubmit(e, 'email', 'email-input'));
    }
}

// Setup platform click handlers
function setupPlatformClicks() {
    const platforms = document.querySelectorAll('.platform-option');
    
    platforms.forEach(platform => {
        platform.addEventListener('click', () => {
            const platformId = platform.dataset.platform;
            
            // Check if platform is disabled
            if (platform.disabled) {
                const platformName = platform.querySelector('.platform-name').textContent;
                alert(`${platformName} is coming soon! We're adding new platforms regularly. Check back soon or try Twitter, Reddit, or Email checking.`);
                return;
            }
            
            // Show the form for this platform
            showPlatformForm(platformId);
        });
    });
}

// Show platform form
function showPlatformForm(platformId) {
    // Hide all forms
    document.querySelectorAll('.platform-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show selected form
    const selectedForm = document.getElementById(`${platformId}-form`);
    if (selectedForm) {
        selectedForm.classList.add('active');
        
        // Update active state on platform buttons
        document.querySelectorAll('.platform-option').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-platform="${platformId}"]`).classList.add('active');
        
        // Scroll to form
        selectedForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Focus input after scroll
        setTimeout(() => {
            const input = selectedForm.querySelector('input');
            if (input) input.focus();
        }, 500);
    }
}

// Handle form submission
async function handleFormSubmit(e, platform, inputId) {
    e.preventDefault();
    
    // Check if user has checks remaining
    if (checksRemaining <= 0) {
        alert('You\'ve used all 3 free checks for today! Upgrade to Pro for unlimited checks.');
        window.location.href = 'index.html#pricing';
        return;
    }
    
    const input = document.getElementById(inputId).value.trim();
    if (!input) return;
    
    const submitBtn = e.target.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    
    // Set loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    btnText.textContent = 'Analyzing...';
    
    try {
        // Simulate API call
        const results = await simulateCheck(platform, input);
        
        // Decrement checks
        checksRemaining--;
        updateChecksCounter();
        
        // Store results and redirect
        localStorage.setItem('checkResults', JSON.stringify(results));
        window.location.href = 'results.html';
        
    } catch (error) {
        console.error('Check failed:', error);
        alert('An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        btnText.textContent = originalText;
    }
}

// Simulate shadow ban check
async function simulateCheck(platform, identifier) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const timestamp = new Date().toISOString();
    
    if (platform === 'twitter') {
        return {
            platform: 'twitter',
            identifier: identifier,
            timestamp: timestamp,
            status: Math.random() > 0.3 ? 'clean' : 'restricted',
            checks: {
                searchBan: {
                    status: Math.random() > 0.7 ? 'failed' : 'passed',
                    description: 'Your tweets appear in search results'
                },
                searchSuggestion: {
                    status: Math.random() > 0.8 ? 'failed' : 'passed',
                    description: 'Your profile appears in search suggestions'
                },
                ghostBan: {
                    status: 'passed',
                    description: 'Your replies are visible to others'
                },
                replyDeboosting: {
                    status: 'passed',
                    description: 'Your replies are not being suppressed'
                }
            },
            details: {
                accountAge: '2 years',
                followers: '1,234',
                lastTweet: '2 hours ago',
                engagementRate: 'Normal'
            }
        };
    }
    
    if (platform === 'reddit') {
        return {
            platform: 'reddit',
            identifier: identifier,
            timestamp: timestamp,
            status: Math.random() > 0.8 ? 'restricted' : 'clean',
            checks: {
                sitewideBan: {
                    status: 'passed',
                    description: 'No site-wide shadow ban detected'
                },
                profileVisibility: {
                    status: 'passed',
                    description: 'Your profile is publicly visible'
                },
                postVisibility: {
                    status: Math.random() > 0.9 ? 'failed' : 'passed',
                    description: 'Your posts are visible to others'
                },
                accountStatus: {
                    status: 'passed',
                    description: 'Account is in good standing'
                }
            },
            details: {
                accountAge: '3 years',
                karma: '12,456',
                lastPost: '5 hours ago',
                subredditBans: 0
            }
        };
    }
    
    if (platform === 'email') {
        return {
            platform: 'email',
            identifier: identifier,
            timestamp: timestamp,
            status: Math.random() > 0.4 ? 'clean' : 'issues',
            checks: {
                blacklists: {
                    status: Math.random() > 0.7 ? 'failed' : 'passed',
                    description: 'Checked 25+ spam blacklists',
                    found: Math.random() > 0.7 ? 2 : 0
                },
                spfRecord: {
                    status: Math.random() > 0.5 ? 'failed' : 'passed',
                    description: 'SPF record validation'
                },
                dkimRecord: {
                    status: Math.random() > 0.6 ? 'failed' : 'passed',
                    description: 'DKIM signature present'
                },
                dmarcRecord: {
                    status: Math.random() > 0.5 ? 'failed' : 'passed',
                    description: 'DMARC policy configured'
                },
                reputation: {
                    status: 'passed',
                    score: Math.floor(Math.random() * 30) + 70,
                    description: 'Sender reputation score'
                }
            },
            details: {
                domain: identifier.includes('@') ? identifier.split('@')[1] : identifier,
                mxRecords: 'Valid',
                sslCertificate: 'Valid',
                reverseDNS: 'Configured'
            }
        };
    }
    
    return {
        platform: platform,
        identifier: identifier,
        timestamp: timestamp,
        status: 'error',
        message: 'Platform not yet implemented'
    };
}

// Update checks counter
function updateChecksCounter() {
    const counterElement = document.getElementById('checks-remaining');
    if (counterElement) {
        counterElement.textContent = checksRemaining;
        localStorage.setItem('checksRemaining', checksRemaining);
        localStorage.setItem('lastCheckDate', new Date().toDateString());
    }
}

// Load checks counter from localStorage
function loadChecksCounter() {
    const lastCheckDate = localStorage.getItem('lastCheckDate');
    const today = new Date().toDateString();
    
    if (lastCheckDate !== today) {
        checksRemaining = 3;
        localStorage.setItem('checksRemaining', checksRemaining);
        localStorage.setItem('lastCheckDate', today);
    } else {
        const stored = localStorage.getItem('checksRemaining');
        checksRemaining = stored ? parseInt(stored) : 3;
    }
    
    updateChecksCounter();
}
