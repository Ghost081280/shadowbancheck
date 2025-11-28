/* =============================================================================
   DASHBOARD-SHARED.JS v1.0
   ShadowBanCheck.io - Unified Dashboard Utilities
   Used by: Pro Dashboard, Agency Dashboard, Admin Dashboard
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// PAGE TYPE DETECTION
// =============================================================================
function detectPageType() {
    const path = window.location.pathname.toLowerCase();
    // Clean URLs: /admin, /agency, /pro
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/agency')) return 'agency';
    if (path.includes('/pro')) return 'dashboard';
    // Fallback for old URLs during transition
    if (path.includes('admin-dashboard') || path.includes('admin.html')) return 'admin';
    if (path.includes('agency-dashboard') || path.includes('agency.html')) return 'agency';
    if (path.includes('dashboard')) return 'dashboard';
    return 'website';
}

const PAGE_TYPE = detectPageType();

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    dashboard: {
        name: 'Pro Dashboard',
        loginRedirect: '/pro',
        otherDashboards: {
            admin: '/admin',
            agency: '/agency'
        }
    },
    agency: {
        name: 'Agency Dashboard',
        loginRedirect: '/agency',
        otherDashboards: {
            admin: '/admin',
            pro: '/pro'
        }
    },
    admin: {
        name: 'Admin Dashboard',
        loginRedirect: '/admin',
        otherDashboards: {
            pro: '/pro',
            agency: '/agency'
        }
    }
};

// =============================================================================
// AUTHENTICATION
// =============================================================================
const Auth = {
    STORAGE_KEY: 'shadowban_session',
    
    getSession() {
        const session = localStorage.getItem(this.STORAGE_KEY) || 
                       sessionStorage.getItem(this.STORAGE_KEY);
        if (!session) return null;
        try {
            return JSON.parse(session);
        } catch (e) {
            return null;
        }
    },
    
    isLoggedIn() {
        const session = this.getSession();
        return session && session.loggedIn;
    },
    
    isAdmin() {
        const session = this.getSession();
        return session && (session.isAdmin || session.role === 'admin');
    },
    
    isAgency() {
        const session = this.getSession();
        return session && (session.isAgency || session.role === 'agency');
    },
    
    getRole() {
        const session = this.getSession();
        if (!session) return null;
        if (session.isAdmin || session.role === 'admin') return 'admin';
        if (session.isAgency || session.role === 'agency') return 'agency';
        return 'user';
    },
    
    logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.STORAGE_KEY);
        window.location.href = 'login.html';
    },
    
    // Check if user has access to current page
    checkAccess() {
        const session = this.getSession();
        
        if (!session || !session.loggedIn) {
            window.location.href = 'login.html';
            return false;
        }
        
        const role = this.getRole();
        
        // Admin can access everything
        if (role === 'admin') return true;
        
        // Agency can only access agency page
        if (PAGE_TYPE === 'agency' && role !== 'agency' && role !== 'admin') {
            window.location.href = '/pro';
            return false;
        }
        
        // Admin page requires admin role
        if (PAGE_TYPE === 'admin' && role !== 'admin') {
            window.location.href = role === 'agency' ? '/agency' : '/pro';
            return false;
        }
        
        // Regular user trying to access agency
        if (PAGE_TYPE === 'agency' && role === 'user') {
            window.location.href = '/pro';
            return false;
        }
        
        return true;
    }
};

// =============================================================================
// NAVIGATION
// =============================================================================
const Navigation = {
    currentSection: 'dashboard',
    
    init() {
        // Find all nav items
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        const sections = document.querySelectorAll('.dashboard-section, .admin-section, .agency-section');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
        
        // Handle link buttons with data-section
        document.querySelectorAll('[data-section]:not(.nav-item)').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const section = el.dataset.section;
                this.switchSection(section);
            });
        });
        
        // Check hash on load
        const hash = window.location.hash.slice(1);
        if (hash) {
            this.switchSection(hash, false);
        }
        
        // Handle browser back/forward
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash) {
                this.switchSection(hash, false);
            }
        });
        
        // Mobile menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.querySelector('.dashboard-sidebar, .admin-sidebar, .agency-sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
            
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (sidebar.classList.contains('open') && 
                    !sidebar.contains(e.target) && 
                    !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }
    },
    
    switchSection(sectionName, updateHash = true) {
        this.currentSection = sectionName;
        
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionName);
        });
        
        // Update section visibility
        document.querySelectorAll('.dashboard-section, .admin-section, .agency-section').forEach(section => {
            const sectionId = section.id.replace('section-', '');
            section.classList.toggle('active', sectionId === sectionName);
        });
        
        // Close mobile sidebar
        const sidebar = document.querySelector('.dashboard-sidebar, .admin-sidebar, .agency-sidebar');
        sidebar?.classList.remove('open');
        
        // Update hash
        if (updateHash) {
            history.pushState(null, '', `#${sectionName}`);
        }
        
        // Fire custom event
        document.dispatchEvent(new CustomEvent('sectionChanged', { 
            detail: { section: sectionName } 
        }));
    }
};

// Make switchSection globally available
window.switchSection = function(section) {
    Navigation.switchSection(section);
};

// =============================================================================
// TOAST NOTIFICATIONS
// =============================================================================
const Toast = {
    show(icon, message, duration = 3000) {
        const toast = document.getElementById('toast');
        const toastIcon = document.getElementById('toast-icon');
        const toastMessage = document.getElementById('toast-message');
        
        if (!toast) return;
        
        if (toastIcon) toastIcon.textContent = icon;
        if (toastMessage) toastMessage.textContent = message;
        
        toast.classList.remove('hidden');
        toast.classList.add('visible');
        
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, duration);
    }
};

// Global showToast function
window.showToast = function(icon, message, duration) {
    Toast.show(icon, message, duration);
};

// =============================================================================
// TABS
// =============================================================================
const Tabs = {
    init() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                const tabContainer = btn.closest('.tabs')?.parentElement;
                
                // Update buttons
                btn.closest('.tabs')?.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.toggle('active', b === btn);
                });
                
                // Update panels
                tabContainer?.querySelectorAll('.tab-panel').forEach(panel => {
                    const panelId = panel.id.replace('panel-', '');
                    panel.classList.toggle('active', panelId === tabId);
                });
            });
        });
    }
};

// =============================================================================
// MODALS
// =============================================================================
const Modals = {
    init() {
        // Close modal on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.add('hidden');
                }
            });
        });
        
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal-overlay')?.classList.add('hidden');
            });
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(modal => {
                    modal.classList.add('hidden');
                });
            }
        });
    },
    
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    },
    
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }
};

// Global modal functions
window.openModal = function(id) { Modals.open(id); };
window.closeModal = function(id) { Modals.close(id); };

// =============================================================================
// LOGOUT HANDLER
// =============================================================================
function initLogout() {
    const logoutBtns = document.querySelectorAll('#logout-btn, #admin-logout-btn, #agency-logout-btn, .logout-btn');
    
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                Auth.logout();
            }
        });
    });
}

// =============================================================================
// USER DATA LOADING
// =============================================================================
function loadUserData() {
    const session = Auth.getSession();
    if (!session) return;
    
    const email = session.email || 'user@example.com';
    const name = session.name || email.split('@')[0];
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    // Update various elements
    const userNameEls = document.querySelectorAll('#sidebar-user-name, #user-first-name');
    const userEmailEls = document.querySelectorAll('#sidebar-user-email, #profile-email');
    
    userNameEls.forEach(el => {
        if (el.tagName === 'INPUT') {
            el.value = capitalizedName;
        } else {
            el.textContent = capitalizedName;
        }
    });
    
    userEmailEls.forEach(el => {
        if (el.tagName === 'INPUT') {
            el.value = email;
        } else {
            el.textContent = email;
        }
    });
}

// =============================================================================
// INITIALIZATION
// =============================================================================
function init() {
    console.log(`🔧 Dashboard Shared v1.0 - ${PAGE_TYPE} page`);
    
    Navigation.init();
    Tabs.init();
    Modals.init();
    initLogout();
    loadUserData();
    
    console.log('✅ Dashboard Shared initialized');
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// =============================================================================
// EXPORTS
// =============================================================================
window.DashboardShared = {
    PAGE_TYPE,
    CONFIG,
    Auth,
    Navigation,
    Toast,
    Tabs,
    Modals
};

})();
