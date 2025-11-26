/* =============================================================================
   LOGIN.JS - Login Page Functionality with Signup & Verification
   ============================================================================= */

// =============================================================================
// CREDENTIALS
// =============================================================================
const ADMIN_CREDENTIALS = {
    email: 'admin@shadowbancheck.io',
    password: 'admin'
};

const DEMO_CREDENTIALS = {
    email: 'demo@test.com',
    password: 'password123'
};

// =============================================================================
// PENDING SIGNUPS STORAGE (Simulates backend)
// In production, this would be server-side
// =============================================================================
let pendingSignup = null;  // Stores current signup attempt
let resendCooldown = 0;    // Cooldown timer for resend

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initGoogleSignIn();
    initPasswordToggle();
    initForgotPassword();
    initSignupForm();
    initVerifyForm();
});

// =============================================================================
// LOGIN FORM
// =============================================================================
function initLoginForm() {
    const form = document.getElementById('login-form');
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Hide any previous errors
        hideError();
        
        // Show loading state
        setLoading(true);
        
        // Simulate API delay
        await delay(1500);
        
        // Check if admin
        const isAdmin = validateAdmin(email, password);
        
        // Check if regular user (demo or registered)
        const isValidUser = validateCredentials(email, password);
        
        if (isAdmin) {
            // Admin login!
            showToast('👑', 'Welcome back, Admin! Redirecting...');
            
            // Store admin session
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem('shadowban_session', JSON.stringify({
                email: email,
                loggedIn: true,
                isAdmin: true,
                timestamp: Date.now()
            }));
            
            // Redirect to ADMIN dashboard
            await delay(1000);
            window.location.href = 'admin-dashboard.html';
            
        } else if (isValidUser) {
            // Regular user login
            showToast('✅', 'Login successful! Redirecting...');
            
            // Store user session
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem('shadowban_session', JSON.stringify({
                email: email,
                loggedIn: true,
                isAdmin: false,
                timestamp: Date.now()
            }));
            
            // Redirect to USER dashboard
            await delay(1000);
            window.location.href = 'dashboard.html';
            
        } else {
            // Failed
            setLoading(false);
            showError('Invalid email or password. Please try again.');
        }
    });
}

function validateAdmin(email, password) {
    return email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() && 
           password === ADMIN_CREDENTIALS.password;
}

function validateCredentials(email, password) {
    // Check demo credentials
    if (email.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() && 
        password === DEMO_CREDENTIALS.password) {
        return true;
    }
    
    // Check registered users from localStorage
    const users = JSON.parse(localStorage.getItem('shadowban_users') || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user && user.password === password && user.verified) {
        return true;
    }
    
    return false;
}

function setLoading(isLoading) {
    const btn = document.getElementById('login-btn');
    const btnText = btn?.querySelector('.btn-text');
    const btnLoading = btn?.querySelector('.btn-loading');
    
    if (isLoading) {
        btn.disabled = true;
        btnText?.classList.add('hidden');
        btnLoading?.classList.remove('hidden');
    } else {
        btn.disabled = false;
        btnText?.classList.remove('hidden');
        btnLoading?.classList.add('hidden');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('login-error');
    const errorMsg = document.getElementById('error-message');
    
    if (errorDiv && errorMsg) {
        errorMsg.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function hideError() {
    const errorDiv = document.getElementById('login-error');
    errorDiv?.classList.add('hidden');
}

// =============================================================================
// SIGNUP MODAL
// =============================================================================
function showSignupModal() {
    document.getElementById('signup-modal')?.classList.remove('hidden');
    // Reset to step 1
    showSignupStep(1);
    // Focus email field
    setTimeout(() => {
        document.getElementById('signup-email')?.focus();
    }, 100);
}

function closeSignupModal() {
    document.getElementById('signup-modal')?.classList.add('hidden');
    // Reset forms
    document.getElementById('signup-form')?.reset();
    document.getElementById('verify-form')?.reset();
    hideSignupError();
    hideVerifyError();
    pendingSignup = null;
}

function showSignupStep(step) {
    document.getElementById('signup-step-1')?.classList.toggle('hidden', step !== 1);
    document.getElementById('signup-step-2')?.classList.toggle('hidden', step !== 2);
    document.getElementById('signup-step-3')?.classList.toggle('hidden', step !== 3);
    
    // Update modal title
    const title = document.getElementById('signup-modal-title');
    if (title) {
        if (step === 1) title.textContent = '🚀 Create Your Account';
        if (step === 2) title.textContent = '📧 Verify Your Email';
        if (step === 3) title.textContent = '🎉 Welcome!';
    }
}

function goBackToStep1() {
    showSignupStep(1);
    pendingSignup = null;
}

// =============================================================================
// SIGNUP FORM HANDLING
// =============================================================================
function initSignupForm() {
    const form = document.getElementById('signup-form');
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        // Hide previous errors
        hideSignupError();
        
        // Validation
        if (!isValidEmail(email)) {
            showSignupError('Please enter a valid email address.');
            return;
        }
        
        if (password.length < 8) {
            showSignupError('Password must be at least 8 characters.');
            return;
        }
        
        if (password !== confirm) {
            showSignupError('Passwords do not match.');
            return;
        }
        
        // Check if email already registered
        const users = JSON.parse(localStorage.getItem('shadowban_users') || '[]');
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            showSignupError('An account with this email already exists.');
            return;
        }
        
        // Show loading
        setSignupLoading(true);
        
        // Simulate sending email (1-2 second delay)
        await delay(1500);
        
        // Generate 6-digit code
        const verificationCode = generateCode();
        
        // Store pending signup
        pendingSignup = {
            email: email,
            password: password,
            code: verificationCode,
            timestamp: Date.now()
        };
        
        // In production, send email here via your email service
        // For now, we'll show it in a toast (REMOVE IN PRODUCTION)
        console.log(`📧 Verification code for ${email}: ${verificationCode}`);
        showToast('📧', `Code sent! (Dev: ${verificationCode})`);
        
        // Reset loading
        setSignupLoading(false);
        
        // Show verification step
        document.getElementById('verify-email-display').textContent = email;
        showSignupStep(2);
        
        // Focus code input
        setTimeout(() => {
            document.getElementById('verify-code')?.focus();
        }, 100);
        
        // Start resend cooldown
        startResendCooldown();
    });
}

