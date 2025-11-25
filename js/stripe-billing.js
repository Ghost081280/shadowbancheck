/* =============================================================================
   STRIPE BILLING INTEGRATION
   ShadowBanCheck.io - Dashboard Payment System
   
   SETUP: Replace 'pk_test_YOUR_PUBLISHABLE_KEY_HERE' with your Stripe key
   ============================================================================= */

(function() {
'use strict';

// ============================================
// CONFIGURATION - UPDATE THIS
// ============================================
const STRIPE_CONFIG = {
    // Replace with your Stripe publishable key
    publishableKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE',
    
    // Price IDs from your Stripe Dashboard
    prices: {
        starter: 'price_starter_monthly',
        pro: 'price_pro_monthly',
        premium: 'price_premium_monthly',
        aiPro: 'price_ai_pro_addon'
    },
    
    // API endpoints (update for your backend)
    endpoints: {
        billing: '/api/billing',
        createCheckout: '/api/billing/create-checkout-session',
        changePlan: '/api/billing/change-plan',
        cancel: '/api/billing/cancel',
        resume: '/api/billing/resume',
        setupIntent: '/api/billing/setup-intent',
        invoice: '/api/billing/invoice',
        portal: '/api/billing/create-portal-session'
    }
};

// ============================================
// STATE
// ============================================
let stripe = null;
let elements = null;
let billingData = null;
let isDemoMode = false;

// ============================================
// DEMO DATA (when Stripe key not configured)
// ============================================
const DEMO_BILLING_DATA = {
    subscription: {
        id: 'sub_demo123',
        status: 'active',
        plan: 'Pro',
        priceId: 'price_pro_monthly',
        amount: 999,
        interval: 'month',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
    },
    paymentMethod: {
        id: 'pm_demo123',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025
    },
    transactions: [
        { id: 'in_1', date: '2024-01-15', amount: 999, status: 'paid', description: 'Pro Plan - Monthly' },
        { id: 'in_2', date: '2023-12-15', amount: 999, status: 'paid', description: 'Pro Plan - Monthly' },
        { id: 'in_3', date: '2023-11-15', amount: 999, status: 'paid', description: 'Pro Plan - Monthly' },
        { id: 'in_4', date: '2023-10-15', amount: 499, status: 'paid', description: 'Starter Plan - Monthly' }
    ],
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    amountDue: 999
};

// ============================================
// INITIALIZATION
// ============================================
async function init() {
    console.log('💳 Stripe Billing Initializing...');
    
    // Check if Stripe key is configured
    if (STRIPE_CONFIG.publishableKey.includes('YOUR_PUBLISHABLE_KEY')) {
        console.log('⚠️ Stripe key not configured - running in DEMO MODE');
        isDemoMode = true;
        billingData = DEMO_BILLING_DATA;
        renderBillingTab();
        console.log('✅ Stripe Billing Ready (Demo Mode)');
        return;
    }
    
    // Load Stripe
    if (typeof Stripe === 'undefined') {
        console.error('❌ Stripe.js not loaded');
        return;
    }
    
    try {
        stripe = Stripe(STRIPE_CONFIG.publishableKey);
        await getBillingData();
        renderBillingTab();
        console.log('✅ Stripe Billing Ready');
    } catch (error) {
        console.error('❌ Stripe initialization failed:', error);
        isDemoMode = true;
        billingData = DEMO_BILLING_DATA;
        renderBillingTab();
    }
}

// ============================================
// API FUNCTIONS
// ============================================
async function getBillingData() {
    if (isDemoMode) {
        billingData = DEMO_BILLING_DATA;
        return billingData;
    }
    
    try {
        const response = await fetch(STRIPE_CONFIG.endpoints.billing);
        if (!response.ok) throw new Error('Failed to fetch billing data');
        billingData = await response.json();
        return billingData;
    } catch (error) {
        console.error('Error fetching billing data:', error);
        billingData = DEMO_BILLING_DATA;
        isDemoMode = true;
        return billingData;
    }
}

async function createSubscription(priceId) {
    if (isDemoMode) {
        alert('Demo Mode: Would create subscription with price ' + priceId);
        return;
    }
    
    try {
        const response = await fetch(STRIPE_CONFIG.endpoints.createCheckout, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId })
        });
        
        const { sessionId } = await response.json();
        await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
        console.error('Error creating subscription:', error);
        showBillingError('Failed to start checkout. Please try again.');
    }
}

async function changePlan(newPriceId) {
    if (isDemoMode) {
        alert('Demo Mode: Would change plan to ' + newPriceId);
        return;
    }
    
    try {
        const response = await fetch(STRIPE_CONFIG.endpoints.changePlan, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId: newPriceId })
        });
        
        if (!response.ok) throw new Error('Failed to change plan');
        
        await getBillingData();
        renderBillingTab();
        showBillingSuccess('Plan updated successfully!');
    } catch (error) {
        console.error('Error changing plan:', error);
        showBillingError('Failed to change plan. Please try again.');
    }
}

