/* =============================================================================
   AGENCY DASHBOARD JS v1.0
   ShadowBanCheck.io - Agency Dashboard Logic
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// STATE
// =============================================================================
let currentSection = 'dashboard';
let selectedClient = null;

// Demo clients data
const clients = {
    'acme-corp': {
        id: 'acme-corp',
        name: 'ACME Corporation',
        icon: '🏭',
        contact: 'marketing@acmecorp.com',
        accounts: [
            { platform: 'twitter', platformName: 'Twitter/X', icon: '𝕏', username: '@acmecorp', status: 'healthy', score: 15 },
            { platform: 'instagram', platformName: 'Instagram', icon: '📷', username: '@acme.corp', status: 'warning', score: 42 },
            { platform: 'linkedin', platformName: 'LinkedIn', icon: 'in', username: 'acme-corporation', status: 'healthy', score: 8 }
        ]
    },
    'tech-startup': {
        id: 'tech-startup',
        name: 'Tech Startup Inc',
        icon: '🚀',
        contact: 'social@techstartup.io',
        accounts: [
            { platform: 'twitter', platformName: 'Twitter/X', icon: '𝕏', username: '@techstartup', status: 'issues', score: 67 },
            { platform: 'tiktok', platformName: 'TikTok', icon: '♪', username: '@techstartup', status: 'healthy', score: 22 }
        ]
    },
    'local-restaurant': {
        id: 'local-restaurant',
        name: 'Local Restaurant',
        icon: '🍕',
        contact: 'owner@localrestaurant.com',
        accounts: [
            { platform: 'instagram', platformName: 'Instagram', icon: '📷', username: '@localfood', status: 'banned', score: 85 },
            { platform: 'facebook', platformName: 'Facebook', icon: 'ⓕ', username: 'localrestaurant', status: 'warning', score: 38 }
        ]
    }
};

// =============================================================================
// INITIALIZATION
// =============================================================================
function init() {
    console.log('🏢 Agency Dashboard v1.0 Initializing...');
    
    initNavigation();
    initFromHash();
    updateStats();
    
    console.log('✅ Agency Dashboard initialized');
}

// =============================================================================
// NAVIGATION
// =============================================================================
function initNavigation() {
    // Nav item clicks
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (section) {
                switchSection(section);
            }
        });
    });
    
    // Handle browser back/forward
    window.addEventListener('hashchange', initFromHash);
}

function initFromHash() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    switchSection(hash, false);
}

function switchSection(sectionName, updateHash = true) {
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionName);
    });
    
    // Update active section
    document.querySelectorAll('.agency-section').forEach(section => {
        section.classList.toggle('active', section.id === `section-${sectionName}`);
    });
    
    currentSection = sectionName;
    
    if (updateHash) {
        window.location.hash = sectionName;
    }
}

// Make globally available
window.switchSection = switchSection;

// =============================================================================
// STATS
// =============================================================================
function updateStats() {
    const allAccounts = Object.values(clients).flatMap(c => c.accounts);
    const healthy = allAccounts.filter(a => a.status === 'healthy').length;
    const issues = allAccounts.filter(a => a.status !== 'healthy').length;
    
    // Dashboard stats
    const statClients = document.getElementById('stat-clients');
    const statAccounts = document.getElementById('stat-accounts');
    const statHealthy = document.getElementById('stat-healthy');
    const statIssues = document.getElementById('stat-issues');
    
    if (statClients) statClients.textContent = Object.keys(clients).length;
    if (statAccounts) statAccounts.textContent = allAccounts.length;
    if (statHealthy) statHealthy.textContent = healthy;
    if (statIssues) statIssues.textContent = issues;
    
    // Nav badges
    const navClientCount = document.getElementById('nav-client-count');
    if (navClientCount) navClientCount.textContent = Object.keys(clients).length;
}

// =============================================================================
// CLIENT FUNCTIONS
// =============================================================================
function selectClient(clientId) {
    selectedClient = clientId;
    
    // Set context in Shadow AI
    if (window.ShadowAI && window.ShadowAI.setClient) {
        window.ShadowAI.setClient(clientId);
    }
    
    // Switch to clients section
    switchSection('clients');
    
    // Highlight the client card
    document.querySelectorAll('.client-card').forEach(card => {
        card.style.borderColor = card.dataset.client === clientId ? 'var(--primary)' : '';
    });
    
    showToast('📋', `Selected: ${clients[clientId]?.name || clientId}`);
}

window.selectClient = selectClient;

function viewClient(clientId) {
    selectClient(clientId);
    showToast('👁️', `Viewing ${clients[clientId]?.name}`);
}

window.viewClient = viewClient;

function checkClient(clientId) {
    const client = clients[clientId];
    if (!client) return;
    
    const accountCount = client.accounts.length;
    const cost = (accountCount * 0.05).toFixed(2);
    
    if (confirm(`Check all ${accountCount} accounts for ${client.name}?\nEstimated cost: $${cost}`)) {
        showToast('🔍', `Checking ${accountCount} accounts...`);
        
        // Simulate check
        setTimeout(() => {
            showToast('✅', `Scan complete for ${client.name}!`);
        }, 2000);
    }
}

window.checkClient = checkClient;

function createDispute(clientId) {
    const client = clients[clientId];
    if (!client) return;
    
    // Find accounts with issues
    const issueAccounts = client.accounts.filter(a => a.status !== 'healthy');
    
    if (issueAccounts.length === 0) {
        showToast('✅', `${client.name} has no accounts needing disputes!`);
        return;
    }
    
    // Switch to resolution center
    switchSection('resolution');
    
    showToast('📋', `Creating dispute for ${client.name}...`);
}

window.createDispute = createDispute;

// =============================================================================
// BULK CHECK
// =============================================================================
function runBulkCheck() {
    const allAccounts = Object.values(clients).flatMap(c => c.accounts);
    const cost = (allAccounts.length * 0.05).toFixed(2);
    
    if (confirm(`Run bulk check on ${allAccounts.length} accounts?\nCost: $${cost}`)) {
        showToast('⚡', `Running bulk check on ${allAccounts.length} accounts...`);
        
        // Simulate progress
        let checked = 0;
        const interval = setInterval(() => {
            checked++;
            if (checked >= allAccounts.length) {
                clearInterval(interval);
                showToast('✅', 'Bulk check complete!');
            }
        }, 300);
    }
}

window.runBulkCheck = runBulkCheck;

// =============================================================================
// DISPUTE FUNCTIONS
// =============================================================================
function viewDispute(disputeId) {
    showToast('📋', `Viewing dispute: ${disputeId}`);
}

window.viewDispute = viewDispute;

function showNewDisputeModal() {
    showToast('➕', 'Opening new dispute form...');
}

window.showNewDisputeModal = showNewDisputeModal;

// =============================================================================
// TOAST
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

window.showToast = showToast;

// =============================================================================
// INIT ON DOM READY
// =============================================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
