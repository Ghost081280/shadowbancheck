/* =============================================================================
   DASHBOARD.JS - Dashboard Functionality & State Management
   ============================================================================= */

// =============================================================================
// MOCK DATA - Simulates backend data for frontend demo
// =============================================================================
const mockUserData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    plan: {
        name: 'Pro',
        price: 9.99,
        accountLimit: 15,
        aiQuestionsPerDay: 10,
        frequency: '6hours',
        nextBilling: 'December 24, 2025'
    },
    usage: {
        accountsUsed: 8,
        aiQuestionsUsed: 7,
        shadowChecks: 47,
        hashtagChecks: 123
    }
};

const mockAccounts = [
    {
        id: 1,
        platform: 'instagram',
        platformName: 'Instagram',
        platformIcon: '📸',
        username: '@johndoe',
        nickname: 'Personal',
        status: 'healthy',
        lastChecked: '2 hours ago',
        score: 95
    },
    {
        id: 2,
        platform: 'tiktok',
        platformName: 'TikTok',
        platformIcon: '🎵',
        username: '@johndoe_tiktok',
        nickname: 'Main TikTok',
        status: 'banned',
        lastChecked: '2 hours ago',
        score: 15
    },
    {
        id: 3,
        platform: 'twitter',
        platformName: 'Twitter/X',
        platformIcon: '🐦',
        username: '@johndoe_x',
        nickname: 'Twitter',
        status: 'healthy',
        lastChecked: '2 hours ago',
        score: 92
    },
    {
        id: 4,
        platform: 'youtube',
        platformName: 'YouTube',
        platformIcon: '▶️',
        username: 'JohnDoeChannel',
        nickname: 'YouTube',
        status: 'healthy',
        lastChecked: '2 hours ago',
        score: 88
    },
    {
        id: 5,
        platform: 'facebook',
        platformName: 'Facebook',
        platformIcon: '📘',
        username: 'john.doe',
        nickname: 'Facebook',
        status: 'healthy',
        lastChecked: '3 hours ago',
        score: 90
    },
    {
        id: 6,
        platform: 'linkedin',
        platformName: 'LinkedIn',
        platformIcon: '💼',
        username: 'johndoe',
        nickname: 'Professional',
        status: 'healthy',
        lastChecked: '3 hours ago',
        score: 100
    },
    {
        id: 7,
        platform: 'instagram',
        platformName: 'Instagram',
        platformIcon: '📸',
        username: '@mybrand',
        nickname: 'Business Account',
        status: 'issues',
        lastChecked: '1 hour ago',
        score: 62
    },
    {
        id: 8,
        platform: 'threads',
        platformName: 'Threads',
        platformIcon: '🧵',
        username: '@johndoe',
        nickname: 'Threads',
        status: 'healthy',
        lastChecked: '4 hours ago',
        score: 85
    }
];

const mockHashtagSets = {
    fitness: ['#fitness', '#gym', '#workout', '#health', '#motivation', '#fitfam', '#training', '#exercise', '#healthy', '#fit', '#bodybuilding', '#lifestyle'],
    food: ['#food', '#foodie', '#yummy', '#delicious', '#homemade', '#cooking', '#recipe', '#foodporn', '#instafood']
};

// =============================================================================
// STATE MANAGEMENT
// =============================================================================
let dashboardState = {
    currentSection: 'overview',
    currentSettingsTab: 'profile',
    accounts: [...mockAccounts],
    user: { ...mockUserData },
    sidebarOpen: false
};

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSidebar();
    initModals();
    initSettingsTabs();
    initQuickActions();
    initAccountsSection();
    initToolsSection();
    initAlertsSection();
    initSettingsSection();
    initSupportSection();
    initFrequencyOptions();
    populateDashboard();
    
    // Check URL hash for initial section
    const hash = window.location.hash.slice(1);
    if (hash) {
        navigateToSection(hash);
    }
});

