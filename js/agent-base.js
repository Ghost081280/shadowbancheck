/* =============================================================================
   AGENT-BASE.JS - Base Agent Class
   ShadowBanCheck.io - 5-Factor Detection Engine
   ============================================================================= */

(function() {
'use strict';

class AgentBase {
    constructor(agentId, factorNumber, weight) {
        this.agentId = agentId;
        this.factorNumber = factorNumber;
        this.weight = weight;
        this.enabled = true;
        this.useDemo = true;
    }
    
    async analyze(input) {
        return {
            agentId: this.agentId,
            factorNumber: this.factorNumber,
            score: 0,
            confidence: 0,
            findings: [],
            message: 'Not implemented'
        };
    }
    
    async analyzeAccount(username, platform) {
        return this.analyze({ type: 'account', username, platform });
    }
    
    async analyzePost(postId, platform, postData = null) {
        return this.analyze({ type: 'post', postId, platform, postData });
    }
    
    async analyzeText(text, platform) {
        return this.analyze({ type: 'text', text, platform });
    }
    
    getWeightedScore(rawScore) {
        return (rawScore * this.weight) / 100;
    }
    
    normalizeScore(score, max) {
        if (max === 0) return 0;
        return Math.min(100, Math.max(0, (score / max) * 100));
    }
    
    calculateConfidence(data, requiredFields) {
        if (!data || !requiredFields || requiredFields.length === 0) return 0;
        let available = 0;
        for (const field of requiredFields) {
            if (data[field] !== undefined && data[field] !== null) available++;
        }
        return Math.round((available / requiredFields.length) * 100);
    }
    
    createResult(options = {}) {
        return {
            agentId: this.agentId,
            factorNumber: this.factorNumber,
            factorName: this.getFactorName(),
            weight: this.weight,
            enabled: this.enabled,
            demo: this.useDemo,
            rawScore: options.rawScore || 0,
            weightedScore: this.getWeightedScore(options.rawScore || 0),
            confidence: options.confidence || 0,
            findings: options.findings || [],
            flags: options.flags || [],
            warnings: options.warnings || [],
            timestamp: new Date().toISOString(),
            processingTime: options.processingTime || 0,
            dataSource: this.useDemo ? 'demo' : 'live',
            message: options.message || null
        };
    }
    
    createFinding(type, message, impact = 0, details = {}) {
        return {
            type, message, impact,
            severity: this.getSeverity(impact),
            details, agent: this.agentId, factor: this.factorNumber
        };
    }
    
    getSeverity(impact) {
        if (impact >= 75) return 'critical';
        if (impact >= 50) return 'high';
        if (impact >= 25) return 'medium';
        if (impact > 0) return 'low';
        return 'none';
    }
    
    getFactorName() {
        const names = {
            1: 'Platform API Analysis',
            2: 'Web/Search Analysis',
            3: 'Historical Data',
            4: 'Real-Time Detection',
            5: 'Predictive Intelligence'
        };
        return names[this.factorNumber] || `Factor ${this.factorNumber}`;
    }
    
    isEnabled() { return this.enabled; }
    setEnabled(enabled) { this.enabled = !!enabled; }
    setDemoMode(useDemo) { this.useDemo = !!useDemo; }
    
    log(message, level = 'info') {
        const prefix = `[${this.agentId}]`;
        if (level === 'error') console.error(prefix, message);
        else if (level === 'warn') console.warn(prefix, message);
        else console.log(prefix, message);
    }
    
    getInfo() {
        return {
            agentId: this.agentId,
            factorNumber: this.factorNumber,
            factorName: this.getFactorName(),
            weight: this.weight,
            enabled: this.enabled,
            useDemo: this.useDemo
        };
    }
}

const AgentRegistry = {
    agents: {},
    
    register(agent) {
        if (agent && agent.agentId) this.agents[agent.agentId] = agent;
    },
    
    get(agentId) { return this.agents[agentId] || null; },
    
    getByFactor(factorNumber) {
        for (const agent of Object.values(this.agents)) {
            if (agent.factorNumber === factorNumber) return agent;
        }
        return null;
    },
    
    getAll() { return { ...this.agents }; },
    getEnabled() { return Object.values(this.agents).filter(a => a.isEnabled()); },
    
    async runAll(input) {
        const results = [];
        for (const agent of this.getEnabled()) {
            try {
                const result = await agent.analyze(input);
                results.push(result);
            } catch (error) {
                results.push({
                    agentId: agent.agentId,
                    factorNumber: agent.factorNumber,
                    error: error.message,
                    score: 0,
                    confidence: 0
                });
            }
        }
        return results;
    },
    
    hasAllFactors() {
        const factors = new Set();
        for (const agent of Object.values(this.agents)) factors.add(agent.factorNumber);
        return factors.size === 5;
    },
    
    getTotalWeight() {
        return Object.values(this.agents).reduce((sum, a) => sum + a.weight, 0);
    }
};

window.AgentBase = AgentBase;
window.AgentRegistry = AgentRegistry;
console.log('✅ AgentBase loaded');

})();
