/* =============================================================================
   AGENT-BASE.JS - Base Agent Class & Registry
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   Version: 2.0.0
   Updated: December 2025
   
   Foundation for all 5 specialized detection agents:
   - Factor 1: Platform API Agent (20%)
   - Factor 2: Web Analysis Agent (20%)
   - Factor 3: Historical Agent (15%)
   - Factor 4: Detection Agent (25%)
   - Factor 5: Predictive AI Agent (20%)
   
   3-Point Intelligence Model:
   - Predictive (15%): Community reports, trends, news
   - Real-Time (55%): Live API/web checks
   - Historical (30%): Database records, past scans
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// CONSTANTS
// =============================================================================

const FACTOR_CONFIG = {
    1: { name: 'Platform API Analysis', weight: 20 },
    2: { name: 'Web/Search Analysis', weight: 20 },
    3: { name: 'Historical Data', weight: 15 },
    4: { name: 'Real-Time Detection', weight: 25 },
    5: { name: 'Predictive Intelligence', weight: 20 }
};

const THREE_POINT_WEIGHTS = {
    predictive: 15,
    realtime: 55,
    historical: 30
};

const CONFIDENCE_LEVELS = {
    high: { min: 70, display: '🟢 High Confidence', description: 'Strong corroboration from multiple sources' },
    medium: { min: 40, display: '🟡 Medium Confidence', description: 'Moderate confidence, some uncertainty' },
    low: { min: 0, display: '🔴 Low Confidence', description: 'Limited evidence, use caution' }
};

const SEVERITY_THRESHOLDS = {
    critical: 75,
    high: 50,
    medium: 25,
    low: 1,
    none: 0
};

// =============================================================================
// AGENT BASE CLASS
// =============================================================================

class AgentBase {
    
    /**
     * Create a new agent
     * @param {string} agentId - Unique identifier (e.g., 'platform-api', 'detection')
     * @param {number} factorNumber - Factor 1-5
     * @param {number} weight - Weight percentage (should match FACTOR_CONFIG)
     */
    constructor(agentId, factorNumber, weight) {
        this.agentId = agentId;
        this.factorNumber = factorNumber;
        this.weight = weight || FACTOR_CONFIG[factorNumber]?.weight || 20;
        this.factorName = FACTOR_CONFIG[factorNumber]?.name || `Factor ${factorNumber}`;
        this.enabled = true;
        this.useDemo = true;
    }
    
    // =========================================================================
    // MAIN ANALYSIS METHOD (Override in subclasses)
    // =========================================================================
    
    /**
     * Main analysis method - override in each agent
     * @param {object} input - Analysis input
     * @returns {object} Standardized agent result
     */
    async analyze(input) {
        return this.createResult({
            status: 'not_implemented',
            rawScore: 0,
            confidence: 0,
            findings: [],
            message: 'Agent analyze() method not implemented'
        });
    }
    
    /**
     * Analyze an account
     * @param {string} username - Username to analyze
     * @param {string} platform - Platform identifier
     */
    async analyzeAccount(username, platform) {
        return this.analyze({ type: 'account', username, platform });
    }
    
    /**
     * Analyze a post
     * @param {string} postId - Post ID
     * @param {string} platform - Platform identifier
     * @param {object} postData - Optional pre-fetched post data
     */
    async analyzePost(postId, platform, postData = null) {
        return this.analyze({ type: 'post', postId, platform, postData });
    }
    
    /**
     * Analyze text content
     * @param {string} text - Text to analyze
     * @param {string} platform - Platform identifier
     */
    async analyzeText(text, platform) {
        return this.analyze({ type: 'text', text, platform });
    }
    
    // =========================================================================
    // 3-POINT INTELLIGENCE HELPERS
    // =========================================================================
    
    /**
     * Calculate 3-Point Intelligence score for a signal
     * @param {number} predictiveScore - Score from predictive sources (0-100)
     * @param {number} realtimeScore - Score from real-time checks (0-100)
     * @param {number} historicalScore - Score from historical data (0-100)
     * @returns {object} 3-Point breakdown with contributions
     */
    calculate3PointScore(predictiveScore, realtimeScore, historicalScore) {
        const predictive = {
            weight: THREE_POINT_WEIGHTS.predictive,
            score: predictiveScore || 0,
            contribution: Math.round((predictiveScore || 0) * THREE_POINT_WEIGHTS.predictive) / 100
        };
        
        const realtime = {
            weight: THREE_POINT_WEIGHTS.realtime,
            score: realtimeScore || 0,
            contribution: Math.round((realtimeScore || 0) * THREE_POINT_WEIGHTS.realtime) / 100
        };
        
        const historical = {
            weight: THREE_POINT_WEIGHTS.historical,
            score: historicalScore || 0,
            contribution: Math.round((historicalScore || 0) * THREE_POINT_WEIGHTS.historical) / 100
        };
        
        const combinedScore = Math.round(
            (predictive.contribution + realtime.contribution + historical.contribution) * 100
        ) / 100;
        
        return {
            predictive,
            realtime,
            historical,
            combinedScore
        };
    }
    
    /**
     * Get confidence level based on score and source count
     * @param {number} score - Combined score
     * @param {number} activeSourceCount - Number of active sources (1-3)
     * @returns {object} Confidence object with level, score, sources, description
     */
    getConfidenceLevel(score, activeSourceCount) {
        // Agreement bonus - reward multiple sources
        const agreementBonus = activeSourceCount >= 3 ? 15 : activeSourceCount >= 2 ? 5 : 0;
        const adjustedScore = Math.min(100, Math.max(0, score + agreementBonus));
        
        let level, description;
        if (adjustedScore >= CONFIDENCE_LEVELS.high.min) {
            level = 'high';
            description = CONFIDENCE_LEVELS.high.description;
        } else if (adjustedScore >= CONFIDENCE_LEVELS.medium.min) {
            level = 'medium';
            description = CONFIDENCE_LEVELS.medium.description;
        } else {
            level = 'low';
            description = CONFIDENCE_LEVELS.low.description;
        }
        
        return {
            level,
            score: adjustedScore,
            sources: activeSourceCount,
            description: activeSourceCount >= 3 
                ? '3+ sources corroborate' 
                : activeSourceCount >= 2 
                    ? '2 sources corroborate' 
                    : 'Single source'
        };
    }
    
    // =========================================================================
    // RESULT BUILDERS
    // =========================================================================
    
    /**
     * Create standardized agent result
     * @param {object} options - Result options
     * @returns {object} Standardized result object
     */
    createResult(options = {}) {
        const rawScore = Math.min(100, Math.max(0, options.rawScore || 0));
        const weightedScore = Math.round((rawScore * this.weight) / 100 * 100) / 100;
        
        return {
            // Agent identification
            agentId: this.agentId,
            agent: this.factorName,
            factorNumber: this.factorNumber,
            factor: this.factorNumber,
            factorName: this.factorName,
            weight: this.weight,
            
            // Status
            status: options.status || 'complete',
            enabled: this.enabled,
            demo: this.useDemo,
            dataSource: this.useDemo ? 'demo' : 'live',
            
            // Scores
            rawScore: rawScore,
            weightedScore: weightedScore,
            confidence: options.confidence || 0,
            
            // Findings and flags
            findings: options.findings || [],
            flags: options.flags || [],
            warnings: options.warnings || [],
            
            // Checks data (agent-specific)
            checks: options.checks || {},
            
            // Metadata
            timestamp: new Date().toISOString(),
            processingTime: options.processingTime || 0,
            message: options.message || null
        };
    }
    
    /**
     * Create a finding object
     * @param {string} type - Finding type ('good', 'info', 'warning', 'danger')
     * @param {string} message - Human-readable message
     * @param {number} impact - Impact score (0-100)
     * @param {object} details - Additional details
     * @returns {object} Finding object
     */
    createFinding(type, message, impact = 0, details = {}) {
        return {
            type: type,
            severity: this.getSeverity(Math.abs(impact)),
            message: message,
            impact: impact,
            details: details,
            agent: this.agentId,
            factor: this.factorNumber
        };
    }
    
    /**
     * Get severity level from impact score
     * @param {number} impact - Impact score (0-100)
     * @returns {string} Severity level
     */
    getSeverity(impact) {
        if (impact >= SEVERITY_THRESHOLDS.critical) return 'critical';
        if (impact >= SEVERITY_THRESHOLDS.high) return 'high';
        if (impact >= SEVERITY_THRESHOLDS.medium) return 'medium';
        if (impact >= SEVERITY_THRESHOLDS.low) return 'low';
        return 'none';
    }
    
    // =========================================================================
    // SCORE HELPERS
    // =========================================================================
    
    /**
     * Calculate weighted score contribution
     * @param {number} rawScore - Raw score (0-100)
     * @returns {number} Weighted contribution
     */
    getWeightedScore(rawScore) {
        return Math.round((rawScore * this.weight) / 100 * 100) / 100;
    }
    
    /**
     * Normalize a score to 0-100 range
     * @param {number} score - Score to normalize
     * @param {number} max - Maximum possible value
     * @returns {number} Normalized score
     */
    normalizeScore(score, max) {
        if (max === 0) return 0;
        return Math.min(100, Math.max(0, Math.round((score / max) * 100)));
    }
    
    /**
     * Calculate confidence based on data availability
     * @param {object} data - Data object
     * @param {array} requiredFields - Fields to check
     * @returns {number} Confidence percentage
     */
    calculateDataConfidence(data, requiredFields) {
        if (!data || !requiredFields || requiredFields.length === 0) return 0;
        
        let available = 0;
        for (const field of requiredFields) {
            if (data[field] !== undefined && data[field] !== null) {
                available++;
            }
        }
        
        return Math.round((available / requiredFields.length) * 100);
    }
    
    // =========================================================================
    // UTILITY METHODS
    // =========================================================================
    
    /**
     * Extract text content from various input formats
     * @param {object} input - Input object
     * @returns {string} Extracted text
     */
    extractText(input) {
        if (input.text) return input.text;
        if (input.postData?.text) return input.postData.text;
        if (input.postData?.tweetText) return input.postData.tweetText;
        if (input.postData?.postTitle) {
            return `${input.postData.postTitle} ${input.postData.postBody || ''}`;
        }
        return '';
    }
    
    /**
     * Extract domain from URL
     * @param {string} url - URL to parse
     * @returns {string|null} Domain or null
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (e) {
            const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\?]+)/i);
            return match ? match[1] : null;
        }
    }
    
    /**
     * Log message with agent prefix
     * @param {string} message - Message to log
     * @param {string} level - Log level ('info', 'warn', 'error')
     */
    log(message, level = 'info') {
        const prefix = `[${this.agentId}]`;
        if (level === 'error') {
            console.error(prefix, message);
        } else if (level === 'warn') {
            console.warn(prefix, message);
        } else {
            console.log(prefix, message);
        }
    }
    
    // =========================================================================
    // CONFIGURATION
    // =========================================================================
    
    isEnabled() { 
        return this.enabled; 
    }
    
    setEnabled(enabled) { 
        this.enabled = !!enabled; 
    }
    
    setDemoMode(useDemo) { 
        this.useDemo = !!useDemo; 
    }
    
    /**
     * Get agent information
     * @returns {object} Agent info
     */
    getInfo() {
        return {
            agentId: this.agentId,
            factorNumber: this.factorNumber,
            factorName: this.factorName,
            weight: this.weight,
            enabled: this.enabled,
            useDemo: this.useDemo
        };
    }
}