// =============================================================================
// NAVIGATION
// =============================================================================
function initNavigation() {
    // Sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            navigateToSection(section);
            closeSidebar();
        });
    });
    
    // Card links (View All, Manage, etc.)
    document.querySelectorAll('[data-section]').forEach(el => {
        if (!el.classList.contains('sidebar-link')) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const section = el.dataset.section;
                navigateToSection(section);
            });
        }
    });
}

function navigateToSection(sectionId) {
    // Update state
    dashboardState.currentSection = sectionId;
    
    // Update URL
    window.location.hash = sectionId;
    
    // Update active nav link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    
    // Show/hide sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    // Scroll to top of content
    document.querySelector('.dashboard-content').scrollTop = 0;
}

// =============================================================================
// SIDEBAR (Mobile)
// =============================================================================
function initSidebar() {
    const sidebar = document.getElementById('dashboard-sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    const close = document.getElementById('sidebar-close');
    
    toggle?.addEventListener('click', () => {
        sidebar.classList.add('active');
        dashboardState.sidebarOpen = true;
    });
    
    close?.addEventListener('click', closeSidebar);
    
    // Close on overlay click
    document.addEventListener('click', (e) => {
        if (dashboardState.sidebarOpen && 
            !sidebar.contains(e.target) && 
            !toggle.contains(e.target)) {
            closeSidebar();
        }
    });
}

function closeSidebar() {
    const sidebar = document.getElementById('dashboard-sidebar');
    sidebar.classList.remove('active');
    dashboardState.sidebarOpen = false;
}

// =============================================================================
// MODALS
// =============================================================================
function initModals() {
    // Close modal buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Add Account Modal
    document.getElementById('add-account-btn')?.addEventListener('click', () => {
        openModal('add-account-modal');
    });
    
    document.getElementById('add-first-account-btn')?.addEventListener('click', () => {
        openModal('add-account-modal');
    });
    
    document.getElementById('confirm-add-account')?.addEventListener('click', addAccount);
    
    // Update Contact Modal
    document.getElementById('update-contact-btn')?.addEventListener('click', () => {
        openModal('update-contact-modal');
    });
    
    document.getElementById('confirm-update-contact')?.addEventListener('click', updateContact);
    
    // Cancel Subscription Modal
    document.getElementById('cancel-subscription-btn')?.addEventListener('click', () => {
        openModal('cancel-modal');
    });
    
    document.getElementById('confirm-cancel')?.addEventListener('click', cancelSubscription);
    
    // Plan Change buttons
    document.querySelectorAll('.btn-plan-select:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
            const plan = btn.dataset.plan;
            showPlanChangeModal(plan);
        });
    });
    
    document.getElementById('confirm-plan-change')?.addEventListener('click', confirmPlanChange);
}

function openModal(modalId) {
    document.getElementById(modalId)?.classList.remove('hidden');
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.add('hidden');
    });
}

// =============================================================================
// SETTINGS TABS
// =============================================================================
function initSettingsTabs() {
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            // Update active tab
            document.querySelectorAll('.settings-tab').forEach(t => {
                t.classList.toggle('active', t.dataset.tab === tabId);
            });
            
            // Show/hide panels
            document.querySelectorAll('.settings-panel').forEach(panel => {
                panel.classList.toggle('active', panel.id === `panel-${tabId}`);
            });
            
            dashboardState.currentSettingsTab = tabId;
        });
    });
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================
function initQuickActions() {
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            
            switch (action) {
                case 'check-all':
                    runBulkCheck();
                    break;
                case 'add-account':
                    openModal('add-account-modal');
                    break;
                case 'check-hashtags':
                    navigateToSection('tools');
                    setTimeout(() => {
                        document.getElementById('tool-hashtag-input')?.focus();
                    }, 300);
                    break;
                case 'download-report':
                    navigateToSection('reports');
                    break;
            }
        });
    });
    
    // Refresh All button
    document.getElementById('refresh-all-btn')?.addEventListener('click', () => {
        showToast('🔄', 'Refreshing all accounts...');
        setTimeout(() => {
            showToast('✅', 'All accounts refreshed!');
        }, 2000);
    });
}

