/* =============================================================================
   DASHBOARD.JS - User Dashboard Functionality
   ============================================================================= */

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    checkSubscription();
    initNavigation();
    initTabs();
    initPlatformDropdowns();
    initModals();
    initLogout();
    initQuickActions();
    loadUserData();
    detectUserIP();
});

// =============================================================================
// SUBSCRIPTION CHECK
// =============================================================================
function checkSubscription() {
    const subscription = localStorage.getItem('shadowban_subscription');
    const overlay = document.getElementById('no-subscription-overlay');
    
    if (!subscription) {
        // No subscription - show overlay
        overlay?.classList.remove('hidden');
    } else {
        // Has subscription - hide overlay
        overlay?.classList.add('hidden');
        loadSubscriptionData(JSON.parse(subscription));
    }
}

function selectPlan(planType) {
    // In production, this would redirect to Stripe checkout
    // For now, simulate selecting a plan
    const plans = {
        starter: { name: '⭐ Starter', accounts: 5, ai: 3, price: '$4.99/mo' },
        pro: { name: '🚀 Pro', accounts: 15, ai: 10, price: '$9.99/mo' },
        premium: { name: '💎 Premium', accounts: 50, ai: 25, price: '$14.99/mo' }
    };
    
    const plan = plans[planType];
    if (!plan) return;
    
    // Simulate subscription (in production, this happens after Stripe payment)
    const subscription = {
        plan: planType,
        name: plan.name,
        accounts: plan.accounts,
        ai: plan.ai,
        price: plan.price,
        frequency: 'daily',
        startDate: Date.now()
    };
    
    localStorage.setItem('shadowban_subscription', JSON.stringify(subscription));
    
    // Hide overlay
    document.getElementById('no-subscription-overlay')?.classList.add('hidden');
    
    // Load subscription data
    loadSubscriptionData(subscription);
    
    showToast('✅', `${plan.name} plan activated! Welcome aboard.`);
}

function loadSubscriptionData(subscription) {
    // Update sidebar
    document.getElementById('sidebar-plan-name').textContent = subscription.name;
    document.getElementById('sidebar-accounts').textContent = `0/${subscription.accounts}`;
    document.getElementById('sidebar-ai').textContent = `0/${subscription.ai}`;
    
    // Update settings
    document.getElementById('current-plan-name').textContent = subscription.name;
    document.getElementById('current-plan-features').textContent = 
        `${subscription.accounts} accounts • ${subscription.ai} AI/day • Email + SMS alerts`;
    document.getElementById('current-plan-price').textContent = subscription.price;
    document.getElementById('accounts-limit').textContent = subscription.accounts;
    
    // Update frequency radio
    const freqRadio = document.querySelector(`input[name="frequency"][value="${subscription.frequency}"]`);
    if (freqRadio) freqRadio.checked = true;
}

// =============================================================================
// NAVIGATION
// =============================================================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.dataset.section;
            
            // Update nav
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            // Update sections
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(`section-${sectionId}`)?.classList.add('active');
            
            // Close mobile sidebar
            document.getElementById('sidebar')?.classList.remove('open');
            
            // Update URL hash
            history.pushState(null, '', `#${sectionId}`);
        });
    });
    
    // Handle link buttons that navigate
    document.querySelectorAll('[data-section]').forEach(el => {
        if (!el.classList.contains('nav-item')) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = el.dataset.section;
                
                navItems.forEach(n => n.classList.remove('active'));
                document.querySelector(`.nav-item[data-section="${sectionId}"]`)?.classList.add('active');
                
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(`section-${sectionId}`)?.classList.add('active');
            });
        }
    });
    
    // Mobile menu toggle
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('open');
    });
    
    // Check URL hash on load
    const hash = window.location.hash.slice(1);
    if (hash) {
        const navItem = document.querySelector(`.nav-item[data-section="${hash}"]`);
        navItem?.click();
    }
}

