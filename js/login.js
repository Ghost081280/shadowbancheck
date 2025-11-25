/* =============================================================================
   LOGIN.JS - Login Page Functionality
   ============================================================================= */

// =============================================================================
// CREDENTIALS
// =============================================================================
const ADMIN_CREDENTIALS = {
    email: 'admin',
    password: 'admin'
};

const DEMO_CREDENTIALS = {
    email: 'demo@test.com',
    password: 'password123'
};

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initGoogleSignIn();
    initPasswordToggle();
    initForgotPassword();
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
        
        // Check if regular user
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
    // For demo, check against demo credentials
    // In production, this would be an API call
    return email.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() && 
           password === DEMO_CREDENTIALS.password;
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
// PASSWORD TOGGLE
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

// Make functions globally available
window.autofillDemo = autofillDemo;
window.copyToClipboard = copyToClipboard;
window.showForgotPassword = showForgotPassword;
window.closeForgotPassword = closeForgotPassword;