async function cancelSubscription() {
    if (isDemoMode) {
        alert('Demo Mode: Would cancel subscription');
        return;
    }
    
    try {
        const response = await fetch(STRIPE_CONFIG.endpoints.cancel, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Failed to cancel subscription');
        
        await getBillingData();
        renderBillingTab();
        showBillingSuccess('Subscription will cancel at period end.');
    } catch (error) {
        console.error('Error canceling subscription:', error);
        showBillingError('Failed to cancel subscription. Please try again.');
    }
}

async function resumeSubscription() {
    if (isDemoMode) {
        alert('Demo Mode: Would resume subscription');
        return;
    }
    
    try {
        const response = await fetch(STRIPE_CONFIG.endpoints.resume, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Failed to resume subscription');
        
        await getBillingData();
        renderBillingTab();
        showBillingSuccess('Subscription resumed!');
    } catch (error) {
        console.error('Error resuming subscription:', error);
        showBillingError('Failed to resume subscription. Please try again.');
    }
}

async function openCustomerPortal() {
    if (isDemoMode) {
        alert('Demo Mode: Would open Stripe Customer Portal');
        return;
    }
    
    try {
        const response = await fetch(STRIPE_CONFIG.endpoints.portal, {
            method: 'POST'
        });
        
        const { url } = await response.json();
        window.location.href = url;
    } catch (error) {
        console.error('Error opening customer portal:', error);
        showBillingError('Failed to open billing portal. Please try again.');
    }
}

async function downloadInvoice(invoiceId) {
    if (isDemoMode) {
        alert('Demo Mode: Would download invoice ' + invoiceId);
        return;
    }
    
    try {
        const response = await fetch(`${STRIPE_CONFIG.endpoints.invoice}/${invoiceId}`);
        const { url } = await response.json();
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error downloading invoice:', error);
        showBillingError('Failed to download invoice. Please try again.');
    }
}

// ============================================
// UI RENDERING
// ============================================
function renderBillingTab() {
    if (!billingData) return;
    
    // Update current plan display
    const planNameEl = document.getElementById('billing-plan-name');
    const planPriceEl = document.getElementById('billing-plan-price');
    const nextBillingEl = document.getElementById('billing-next-date');
    
    if (planNameEl && billingData.subscription) {
        planNameEl.textContent = billingData.subscription.plan;
    }
    
    if (planPriceEl && billingData.subscription) {
        const price = (billingData.subscription.amount / 100).toFixed(2);
        planPriceEl.textContent = `$${price}/${billingData.subscription.interval}`;
    }
    
    if (nextBillingEl) {
        nextBillingEl.textContent = billingData.nextBillingDate;
    }
    
    // Update payment method
    const cardBrandEl = document.getElementById('card-brand');
    const cardLast4El = document.getElementById('card-last4');
    const cardExpiryEl = document.getElementById('card-expiry');
    
    if (billingData.paymentMethod) {
        if (cardBrandEl) cardBrandEl.textContent = billingData.paymentMethod.brand.toUpperCase();
        if (cardLast4El) cardLast4El.textContent = `•••• ${billingData.paymentMethod.last4}`;
        if (cardExpiryEl) cardExpiryEl.textContent = `${billingData.paymentMethod.expMonth}/${billingData.paymentMethod.expYear}`;
    }
    
    // Render transactions
    renderTransactions();
    
    // Update cancel/resume button
    updateCancelButton();
}

function renderTransactions() {
    const container = document.getElementById('transactions-list');
    if (!container || !billingData.transactions) return;
    
    const html = billingData.transactions.map(tx => `
        <div class="transaction-row">
            <div class="transaction-date">${tx.date}</div>
            <div class="transaction-desc">${tx.description}</div>
            <div class="transaction-amount">$${(tx.amount / 100).toFixed(2)}</div>
            <div class="transaction-status ${tx.status}">${tx.status}</div>
            <button class="btn-download" onclick="StripeBilling.downloadInvoice('${tx.id}')">
                📄
            </button>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function updateCancelButton() {
    const cancelBtn = document.getElementById('cancel-subscription-btn');
    if (!cancelBtn || !billingData.subscription) return;
    
    if (billingData.subscription.cancelAtPeriodEnd) {
        cancelBtn.textContent = 'Resume Subscription';
        cancelBtn.onclick = () => handleResumeSubscription();
    } else {
        cancelBtn.textContent = 'Cancel Subscription';
        cancelBtn.onclick = () => handleCancelSubscription();
    }
}

// ============================================
// UI HANDLERS
// ============================================
function handlePlanChange(planKey) {
    const priceId = STRIPE_CONFIG.prices[planKey];
    if (!priceId) {
        console.error('Invalid plan key:', planKey);
        return;
    }
    
    if (billingData.subscription && billingData.subscription.priceId === priceId) {
        showBillingError('You are already on this plan.');
        return;
    }
    
    if (confirm('Are you sure you want to change your plan? Your billing will be prorated.')) {
        if (billingData.subscription) {
            changePlan(priceId);
        } else {
            createSubscription(priceId);
        }
    }
}

function handleCancelSubscription() {
    if (confirm('Are you sure you want to cancel? You will keep access until the end of your billing period.')) {
        cancelSubscription();
    }
}

function handleResumeSubscription() {
    resumeSubscription();
}

// ============================================
// NOTIFICATIONS
// ============================================
function showBillingSuccess(message) {
    // Use existing toast if available
    if (typeof showToast === 'function') {
        showToast('✅', message);
    } else {
        alert(message);
    }
}

function showBillingError(message) {
    if (typeof showToast === 'function') {
        showToast('❌', message);
    } else {
        alert(message);
    }
}

// ============================================
// INITIALIZATION
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================
// EXPORTS
// ============================================
window.StripeBilling = {
    init,
    getBillingData,
    createSubscription,
    changePlan,
    cancelSubscription,
    resumeSubscription,
    openCustomerPortal,
    downloadInvoice,
    handlePlanChange,
    renderBillingTab,
    isDemoMode: () => isDemoMode,
    getConfig: () => STRIPE_CONFIG
};

})();