// =============================================================================
// TABS
// =============================================================================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update panels
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${tabId}`)?.classList.add('active');
        });
    });
}

// =============================================================================
// PLATFORM DROPDOWNS
// =============================================================================
function initPlatformDropdowns() {
    // Get platforms from platforms.js (the truth file)
    if (!window.platformData) {
        console.error('platforms.js not loaded');
        return;
    }
    
    const toolPlatform = document.getElementById('tool-platform');
    const ipPlatform = document.getElementById('ip-platform');
    const newPlatform = document.getElementById('new-platform');
    
    // Build options from platformData
    let optionsHtml = '<option value="">Select Platform...</option>';
    
    window.platformData.forEach(platform => {
        const statusLabel = platform.status === 'live' ? '🟢' : '🟡';
        const statusText = platform.status === 'live' ? '' : ' (Coming Soon)';
        const disabled = platform.status !== 'live' ? 'disabled' : '';
        
        optionsHtml += `<option value="${platform.name.toLowerCase().replace(/\//g, '-')}" ${disabled}>
            ${platform.icon} ${platform.name}${statusText}
        </option>`;
    });
    
    // Apply to dropdowns
    if (toolPlatform) toolPlatform.innerHTML = optionsHtml;
    if (ipPlatform) ipPlatform.innerHTML = optionsHtml;
    if (newPlatform) newPlatform.innerHTML = optionsHtml;
}

// =============================================================================
// MODALS
// =============================================================================
function initModals() {
    // Add Account Modal
    const addAccountModal = document.getElementById('add-account-modal');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    
    document.getElementById('add-account-btn')?.addEventListener('click', () => {
        addAccountModal?.classList.remove('hidden');
    });
    
    document.getElementById('add-first-account-btn')?.addEventListener('click', () => {
        addAccountModal?.classList.remove('hidden');
    });
    
    modalClose?.addEventListener('click', () => {
        addAccountModal?.classList.add('hidden');
    });
    
    modalCancel?.addEventListener('click', () => {
        addAccountModal?.classList.add('hidden');
    });
    
    modalConfirm?.addEventListener('click', () => {
        const platform = document.getElementById('new-platform').value;
        const username = document.getElementById('new-username').value;
        
        if (!platform || !username) {
            showToast('⚠️', 'Please select a platform and enter a username');
            return;
        }
        
        // In production, save to database
        showToast('✅', `Account @${username} added successfully!`);
        addAccountModal?.classList.add('hidden');
        
        // Reset form
        document.getElementById('new-platform').value = '';
        document.getElementById('new-username').value = '';
        document.getElementById('new-nickname').value = '';
    });
    
    // Close modals when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
            }
        });
    });
}

// =============================================================================
// TOOL INFO MODALS
// =============================================================================
const toolInfoContent = {
    account: {
        title: '🔍 Account Check',
        body: `
            <p>Check any username for shadow ban probability across supported platforms.</p>
            <h4>What We Check:</h4>
            <ul>
                <li>Profile accessibility (public/restricted)</li>
                <li>Search ban status (account hidden from search)</li>
                <li>Reply deboosting (replies hidden behind "Show more")</li>
                <li>Quality Filter Detection (QFD) status</li>
                <li>Ghost ban detection (posts invisible)</li>
                <li>Account age & trust signals</li>
            </ul>
        `
    },
    post: {
        title: '⚡ Power Check: 3-in-1 Analysis',
        body: `
            <p class="modal-intro">One URL, three comprehensive checks. Here's everything we analyze:</p>
            
            <div class="modal-check-section">
                <h4>🔗 Post Visibility Check</h4>
                <ul>
                    <li>Search result presence (is the post findable?)</li>
                    <li>Feed visibility status (shown to followers?)</li>
                    <li>Logged-out accessibility test</li>
                    <li>Engagement rate vs. expected baseline</li>
                    <li>Time-decay and velocity patterns</li>
                    <li>Sensitive content/warning flags</li>
                </ul>
            </div>
            
            <div class="modal-check-section">
                <h4>👤 Account Status Check</h4>
                <ul>
                    <li>Profile accessibility (public/restricted)</li>
                    <li>Search ban status (account hidden from search)</li>
                    <li>Reply deboosting (replies hidden behind "Show more")</li>
                    <li>Quality Filter Detection (QFD) status</li>
                    <li>Ghost ban detection (posts invisible)</li>
                    <li>Account age & trust signals</li>
                </ul>
            </div>
            
            <div class="modal-check-section">
                <h4>#️⃣ Hashtag Health Check</h4>
                <ul>
                    <li>Banned hashtag detection (500+ Instagram, 300+ TikTok)</li>
                    <li>Restricted/limited reach hashtags</li>
                    <li>Spam-flagged hashtag identification</li>
                    <li>Hashtag competition & saturation</li>
                    <li>Platform-specific restrictions</li>
                </ul>
            </div>
            
            <div class="modal-engine-section">
                <h4>🧠 Powered by Our 5-Factor Detection Engine</h4>
                <ul>
                    <li>✓ 🔌 <strong>Platform APIs</strong> - Direct integration with Twitter/X API, Reddit API, and more</li>
                    <li>✓ 🌐 <strong>Web Analysis</strong> - Live scraping, logged-in/out tests, search visibility checks</li>
                    <li>✓ 📊 <strong>Historical Data</strong> - Baseline comparisons from millions of tracked accounts</li>
                    <li>✓ #️⃣ <strong>Hashtag Database</strong> - 500+ Instagram banned, 300+ TikTok restricted hashtags</li>
                    <li>✓ 🔍 <strong>IP Analysis</strong> - VPN/proxy detection, datacenter flagging, location risk</li>
                </ul>
                <p>Our Engine combines all signals and assigns a <strong>Shadow Ban Probability Score</strong> with detailed breakdowns so you know exactly where you stand.</p>
            </div>
        `
    },
    hashtag: {
        title: '🏷️ Hashtag Check',
        body: `
            <p>Check if hashtags are banned or restricted before posting.</p>
            <h4>What We Check:</h4>
            <ul>
                <li>Banned hashtag detection (500+ Instagram, 300+ TikTok)</li>
                <li>Restricted/limited reach hashtags</li>
                <li>Spam-flagged hashtag identification</li>
                <li>Hashtag competition & saturation</li>
                <li>Platform-specific restrictions</li>
            </ul>
            <p class="modal-tip"><strong>Tip:</strong> Avoid banned hashtags to prevent your entire post from being hidden!</p>
        `
    },
    ip: {
        title: '🌐 IP Address Check',
        body: `
            <p>Check if your IP address might be causing platform restrictions.</p>
            <h4>What We Check:</h4>
            <ul>
                <li>VPN/Proxy detection</li>
                <li>Datacenter IP flagging</li>
                <li>Geographic location risk</li>
                <li>IP reputation score</li>
                <li>Platform-specific IP preferences</li>
            </ul>
            <p class="modal-tip"><strong>Note:</strong> Select a platform to see platform-specific IP risk assessment. Some platforms are stricter with certain regions or datacenter IPs.</p>
        `
    }
};

function showToolInfo(tool) {
    const modal = document.getElementById('tool-info-modal');
    const title = document.getElementById('tool-info-title');
    const body = document.getElementById('tool-info-body');
    
    const content = toolInfoContent[tool];
    if (!content) return;
    
    title.textContent = content.title;
    body.innerHTML = content.body;
    modal?.classList.remove('hidden');
}

function closeToolInfo() {
    document.getElementById('tool-info-modal')?.classList.add('hidden');
}

// =============================================================================
// ALERT INFO
// =============================================================================
const alertInfoContent = {
    shadowban: 'Get notified immediately when we detect a shadow ban on any of your monitored accounts. This includes search bans, ghost bans, and reply deboosting.',
    reach: 'Get alerted when we detect a significant drop in your account\'s reach or engagement compared to your baseline, which may indicate algorithmic suppression.',
    restored: 'Receive a notification when a previously flagged account returns to normal visibility status.',
    weekly: 'Get a weekly summary email with the status of all your monitored accounts and any changes detected.',
    hashtag: 'Get notified if you use a banned or restricted hashtag in any of your posts on monitored accounts.'
};

function showAlertInfo(type) {
    const modal = document.getElementById('alert-info-modal');
    const title = document.getElementById('alert-info-title');
    const text = document.getElementById('alert-info-text');
    
    const titles = {
        shadowban: '🚫 Shadow Ban Detected',
        reach: '⚠️ Reduced Reach',
        restored: '✅ Account Restored',
        weekly: '📊 Weekly Report',
        hashtag: '🏷️ Banned Hashtag Used'
    };
    
    title.textContent = titles[type] || 'Alert Info';
    text.textContent = alertInfoContent[type] || '';
    modal?.classList.remove('hidden');
}

function closeAlertInfo() {
    document.getElementById('alert-info-modal')?.classList.add('hidden');
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================
function initQuickActions() {
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            
            switch (action) {
                case 'check-all':
                    showToast('🔍', 'Checking all accounts...');
                    break;
                case 'add-account':
                    document.getElementById('add-account-modal')?.classList.remove('hidden');
                    break;
                case 'check-hashtags':
                    // Navigate to tools section
                    document.querySelector('.nav-item[data-section="tools"]')?.click();
                    break;
                case 'ask-ai':
                    // Open Shadow AI chatbot
                    if (window.ShadowAI && typeof window.ShadowAI.open === 'function') {
                        window.ShadowAI.open();
                    } else {
                        showToast('🤖', 'Shadow AI is loading...');
                    }
                    break;
            }
        });
    });
    
    // Open AI button in support section
    document.getElementById('open-ai')?.addEventListener('click', () => {
        if (window.ShadowAI && typeof window.ShadowAI.open === 'function') {
            window.ShadowAI.open();
        } else {
            showToast('🤖', 'Shadow AI is loading...');
        }
    });
}

// =============================================================================
// LOGOUT
// =============================================================================
function initLogout() {
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('shadowban_session');
            sessionStorage.removeItem('shadowban_session');
            window.location.href = 'login.html';
        }
    });
}

// =============================================================================
// LOAD USER DATA
// =============================================================================
function loadUserData() {
    const session = localStorage.getItem('shadowban_session') || sessionStorage.getItem('shadowban_session');
    
    if (session) {
        try {
            const data = JSON.parse(session);
            const email = data.email || 'user@example.com';
            const firstName = email.split('@')[0].split('.')[0];
            const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            
            document.getElementById('user-first-name').textContent = capitalizedName;
            document.getElementById('sidebar-user-name').textContent = capitalizedName;
            document.getElementById('sidebar-user-email').textContent = email;
            document.getElementById('profile-email').value = email;
        } catch (e) {
            console.error('Error loading user data:', e);
        }
    }
}

// =============================================================================
// DETECT USER IP
// =============================================================================
function detectUserIP() {
    const ipDisplay = document.getElementById('user-ip');
    
    // Try to get user's IP
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            if (ipDisplay) ipDisplay.textContent = data.ip;
        })
        .catch(() => {
            if (ipDisplay) ipDisplay.textContent = 'Unable to detect';
        });
}

// =============================================================================
// TOAST NOTIFICATIONS
// =============================================================================
function showToast(icon, message) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastIcon && toastMessage) {
        toastIcon.textContent = icon;
        toastMessage.textContent = message;
        
        toast.classList.remove('hidden');
        toast.classList.add('visible');
        
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }
}

// =============================================================================
// MAKE FUNCTIONS GLOBAL
// =============================================================================
window.selectPlan = selectPlan;
window.showToolInfo = showToolInfo;
window.closeToolInfo = closeToolInfo;
window.showAlertInfo = showAlertInfo;
window.closeAlertInfo = closeAlertInfo;
window.showToast = showToast;
