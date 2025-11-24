// Shadow Ban Checker - Modal System

let checksRemaining = 3;
let lastCheckDate = null;

// Initialize checker page
document.addEventListener('DOMContentLoaded', () => {
    loadChecksCounter();
    setupPlatformCards();
    setupModalHandlers();
    setupFormSubmissions();
});

// Load checks counter from localStorage
function loadChecksCounter() {
    const storedChecks = localStorage.getItem('checksRemaining');
    const storedDate = localStorage.getItem('lastCheckDate');
    const today = new Date().toDateString();
    
    if (storedDate === today && storedChecks) {
        checksRemaining = parseInt(storedChecks);
    } else {
        checksRemaining = 3;
        localStorage.setItem('checksRemaining', checksRemaining);
        localStorage.setItem('lastCheckDate', today);
    }
    
    updateChecksCounter();
}

// Update checks counter display
function updateChecksCounter() {
    const counterEl = document.getElementById('checks-remaining');
    if (counterEl) {
        counterEl.textContent = checksRemaining;
        counterEl.style.color = checksRemaining > 0 ? '#10b981' : '#ef4444';
    }
    
    localStorage.setItem('checksRemaining', checksRemaining);
}

// Setup platform card click handlers
function setupPlatformCards() {
    const platformCards = document.querySelectorAll('.platform-card.live');
    
    platformCards.forEach(card => {
        card.addEventListener('click', () => {
            const platform = card.dataset.platform;
            openModal(platform);
        });
    });
}

// Open modal for specific platform
function openModal(platform) {
    const modal = document.getElementById('check-modal');
    const forms = modal.querySelectorAll('.platform-form');
    
    // Hide all forms
    forms.forEach(form => {
        form.style.display = 'none';
    });
    
    // Show selected platform form
    const selectedForm = document.getElementById(`${platform}-form`);
    if (selectedForm) {
        selectedForm.style.display = 'block';
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('check-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset all forms
    const forms = modal.querySelectorAll('.platform-form');
    forms.forEach(form => {
        form.reset();
    });
}

// Setup modal handlers
function setupModalHandlers() {
    const modal = document.getElementById('check-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    // Close button
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Overlay click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Setup form submissions
function setupFormSubmissions() {
    const forms = document.querySelectorAll('.platform-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const platform = form.dataset.platform;
            let inputValue = '';
            
            // Get input value based on platform
            if (platform === 'twitter') {
                inputValue = document.getElementById('twitter-username').value.trim();
            } else if (platform === 'reddit') {
                inputValue = document.getElementById('reddit-username').value.trim();
            } else if (platform === 'email') {
                inputValue = document.getElementById('email-address').value.trim();
            }
            
            if (!inputValue) return;
            
            await handleFormSubmit(e, platform, inputValue);
        });
    });
}

// Handle form submission
async function handleFormSubmit(e, platform, inputValue) {
    // Check if user has checks remaining
    if (checksRemaining <= 0) {
        alert('You\'ve used all 3 free checks for today! Upgrade to Pro for unlimited checks.');
        window.location.href = 'index.html#pricing';
        return;
    }
    
    const submitBtn = e.target.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    
    // Set loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    btnText.textContent = 'Analyzing...';
    
    try {
        // Simulate API call
        const results = await simulateCheck(platform, inputValue);
        
        // Decrement checks
        checksRemaining--;
        updateChecksCounter();
        
        // Store results and redirect
        localStorage.setItem('checkResults', JSON.stringify(results));
        
        // Close modal before redirect
        closeModal();
        
        // Small delay for smooth transition
        setTimeout(() => {
            window.location.href = 'results.html';
        }, 300);
        
    } catch (error) {
        console.error('Check failed:', error);
        alert('Something went wrong. Please try again.');
        
        // Reset button
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
                    description: 'DKIM record validation'
                },
                dmarcRecord: {
                    status: Math.random() > 0.6 ? 'failed' : 'passed',
                    description: 'DMARC policy validation'
                },
                reputationScore: {
                    status: 'passed',
                    description: 'Sender reputation score',
                    score: Math.floor(Math.random() * 30) + 70
                }
            },
            details: {
                domain: identifier.includes('@') ? identifier.split('@')[1] : identifier,
                mxRecords: 'Valid',
                sslCertificate: 'Valid',
                lastChecked: 'Just now'
            }
        };
    }
    
    return null;
}