function setSignupLoading(isLoading) {
    const btn = document.getElementById('signup-btn');
    const btnText = btn?.querySelector('.btn-text');
    const btnLoading = btn?.querySelector('.btn-loading');
    
    if (isLoading) {
        btn.disabled = true;
        btnText?.classList.add('hidden');
        btnLoading?.classList.remove('hidden');
    } else {
        btn.disabled = false;
        btnText?.classList.remove('hidden');
        btnLoading?.classList.add('hidden');
    }
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
    document.getElementById('signup-error')?.classList.add('hidden');
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =============================================================================
// VERIFICATION FORM HANDLING
// =============================================================================
function initVerifyForm() {
    const form = document.getElementById('verify-form');
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const code = document.getElementById('verify-code').value.trim();
        
        // Hide previous errors
        hideVerifyError();
        
        if (!pendingSignup) {
            showVerifyError('Session expired. Please start over.');
            return;
        }
        
        // Check if code expired (10 minutes)
        if (Date.now() - pendingSignup.timestamp > 10 * 60 * 1000) {
            showVerifyError('Code expired. Please request a new one.');
            return;
        }
        
        // Validate code format
        if (!/^\d{6}$/.test(code)) {
            showVerifyError('Please enter a valid 6-digit code.');
            return;
        }
        
        // Show loading
        setVerifyLoading(true);
        
        await delay(1000);
        
        // Check code
        if (code !== pendingSignup.code) {
            setVerifyLoading(false);
            showVerifyError('Invalid verification code. Please try again.');
            return;
        }
        
        // Success! Create the user account
        const users = JSON.parse(localStorage.getItem('shadowban_users') || '[]');
        users.push({
            email: pendingSignup.email,
            password: pendingSignup.password,
            verified: true,
            createdAt: Date.now()
        });
        localStorage.setItem('shadowban_users', JSON.stringify(users));
        
        // Clear pending signup
        const completedEmail = pendingSignup.email;
        pendingSignup = null;
        
        // Reset loading
        setVerifyLoading(false);
        
        // Show success
        showSignupStep(3);
        
        // Store in session so they're logged in
        sessionStorage.setItem('shadowban_session', JSON.stringify({
            email: completedEmail,
            loggedIn: true,
            isAdmin: false,
            timestamp: Date.now()
        }));
    });
}

function setVerifyLoading(isLoading) {
    const btn = document.getElementById('verify-btn');
    const btnText = btn?.querySelector('.btn-text');
    const btnLoading = btn?.querySelector('.btn-loading');
    
    if (isLoading) {
        btn.disabled = true;
        btnText?.classList.add('hidden');
        btnLoading?.classList.remove('hidden');
    } else {
        btn.disabled = false;
        btnText?.classList.remove('hidden');
        btnLoading?.classList.add('hidden');
    }
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
    document.getElementById('verify-error')?.classList.add('hidden');
}

