/* =============================================================================
   LOGIN.JS v2.0
   ShadowBanCheck.io - Authentication System with 3-Way Role Routing
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// DEMO ACCOUNTS (Replace with backend auth in production)
// =============================================================================
const DEMO_ACCOUNTS = {
    // User account
    'demo@test.com': {
        password: 'password123',
        role: 'user',
        name: 'Demo User',
        redirect: 'dashboard.html'
    },
    // Agency account
    'agency@test.com': {
        password: 'agency123',
        role: 'agency',
        name: 'Agency Demo',
        redirect: 'agency-dashboard.html'
    },
    // Admin account
    'admin@shadowbancheck.io': {
        password: 'admin',
        role: 'admin',
        name: 'Admin',
        redirect: 'admin-dashboard.html'
    }
};

// =============================================================================
// STORAGE KEYS
// =============================================================================
const STORAGE_KEYS = {
    session: 'shadowban_session',
    users: 'shadowban_users',
    pendingVerification: 'shadowban_pending_verification'
};

// =============================================================================
// INITIALIZATION
// =============================================================================
function init() {
    console.log('🔐 Login System v2.0 Initializing...');
    
    // Check if already logged in
    checkExistingSession();
    
    // Init form handlers
    initLoginForm();
    initSignupForm();
    initVerifyForm();
    initForgotForm();
    initPasswordToggle();
    
    console.log('✅ Login system initialized');
}

// =============================================================================
// SESSION CHECK
// =============================================================================
function checkExistingSession() {
    const session = localStorage.getItem(STORAGE_KEYS.session) || 
                   sessionStorage.getItem(STORAGE_KEYS.session);
    
    if (session) {
        try {
            const data = JSON.parse(session);
            if (data.loggedIn && data.email) {
                // Redirect based on role
                redirectByRole(data.role || 'user');
            }
        } catch (e) {
            // Invalid session, clear it
            localStorage.removeItem(STORAGE_KEYS.session);
            sessionStorage.removeItem(STORAGE_KEYS.session);
        }
    }
}

function redirectByRole(role) {
    switch (role) {
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        case 'agency':
            window.location.href = 'agency-dashboard.html';
            break;
        default:
            window.location.href = 'dashboard.html';
    }
}

// =============================================================================
// LOGIN FORM
// =============================================================================
function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember')?.checked || false;
        
        const loginBtn = document.getElementById('login-btn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoading = loginBtn.querySelector('.btn-loading');
        
        // Show loading
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        loginBtn.disabled = true;
        hideLoginError();
        
        // Simulate network delay
        await delay(800);
        
        // Check demo accounts first
        if (DEMO_ACCOUNTS[email]) {
            const account = DEMO_ACCOUNTS[email];
            if (account.password === password) {
                // Success - create session
                createSession(email, account.role, account.name, remember);
                showToast('✅', `Welcome back, ${account.name}!`);
                await delay(500);
                window.location.href = account.redirect;
                return;
            }
        }
        
        // Check registered users
        const users = getRegisteredUsers();
        const user = users[email];
        
        if (user && user.password === password) {
            // Success - create session
            createSession(email, user.role || 'user', user.name || 'User', remember);
            showToast('✅', `Welcome back!`);
            await delay(500);
            redirectByRole(user.role || 'user');
            return;
        }
        
        // Failed
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        loginBtn.disabled = false;
        showLoginError('Invalid email or password. Please try again.');
    });
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
    storage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionData));
    
    // Also store in localStorage if remember
    if (remember) {
        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionData));
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('login-error');
    const errorMsg = document.getElementById('error-message');
    if (errorDiv && errorMsg) {
        errorMsg.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function hideLoginError() {
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

// =============================================================================
// SIGNUP FORM
// =============================================================================
let pendingSignup = null;

function initSignupForm() {
    const form = document.getElementById('signup-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('signup-email').value.trim().toLowerCase();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        const btn = document.getElementById('signup-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        
        // Validation
        if (password !== confirm) {
            showSignupError('Passwords do not match');
            return;
        }
        
        if (password.length < 8) {
            showSignupError('Password must be at least 8 characters');
            return;
        }
        
        // Check if email already exists
        const users = getRegisteredUsers();
        if (users[email] || DEMO_ACCOUNTS[email]) {
            showSignupError('An account with this email already exists');
            return;
        }
        
        // Show loading
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        btn.disabled = true;
        hideSignupError();
        
        await delay(1000);
        
        // Generate verification code
        const code = generateCode();
        pendingSignup = { email, password, code };
        
        // Store pending verification
        localStorage.setItem(STORAGE_KEYS.pendingVerification, JSON.stringify({
            email,
            code,
            expires: Date.now() + (10 * 60 * 1000) // 10 minutes
        }));
        
        console.log('📧 Verification code:', code); // For demo purposes
        
        // Reset button
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        btn.disabled = false;
        
        // Show verification step
        document.getElementById('verify-email-display').textContent = email;
        document.getElementById('signup-step-1').classList.add('hidden');
        document.getElementById('signup-step-2').classList.remove('hidden');
        document.getElementById('signup-modal-title').textContent = '📧 Verify Your Email';
        
        showToast('📧', `Code sent! (Demo: ${code})`);
        startResendTimer();
    });
}

function showSignupError(message) {
    const errorDiv = document.getElementById('signup-error');
    const errorMsg = document.getElementById('signup-error-message');
    if (errorDiv && errorMsg) {
        errorMsg.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function hideSignupError() {
    const errorDiv = document.getElementById('signup-error');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

// =============================================================================
// VERIFICATION FORM
// =============================================================================
function initVerifyForm() {
    const form = document.getElementById('verify-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const code = document.getElementById('verify-code').value.trim();
        const btn = document.getElementById('verify-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        
        if (!pendingSignup) {
            showVerifyError('Session expired. Please try again.');
            return;
        }
        
        // Show loading
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        btn.disabled = true;
        hideVerifyError();
        
        await delay(800);
        
        // Check code
        if (code === pendingSignup.code || code === '000000') { // 000000 is bypass for demo
            // Create account
            const users = getRegisteredUsers();
            users[pendingSignup.email] = {
                password: pendingSignup.password,
                role: 'user',
                name: pendingSignup.email.split('@')[0],
                createdAt: Date.now()
            };
            saveRegisteredUsers(users);
            
            // Clear pending
            localStorage.removeItem(STORAGE_KEYS.pendingVerification);
            
            // Show success
            document.getElementById('signup-step-2').classList.add('hidden');
            document.getElementById('signup-step-3').classList.remove('hidden');
            document.getElementById('signup-modal-title').textContent = '🎉 Success!';
            
            showToast('✅', 'Account created successfully!');
        } else {
            // Wrong code
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            btn.disabled = false;
            showVerifyError('Invalid verification code. Please try again.');
        }
    });
}

function showVerifyError(message) {
    const errorDiv = document.getElementById('verify-error');
    const errorMsg = document.getElementById('verify-error-message');
    if (errorDiv && errorMsg) {
        errorMsg.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function hideVerifyError() {
    const errorDiv = document.getElementById('verify-error');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

// Resend timer
let resendInterval = null;

function startResendTimer() {
    const btn = document.getElementById('resend-btn');
    const timer = document.getElementById('resend-timer');
    let seconds = 60;
    
    btn.disabled = true;
    btn.style.opacity = '0.5';
    timer.classList.remove('hidden');
    
    if (resendInterval) clearInterval(resendInterval);
    
    resendInterval = setInterval(() => {
        seconds--;
        timer.textContent = `(${seconds}s)`;
        
        if (seconds <= 0) {
            clearInterval(resendInterval);
            btn.disabled = false;
            btn.style.opacity = '1';
            timer.classList.add('hidden');
        }
    }, 1000);
}

window.resendCode = function() {
    if (!pendingSignup) return;
    
    // Generate new code
    pendingSignup.code = generateCode();
    console.log('📧 New verification code:', pendingSignup.code);
    showToast('📧', `New code sent! (Demo: ${pendingSignup.code})`);
    startResendTimer();
};

window.goBackToStep1 = function() {
    document.getElementById('signup-step-2').classList.add('hidden');
    document.getElementById('signup-step-1').classList.remove('hidden');
    document.getElementById('signup-modal-title').textContent = '🚀 Create Your Account';
    pendingSignup = null;
};

window.signupComplete = function() {
    closeSignupModal();
    
    // Auto-fill login with new email
    if (pendingSignup && pendingSignup.email) {
        document.getElementById('email').value = pendingSignup.email;
        document.getElementById('password').focus();
    }
    
    pendingSignup = null;
};

// =============================================================================
// FORGOT PASSWORD
// =============================================================================
function initForgotForm() {
    const form = document.getElementById('forgot-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value.trim().toLowerCase();
        
        await delay(800);
        
        // Always show success (don't reveal if email exists)
        showToast('📧', 'If an account exists, a reset link has been sent.');
        closeForgotPassword();
    });
}

// =============================================================================
// PASSWORD TOGGLE
// =============================================================================
function initPasswordToggle() {
    const toggle = document.getElementById('toggle-password');
    const password = document.getElementById('password');
    
    if (toggle && password) {
        toggle.addEventListener('click', () => {
            const type = password.type === 'password' ? 'text' : 'password';
            password.type = type;
            toggle.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
}

window.toggleSignupPassword = function(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
    }
};

// =============================================================================
// MODALS
// =============================================================================
window.showSignupModal = function() {
    const modal = document.getElementById('signup-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Reset to step 1
        document.getElementById('signup-step-1').classList.remove('hidden');
        document.getElementById('signup-step-2').classList.add('hidden');
        document.getElementById('signup-step-3').classList.add('hidden');
        document.getElementById('signup-modal-title').textContent = '🚀 Create Your Account';
        document.getElementById('signup-form').reset();
        hideSignupError();
    }
};

window.closeSignupModal = function() {
    const modal = document.getElementById('signup-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

window.showForgotPassword = function() {
    const modal = document.getElementById('forgot-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('forgot-form').reset();
    }
};

window.closeForgotPassword = function() {
    const modal = document.getElementById('forgot-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

// =============================================================================
// DEMO AUTO-FILL FUNCTIONS
// =============================================================================
window.autofillDemo = function() {
    document.getElementById('email').value = 'demo@test.com';
    document.getElementById('password').value = 'password123';
    showToast('⚡', 'User credentials filled!');
};

window.autofillAgency = function() {
    document.getElementById('email').value = 'agency@test.com';
    document.getElementById('password').value = 'agency123';
    showToast('🏢', 'Agency credentials filled!');
};

window.autofillAdmin = function() {
    document.getElementById('email').value = 'admin@shadowbancheck.io';
    document.getElementById('password').value = 'admin';
    showToast('👑', 'Admin credentials filled!');
};

window.copyToClipboard = function(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = '✅';
        setTimeout(() => btn.textContent = original, 1000);
    });
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
function getRegisteredUsers() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
    } catch {
        return {};
    }
}

function saveRegisteredUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

// =============================================================================
// GOOGLE SIGN IN (Placeholder)
// =============================================================================
document.getElementById('google-signin-btn')?.addEventListener('click', () => {
    showToast('🔧', 'Google Sign-In coming soon!');
});

// =============================================================================
// INIT
// =============================================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
