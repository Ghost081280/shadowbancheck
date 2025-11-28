/* =============================================================================
   LOGIN.JS v3.1
   ShadowBanCheck.io - Authentication System with Clean URL Routing
   Routes to: /pro (user), /agency (agency), /admin (admin)
   ============================================================================= */

// =============================================================================
// DEMO ACCOUNTS (Replace with backend auth in production)
// =============================================================================
const DEMO_ACCOUNTS = {
    // Pro (User) account
    'demo@test.com': {
        password: 'password123',
        role: 'user',
        name: 'Demo User',
        redirect: 'pro.html'  // /pro
    },
    // Agency account
    'agency@test.com': {
        password: 'agency123',
        role: 'agency',
        name: 'Agency Demo',
        redirect: 'agency.html'  // /agency
    },
    // Admin account
    'admin@shadowbancheck.io': {
        password: 'admin',
        role: 'admin',
        name: 'Admin',
        redirect: 'admin.html'  // /admin
    }
};

// =============================================================================
// URL CONFIGURATION
// =============================================================================
const REDIRECTS = {
    user: 'pro.html',      // /pro
    agency: 'agency.html', // /agency
    admin: 'admin.html'    // /admin
};

// =============================================================================
// STORAGE KEYS
// =============================================================================
const STORAGE_KEY = 'shadowban_session';

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Login System v3.1 Initializing...');
    
    // Check if already logged in
    checkExistingSession();
    
    console.log('✅ Login system initialized');
});

// =============================================================================
// SESSION CHECK
// =============================================================================
function checkExistingSession() {
    const session = localStorage.getItem(STORAGE_KEY) || 
                   sessionStorage.getItem(STORAGE_KEY);
    
    if (session) {
        try {
            const data = JSON.parse(session);
            if (data.loggedIn && data.email) {
                // Redirect based on role
                redirectByRole(data.role || 'user');
            }
        } catch (e) {
            // Invalid session, clear it
            localStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }
}

function redirectByRole(role) {
    switch (role) {
        case 'admin':
            window.location.href = REDIRECTS.admin;
            break;
        case 'agency':
            window.location.href = REDIRECTS.agency;
            break;
        default:
            window.location.href = REDIRECTS.user;
    }
}

// =============================================================================
// LOGIN FORM
// =============================================================================
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember-me')?.checked || false;
    
    // Check demo accounts
    if (DEMO_ACCOUNTS[email]) {
        const account = DEMO_ACCOUNTS[email];
        if (account.password === password) {
            // Success - create session
            createSession(email, account.role, account.name, remember);
            showToast('✅', `Welcome back, ${account.name}!`);
            setTimeout(() => {
                window.location.href = account.redirect;
            }, 500);
            return false;
        }
    }
    
    // Check registered users
    const users = getRegisteredUsers();
    const user = users[email];
    
    if (user && user.password === password) {
        // Success - create session
        createSession(email, user.role || 'user', user.name || 'User', remember);
        showToast('✅', `Welcome back!`);
        setTimeout(() => {
            redirectByRole(user.role || 'user');
        }, 500);
        return false;
    }
    
    // Failed
    showToast('❌', 'Invalid email or password');
    return false;
}

function createSession(email, role, name, remember) {
    const sessionData = {
        loggedIn: true,
        email: email,
        role: role,
        name: name,
        isAdmin: role === 'admin',
        isAgency: role === 'agency',
        createdAt: Date.now()
    };
    
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    
    // Also store in localStorage if remember
    if (remember) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    }
}

// =============================================================================
// SIGNUP FORM
// =============================================================================
let pendingSignup = null;
let verificationCode = null;

function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;
    
    // Validation
    if (password.length < 8) {
        showToast('⚠️', 'Password must be at least 8 characters');
        return false;
    }
    
    // Check if email already exists
    const users = getRegisteredUsers();
    if (users[email] || DEMO_ACCOUNTS[email]) {
        showToast('⚠️', 'An account with this email already exists');
        return false;
    }
    
    // Store pending signup
    pendingSignup = {
        firstName,
        lastName,
        email,
        password,
        name: `${firstName} ${lastName}`
    };
    
    // Generate verification code
    verificationCode = generateCode();
    console.log('📧 Verification code:', verificationCode);
    
    // Show verification step
    document.getElementById('signup-card').classList.add('hidden');
    document.getElementById('verify-card').classList.remove('hidden');
    document.getElementById('verify-email').textContent = email;
    
    showToast('📧', `Code sent! (Demo: ${verificationCode})`);
    
    return false;
}