// =============================================================================
// ACCOUNTS SECTION
// =============================================================================
function initAccountsSection() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.filter === filter);
            });
            
            filterAccounts(filter);
        });
    });
}

function filterAccounts(filter) {
    const cards = document.querySelectorAll('.account-card');
    
    cards.forEach(card => {
        const status = card.dataset.status;
        
        if (filter === 'all') {
            card.style.display = '';
        } else if (filter === 'healthy' && status === 'healthy') {
            card.style.display = '';
        } else if (filter === 'issues' && status === 'issues') {
            card.style.display = '';
        } else if (filter === 'banned' && status === 'banned') {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

function renderAccounts() {
    const grid = document.getElementById('accounts-grid');
    const empty = document.getElementById('accounts-empty');
    
    if (!grid) return;
    
    if (dashboardState.accounts.length === 0) {
        grid.innerHTML = '';
        empty?.classList.remove('hidden');
        return;
    }
    
    empty?.classList.add('hidden');
    
    grid.innerHTML = dashboardState.accounts.map(account => `
        <div class="account-card ${account.status}" data-status="${account.status}" data-id="${account.id}">
            <div class="account-header">
                <div class="account-platform">
                    <span class="account-platform-icon">${account.platformIcon}</span>
                    <div class="account-platform-info">
                        <h4>${account.username}</h4>
                        <span>${account.platformName} • ${account.nickname}</span>
                    </div>
                </div>
                <span class="account-status-badge ${account.status}">
                    ${account.status === 'healthy' ? '✓ Healthy' : account.status === 'issues' ? '⚠ Issues' : '🚫 Banned'}
                </span>
            </div>
            <div class="account-details">
                <div class="account-detail">
                    <span>Visibility Score</span>
                    <span>${account.score}%</span>
                </div>
                <div class="account-detail">
                    <span>Last Checked</span>
                    <span>${account.lastChecked}</span>
                </div>
            </div>
            <div class="account-actions">
                <button onclick="checkAccount(${account.id})">🔍 Check Now</button>
                <button onclick="viewAccountDetails(${account.id})">📊 Details</button>
                <button class="btn-remove" onclick="removeAccount(${account.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function addAccount() {
    const platform = document.getElementById('add-account-platform').value;
    const username = document.getElementById('add-account-username').value;
    const nickname = document.getElementById('add-account-nickname').value;
    
    if (!platform || !username) {
        showToast('⚠️', 'Please select a platform and enter a username');
        return;
    }
    
    // Check account limit
    if (dashboardState.accounts.length >= dashboardState.user.plan.accountLimit) {
        showToast('⚠️', `Account limit reached (${dashboardState.user.plan.accountLimit}). Upgrade to add more!`);
        closeAllModals();
        return;
    }
    
    const platformData = {
        instagram: { name: 'Instagram', icon: '📸' },
        tiktok: { name: 'TikTok', icon: '🎵' },
        twitter: { name: 'Twitter/X', icon: '🐦' },
        facebook: { name: 'Facebook', icon: '📘' },
        youtube: { name: 'YouTube', icon: '▶️' },
        linkedin: { name: 'LinkedIn', icon: '💼' },
        reddit: { name: 'Reddit', icon: '🤖' },
        pinterest: { name: 'Pinterest', icon: '📌' },
        threads: { name: 'Threads', icon: '🧵' },
        snapchat: { name: 'Snapchat', icon: '👻' },
        whatsapp: { name: 'WhatsApp', icon: '💬' },
        telegram: { name: 'Telegram', icon: '✈️' },
        discord: { name: 'Discord', icon: '🎮' },
        amazon: { name: 'Amazon', icon: '📦' },
        ebay: { name: 'eBay', icon: '🏷️' },
        etsy: { name: 'Etsy', icon: '🎨' }
    };
    
    const newAccount = {
        id: Date.now(),
        platform: platform,
        platformName: platformData[platform].name,
        platformIcon: platformData[platform].icon,
        username: username.startsWith('@') ? username : `@${username}`,
        nickname: nickname || platformData[platform].name,
        status: 'healthy',
        lastChecked: 'Just now',
        score: Math.floor(Math.random() * 20) + 80
    };
    
    dashboardState.accounts.push(newAccount);
    dashboardState.user.usage.accountsUsed++;
    
    renderAccounts();
    populateDashboard();
    closeAllModals();
    
    // Clear form
    document.getElementById('add-account-platform').value = '';
    document.getElementById('add-account-username').value = '';
    document.getElementById('add-account-nickname').value = '';
    
    showToast('✅', `${newAccount.username} added to monitoring!`);
}

function removeAccount(accountId) {
    if (!confirm('Remove this account from monitoring?')) return;
    
    dashboardState.accounts = dashboardState.accounts.filter(a => a.id !== accountId);
    dashboardState.user.usage.accountsUsed--;
    
    renderAccounts();
    populateDashboard();
    
    showToast('✅', 'Account removed from monitoring');
}

function checkAccount(accountId) {
    const account = dashboardState.accounts.find(a => a.id === accountId);
    if (!account) return;
    
    showToast('🔍', `Checking ${account.username}...`);
    
    setTimeout(() => {
        account.lastChecked = 'Just now';
        renderAccounts();
        showToast('✅', `${account.username} check complete!`);
    }, 1500);
}

function viewAccountDetails(accountId) {
    const account = dashboardState.accounts.find(a => a.id === accountId);
    if (!account) return;
    
    alert(`Account Details:\n\nPlatform: ${account.platformName}\nUsername: ${account.username}\nStatus: ${account.status}\nVisibility Score: ${account.score}%\nLast Checked: ${account.lastChecked}`);
}

// =============================================================================
// TOOLS SECTION
// =============================================================================
function initToolsSection() {
    // Shadow Ban Checker
    document.getElementById('run-shadowban-check')?.addEventListener('click', runShadowBanCheck);
    
    // Hashtag Checker
    const hashtagInput = document.getElementById('tool-hashtag-input');
    hashtagInput?.addEventListener('input', updateHashtagCount);
    document.getElementById('run-hashtag-check')?.addEventListener('click', runHashtagCheck);
    
    // Saved hashtag sets
    document.querySelectorAll('.saved-set-btn:not(.add-set)').forEach(btn => {
        btn.addEventListener('click', () => {
            const setName = btn.dataset.set;
            loadHashtagSet(setName);
        });
    });
    
    document.getElementById('add-hashtag-set')?.addEventListener('click', saveHashtagSet);
    
    // Post URL Analyzer
    document.getElementById('run-url-analysis')?.addEventListener('click', runUrlAnalysis);
    
    // Bulk Check
    document.getElementById('run-bulk-check')?.addEventListener('click', runBulkCheck);
    
    // Close results
    document.getElementById('close-tool-results')?.addEventListener('click', () => {
        document.getElementById('tool-results')?.classList.add('hidden');
    });
    
    // Recent items click
    document.querySelectorAll('.recent-item').forEach(item => {
        item.addEventListener('click', () => {
            document.getElementById('tool-username-input').value = item.textContent;
        });
    });
}

function runShadowBanCheck() {
    const platform = document.getElementById('tool-platform-select').value;
    const username = document.getElementById('tool-username-input').value;
    
    if (!platform || !username) {
        showToast('⚠️', 'Please select a platform and enter a username');
        return;
    }
    
    showToast('🔍', `Checking ${username} on ${platform}...`);
    
    setTimeout(() => {
        const score = Math.floor(Math.random() * 100);
        const status = score > 70 ? 'healthy' : score > 40 ? 'issues' : 'banned';
        
        showToolResults('Shadow Ban Check Results', `
            <div class="result-summary ${status}">
                <div class="result-score">
                    <span class="score-value">${score}%</span>
                    <span class="score-label">Visibility Score</span>
                </div>
                <div class="result-status">
                    ${status === 'healthy' ? '✅ No shadow ban detected' : 
                      status === 'issues' ? '⚠️ Potential visibility issues' : 
                      '🚫 Shadow ban likely'}
                </div>
            </div>
            <div class="result-details">
                <p><strong>Platform:</strong> ${platform}</p>
                <p><strong>Account:</strong> ${username}</p>
                <p><strong>Checked:</strong> Just now</p>
            </div>
        `);
    }, 2000);
}

function updateHashtagCount() {
    const input = document.getElementById('tool-hashtag-input').value;
    const hashtags = input.match(/#\w+/g) || [];
    document.getElementById('tool-hashtag-count').textContent = `${hashtags.length} hashtag${hashtags.length !== 1 ? 's' : ''}`;
}

function runHashtagCheck() {
    const input = document.getElementById('tool-hashtag-input').value;
    const hashtags = input.match(/#\w+/g) || [];
    
    if (hashtags.length === 0) {
        showToast('⚠️', 'Please enter at least one hashtag');
        return;
    }
    
    showToast('🏷️', `Checking ${hashtags.length} hashtags...`);
    
    setTimeout(() => {
        const results = hashtags.map(tag => ({
            tag,
            status: Math.random() > 0.2 ? 'safe' : Math.random() > 0.5 ? 'restricted' : 'banned'
        }));
        
        const safe = results.filter(r => r.status === 'safe').length;
        const restricted = results.filter(r => r.status === 'restricted').length;
        const banned = results.filter(r => r.status === 'banned').length;
        
        showToolResults('Hashtag Check Results', `
            <div class="hashtag-summary">
                <span class="tag-stat safe">✅ ${safe} Safe</span>
                <span class="tag-stat restricted">⚠️ ${restricted} Restricted</span>
                <span class="tag-stat banned">🚫 ${banned} Banned</span>
            </div>
            <div class="hashtag-results">
                ${results.map(r => `
                    <div class="hashtag-result ${r.status}">
                        <span>${r.tag}</span>
                        <span class="hashtag-status">${r.status === 'safe' ? '✅' : r.status === 'restricted' ? '⚠️' : '🚫'}</span>
                    </div>
                `).join('')}
            </div>
        `);
    }, 1500);
}

function loadHashtagSet(setName) {
    const set = mockHashtagSets[setName];
    if (set) {
        document.getElementById('tool-hashtag-input').value = set.join(' ');
        updateHashtagCount();
        showToast('✅', `Loaded ${setName} hashtag set`);
    }
}

function saveHashtagSet() {
    const name = prompt('Enter a name for this hashtag set:');
    if (name) {
        showToast('✅', `Hashtag set "${name}" saved!`);
    }
}

function runUrlAnalysis() {
    const url = document.getElementById('tool-url-input').value;
    
    if (!url) {
        showToast('⚠️', 'Please enter a post URL');
        return;
    }
    
    showToast('🔗', 'Analyzing post...');
    
    setTimeout(() => {
        showToolResults('Post Analysis Results', `
            <div class="result-summary healthy">
                <div class="result-score">
                    <span class="score-value">87%</span>
                    <span class="score-label">Visibility Score</span>
                </div>
                <div class="result-status">✅ Post appears to be visible</div>
            </div>
            <div class="result-details">
                <p><strong>URL:</strong> ${url}</p>
                <p><strong>Engagement:</strong> Normal</p>
                <p><strong>Hashtags:</strong> All safe</p>
                <p><strong>Checked:</strong> Just now</p>
            </div>
        `);
    }, 2000);
}

function runBulkCheck() {
    const count = dashboardState.accounts.length;
    
    if (count === 0) {
        showToast('⚠️', 'No accounts to check. Add some accounts first!');
        return;
    }
    
    showToast('⚡', `Checking ${count} accounts...`);
    
    setTimeout(() => {
        dashboardState.accounts.forEach(account => {
            account.lastChecked = 'Just now';
        });
        renderAccounts();
        showToast('✅', `All ${count} accounts checked!`);
    }, 2000);
}

function showToolResults(title, content) {
    const resultsDiv = document.getElementById('tool-results');
    const titleEl = document.getElementById('tool-results-title');
    const contentEl = document.getElementById('tool-results-content');
    
    if (resultsDiv && titleEl && contentEl) {
        titleEl.textContent = title;
        contentEl.innerHTML = content;
        resultsDiv.classList.remove('hidden');
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
}

// =============================================================================
// ALERTS SECTION
// =============================================================================
function initAlertsSection() {
    // Alert history filter
    document.getElementById('alerts-history-filter')?.addEventListener('change', (e) => {
        filterAlertHistory(e.target.value);
    });
    
    // Load more alerts
    document.getElementById('load-more-alerts')?.addEventListener('click', () => {
        showToast('📜', 'Loading more alerts...');
    });
}

function filterAlertHistory(filter) {
    const items = document.querySelectorAll('.alert-history-item');
    
    items.forEach(item => {
        if (filter === 'all') {
            item.style.display = '';
        } else {
            item.style.display = item.classList.contains(filter) ? '' : 'none';
        }
    });
}

// =============================================================================
// SETTINGS SECTION
// =============================================================================
function initSettingsSection() {
    // Save profile
    document.getElementById('save-profile-btn')?.addEventListener('click', saveProfile);
    
    // Change password
    document.getElementById('change-password-btn')?.addEventListener('click', changePassword);
    
    // Update payment
    document.getElementById('update-payment-btn')?.addEventListener('click', () => {
        showToast('💳', 'Redirecting to Stripe...');
    });
    
    // Save frequency
    document.getElementById('save-frequency-btn')?.addEventListener('click', saveFrequency);
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', logout);
}

function saveProfile() {
    const firstName = document.getElementById('profile-first-name').value;
    const lastName = document.getElementById('profile-last-name').value;
    const email = document.getElementById('profile-email').value;
    const phone = document.getElementById('profile-phone').value;
    
    dashboardState.user.firstName = firstName;
    dashboardState.user.lastName = lastName;
    dashboardState.user.email = email;
    dashboardState.user.phone = phone;
    
    populateDashboard();
    showToast('✅', 'Profile updated successfully!');
}

function changePassword() {
    const current = document.getElementById('current-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;
    
    if (!current || !newPass || !confirm) {
        showToast('⚠️', 'Please fill in all password fields');
        return;
    }
    
    if (newPass !== confirm) {
        showToast('⚠️', 'New passwords do not match');
        return;
    }
    
    // Clear fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    
    showToast('✅', 'Password changed successfully!');
}

function updateContact() {
    const email = document.getElementById('update-email').value;
    const phone = document.getElementById('update-phone').value;
    
    dashboardState.user.email = email;
    dashboardState.user.phone = phone;
    
    // Update displays
    document.getElementById('alert-email').textContent = email;
    document.getElementById('alert-phone').textContent = phone;
    
    closeAllModals();
    showToast('✅', 'Contact information updated!');
}

function showPlanChangeModal(newPlan) {
    const plans = {
        starter: { name: 'Starter', price: 4.99, accounts: 5, ai: 3 },
        pro: { name: 'Pro', price: 9.99, accounts: 15, ai: 10 },
        premium: { name: 'Premium', price: 14.99, accounts: 50, ai: 25 }
    };
    
    const plan = plans[newPlan];
    const currentPlan = dashboardState.user.plan.name.toLowerCase();
    const isUpgrade = plan.price > dashboardState.user.plan.price;
    
    document.getElementById('plan-change-title').textContent = isUpgrade ? '⬆️ Upgrade Plan' : '⬇️ Downgrade Plan';
    document.getElementById('plan-change-summary').innerHTML = `
        <div class="plan-change-details">
            <div class="plan-change-from">
                <span>Current Plan</span>
                <strong>${dashboardState.user.plan.name}</strong>
                <span>$${dashboardState.user.plan.price}/mo</span>
            </div>
            <div class="plan-change-arrow">→</div>
            <div class="plan-change-to">
                <span>New Plan</span>
                <strong>${plan.name}</strong>
                <span>$${plan.price}/mo</span>
            </div>
        </div>
        <div class="plan-change-info">
            <p>${isUpgrade ? 
                'You will be charged the prorated difference immediately.' : 
                'Your new plan will take effect at the end of your billing period.'}</p>
        </div>
    `;
    
    document.getElementById('confirm-plan-change').dataset.plan = newPlan;
    openModal('plan-change-modal');
}

function confirmPlanChange() {
    const newPlan = document.getElementById('confirm-plan-change').dataset.plan;
    
    const plans = {
        starter: { name: 'Starter', price: 4.99, accountLimit: 5, aiQuestionsPerDay: 3 },
        pro: { name: 'Pro', price: 9.99, accountLimit: 15, aiQuestionsPerDay: 10 },
        premium: { name: 'Premium', price: 14.99, accountLimit: 50, aiQuestionsPerDay: 25 }
    };
    
    dashboardState.user.plan = { ...dashboardState.user.plan, ...plans[newPlan] };
    
    closeAllModals();
    populateDashboard();
    showToast('✅', `Plan changed to ${plans[newPlan].name}!`);
}

function cancelSubscription() {
    closeAllModals();
    showToast('😢', 'Subscription cancelled. Access continues until December 24, 2025.');
}

// =============================================================================
// FREQUENCY OPTIONS
// =============================================================================
function initFrequencyOptions() {
    document.querySelectorAll('input[name="frequency"]').forEach(radio => {
        radio.addEventListener('change', updateFrequencySummary);
    });
}

function updateFrequencySummary() {
    const frequency = document.querySelector('input[name="frequency"]:checked').value;
    const adjustmentEl = document.getElementById('frequency-adjustment');
    const totalEl = document.getElementById('frequency-total');
    
    const adjustments = {
        daily: 0,
        '6hours': 2,
        hourly: 5
    };
    
    const adjustment = adjustments[frequency];
    const total = dashboardState.user.plan.price + adjustment;
    
    adjustmentEl.textContent = adjustment > 0 ? `+$${adjustment.toFixed(2)}` : 'Included';
    totalEl.textContent = `$${total.toFixed(2)}`;
    
    // Update selected state
    document.querySelectorAll('.frequency-option').forEach(opt => {
        const input = opt.querySelector('input');
        opt.classList.toggle('selected', input.checked);
    });
}

function saveFrequency() {
    const frequency = document.querySelector('input[name="frequency"]:checked').value;
    dashboardState.user.plan.frequency = frequency;
    showToast('✅', 'Check frequency updated!');
}

// =============================================================================
// SUPPORT SECTION
// =============================================================================
function initSupportSection() {
    // Open Shadow AI
    document.getElementById('open-ai-support')?.addEventListener('click', () => {
        document.getElementById('shadow-ai-btn')?.click();
    });
    
    // Support form
    document.getElementById('support-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('support-subject').value;
        const message = document.getElementById('support-message').value;
        
        if (!subject || !message) {
            showToast('⚠️', 'Please fill in all fields');
            return;
        }
        
        // Clear form
        document.getElementById('support-subject').value = '';
        document.getElementById('support-message').value = '';
        
        showToast('✅', 'Message sent! We\'ll get back to you soon.');
    });
}

// =============================================================================
// POPULATE DASHBOARD
// =============================================================================
function populateDashboard() {
    const user = dashboardState.user;
    const accounts = dashboardState.accounts;
    
    // Counts
    const healthy = accounts.filter(a => a.status === 'healthy').length;
    const issues = accounts.filter(a => a.status === 'issues').length;
    const banned = accounts.filter(a => a.status === 'banned').length;
    const total = accounts.length;
    
    // Overview stats
    document.getElementById('stat-healthy').textContent = healthy;
    document.getElementById('stat-issues').textContent = issues;
    document.getElementById('stat-banned').textContent = banned;
    document.getElementById('stat-total').textContent = total;
    
    // User name
    document.getElementById('user-first-name').textContent = user.firstName;
    document.getElementById('sidebar-user-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('sidebar-user-email').textContent = user.email;
    
    // Plan info
    document.getElementById('sidebar-plan-name').textContent = `${user.plan.name} Plan`;
    document.getElementById('sidebar-accounts').textContent = `${user.usage.accountsUsed} / ${user.plan.accountLimit}`;
    document.getElementById('sidebar-ai').textContent = `${user.usage.aiQuestionsUsed} / ${user.plan.aiQuestionsPerDay} today`;
    
    // Usage
    document.getElementById('usage-checks').textContent = `${user.usage.shadowChecks} / Unlimited`;
    document.getElementById('usage-hashtags').textContent = `${user.usage.hashtagChecks} / Unlimited`;
    document.getElementById('usage-ai').textContent = `${user.usage.aiQuestionsUsed} / ${user.plan.aiQuestionsPerDay}`;
    document.getElementById('usage-accounts').textContent = `${user.usage.accountsUsed} / ${user.plan.accountLimit}`;
    
    // Update usage bar widths
    const aiPercentage = (user.usage.aiQuestionsUsed / user.plan.aiQuestionsPerDay) * 100;
    const accountPercentage = (user.usage.accountsUsed / user.plan.accountLimit) * 100;
    
    // Accounts section counts
    document.getElementById('accounts-count').textContent = total;
    document.getElementById('accounts-limit').textContent = user.plan.accountLimit;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const filter = btn.dataset.filter;
        if (filter === 'all') btn.textContent = `All (${total})`;
        if (filter === 'healthy') btn.textContent = `Healthy (${healthy})`;
        if (filter === 'issues') btn.textContent = `Issues (${issues})`;
        if (filter === 'banned') btn.textContent = `Banned (${banned})`;
    });
    
    // AI Questions badge
    document.getElementById('ai-questions-badge').textContent = `${user.usage.aiQuestionsUsed}/${user.plan.aiQuestionsPerDay}`;
    document.getElementById('support-ai-remaining').textContent = user.plan.aiQuestionsPerDay - user.usage.aiQuestionsUsed;
    
    // Render accounts grid
    renderAccounts();
    
    // Render accounts mini list (overview)
    renderAccountsMini();
    
    // Update alert email/phone
    document.getElementById('alert-email').textContent = user.email;
    document.getElementById('alert-phone').textContent = user.phone;
    
    // Profile form
    document.getElementById('profile-first-name').value = user.firstName;
    document.getElementById('profile-last-name').value = user.lastName;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-phone').value = user.phone;
    
    // Support form
    document.getElementById('support-name').value = `${user.firstName} ${user.lastName}`;
    document.getElementById('support-email').value = user.email;
}

function renderAccountsMini() {
    const container = document.getElementById('accounts-mini');
    if (!container) return;
    
    const displayAccounts = dashboardState.accounts.slice(0, 5);
    
    container.innerHTML = displayAccounts.map(account => `
        <div class="account-mini-item">
            <span class="account-mini-icon">${account.platformIcon}</span>
            <span class="account-mini-name">${account.username}</span>
            <span class="account-mini-status ${account.status}">
                ${account.status === 'healthy' ? 'Healthy' : account.status === 'issues' ? 'Issues' : 'Banned'}
            </span>
        </div>
    `).join('');
    
    if (dashboardState.accounts.length > 5) {
        container.innerHTML += `
            <div class="account-mini-item" style="justify-content: center; cursor: pointer;" onclick="navigateToSection('accounts')">
                <span style="color: var(--primary-light);">+ ${dashboardState.accounts.length - 5} more accounts</span>
            </div>
        `;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
function showToast(icon, message) {
    const toast = document.getElementById('toast-dash');
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

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showToast('👋', 'Logging out...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Make functions available globally
window.checkAccount = checkAccount;
window.viewAccountDetails = viewAccountDetails;
window.removeAccount = removeAccount;
window.navigateToSection = navigateToSection;