// =============================================================================
// RESEND CODE FUNCTIONALITY
// =============================================================================
function resendCode() {
    if (resendCooldown > 0 || !pendingSignup) return;
    
    // Generate new code
    const newCode = generateCode();
    pendingSignup.code = newCode;
    pendingSignup.timestamp = Date.now();
    
    // In production, send email here
    console.log(`📧 New verification code for ${pendingSignup.email}: ${newCode}`);
    showToast('📧', `New code sent! (Dev: ${newCode})`);
    
    // Start cooldown
    startResendCooldown();
}

function startResendCooldown() {
    resendCooldown = 60;
    const resendBtn = document.getElementById('resend-btn');
    const resendTimer = document.getElementById('resend-timer');
    
    resendBtn.disabled = true;
    resendTimer?.classList.remove('hidden');
    
    const interval = setInterval(() => {
        resendCooldown--;
        if (resendTimer) resendTimer.textContent = `(${resendCooldown}s)`;
        
        if (resendCooldown <= 0) {
            clearInterval(interval);
            resendBtn.disabled = false;
            resendTimer?.classList.add('hidden');
        }
    }, 1000);
}

function signupComplete() {
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// =============================================================================
// PASSWORD TOGGLE FOR SIGNUP
// =============================================================================
function toggleSignupPassword(inputId) {
    const input = document.getElementById(inputId);
    const btn = input?.nextElementSibling;
    
    if (input) {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        if (btn) btn.textContent = type === 'password' ? '👁️' : '🙈';
    }
}

// =============================================================================
// GOOGLE SIGN IN
// =============================================================================
function initGoogleSignIn() {
    const googleBtn = document.getElementById('google-signin-btn');
    
    googleBtn?.addEventListener('click', async () => {
        showToast('🔧', 'Google Sign-In coming soon!');
        
        // In production, you would integrate with:
        // - Firebase Auth
        // - Supabase Auth
        // - Google Identity Services
        // - etc.
    });
}

// =============================================================================
// PASSWORD TOGGLE (Login)
// =============================================================================
function initPasswordToggle() {
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    toggleBtn?.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });
}

// =============================================================================
// FORGOT PASSWORD
// =============================================================================
function initForgotPassword() {
    const form = document.getElementById('forgot-form');
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value.trim();
        
        if (!email) {
            showToast('⚠️', 'Please enter your email address');
            return;
        }
        
        // Show loading
        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;
        
        await delay(1500);
        
        // Reset button
        btn.textContent = originalText;
        btn.disabled = false;
        
        // Close modal
        closeForgotPassword();
        
        // Show success message
        showToast('✅', 'Password reset link sent! Check your email.');
    });
}

function showForgotPassword() {
    document.getElementById('forgot-modal')?.classList.remove('hidden');
}

function closeForgotPassword() {
    document.getElementById('forgot-modal')?.classList.add('hidden');
    document.getElementById('forgot-email').value = '';
}

// =============================================================================
// DEMO HELPERS - REMOVE AFTER TESTING
// =============================================================================
function autofillDemo() {
    document.getElementById('email').value = DEMO_CREDENTIALS.email;
    document.getElementById('password').value = DEMO_CREDENTIALS.password;
    showToast('✅', 'Demo credentials filled! Click Sign In.');
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '✅';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1000);
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        const originalText = btn.textContent;
        btn.textContent = '✅';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1000);
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
// UTILITY FUNCTIONS
// =============================================================================
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// CHECK EXISTING SESSION
// =============================================================================
(function checkSession() {
    // Check if user is already logged in
    const session = localStorage.getItem('shadowban_session') || 
                   sessionStorage.getItem('shadowban_session');
    
    if (session) {
        try {
            const data = JSON.parse(session);
            if (data.loggedIn) {
                // Redirect based on role
                if (data.isAdmin) {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }
        } catch (e) {
            // Invalid session, clear it
            localStorage.removeItem('shadowban_session');
            sessionStorage.removeItem('shadowban_session');
        }
    }
})();

// =============================================================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// =============================================================================
window.autofillDemo = autofillDemo;
window.copyToClipboard = copyToClipboard;
window.showForgotPassword = showForgotPassword;
window.closeForgotPassword = closeForgotPassword;
window.showSignupModal = showSignupModal;
window.closeSignupModal = closeSignupModal;
window.goBackToStep1 = goBackToStep1;
window.toggleSignupPassword = toggleSignupPassword;
window.resendCode = resendCode;
window.signupComplete = signupComplete;