function handleVerify(e) {
    e.preventDefault();
    
    const code = document.getElementById('verify-code').value.trim();
    
    if (code !== verificationCode) {
        showToast('❌', 'Invalid verification code');
        return false;
    }
    
    if (!pendingSignup) {
        showToast('❌', 'Signup session expired');
        showLogin();
        return false;
    }
    
    // Save the new user
    const users = getRegisteredUsers();
    users[pendingSignup.email] = {
        password: pendingSignup.password,
        name: pendingSignup.name,
        firstName: pendingSignup.firstName,
        lastName: pendingSignup.lastName,
        role: 'user',
        createdAt: Date.now()
    };
    saveRegisteredUsers(users);
    
    // Create session and redirect
    createSession(pendingSignup.email, 'user', pendingSignup.name, true);
    showToast('✅', 'Account created! Welcome aboard!');
    
    setTimeout(() => {
        window.location.href = REDIRECTS.user;
    }, 1000);
    
    return false;
}

function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value.trim();
    
    // Always show success (don't reveal if email exists)
    showToast('📧', 'If an account exists, a reset link has been sent.');
    showLogin();
    
    return false;
}

// =============================================================================
// NAVIGATION
// =============================================================================
function showLogin() {
    document.getElementById('login-card').classList.remove('hidden');
    document.getElementById('signup-card').classList.add('hidden');
    document.getElementById('verify-card').classList.add('hidden');
    document.getElementById('forgot-card').classList.add('hidden');
}

function showSignup() {
    document.getElementById('login-card').classList.add('hidden');
    document.getElementById('signup-card').classList.remove('hidden');
    document.getElementById('verify-card').classList.add('hidden');
    document.getElementById('forgot-card').classList.add('hidden');
}

function showForgotPassword() {
    document.getElementById('login-card').classList.add('hidden');
    document.getElementById('signup-card').classList.add('hidden');
    document.getElementById('verify-card').classList.add('hidden');
    document.getElementById('forgot-card').classList.remove('hidden');
}

function resendCode() {
    if (!pendingSignup) {
        showToast('⚠️', 'Please start signup again');
        showSignup();
        return;
    }
    
    verificationCode = generateCode();
    console.log('📧 New verification code:', verificationCode);
    showToast('📧', `New code sent! (Demo: ${verificationCode})`);
}

// =============================================================================
// PASSWORD TOGGLE
// =============================================================================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const btn = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

// =============================================================================
// DEMO AUTO-FILL FUNCTIONS
// =============================================================================
function autofillDemo() {
    document.getElementById('email').value = 'demo@test.com';
    document.getElementById('password').value = 'password123';
    showToast('⚡', 'Pro credentials filled!');
}

function autofillAgency() {
    document.getElementById('email').value = 'agency@test.com';
    document.getElementById('password').value = 'agency123';
    showToast('🏢', 'Agency credentials filled!');
}

function autofillAdmin() {
    document.getElementById('email').value = 'admin@shadowbancheck.io';
    document.getElementById('password').value = 'admin';
    showToast('👑', 'Admin credentials filled!');
}

// =============================================================================
// GOOGLE SIGN IN (Placeholder)
// =============================================================================
function handleGoogleSignIn() {
    showToast('🔧', 'Google Sign-In coming soon!');
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
function getRegisteredUsers() {
    try {
        return JSON.parse(localStorage.getItem('shadowban_users') || '{}');
    } catch {
        return {};
    }
}

function saveRegisteredUsers(users) {
    localStorage.setItem('shadowban_users', JSON.stringify(users));
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// =============================================================================
// TOAST
// =============================================================================
function showToast(icon, message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastIcon && toastMessage) {
        toastIcon.textContent = icon;
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    }
}