// =============================================================================
// AGENT REGISTRY
// =============================================================================

const AgentRegistry = {
    agents: {},
    
    /**
     * Register an agent
     * @param {AgentBase} agent - Agent instance to register
     */
    register(agent) {
        if (agent && agent.agentId) {
            this.agents[agent.agentId] = agent;
            console.log(`📌 Registered: ${agent.factorName} (Factor ${agent.factorNumber}, ${agent.weight}%)`);
        }
    },
    
    /**
     * Get agent by ID
     * @param {string} agentId - Agent identifier
     * @returns {AgentBase|null} Agent or null
     */
    get(agentId) {
        return this.agents[agentId] || null;
    },
    
    /**
     * Get agent by factor number
     * @param {number} factorNumber - Factor 1-5
     * @returns {AgentBase|null} Agent or null
     */
    getByFactor(factorNumber) {
        for (const agent of Object.values(this.agents)) {
            if (agent.factorNumber === factorNumber) return agent;
        }
        return null;
    },
    
    /**
     * Get all registered agents
     * @returns {object} Map of agents
     */
    getAll() {
        return { ...this.agents };
    },
    
    /**
     * Get all enabled agents
     * @returns {array} Array of enabled agents
     */
    getEnabled() {
        return Object.values(this.agents).filter(a => a.isEnabled());
    },
    
    /**
     * Run all enabled agents
     * @param {object} input - Analysis input
     * @returns {array} Array of results
     */
    async runAll(input) {
        const results = [];
        const enabledAgents = this.getEnabled();
        
        // Sort by factor number for consistent ordering
        enabledAgents.sort((a, b) => a.factorNumber - b.factorNumber);
        
        for (const agent of enabledAgents) {
            try {
                const startTime = Date.now();
                const result = await agent.analyze(input);
                result.processingTime = Date.now() - startTime;
                results.push(result);
            } catch (error) {
                console.error(`[${agent.agentId}] Error:`, error.message);
                results.push({
                    agentId: agent.agentId,
                    agent: agent.factorName,
                    factorNumber: agent.factorNumber,
                    factor: agent.factorNumber,
                    factorName: agent.factorName,
                    weight: agent.weight,
                    status: 'error',
                    error: error.message,
                    rawScore: 0,
                    weightedScore: 0,
                    confidence: 0,
                    findings: [{
                        type: 'danger',
                        severity: 'high',
                        message: `Agent error: ${error.message}`,
                        impact: 0
                    }]
                });
            }
        }
        
        return results;
    },
    
    /**
     * Check if all 5 factors have registered agents
     * @returns {boolean} True if all factors covered
     */
    hasAllFactors() {
        const factors = new Set();
        for (const agent of Object.values(this.agents)) {
            factors.add(agent.factorNumber);
        }
        return factors.size === 5;
    },
    
    /**
     * Get total weight of all agents
     * @returns {number} Total weight (should be 100)
     */
    getTotalWeight() {
        return Object.values(this.agents).reduce((sum, a) => sum + a.weight, 0);
    },
    
    /**
     * Set demo mode for all agents
     * @param {boolean} useDemo - Demo mode flag
     */
    setDemoMode(useDemo) {
        for (const agent of Object.values(this.agents)) {
            agent.setDemoMode(useDemo);
        }
    },
    
    /**
     * Get registry status
     * @returns {object} Status info
     */
    getStatus() {
        return {
            agentCount: Object.keys(this.agents).length,
            totalWeight: this.getTotalWeight(),
            hasAllFactors: this.hasAllFactors(),
            agents: Object.values(this.agents).map(a => ({
                id: a.agentId,
                factor: a.factorNumber,
                name: a.factorName,
                weight: a.weight,
                enabled: a.enabled,
                demo: a.useDemo
            }))
        };
    }
};

// =============================================================================
// EXPORTS
// =============================================================================

// Export constants for other modules
window.FACTOR_CONFIG = FACTOR_CONFIG;
window.THREE_POINT_WEIGHTS = THREE_POINT_WEIGHTS;
window.CONFIDENCE_LEVELS = CONFIDENCE_LEVELS;
window.SEVERITY_THRESHOLDS = SEVERITY_THRESHOLDS;

// Export classes
window.AgentBase = AgentBase;
window.AgentRegistry = AgentRegistry;

console.log('✅ AgentBase v2.0.0 loaded - 5-Factor Engine Foundation');

})();
