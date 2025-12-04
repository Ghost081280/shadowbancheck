# ShadowBanCheck.io

### Intelligence-Grade Shadow Ban Detection Engine

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-Verification%20Ready-blue.svg)](#research--verification)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange.svg)](#roadmap)

**The most comprehensive, research-backed shadow ban detection engine on the internet.**

We don't guess. We correlate multiple independent intelligence sources to calculate the *probability* your content is being suppressed—the same methodology used by professional intelligence analysts.

⚠️ **Status:** In Active Development

🔧 **Development Site:** [ghost081280.github.io/shadowbancheck](https://ghost081280.github.io/shadowbancheck/index.html)

🧪 **Engine Tests:** [5-Factor Engine Test Page](https://ghost081280.github.io/shadowbancheck/js/detection/tests/test-integration.html)

🔗 **Will be live at:** [shadowbancheck.io](https://shadowbancheck.io) *(coming soon)*

---

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Our Approach](#our-approach)
- [Architecture](#architecture)
  - [3-Point Intelligence Model](#3-point-intelligence-model)
  - [5-Factor Detection Engine](#5-factor-detection-engine)
  - [21 Detection Modules](#21-detection-modules-6-signal-types)
- [Supported Platforms](#supported-platforms)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Access](#api-access-coming-soon)
- [Research & Verification](#research--verification)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Citation](#citation)

---

## Why This Exists

> *"There is NO official 'shadowban' field in any API. Everything is inference via controlled experiments + multiple vantage points + owned-tweet metrics for causal claims."*
> — Academic Research Analysis

Millions of creators, politicians, journalists, and businesses depend on social media visibility for their livelihoods. When reach suddenly drops 40-80% overnight with no explanation, they deserve answers—not guesses.

Existing tools provide simple yes/no answers based on single API calls. That's not detection—that's a coin flip with extra steps.

**ShadowBanCheck.io was built to solve this problem properly.**

We apply the same rigorous methodology used by intelligence agencies and academic researchers: multi-source correlation, controlled experiments, and transparent probability scoring.

---

## Our Approach

### The Problem with Binary Detection

Most shadow ban tools return "BANNED" or "NOT BANNED" based on a single check. This is fundamentally flawed because:

- Platform algorithms are complex and contextual
- Single API checks can return false positives/negatives
- Visibility restrictions exist on a spectrum, not binary states
- Conditions change rapidly—a check from 5 minutes ago may be stale

### Our Solution: Probability-Based Intelligence

We calculate the **probability** of content suppression by correlating three independent intelligence sources per signal. A 15% probability means most signals indicate normal visibility. A 75% probability means multiple corroborated signals indicate likely restrictions.

This approach produces results that are:
- **Defensible** — Every score can be traced to specific signals
- **Citable** — Permanent URLs for each analysis
- **Accurate** — Multi-source correlation eliminates false positives
- **Transparent** — Our methodology is open source for verification

---

## Architecture

### 3-Point Intelligence Model

Every signal we analyze is scored using three independent intelligence sources. This multi-source correlation is what separates our probability scores from simple database lookups.

```
┌─────────────────────────────────────────────────────────────────┐
│                   3-POINT INTELLIGENCE MODEL                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│   │  PREDICTIVE  │  │  REAL-TIME   │  │  HISTORICAL  │          │
│   │     15%      │  │     55%      │  │     30%      │          │
│   └──────────────┘  └──────────────┘  └──────────────┘          │
│          │                 │                 │                   │
│   Web searches for   Live platform     Database lookups         │
│   emerging reports   API checks        + past scores            │
│                                                                  │
│   • Reddit discussions  • Visibility tests   • Flagged content  │
│   • News articles       • Search indexing    • Trend analysis   │
│   • Platform changes    • Content filters    • Account history  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Why 3 sources?** Any single source can be wrong. Databases become outdated. API checks can reflect temporary states. Predictive signals can be noise. By correlating all three, we produce probability scores that are defensible and accurate.

---

### 5-Factor Detection Engine

Each analysis deploys 5 specialized agents that work in parallel. Think of them as a team of specialists, each with domain expertise.

```
┌─────────────────────────────────────────────────────────────────┐
│                5-FACTOR DETECTION ENGINE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔌 PLATFORM API AGENT (20%)                                     │
│     Direct integration with official platform APIs               │
│     → Account status, visibility flags, restriction metadata     │
│                                                                  │
│  🔍 WEB ANALYSIS AGENT (20%)                                     │
│     Automated browser testing from multiple vantage points       │
│     → Search visibility (logged-in/out/incognito)                │
│     → Predictive web searches for emerging ban reports           │
│                                                                  │
│  📊 HISTORICAL AGENT (15%)                                       │
│     Score history and trend analysis                             │
│     → Baseline comparisons, anomaly detection                    │
│     → Pro users: personal historical tracking                    │
│                                                                  │
│  🎯 DETECTION AGENT (25%)                                        │
│     Coordinates 21 modules across 9 signal types (6 live)         │
│     → Full 3-Point Intelligence scoring per signal               │
│                                                                  │
│  🧠 PREDICTIVE AI AGENT (20%)                                    │
│     Final synthesis and probability calculation                  │
│     → Weighted correlation, confidence rating                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 21 Detection Modules (9 Signal Types)

The Detection Agent coordinates specialized modules across 9 signal types (6 live, 3 coming soon):

| Signal Type | Modules | Status | What We Detect |
|-------------|---------|--------|----------------|
| **#️⃣ Hashtags** | 4 | ✅ Live | Banned, restricted, low-reach, and spam-associated hashtags |
| **💲 Cashtags** | 3 | ✅ Live | Financial tickers and crypto symbols that trigger spam filters |
| **🔗 Links** | 4 | ✅ Live | Domain reputation, URL shorteners, affiliate patterns, blocked domains |
| **📝 Content** | 4 | ✅ Live | Flagged words, spam patterns, sensitive content markers |
| **@ Mentions** | 3 | ✅ Live | Suspended accounts, shadowbanned users, problematic patterns |
| **😀 Emojis** | 3 | ✅ Live | Emojis associated with restricted content or spam campaigns |
| **🖼️ Images** | TBD | 🔜 Phase 2 | Visual content analysis, banned imagery, watermarks |
| **🎬 Videos** | TBD | 🔜 Phase 2 | Frame extraction, content scanning, copyrighted material |
| **🔊 Audio** | TBD | 🔜 Phase 3 | Speech-to-text scanning, audio fingerprinting |

<details>
<summary><strong>📋 View All 21 Module Details</strong></summary>

#### #️⃣ Hashtag Modules (4)
| Module | Description |
|--------|-------------|
| `hashtag-banned` | Checks against database of permanently banned hashtags per platform |
| `hashtag-restricted` | Detects limited-reach hashtags that reduce visibility |
| `hashtag-spam` | Identifies spam-associated tags (#followback, #f4f, etc.) |
| `hashtag-indexing` | Real-time verification if hashtag is being indexed in search |

#### 💲 Cashtag Modules (3)
| Module | Description |
|--------|-------------|
| `cashtag-pump-dump` | Detects patterns associated with pump & dump schemes |
| `cashtag-scam` | Checks against known scam/fraud ticker database |
| `cashtag-coordinated` | Identifies coordinated cashtag spam campaigns |

#### 🔗 Link Modules (4)
| Module | Description |
|--------|-------------|
| `link-throttled` | Detects domains throttled by platforms (The Markup research) |
| `link-blocked` | Checks against known blocked/banned domain database |
| `link-shortener` | Identifies URL shorteners that trigger spam filters |
| `link-suspicious` | Pattern detection for affiliate links, redirects, cloaked URLs |

#### 📝 Content Modules (4)
| Module | Description |
|--------|-------------|
| `content-banned` | Scans for permanently banned terms and phrases |
| `content-restricted` | Detects restricted content patterns that limit reach |
| `content-spam` | Identifies spam patterns (excessive caps, repetition, urgency) |
| `content-style` | Analyzes style issues (ALL CAPS, excessive punctuation/emojis) |

#### @ Mention Modules (3)
| Module | Description |
|--------|-------------|
| `mention-suspended` | Detects mentions of suspended/banned accounts |
| `mention-bot` | Identifies bot account mention patterns |
| `mention-spam` | Pattern matching for spam account mentions |

#### 😀 Emoji Modules (3)
| Module | Description |
|--------|-------------|
| `emoji-risky` | Database of emojis associated with restricted content |
| `emoji-combination` | Detects risky emoji combinations (🚀💰🔥 = crypto spam) |
| `emoji-excessive` | Flags excessive emoji usage that triggers spam filters |

</details>

**Platform-Specific Module Counts:**

| Platform | Total Modules | Notes |
|----------|---------------|-------|
| Twitter/X | 21 | All 6 live signal types |
| Reddit | 11 | No hashtags/cashtags |
| Instagram | 18 | No cashtags |
| TikTok | 18 | All 6 signal types |
| Facebook | 15 | No cashtags |
| YouTube | 8 | No hashtags/cashtags |
| LinkedIn | 15 | Limited hashtags (max 3 rule) |

---

## Supported Platforms

<details open>
<summary><strong>𝕏 Twitter/X Analysis</strong> — ✅ Operational (21 modules)</summary>

| Detection Capability | Description |
|---------------------|-------------|
| Search suggestion ban | Detect if account is hidden from search suggestions |
| Reply deboosting | Analyze if replies are being suppressed |
| Ghost ban verification | Check if tweets are invisible to others |
| Search ban identification | Verify if account appears in search results |
| Quality Filter Detection (QFD) | Check QFD status affecting visibility |
| Verification status | Analyze blue/business/government badge status |
| Account trust signals | Evaluate platform trust score indicators |
| Follower/following ratio | Flag suspicious ratios that trigger filters |
| Sensitive media flags | Detect content marked as sensitive |
| Profile accessibility | Verify profile is publicly accessible |

> 💡 Twitter/X uses multiple layers of visibility filtering. Our 21 modules test from multiple vantage points (logged-in, logged-out, incognito) for accurate detection.

</details>

<details>
<summary><strong>🤖 Reddit Analysis</strong> — ✅ Operational (11 modules)</summary>

| Detection Capability | Description |
|---------------------|-------------|
| Shadowban verification | Check if account is site-wide shadowbanned |
| Profile visibility | Analyze if profile is publicly accessible |
| Subreddit-specific bans | Detect bans from individual subreddits |
| Karma threshold restrictions | Identify low-karma posting limitations |
| Account age restrictions | Detect new account posting limitations |
| Spam filter triggers | Analyze content triggering spam filters |
| AutoModerator removal | Detect AutoMod-removed content |
| Comment visibility | Verify if comments are visible to others |
| Cross-posting restrictions | Check for cross-post limitations |

> 💡 Reddit does not use hashtags. Analysis focuses on account visibility, subreddit bans, and content patterns.

</details>

<details>
<summary><strong>📸 Instagram Analysis</strong> — 🔜 Coming Soon (18 modules)</summary>

| Detection Capability | Description |
|---------------------|-------------|
| Explore page eligibility | Analyze if content can appear on Explore |
| Hashtag search visibility | Check if posts appear under hashtags |
| Story visibility verification | Verify story reach and visibility |
| Reels recommendation status | Check Reels algorithm eligibility |
| Account reach restrictions | Detect shadow restrictions on reach |
| Profile discoverability | Analyze if profile appears in suggestions |

> 💡 Instagram maintains aggressive hashtag restrictions. Our database tracks 1,800+ flagged tags.

</details>

<details>
<summary><strong>🎵 TikTok Analysis</strong> — 🔜 Coming Soon (18 modules)</summary>

| Detection Capability | Description |
|---------------------|-------------|
| For You Page eligibility | Analyze if content can appear on FYP |
| Search visibility verification | Check if account appears in search |
| Comment visibility detection | Verify if comments are visible |
| Duet/Stitch restrictions | Check for collaboration limitations |
| Account trust score | Evaluate platform trust indicators |

> 💡 TikTok shadow bans are notoriously difficult to detect. Our agents use multiple verification methods.

</details>

<details>
<summary><strong>📘 Facebook Analysis</strong> — 🔜 Coming Soon (15 modules)</summary>

| Detection Capability | Description |
|---------------------|-------------|
| Reduced distribution status | Detect algorithmic reach reduction |
| Fact-check overlay detection | Identify fact-check labels on content |
| Group posting restrictions | Check for group posting limitations |
| Marketplace restrictions | Detect marketplace access limitations |
| Comment visibility | Verify comment visibility status |

> 💡 Facebook uses "reduced distribution" rather than explicit shadowbans.

</details>

<details>
<summary><strong>▶️ YouTube Analysis</strong> — 🔜 Coming Soon (8 modules)</summary>

| Detection Capability | Description |
|---------------------|-------------|
| Search visibility analysis | Check if videos appear in search |
| Recommendation status | Analyze algorithm recommendation eligibility |
| Demonetization indicators | Detect monetization restrictions |
| Age restriction flags | Identify age-gated content |
| Limited state detection | Check for "limited state" restrictions |

> 💡 YouTube uses "limited state" for shadow restrictions on videos.

</details>

<details>
<summary><strong>💼 LinkedIn Analysis</strong> — 🔜 Coming Soon (15 modules)</summary>

| Detection Capability | Description |
|---------------------|-------------|
| Feed visibility analysis | Check if posts appear in connections' feeds |
| Search presence verification | Verify profile appears in search results |
| Connection request restrictions | Detect connection request limitations |
| Content reach limitations | Analyze post reach restrictions |
| Profile view restrictions | Check for profile visibility issues |

> 💡 LinkedIn heavily restricts spam-like behavior and promotional content.

</details>

---

### Platform Module Summary

| Platform | Status | Modules | Signal Types |
|----------|--------|---------|--------------|
| **Twitter/X** | ✅ Live | 21 | All 6 live |
| **Reddit** | ✅ Live | 11 | 4 (no hashtags/cashtags) |
| **Instagram** | 🔜 Soon | 18 | 5 (no cashtags) |
| **TikTok** | 🔜 Soon | 18 | All 6 |
| **Facebook** | 🔜 Soon | 15 | 5 (no cashtags) |
| **YouTube** | 🔜 Soon | 8 | 4 (no hashtags/cashtags) |
| **LinkedIn** | 🔜 Soon | 15 | 5 (limited hashtags) |

---

## Getting Started

### Prerequisites

- Node.js 18+ (for local development)
- Modern browser (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/[your-username]/shadowbancheck.git

# Navigate to the project
cd shadowbancheck

# Install dependencies (if applicable)
npm install

# Start local development server
npm run dev
```

### Running Tests

```bash
# Navigate to detection engine tests
cd js/detection/tests

# Run Node.js test suite
node test-all-agents.js

# Or open browser test
open test-integration.html
```

---

## Project Structure

```
shadowbancheck/
│
├── index.html                      # Main landing page
├── checker.html                    # Account checker
├── hashtag-checker.html            # Hashtag checker
├── results.html                    # Results display
├── login.html                      # User authentication
├── pro.html                        # Pro dashboard
├── agency.html                     # Agency dashboard
├── research.html                   # Research dashboard
├── admin.html                      # Admin dashboard
├── README.md
├── LICENSE.txt
│
├── css/
│   ├── main.css                    # Shared styles
│   ├── index.css                   # Homepage styles
│   ├── checker.css                 # Checker page styles
│   ├── hashtag-checker.css         # Hashtag checker styles
│   ├── results.css                 # Results page styles
│   ├── login.css                   # Login page styles
│   ├── dashboard-shared.css        # Shared dashboard styles
│   └── shadow-ai.css               # Shadow AI chatbot styles
│
├── js/
│   ├── detection/                  # 🔥 THE DETECTION ENGINE
│   │   │
│   │   ├── 5-factor-engine.js      # Main orchestrator
│   │   │
│   │   ├── agents/                 # 5 Detection Agents
│   │   │   ├── agent-base.js            # Agent registry & orchestration
│   │   │   ├── agent-platform-api.js    # Factor 1: Platform API (20%)
│   │   │   ├── agent-web-analysis.js    # Factor 2: Web Analysis (20%)
│   │   │   ├── agent-historical.js      # Factor 3: Historical (15%)
│   │   │   ├── agent-detection.js       # Factor 4: Detection (25%)
│   │   │   └── agent-predictive.js      # Factor 5: Predictive AI (20%)
│   │   │
│   │   ├── databases/              # Signal Databases (9 types)
│   │   │   ├── flagged-hashtags.js      # Banned/restricted hashtags + cashtags (combined for now)
│   │   │   ├── flagged-links.js         # Throttled domains, shorteners
│   │   │   ├── flagged-content.js       # Banned terms, spam patterns
│   │   │   ├── flagged-mentions.js      # Bot patterns, spam accounts
│   │   │   ├── flagged-emojis.js        # Risky emoji combinations
│   │   │   ├── flagged-images.js        # 🔜 Image analysis rules
│   │   │   ├── flagged-videos.js        # 🔜 Video analysis rules
│   │   │   └── flagged-audio.js         # 🔜 Audio analysis rules
│   │   │
│   │   ├── platforms/              # Platform Handlers
│   │   │   ├── platform-base.js         # Base platform class
│   │   │   ├── twitter.js               # Twitter/X integration
│   │   │   └── reddit.js                # Reddit integration
│   │   │
│   │   └── tests/                  # Test Suite
│   │       ├── test-integration.html    # Browser test page
│   │       ├── test-all-agents.js       # Node.js test suite
│   │       └── demo-data.js             # Demo scenarios
│   │
│   ├── main.js                     # Core functionality
│   ├── index.js                    # Homepage logic
│   ├── checker.js                  # Account checker logic
│   ├── hashtag-checker.js          # Hashtag checker logic
│   ├── results.js                  # Results display logic
│   ├── login.js                    # Authentication logic
│   ├── platforms.js                # Platform definitions
│   ├── shared-components.js        # Shared UI components
│   ├── shadow-ai.js                # Shadow AI chatbot
│   ├── detection-api.js            # Detection API client
│   ├── hashtag-api.js              # Hashtag API client
│   ├── pro-dashboard.js            # Pro dashboard logic
│   ├── agency-dashboard.js         # Agency dashboard logic
│   ├── research-dashboard.js       # Research dashboard logic
│   ├── admin-dashboard.js          # Admin dashboard logic
│   ├── resolution-center.js        # Issue resolution logic
│   └── stripe-billing.js           # Stripe payment integration
│
├── server/                         # Backend (Railway deployment)
│   ├── detection-engine.js         # Server-side detection
│   ├── package.json
│   └── railway.json                # Railway config
│
├── shared/                         # Reusable HTML components
│   ├── header.html
│   ├── footer.html
│   ├── mobile-nav.html
│   ├── back-to-top.html
│   ├── cookie-popup.html
│   └── toast.html
│
└── legal/                          # Legal pages
    ├── terms.html
    ├── privacy-policy.html
    └── cookie-policy.html
```

---

## API Access (Coming Soon)

We're building a public API for developers and researchers who want programmatic access to our detection engine.

### Planned Endpoints

```javascript
// Full analysis
POST /api/v1/scan
{
  "platform": "twitter",
  "username": "example_user",
  "postId": "1234567890"  // optional
}

// Quick probability check
GET /api/v1/quick-check?platform=twitter&username=example_user

// Signal database access
GET /api/v1/signals?platform=twitter&signal_type=hashtags

// Historical data (Pro/API tier)
GET /api/v1/history?platform=twitter&username=example_user&days=30
```

### API Tiers

| Tier | Access | Pricing |
|------|--------|---------|
| **Free** | Limited queries/day | $0 |
| **Research** | Academic access | Discounted |
| **Developer** | 1,000 queries/month | TBD |
| **Enterprise** | Unlimited | Custom |

**Join the waitlist:** [shadowbancheck.io/#pricing](https://shadowbancheck.io/#pricing)

---

## Research & Verification

### Open Source for Credibility

This project is open source specifically so researchers, journalists, and academics can verify our methodology. We believe transparency is essential for credibility in this space.

**What you can verify:**

- ✅ 3-Point Intelligence weighting (15% / 55% / 30%)
- ✅ 5-Factor agent architecture and weights
- ✅ Signal databases and detection logic
- ✅ Probability calculation algorithms
- ✅ Platform-specific module implementations

### Academic Use

If you're conducting research on content moderation, algorithmic suppression, or platform transparency, we welcome collaboration.

**Resources for researchers:**

- Full detection methodology in `/js/detection/`
- Signal databases with sources in `/js/detection/databases/`
- Test scenarios in `/js/detection/tests/demo-data.js`
- Architecture documentation (this README)

**Contact:** [hello@shadowbancheck.io](mailto:hello@shadowbancheck.io) with subject "Research Inquiry"

---

## Contributing

We welcome contributions from developers, researchers, and domain experts.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature`
3. **Make your changes**
4. **Run tests:** `node js/detection/tests/test-all-agents.js`
5. **Submit a pull request**

### Areas Where We Need Help

| Area | Description | Skills Needed |
|------|-------------|---------------|
| **Platform Handlers** | Add support for Instagram, TikTok, YouTube | API integration, reverse engineering |
| **Signal Databases** | Expand banned hashtag lists, throttled domains | Research, data collection |
| **Regional Testing** | Implement multi-region visibility tests | Infrastructure, DevOps |
| **Accuracy Validation** | Test probability scores against known cases | QA, research methodology |
| **Documentation** | Improve docs, add examples | Technical writing |

### Code Standards

- Clean, readable code with comments
- Proper separation of concerns
- Mobile-first responsive design
- No external dependencies without discussion

---

## Roadmap

### Phase 1: Foundation ✅
- [x] 5-Factor Detection Engine architecture
- [x] 3-Point Intelligence Model
- [x] Twitter/X platform handler
- [x] Reddit platform handler
- [x] 8 signal databases (6 live + 3 placeholder for Images, Videos, Audio)
- [x] Browser and Node.js test suites

### Phase 2: Expansion 🔄
- [ ] Instagram platform handler
- [ ] TikTok platform handler
- [ ] Facebook platform handler
- [ ] YouTube platform handler
- [ ] LinkedIn platform handler
- [ ] Real API integration (currently demo mode)
- [ ] Historical tracking database
- [ ] Separate flagged-cashtags.js from hashtags
- [ ] 🖼️ Image signal analysis
- [ ] 🎬 Video signal analysis

### Phase 3: Intelligence
- [ ] 🔊 Audio signal analysis (speech-to-text)
- [ ] Public API launch
- [ ] Regional server expansion

### Phase 4: Scale
- [ ] Enterprise features
- [ ] Real-time monitoring
- [ ] Webhook notifications
- [ ] Third-party integrations

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

**You are free to:**
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Use privately

**Under these conditions:**
- 📝 Include the original license and copyright notice
- 📝 **Cite ShadowBanCheck.io as the source** (see below)

---

## Citation

If you use this project in your research, tools, or applications, please cite:

### Academic Citation

```bibtex
@software{shadowbancheck2025,
  author = {ShadowBanCheck.io},
  title = {ShadowBanCheck: Intelligence-Grade Shadow Ban Detection Engine},
  year = {2025},
  url = {https://github.com/[your-username]/shadowbancheck},
  note = {5-Factor Detection Engine with 3-Point Intelligence Model}
}
```

### General Attribution

```
Shadow ban detection powered by ShadowBanCheck.io
https://shadowbancheck.io
```

### In Documentation

> This project uses the 5-Factor Detection Engine from [ShadowBanCheck.io](https://shadowbancheck.io), an open-source shadow ban detection system using 3-Point Intelligence correlation.

---

## Acknowledgments

- **The Markup** — Investigative journalism on link throttling research
- **Academic researchers** — Methodology inspiration for multi-source correlation
- **Open source community** — Contributions and feedback

---

## Contact

- 🌐 **Website:** [shadowbancheck.io](https://shadowbancheck.io)
- 📧 **Email:** [hello@shadowbancheck.io](mailto:hello@shadowbancheck.io)
- 🐦 **Twitter/X:** [@Ghost081280](https://x.com/Ghost081280)
- 💼 **LinkedIn:** [Andrew Couch](https://linkedin.com/in/andrewcouch)
- 🐙 **GitHub:** [Ghost081280](https://github.com/Ghost081280)

---

<p align="center">
  <strong>Built with 🔍 by creators who got shadowbanned one too many times.</strong>
</p>

<p align="center">
  <a href="https://shadowbancheck.io">shadowbancheck.io</a> — Know your probability.
</p>
