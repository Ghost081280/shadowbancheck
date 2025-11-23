// Main JavaScript for ShadowBanCheck.io

// Auto-detect IP address on page load
document.addEventListener('DOMContentLoaded', () => {
    detectIPAddress();
    initializePlatformSelector();
    initializeFullScanForm();
});

// Detect user's IP address
async function detectIPAddress() {
    const ipElement = document.getElementById('detected-ip');
    const ipInput = document.getElementById('ip-input');
    
    if (!ipElement) return;
    
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipElement.textContent = data.ip;
        if (ipInput) {
            ipInput.value = data.ip;
        }
    } catch (error) {
        ipElement.textContent = 'Unable to detect';
        console.error('IP detection failed:', error);
    }
}

// Platform Selector Logic
function initializePlatformSelector() {
    const checkboxes = document.querySelectorAll('.platform-checkbox input[type="checkbox"]');
    const selectAllBtn = document.getElementById('select-all-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const selectedCountEl = document.getElementById('selected-count');
    const startScanBtn = document.getElementById('start-scan-btn');

    if (!checkboxes.length) return;

    // Update count and button
    function updateSelection() {
        const checkedCount = document.querySelectorAll('.platform-checkbox input[type="checkbox"]:checked').length;
        
        if (selectedCountEl) {
            selectedCountEl.textContent = checkedCount;
        }

        if (startScanBtn) {
            if (checkedCount > 0) {
                startScanBtn.disabled = false;
                
                // Update pricing
                let price, label;
                if (checkedCount <= 5) {
                    price = '$19';
                    label = `Scan ${checkedCount} platform${checkedCount > 1 ? 's' : ''} - Quick Check`;
                } else if (checkedCount <= 10) {
                    price = '$39';
                    label = `Scan ${checkedCount} platforms - Standard`;
                } else if (checkedCount <= 20) {
                    price = '$67';
                    label = `Scan ${checkedCount} platforms - Deep Scan`;
                } else {
                    price = '$97';
                    label = `Scan All ${checkedCount} Platforms - Full Spectrum`;
                }
                
                startScanBtn.innerHTML = `
                    <span class="btn-text">${label}</span>
                    <span class="btn-price">${price}</span>
                `;
            } else {
                startScanBtn.disabled = true;
                startScanBtn.innerHTML = '<span class="btn-text">Select platforms to start</span>';
            }
        }
    }

    // Select All
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            updateSelection();
        });
    }

    // Clear All
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            updateSelection();
        });
    }

    // Listen to all checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelection);
    });

    // Initial update
    updateSelection();
}

// Full Scan Form Logic
function initializeFullScanForm() {
    const startScanBtn = document.getElementById('start-scan-btn');
    
    if (!startScanBtn) return;

    startScanBtn.addEventListener('click', () => {
        // Get all input values
        const usernames = document.getElementById('usernames-input')?.value.trim() || '';
        const emails = document.getElementById('emails-input')?.value.trim() || '';
        const phones = document.getElementById('phones-input')?.value.trim() || '';
        const domains = document.getElementById('domains-input')?.value.trim() || '';
        const ip = document.getElementById('ip-input')?.value.trim() || '';

        // Get selected platforms
        const selectedPlatforms = Array.from(
            document.querySelectorAll('.platform-checkbox input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        // Validate inputs
        if (!usernames && !emails && !phones && !domains && !ip) {
            alert('Please enter at least one piece of information to scan (username, email, phone, domain, or IP).');
            document.getElementById('usernames-input').focus();
            return;
        }

        if (selectedPlatforms.length === 0) {
            alert('Please select at least one platform to scan.');
            return;
        }

        // Calculate price
        let price;
        const count = selectedPlatforms.length;
        if (count <= 5) price = 19;
        else if (count <= 10) price = 39;
        else if (count <= 20) price = 67;
        else price = 97;

        // Store scan data
        const scanData = {
            usernames: usernames.split(',').map(s => s.trim()).filter(s => s),
            emails: emails.split(',').map(s => s.trim()).filter(s => s),
            phones: phones.split(',').map(s => s.trim()).filter(s => s),
            domains: domains.split(',').map(s => s.trim()).filter(s => s),
            ip: ip,
            platforms: selectedPlatforms,
            price: price,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('fullScanData', JSON.stringify(scanData));

        // For now, show alert (will redirect to payment page)
        alert(
            `Full Spectrum Scan - $${price}\n\n` +
            `Platforms: ${count}\n` +
            `Usernames: ${scanData.usernames.length}\n` +
            `Emails: ${scanData.emails.length}\n` +
            `Phones: ${scanData.phones.length}\n` +
            `Domains: ${scanData.domains.length}\n\n` +
            `This will launch next week! We'll scan all selected platforms and email you a comprehensive PDF report.\n\n` +
            `Sign up for early access!`
        );

        // TODO: Redirect to payment page
        // window.location.href = 'full-scan-payment.html';
    });
}

// Add IP functionality
const addIpBtn = document.getElementById('add-ip-btn');
if (addIpBtn) {
    addIpBtn.addEventListener('click', () => {
        const ip = prompt('Enter an IP address to check:');
        if (ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
            const ipInput = document.getElementById('ip-input');
            const currentIp = ipInput.value;
            ipInput.value = currentIp + ', ' + ip;
            ipInput.disabled = false;
        } else if (ip) {
            alert('Invalid IP address format. Please use format: 123.456.789.012');
        }
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll animations (simple fade-in on scroll)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all platform cards, pricing cards, and steps
document.querySelectorAll('.platform-card, .pricing-card, .step, .quick-option').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Track events (placeholder for analytics)
function trackEvent(category, action, label) {
    console.log('Event:', category, action, label);
    // TODO: Integrate with Google Analytics or other tracking
}

// Track CTA clicks
document.querySelectorAll('.btn-hero, .btn-primary, .btn-pricing, .btn-scan').forEach(btn => {
    btn.addEventListener('click', (e) => {
        trackEvent('CTA', 'click', e.target.textContent || 'Button');
    });
});
