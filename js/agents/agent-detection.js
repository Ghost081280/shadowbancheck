/* =============================================================================
   AGENT-DETECTION.JS - Factor 4: Real-Time Detection
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   Weight: 25%
   
   The core detection agent that uses all flagged databases:
   - Hashtags & Cashtags (flagged-hashtags.js)
   - Links (flagged-links.js)
   - Content/Words (flagged-content.js)
   - Mentions (flagged-mentions.js)
   - Emojis (flagged-emojis.js)
   - Images (flagged-images.js) - Phase 2
   - Videos (flagged-videos.js) - Phase 3
   - Audio (flagged-audio.js) - Phase 3
   
   Uses 3-Point Intelligence Model:
   - Point 1: Predictive (web search for trends/news)
   - Point 2: Real-Time (platform API checks)
   - Point 3: Historical (stored database)
   ============================================================================= */

(function() {
'use strict';

class DetectionAgent extends window.AgentBase {
    
    constructor() {
        super('detection', 4, 25); // Factor 4, 25% weight (highest)
        
        // Detection types and their weights
        this.detectionTypes = {
            hashtags: { weight: 20, enabled: true },
            cashtags: { weight: 15, enabled: true },
            links: { weight: 20, enabled: true },
            content: { weight: 20, enabled: true },
            mentions: { weight: 10, enabled: true },
            emojis: { weight: 10, enabled: true },
            images: { weight: 0, enabled: false },   // Phase 2
            videos: { weight: 0, enabled: false },   // Phase 3
            audio: { weight: 0, enabled: false }     // Phase 3
        };
    }
    
    async analyze(input) {
        const startTime = Date.now();
        
        try {
            // Extract text content from input
            const text = this.extractText(input);
            const platform = input.platform || 'twitter';
            
            if (!text) {
                return this.createResult({
                    rawScore: 0,
                    confidence: 100,
                    findings: [],
                    processingTime: Date.now() - startTime,
                    message: 'No text content to analyze'
                });
            }
            
            // Run all detection checks with 3-point intelligence
            const detectionResults = await this.runAllDetections(text, platform, input);
            
            // Synthesize results
            const synthesis = this.synthesizeResults(detectionResults);
            
            return this.createResult({
                rawScore: synthesis.score,
                confidence: synthesis.confidence,
                findings: synthesis.findings,
                flags: synthesis.flags,
                warnings: synthesis.warnings,
                processingTime: Date.now() - startTime,
                message: null
            });
            
        } catch (error) {
            this.log(`Error: ${error.message}`, 'error');
            return this.createResult({
                rawScore: 0,
                confidence: 0,
                message: `Error: ${error.message}`
            });
        }
    }
    
    extractText(input) {
        if (input.type === 'text') {
            return input.text || '';
        }
        if (input.postData && input.postData.text) {
            return input.postData.text;
        }
        if (input.postData && input.postData.tweetText) {
            return input.postData.tweetText;
        }
        if (input.postData && input.postData.postTitle) {
            return `${input.postData.postTitle} ${input.postData.postBody || ''}`;
        }
        return '';
    }
    
    // =========================================================================
    // DETECTION METHODS
    // =========================================================================
    
    async runAllDetections(text, platform, input) {
        const results = {};
        
        // 1. Hashtag & Cashtag Detection
        results.hashtags = await this.checkHashtags(text, platform);
        
        // 2. Link Detection
        results.links = await this.checkLinks(text, platform);
        
        // 3. Content Detection
        results.content = await this.checkContent(text, platform);
        
        // 4. Mention Detection
        results.mentions = await this.checkMentions(text, platform);
        
        // 5. Emoji Detection
        results.emojis = await this.checkEmojis(text, platform);
        
        // 6-8. Future: Images, Videos, Audio (placeholders)
        results.images = this.checkImages(input);
        results.videos = this.checkVideos(input);
        results.audio = this.checkAudio(input);
        
        return results;
    }
    
    async checkHashtags(text, platform) {
        const result = {
            type: 'hashtags',
            enabled: this.detectionTypes.hashtags.enabled,
            found: [],
            flagged: [],
            score: 0,
            intelligencePoints: { predictive: null, realtime: null, historical: null }
        };
        
        if (!this.detectionTypes.hashtags.enabled) return result;
        
        // Check if FlaggedHashtags database is available
        if (!window.FlaggedHashtags) {
            result.error = 'FlaggedHashtags database not loaded';
            return result;
        }
        
        // Extract and check tags
        const extraction = window.FlaggedHashtags.extractAndCheck(text, platform);
        
        result.found = extraction.allTags;
        result.flagged = extraction.results ? [
            ...extraction.results.banned,
            ...extraction.results.restricted,
            ...extraction.results.monitored
        ] : [];
        
        // Calculate score
        if (extraction.results) {
            result.score = extraction.results.summary.riskScore || 0;
        }
        
        // 3-Point Intelligence
        result.intelligencePoints = {
            predictive: null, // Would check trending/news
            realtime: extraction.results,
            historical: null // Would check past flags
        };
        
        return result;
    }
    
    async checkLinks(text, platform) {
        const result = {
            type: 'links',
            enabled: this.detectionTypes.links.enabled,
            found: [],
            flagged: [],
            score: 0,
            intelligencePoints: { predictive: null, realtime: null, historical: null }
        };
        
        if (!this.detectionTypes.links.enabled) return result;
        
        // Check if FlaggedLinks database is available
        if (!window.FlaggedLinks) {
            // Fallback: basic URL extraction without database check
            const urlPattern = /https?:\/\/[^\s]+/g;
            result.found = text.match(urlPattern) || [];
            return result;
        }
        
        // Extract and check links
        const extraction = window.FlaggedLinks.extractAndCheck(text, platform);
        
        result.found = extraction.urls || [];
        result.flagged = extraction.results ? extraction.results.flagged : [];
        
        if (extraction.results) {
            result.score = extraction.results.summary ? extraction.results.summary.riskScore || 0 : 0;
        }
        
        result.intelligencePoints = {
            predictive: null,
            realtime: extraction.results,
            historical: null
        };
        
        return result;
    }
    
    async checkContent(text, platform) {
        const result = {
            type: 'content',
            enabled: this.detectionTypes.content.enabled,
            found: [],
            flagged: [],
            score: 0,
            intelligencePoints: { predictive: null, realtime: null, historical: null }
        };
        
        if (!this.detectionTypes.content.enabled) return result;
        
        if (!window.FlaggedContent) {
            result.error = 'FlaggedContent database not loaded';
            return result;
        }
        
        // Scan content
        const scan = window.FlaggedContent.scan(text, platform);
        
        result.flagged = scan.flags || [];
        result.score = scan.score || 0;
        result.riskLevel = scan.riskLevel;
        result.summary = scan.summary;
        
        result.intelligencePoints = {
            predictive: null,
            realtime: scan,
            historical: null
        };
        
        return result;
    }
    
    async checkMentions(text, platform) {
        const result = {
            type: 'mentions',
            enabled: this.detectionTypes.mentions.enabled,
            found: [],
            flagged: [],
            score: 0,
            intelligencePoints: { predictive: null, realtime: null, historical: null }
        };
        
        if (!this.detectionTypes.mentions.enabled) return result;
        
        if (!window.FlaggedMentions) {
            // Fallback: basic mention extraction
            const mentionPattern = /@\w+/g;
            result.found = text.match(mentionPattern) || [];
            return result;
        }
        
        // Extract and check mentions
        const extraction = window.FlaggedMentions.extractAndCheck(text, platform);
        
        result.found = extraction.mentions || [];
        result.flagged = extraction.results ? extraction.results.flagged : [];
        
        if (extraction.results) {
            result.score = extraction.results.summary ? extraction.results.summary.riskScore || 0 : 0;
            result.excessive = extraction.results.excessive;
        }
        
        result.intelligencePoints = {
            predictive: null,
            realtime: extraction.results,
            historical: null
        };
        
        return result;
    }
    
    async checkEmojis(text, platform) {
        const result = {
            type: 'emojis',
            enabled: this.detectionTypes.emojis.enabled,
            found: [],
            flagged: [],
            score: 0,
            intelligencePoints: { predictive: null, realtime: null, historical: null }
        };
        
        if (!this.detectionTypes.emojis.enabled) return result;
        
        if (!window.FlaggedEmojis) {
            // Fallback: basic emoji extraction
            const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu;
            result.found = text.match(emojiPattern) || [];
            return result;
        }
        
        // Extract and check emojis
        const extraction = window.FlaggedEmojis.extractAndCheck(text, platform);
        
        result.found = extraction.emojis || [];
        result.flagged = extraction.results ? extraction.results.flagged : [];
        
        if (extraction.results) {
            result.score = extraction.results.summary ? extraction.results.summary.riskScore || 0 : 0;
            result.combinations = extraction.results.combinations;
            result.excessive = extraction.results.excessive;
        }
        
        result.intelligencePoints = {
            predictive: null,
            realtime: extraction.results,
            historical: null
        };
        
        return result;
    }
    
    checkImages(input) {
        // Phase 2 placeholder
        const result = {
            type: 'images',
            enabled: false,
            found: [],
            flagged: [],
            score: 0,
            message: 'Image detection coming in Phase 2'
        };
        
        if (window.FlaggedImages && window.FlaggedImages.isEnabled()) {
            result.enabled = true;
            // Would analyze images here
        }
        
        return result;
    }
    
    checkVideos(input) {
        // Phase 3 placeholder
        return {
            type: 'videos',
            enabled: false,
            found: [],
            flagged: [],
            score: 0,
            message: 'Video detection coming in Phase 3'
        };
    }
    
    checkAudio(input) {
        // Phase 3 placeholder
        return {
            type: 'audio',
            enabled: false,
            found: [],
            flagged: [],
            score: 0,
            message: 'Audio detection coming in Phase 3'
        };
    }
    
    // =========================================================================
    // SYNTHESIS
    // =========================================================================
    
    synthesizeResults(detectionResults) {
        const findings = [];
        const flags = [];
        const warnings = [];
        let totalScore = 0;
        let totalWeight = 0;
        let confidenceSum = 0;
        let confidenceCount = 0;
        
        for (const [type, result] of Object.entries(detectionResults)) {
            if (!result.enabled) continue;
            
            const typeConfig = this.detectionTypes[type];
            const weight = typeConfig ? typeConfig.weight : 10;
            
            // Add weighted score
            if (result.score > 0) {
                totalScore += (result.score * weight) / 100;
                totalWeight += weight;
                
                // Create finding for this detection type
                findings.push(this.createFinding(
                    `${type}_detection`,
                    `${this.capitalize(type)} analysis: ${result.flagged.length} item(s) flagged`,
                    result.score,
                    {
                        type: type,
                        found: result.found.length,
                        flagged: result.flagged,
                        score: result.score
                    }
                ));
                
                // Add flags
                if (result.score >= 50) {
                    flags.push(`high_risk_${type}`);
                } else if (result.score >= 20) {
                    flags.push(`medium_risk_${type}`);
                }
            }
            
            // Confidence based on data availability
            if (result.found !== undefined) {
                confidenceSum += result.error ? 30 : 90;
                confidenceCount++;
            }
        }
        
        // Calculate final score
        const finalScore = totalWeight > 0 
            ? Math.min(100, (totalScore / totalWeight) * 100)
            : 0;
        
        // Calculate confidence
        const confidence = confidenceCount > 0 
            ? Math.round(confidenceSum / confidenceCount)
            : 50;
        
        // Apply 3-Point Intelligence adjustment
        const intelligenceAdjustment = this.applyIntelligenceModel(detectionResults);
        const adjustedScore = Math.min(100, finalScore + intelligenceAdjustment.adjustment);
        
        if (intelligenceAdjustment.finding) {
            findings.push(intelligenceAdjustment.finding);
        }
        
        return {
            score: Math.round(adjustedScore),
            confidence,
            findings,
            flags,
            warnings
        };
    }
    
    applyIntelligenceModel(results) {
        // 3-Point Intelligence Model
        // Point 1: PREDICTIVE (what we think will happen)
        // Point 2: REAL-TIME (what we see now)
        // Point 3: HISTORICAL (what we've scored before)
        
        // For now, we only have real-time (Point 2)
        // Future: Add predictive (Point 1) via web search
        // Future: Add historical (Point 3) via stored scores
        
        let agreementCount = 0;
        let totalPoints = 0;
        
        for (const result of Object.values(results)) {
            if (!result.enabled) continue;
            
            const points = result.intelligencePoints;
            if (!points) continue;
            
            // Check how many points agree
            const hasRealtime = points.realtime !== null;
            const hasPredictive = points.predictive !== null;
            const hasHistorical = points.historical !== null;
            
            // Count agreement (for future implementation)
            if (hasRealtime) {
                totalPoints++;
                agreementCount++; // Real-time always "agrees" with itself
            }
        }
        
        // Agreement confidence adjustment
        // 3/3 agree: +10% boost
        // 2/3 agree: no change
        // 1/3 agree: -15% penalty
        // 0/3 agree: flag for review
        
        if (totalPoints === 0) {
            return { adjustment: 0, finding: null };
        }
        
        // For now, with only real-time data, no adjustment
        // This will be enhanced when predictive and historical points are added
        return { 
            adjustment: 0, 
            finding: this.createFinding(
                'intelligence_model',
                '3-Point Intelligence: Using real-time detection (predictive & historical coming soon)',
                0,
                { points: { realtime: true, predictive: false, historical: false } }
            )
        };
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // =========================================================================
    // PUBLIC API
    // =========================================================================
    
    /**
     * Enable/disable a detection type
     * @param {string} type - Detection type name
     * @param {boolean} enabled - Enable state
     */
    setDetectionEnabled(type, enabled) {
        if (this.detectionTypes[type]) {
            this.detectionTypes[type].enabled = !!enabled;
        }
    }
    
    /**
     * Get detection type status
     * @returns {object} Detection types and their status
     */
    getDetectionStatus() {
        return { ...this.detectionTypes };
    }
}

// Register agent
const detectionAgent = new DetectionAgent();
if (window.AgentRegistry) {
    window.AgentRegistry.register(detectionAgent);
}

window.DetectionAgent = DetectionAgent;
console.log('✅ DetectionAgent (Factor 4) loaded');

})();
