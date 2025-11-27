/* =============================================================================
   RESOLUTION CENTER v1.0
   ShadowBanCheck.io - Dispute Automation Module
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// PLATFORM CONTACTS DATABASE
// =============================================================================
const PLATFORM_CONTACTS = {
    twitter: {
        name: 'Twitter/X',
        icon: '𝕏',
        emails: ['appeals@x.com', 'legal@x.com'],
        primaryEmail: 'appeals@x.com',
        responseTime: '3-7 days',
        successRate: 45,
        tips: [
            'Be specific about which type of restriction you\'re experiencing',
            'Reference specific tweets that show the issue',
            'Mention any business impact clearly',
            'Keep the tone professional and factual'
        ]
    },
    instagram: {
        name: 'Instagram',
        icon: '📷',
        emails: ['support@instagram.com', 'legal@fb.com'],
        primaryEmail: 'support@instagram.com',
        responseTime: '5-14 days',
        successRate: 35,
        tips: [
            'Use the in-app "Report a Problem" feature first',
            'Include your username and account details',
            'Explain the business impact if applicable',
            'Be patient - Instagram is slow to respond'
        ]
    },
    tiktok: {
        name: 'TikTok',
        icon: '♪',
        emails: ['legal@tiktok.com'],
        primaryEmail: 'legal@tiktok.com',
        responseTime: '7-14 days',
        successRate: 30,
        tips: [
            'Check Community Guidelines for any violations first',
            'Use in-app feedback form alongside email',
            'Be very specific about the restriction type',
            'TikTok has strict AI moderation - appeals are harder'
        ]
    },
    reddit: {
        name: 'Reddit',
        icon: '🔴',
        emails: ['appeals@reddit.com'],
        primaryEmail: 'appeals@reddit.com',
        responseTime: '3-10 days',
        successRate: 50,
        tips: [
            'Use reddit.com/appeals for account issues',
            'For subreddit bans, contact moderators via modmail',
            'Be honest about any rule violations',
            'Reddit has a transparent appeal process'
        ]
    },
    youtube: {
        name: 'YouTube',
        icon: '▶️',
        emails: ['support@youtube.com', 'legal-yt@google.com'],
        primaryEmail: 'support@youtube.com',
        responseTime: '7-21 days',
        successRate: 40,
        tips: [
            'Use YouTube Studio to request human review',
            'Contact @TeamYouTube on Twitter for faster response',
            'Document specific videos affected',
            'Creator support is available for partners'
        ]
    },
    facebook: {
        name: 'Facebook',
        icon: 'ⓕ',
        emails: ['support@fb.com', 'legal@fb.com'],
        primaryEmail: 'support@fb.com',
        responseTime: '5-14 days',
        successRate: 35,
        tips: [
            'Use the in-app support request feature',
            'Avoid sharing fact-checker flagged content',
            'Appeal directly through the notification if available',
            'Business accounts may get faster support'
        ]
    },
    linkedin: {
        name: 'LinkedIn',
        icon: 'in',
        emails: ['support@linkedin.com', 'legal@linkedin.com'],
        primaryEmail: 'support@linkedin.com',
        responseTime: '5-10 days',
        successRate: 55,
        tips: [
            'LinkedIn has the highest success rate for appeals',
            'Keep communications professional',
            'Reference your professional reputation',
            'Use the Help Center for formal appeals'
        ]
    }
};

// =============================================================================
// LETTER TEMPLATES
// =============================================================================
const LETTER_TEMPLATES = {
    shadowban_appeal: {
        name: 'Shadow Ban Appeal',
        subject: 'Account Visibility Restriction Appeal - Requesting Review',
        generate: function(data) {
            return `Dear ${data.platformName} Support Team,

I am writing to formally request a review of my account @${data.username}, which appears to be experiencing significant visibility restrictions commonly referred to as a "shadow ban."

ACCOUNT DETAILS:
• Username: @${data.username}
• Platform: ${data.platformName}
• Account Age: ${data.accountAge || 'Not specified'}
• Follower Count: ${data.followers || 'Not specified'}
• Account Type: ${data.accountType || 'Personal/Creator'}

ISSUE DESCRIPTION:
I have noticed the following symptoms affecting my account:
${data.symptoms || '• Significantly reduced reach and engagement\n• Content not appearing in search results\n• Posts not showing in hashtag feeds\n• Replies hidden from threads'}

EVIDENCE:
I have conducted an independent analysis using ShadowBanCheck.io, which detected the following:
• Overall Shadow Ban Score: ${data.score}%
• Search Visibility: ${data.factors?.search || 'Restricted'}
• Reply Visibility: ${data.factors?.reply || 'Limited'}
• Recommendation Status: ${data.factors?.suggestion || 'Suppressed'}

COMPLIANCE STATEMENT:
I have reviewed ${data.platformName}'s Terms of Service and Community Guidelines, and I believe my account is in full compliance. I have not:
• Engaged in spam or automated behavior
• Posted content that violates community guidelines
• Used prohibited third-party tools or services
• Participated in artificial engagement schemes

BUSINESS IMPACT:
${data.businessImpact || 'This restriction is significantly affecting my ability to connect with my audience and share content with my community.'}

REQUEST:
I respectfully request that my account be reviewed by a human moderator and any restrictions be removed if found to be applied in error. I am committed to following all platform guidelines and maintaining a positive presence on ${data.platformName}.

Please find attached the detailed scan report from ShadowBanCheck.io for your reference.

Thank you for your time and attention to this matter. I look forward to your response.

Sincerely,
${data.senderName || '[Your Name]'}
${data.senderEmail || '[Your Email]'}

---
This appeal was generated with assistance from ShadowBanCheck.io
Contact: disputes@shadowbancheck.io
Reference: ${data.trackingId || 'DSP-' + Date.now()}`;
        }
    },
    
    content_restriction: {
        name: 'Content Restriction Appeal',
        subject: 'Content Visibility Issue - Appeal for Review',
        generate: function(data) {
            return `Dear ${data.platformName} Support Team,

I am writing regarding a specific content restriction affecting my account @${data.username}.

AFFECTED CONTENT:
• Post/Video URL: ${data.contentUrl || '[Content URL]'}
• Date Posted: ${data.postDate || '[Date]'}
• Content Type: ${data.contentType || 'Post/Video/Story'}

ISSUE:
${data.issueDescription || 'This content is not receiving normal distribution and appears to be suppressed or restricted.'}

I believe this content complies with ${data.platformName}'s guidelines and request a manual review.

SCAN EVIDENCE:
ShadowBanCheck.io Score: ${data.score}%

Thank you for your review.

Sincerely,
${data.senderName || '[Your Name]'}

---
Reference: ${data.trackingId || 'DSP-' + Date.now()}`;
        }
    },
    
    hashtag_restriction: {
        name: 'Hashtag Restriction Inquiry',
        subject: 'Hashtag Visibility Issue - Account Review Request',
        generate: function(data) {
            return `Dear ${data.platformName} Support Team,

I am contacting you regarding hashtag visibility issues on my account @${data.username}.

ISSUE:
My posts are no longer appearing in hashtag searches, despite using appropriate and relevant hashtags.

AFFECTED HASHTAGS:
${data.hashtags || '• [List relevant hashtags]'}

SCAN RESULTS:
ShadowBanCheck.io detected: ${data.score}% restriction likelihood

I would appreciate a review of my account's hashtag status.

Thank you,
${data.senderName || '[Your Name]'}

---
Reference: ${data.trackingId || 'DSP-' + Date.now()}`;
        }
    }
};

// =============================================================================
// DISPUTE TRACKING
// =============================================================================
const STORAGE_KEY = 'shadowban_disputes_v1';

function getDisputes() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveDispute(dispute) {
    const disputes = getDisputes();
    disputes.unshift(dispute);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(disputes.slice(0, 50))); // Keep last 50
    return dispute;
}

function updateDispute(trackingId, updates) {
    const disputes = getDisputes();
    const index = disputes.findIndex(d => d.trackingId === trackingId);
    if (index !== -1) {
        disputes[index] = { ...disputes[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(disputes));
        return disputes[index];
    }
    return null;
}

function generateTrackingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'DSP-';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// =============================================================================
// RESOLUTION CENTER CLASS
// =============================================================================
class ResolutionCenter {
    constructor() {
        this.currentDispute = null;
    }
    
    // Get platform info
    getPlatformInfo(platform) {
        return PLATFORM_CONTACTS[platform.toLowerCase()] || null;
    }
    
    // Get all platforms
    getAllPlatforms() {
        return Object.entries(PLATFORM_CONTACTS).map(([key, value]) => ({
            id: key,
            ...value
        }));
    }
    
    // Generate dispute letter
    generateLetter(templateId, data) {
        const template = LETTER_TEMPLATES[templateId];
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        
        // Add tracking ID
        data.trackingId = data.trackingId || generateTrackingId();
        
        // Add platform name
        const platformInfo = this.getPlatformInfo(data.platform);
        data.platformName = platformInfo?.name || data.platform;
        
        return {
            subject: template.subject,
            body: template.generate(data),
            trackingId: data.trackingId,
            platform: data.platform,
            platformInfo: platformInfo
        };
    }
    
    // Create a new dispute
    createDispute(data) {
        const letter = this.generateLetter(data.templateId || 'shadowban_appeal', data);
        
        const dispute = {
            trackingId: letter.trackingId,
            platform: data.platform,
            username: data.username,
            status: 'draft',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            letter: letter,
            scanData: data.scanData || null,
            clientId: data.clientId || null, // For agency use
            responses: []
        };
        
        this.currentDispute = dispute;
        return dispute;
    }
    
    // Save dispute to storage
    saveCurrentDispute() {
        if (this.currentDispute) {
            return saveDispute(this.currentDispute);
        }
        return null;
    }
    
    // Submit dispute
    submitDispute(dispute) {
        dispute = dispute || this.currentDispute;
        if (!dispute) return null;
        
        dispute.status = 'submitted';
        dispute.submittedAt = Date.now();
        dispute.updatedAt = Date.now();
        
        // In production, this would send email via disputes@shadowbancheck.io
        console.log('📧 Dispute submitted:', dispute.trackingId);
        console.log('To:', dispute.letter.platformInfo?.primaryEmail);
        console.log('Subject:', dispute.letter.subject);
        
        return saveDispute(dispute);
    }
    
    // Get dispute status
    getDispute(trackingId) {
        const disputes = getDisputes();
        return disputes.find(d => d.trackingId === trackingId) || null;
    }
    
    // Get all disputes
    getAllDisputes() {
        return getDisputes();
    }
    
    // Get disputes by status
    getDisputesByStatus(status) {
        return getDisputes().filter(d => d.status === status);
    }
    
    // Update dispute status
    updateDisputeStatus(trackingId, status, notes) {
        return updateDispute(trackingId, {
            status: status,
            updatedAt: Date.now(),
            statusNotes: notes
        });
    }
    
    // Add response to dispute
    addResponse(trackingId, response) {
        const dispute = this.getDispute(trackingId);
        if (!dispute) return null;
        
        dispute.responses = dispute.responses || [];
        dispute.responses.push({
            date: Date.now(),
            content: response,
            type: 'platform_response'
        });
        
        return updateDispute(trackingId, {
            responses: dispute.responses,
            status: 'responded',
            updatedAt: Date.now()
        });
    }
    
    // Get platform tips
    getPlatformTips(platform) {
        const info = this.getPlatformInfo(platform);
        return info?.tips || [];
    }
    
    // Get success rate
    getSuccessRate(platform) {
        const info = this.getPlatformInfo(platform);
        return info?.successRate || 0;
    }
    
    // Get available templates
    getTemplates() {
        return Object.entries(LETTER_TEMPLATES).map(([id, template]) => ({
            id: id,
            name: template.name
        }));
    }
}

// =============================================================================
// UI COMPONENTS (Optional)
// =============================================================================
function createDisputeModal() {
    if (document.getElementById('resolution-center-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'resolution-center-modal';
    modal.className = 'resolution-modal hidden';
    modal.innerHTML = `
        <div class="resolution-modal-content">
            <div class="resolution-modal-header">
                <h2>📋 Resolution Center</h2>
                <button class="modal-close" onclick="ResolutionCenter.closeModal()">&times;</button>
            </div>
            <div class="resolution-modal-body" id="resolution-modal-body">
                <!-- Content populated dynamically -->
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// =============================================================================
// GLOBAL INSTANCE
// =============================================================================
const resolutionCenterInstance = new ResolutionCenter();

// Public API
window.ResolutionCenter = {
    instance: resolutionCenterInstance,
    
    // Platform info
    getPlatformInfo: (platform) => resolutionCenterInstance.getPlatformInfo(platform),
    getAllPlatforms: () => resolutionCenterInstance.getAllPlatforms(),
    
    // Dispute management
    createDispute: (data) => resolutionCenterInstance.createDispute(data),
    submitDispute: (dispute) => resolutionCenterInstance.submitDispute(dispute),
    getDispute: (trackingId) => resolutionCenterInstance.getDispute(trackingId),
    getAllDisputes: () => resolutionCenterInstance.getAllDisputes(),
    updateStatus: (trackingId, status, notes) => resolutionCenterInstance.updateDisputeStatus(trackingId, status, notes),
    
    // Letter generation
    generateLetter: (templateId, data) => resolutionCenterInstance.generateLetter(templateId, data),
    getTemplates: () => resolutionCenterInstance.getTemplates(),
    
    // Helpers
    getPlatformTips: (platform) => resolutionCenterInstance.getPlatformTips(platform),
    getSuccessRate: (platform) => resolutionCenterInstance.getSuccessRate(platform),
    
    // Modal control
    openModal: () => {
        createDisputeModal();
        document.getElementById('resolution-center-modal')?.classList.remove('hidden');
    },
    closeModal: () => {
        document.getElementById('resolution-center-modal')?.classList.add('hidden');
    }
};

// =============================================================================
// INITIALIZATION
// =============================================================================
console.log('📋 Resolution Center v1.0 loaded');
console.log(`   • ${Object.keys(PLATFORM_CONTACTS).length} platforms supported`);
console.log(`   • ${Object.keys(LETTER_TEMPLATES).length} letter templates`);
console.log(`   • ${getDisputes().length} disputes in history`);

})();
