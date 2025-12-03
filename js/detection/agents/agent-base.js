/* =============================================================================
   AGENT-BASE.JS - Foundation for 5-Factor Detection Engine
   ShadowBanCheck.io
   
   Provides:
   - AgentRegistry: Central hub for all agents (with deferred registration)
   - AgentBase: Base class for agents to extend
   - Shared utilities and constants
   
   DEFERRED REGISTRATION PATTERN:
   Agents can register before or after this file loads. If they register
   before, they're queued in window.AgentQueue and processed when this loads.
   
   Load Order: This file should load first, but it's resilient if it doesn't.
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// CONSTANTS
// =============================================================================

const FACTOR_CONFIG = {
    1: { name: 'Platform API Analysis', weight: 20, agentId: 'api' },
    2: { name: 'Web/Search Analysis', weight: 20, agentId: 'web' },
    3: { name: 'Historical Data', weight: 15, agentId: 'historical' },
    4: { name: 'Real-Time Detection', weight: 25, agentId: 'detection' },
    5: { name: 'Predictive Intelligence', weight: 20, agentId: 'predictive' }
};

const THREE_POINT_WEIGHTS = {
    predictive: 15,
    realtime: 55,
    historical: 30
};

const CONFIDENCE_LEVELS = {
    high: { min: 70, label: 'High Confidence', bonus: 15 },
    medium: { min: 40, label: 'Medium Confidence', bonus: 5 },
    low: { min: 0, label: 'Low Confidence', bonus: 0 }
};

const SEVERITY_THRESHOLDS = {
    critical: 75,
    high: 50,
    medium: 25,
    low: 1
};

// =============================================================================
// AGENT REGISTRY - Central Hub
// =============================================================================

const AgentRegistry = {
    
    _agents: {},
    _initialized: false,
    
    /**
     * Register an agent
     * @param {object} agent - Agent instance with id, factor, analyze method
     */
    register: function(agent) {
        if (!agent || !agent.id) {
            console.warn('[AgentRegistry] Cannot register agent without id');
            return false;
        }
        
        this._agents[agent.id] = agent;
        console.log(`[AgentRegistry] Registered: ${agent.id} (Factor ${agent.factor})`);
        return true;
    },
    
    /**
     * Get an agent by ID
     * @param {string} id - Agent ID
     * @returns {object|null} Agent instance
     */
    get: function(id) {
        return this._agents[id] || null;
    },
    
    /**
     * Get agent by factor number
     * @param {number} factor - Factor number (1-5)
     * @returns {object|null} Agent instance
     */
    getByFactor: function(factor) {
        for (const agent of Object.values(this._agents)) {
            if (agent.factor === factor) {
                return agent;
            }
        }
        return null;
    },
    
    /**
     * Get all registered agents
     * @returns {object} All agents keyed by ID
     */
    getAll: function() {
        return { ...this._agents };
    },
    
    /**
     * Get list of registered agent IDs
     * @returns {array} Agent IDs
     */
    getIds: function() {
        return Object.keys(this._agents);
    },
    
    /**
     * Check if an agent is registered
     * @param {string} id - Agent ID
     * @returns {boolean}
     */
    has: function(id) {
        return !!this._agents[id];
    },
    
    /**
     * Run all registered agents
     * @param {object} input - Analysis input
     * @returns {Promise<array>} Results from all agents
     */
    runAll: async function(input) {
        const results = [];
        const agents = Object.values(this._agents);
        
        // Sort by factor number for consistent ordering
        agents.sort((a, b) => (a.factor || 0) - (b.factor || 0));
        
        for (const agent of agents) {
            try {
                if (typeof agent.analyze === 'function') {
                    const result = await agent.analyze(input);
                    results.push(result);
                } else {
                    console.warn(`[AgentRegistry] Agent ${agent.id} has no analyze method`);
                    results.push(this._createPlaceholderResult(agent));
                }
            } catch (error) {
                console.error(`[AgentRegistry] Error running ${agent.id}:`, error);
                results.push(this._createErrorResult(agent, error));
            }
        }
        
        return results;
    },
    
    /**
     * Run a specific agent
     * @param {string} id - Agent ID
     * @param {object} input - Analysis input
     * @returns {Promise<object>} Agent result
     */
    run: async function(id, input) {
        const agent = this.get(id);
        if (!agent) {
            return { error: true, message: `Agent not found: ${id}` };
        }
        
        if (typeof agent.analyze !== 'function') {
            return { error: true, message: `Agent ${id} has no analyze method` };
        }
        
        try {
            return await agent.analyze(input);
        } catch (error) {
            return this._createErrorResult(agent, error);
        }
    },
    
    /**
     * Get registry status
     * @returns {object} Status info
     */
    getStatus: function() {
        const agents = Object.values(this._agents);
        return {
            initialized: this._initialized,
            agentCount: agents.length,
            agents: agents.map(a => ({
                id: a.id,
                name: a.name,
                factor: a.factor,
                weight: a.weight
            })),
            factorsCovered: [...new Set(agents.map(a => a.factor).filter(f => f))].sort()
        };
    },
    
    /**
     * Clear all agents (for testing)
     */
    clear: function() {
        this._agents = {};
    },
    
    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================
    
    _createPlaceholderResult: function(agent) {
        return {
            agent: agent.name || agent.id,
            agentId: agent.id,
            factor: agent.factor,
            weight: agent.weight || FACTOR_CONFIG[agent.factor]?.weight || 20,
            status: 'placeholder',
            rawScore: 0,
            weightedScore: 0,
            confidence: 0,
            findings: [],
            message: 'Agent has no analyze method'
        };
    },
    
    _createErrorResult: function(agent, error) {
        return {
            agent: agent.name || agent.id,
            agentId: agent.id,
            factor: agent.factor,
            weight: agent.weight || FACTOR_CONFIG[agent.factor]?.weight || 20,
            status: 'error',
            rawScore: 0,
            weightedScore: 0,
            confidence: 0,
            findings: [],
            error: true,
            message: error.message || 'Unknown error'
        };
    }
};

