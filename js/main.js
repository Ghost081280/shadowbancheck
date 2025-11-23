// Simplified main.js - No complex forms

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initScrollAnimations();
    initTryAIButton();
});

// Smooth scrolling for anchor links
function initSmoothScroll() {
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
}

// Scroll animations (fade-in on scroll)
function initScrollAnimations() {
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

    // Observe all animated elements
    document.querySelectorAll('.option-card, .platform-item, .step, .price-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Try Shadow AI button - opens chat
function initTryAIButton() {
    const tryAIBtn = document.getElementById('try-ai-btn');
    const shadowAIBtn = document.getElementById('shadow-ai-btn');
    
    if (tryAIBtn && shadowAIBtn) {
        tryAIBtn.addEventListener('click', () => {
            shadowAIBtn.click();
        });
    }
}

// Track events (placeholder for analytics)
function trackEvent(category, action, label) {
    console.log('Event:', category, action, label);
    // TODO: Integrate with Google Analytics
}

// Track CTA clicks
document.querySelectorAll('.btn-large, .btn-pricing, .btn-price').forEach(btn => {
    btn.addEventListener('click', (e) => {
        trackEvent('CTA', 'click', e.target.textContent || 'Button');
    });
});