// =============================================================================
// AGENT BASE CLASS
// =============================================================================

class AgentBase {
    
    constructor(config = {}) {
        this.id = config.id || 'unknown';
        this.name = config.name || 'Unknown Agent';
        this.factor = config.factor || 0;
        this.weight = config.weight || FACTOR_CONFIG[config.factor]?.weight || 20;
        this.version = config.version || '1.0.0';
        this.demoMode = true;
    }
    
    /**
     * Main analysis method - OVERRIDE IN SUBCLASS
     * @param {object} input - Analysis input
     * @returns {Promise<object>} Analysis result
     */
    async analyze(input) {
        // Override in subclass
        return this.createResult({
            status: 'not_implemented',
            rawScore: 0,
            findings: [{ type: 'info', message: 'Agent not implemented' }]
        });
    }
    
    /**
     * Create standardized result object
     * @param {object} data - Result data
     * @returns {object} Formatted result
     */
    createResult(data) {
        const rawScore = data.rawScore || 0;
        return {
            agent: this.name,
            agentId: this.id,
            factor: this.factor,
            weight: this.weight,
            status: data.status || 'complete',
            
            checks: data.checks || {},
            findings: data.findings || [],
            
            rawScore: rawScore,
            weightedScore: Math.round((rawScore * this.weight) / 100 * 100) / 100,
            confidence: data.confidence || 50,
            
            timestamp: new Date().toISOString(),
            ...data.extra
        };
    }
    
    /**
     * Create a finding object
     * @param {string} type - 'good', 'info', 'warning', 'danger'
     * @param {string} severity - 'none', 'low', 'medium', 'high'
     * @param {string} message - Finding message
     * @param {number} impact - Score impact (0-100)
     * @returns {object} Finding object
     */
    createFinding(type, severity, message, impact = 0) {
        return { type, severity, message, impact };
    }
    
    /**
     * Calculate 3-Point Intelligence score
     * @param {number} predictive - Predictive score (0-100)
     * @param {number} realtime - Real-time score (0-100)
     * @param {number} historical - Historical score (0-100)
     * @returns {object} 3-Point score breakdown
     */
    calculate3PointScore(predictive, realtime, historical) {
        const pContrib = (predictive * THREE_POINT_WEIGHTS.predictive) / 100;
        const rContrib = (realtime * THREE_POINT_WEIGHTS.realtime) / 100;
        const hContrib = (historical * THREE_POINT_WEIGHTS.historical) / 100;
        
        return {
            predictive: { weight: THREE_POINT_WEIGHTS.predictive, score: predictive, contribution: pContrib },
            realtime: { weight: THREE_POINT_WEIGHTS.realtime, score: realtime, contribution: rContrib },
            historical: { weight: THREE_POINT_WEIGHTS.historical, score: historical, contribution: hContrib },
            combinedScore: Math.round((pContrib + rContrib + hContrib) * 100) / 100
        };
    }
    
    /**
     * Get confidence level based on score and source count
     * @param {number} score - Base score
     * @param {number} sources - Number of corroborating sources
     * @returns {object} Confidence info
     */
    getConfidenceLevel(score, sources = 1) {
        const bonus = sources >= 3 ? CONFIDENCE_LEVELS.high.bonus : 
                      sources >= 2 ? CONFIDENCE_LEVELS.medium.bonus : 0;
        const adjusted = Math.min(100, score + bonus);
        
        let level;
        if (adjusted >= CONFIDENCE_LEVELS.high.min) {
            level = 'high';
        } else if (adjusted >= CONFIDENCE_LEVELS.medium.min) {
            level = 'medium';
        } else {
            level = 'low';
        }
        
        return {
            level,
            score: adjusted,
            sources,
            description: `${sources} source${sources !== 1 ? 's' : ''} corroborate`
        };
    }
    
    /**
     * Determine severity from score
     * @param {number} score - Score (0-100)
     * @returns {string} Severity level
     */
    getSeverity(score) {
        if (score >= SEVERITY_THRESHOLDS.critical) return 'critical';
        if (score >= SEVERITY_THRESHOLDS.high) return 'high';
        if (score >= SEVERITY_THRESHOLDS.medium) return 'medium';
        if (score >= SEVERITY_THRESHOLDS.low) return 'low';
        return 'none';
    }
    
    /**
     * Set demo mode
     * @param {boolean} enabled
     */
    setDemoMode(enabled) {
        this.demoMode = !!enabled;
    }
    
    /**
     * Get agent status
     * @returns {object} Status info
     */
    getStatus() {
        return {
            id: this.id,
            name: this.name,
            factor: this.factor,
            weight: this.weight,
            version: this.version,
            demoMode: this.demoMode
        };
    }
}

// =============================================================================
// DEFERRED REGISTRATION - Process any agents that registered before we loaded
// =============================================================================

function processQueuedAgents() {
    if (window.AgentQueue && Array.isArray(window.AgentQueue)) {
        console.log(`[AgentRegistry] Processing ${window.AgentQueue.length} queued agent(s)`);
        
        for (const agent of window.AgentQueue) {
            AgentRegistry.register(agent);
        }
        
        // Clear the queue
        window.AgentQueue = [];
    }
}

// =============================================================================
// HELPER: Safe Registration Function
// Use this in agent files for safe registration regardless of load order
// =============================================================================

function registerAgent(agent) {
    if (window.AgentRegistry) {
        window.AgentRegistry.register(agent);
    } else {
        // Queue for later
        window.AgentQueue = window.AgentQueue || [];
        window.AgentQueue.push(agent);
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Export constants
window.FACTOR_CONFIG = FACTOR_CONFIG;
window.THREE_POINT_WEIGHTS = THREE_POINT_WEIGHTS;
window.CONFIDENCE_LEVELS = CONFIDENCE_LEVELS;
window.SEVERITY_THRESHOLDS = SEVERITY_THRESHOLDS;

// Export classes and registry
window.AgentBase = AgentBase;
window.AgentRegistry = AgentRegistry;
window.registerAgent = registerAgent;

// Process any queued agents
processQueuedAgents();
AgentRegistry._initialized = true;

// =============================================================================
// INITIALIZATION
// =============================================================================

console.log('✅ AgentBase + AgentRegistry loaded');
console.log('   Factors:', Object.values(FACTOR_CONFIG).map(f => f.name).join(', '));
console.log('   3-Point Weights: Predictive', THREE_POINT_WEIGHTS.predictive + '%,',
            'Real-Time', THREE_POINT_WEIGHTS.realtime + '%,',
            'Historical', THREE_POINT_WEIGHTS.historical + '%');

})();
