/* =============================================================================
   FLAGGED-HASHTAGS.JS - Hashtag & Cashtag Database
   ShadowBanCheck.io
   
   Database of flagged hashtags (#tags) AND cashtags ($tags) that platforms
   commonly filter, suppress, or ban.
   
   Structure: { tag, type, status, platforms, category, notes }
   
   Status Levels:
   - banned: Tag is completely blocked/hidden
   - restricted: Tag has reduced reach or visibility
   - monitored: Tag is being watched, may affect algorithm
   - safe: No known issues
   
   Types:
   - hashtag: #tag format
   - cashtag: $tag format (stocks, crypto tickers)
   
   Last Updated: 2025-01
   ============================================================================= */

(function() {
'use strict';

// ============================================================================
// MAIN DATABASE
// ============================================================================
window.FlaggedHashtags = {
    
    // Version for cache busting and tracking
    version: '2.0.0',
    lastUpdated: '2025-01-01',
    
    // =========================================================================
    // COMBINED HASHTAG + CASHTAG DATABASE
    // =========================================================================
    tags: [
        // =====================================================================
        // ENGAGEMENT MANIPULATION - Hashtags
        // =====================================================================
        { tag: '#followback', type: 'hashtag', status: 'banned', platforms: ['twitter', 'instagram'], category: 'engagement', notes: 'Mutual follow schemes' },
        { tag: '#teamfollowback', type: 'hashtag', status: 'banned', platforms: ['twitter', 'instagram'], category: 'engagement', notes: null },
        { tag: '#tfb', type: 'hashtag', status: 'banned', platforms: ['twitter', 'instagram'], category: 'engagement', notes: null },
        { tag: '#followtrain', type: 'hashtag', status: 'banned', platforms: ['twitter', 'instagram'], category: 'engagement', notes: null },
        { tag: '#gainfollowers', type: 'hashtag', status: 'banned', platforms: ['twitter', 'instagram'], category: 'engagement', notes: null },
        { tag: '#followforfollow', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'engagement', notes: null },
        { tag: '#f4f', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'engagement', notes: null },
        { tag: '#follow4follow', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'engagement', notes: null },
        { tag: '#followme', type: 'hashtag', status: 'restricted', platforms: ['twitter', 'instagram'], category: 'engagement', notes: null },
        { tag: '#followalways', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'engagement', notes: null },
        { tag: '#instantfollow', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'engagement', notes: null },
        { tag: '#autofollow', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'engagement', notes: null },
        { tag: '#openfollow', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'engagement', notes: null },
        { tag: '#mustfollow', type: 'hashtag', status: 'banned', platforms: ['twitter', 'instagram'], category: 'engagement', notes: null },
        { tag: '#followgain', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'engagement', notes: null },
        { tag: '#followloop', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'engagement', notes: null },
        { tag: '#followparty', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'engagement', notes: null },
        { tag: '#like4like', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'engagement', notes: null },
        { tag: '#l4l', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'engagement', notes: null },
        { tag: '#likeforlike', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'engagement', notes: null },
        { tag: '#likeforfollow', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'engagement', notes: null },
        { tag: '#followforlike', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'engagement', notes: null },
        { tag: '#rt4rt', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'engagement', notes: null },
        { tag: '#retweet4retweet', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'engagement', notes: null },
        { tag: '#spam4spam', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'engagement', notes: null },
        { tag: '#s4s', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'engagement', notes: 'Shoutout for shoutout' },
        { tag: '#shoutout4shoutout', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'engagement', notes: null },
        { tag: '#tagsforlikes', type: 'hashtag', status: 'restricted', platforms: ['instagram'], category: 'engagement', notes: null },
        { tag: '#tag4like', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'engagement', notes: null },
        
        // =====================================================================
        // GROWTH SCHEMES - Hashtags
        // =====================================================================
        { tag: '#gainwithxyla', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'growth_scheme', notes: 'Known growth scheme' },
        { tag: '#gainwithspxces', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'growth_scheme', notes: null },
        { tag: '#gainwiththepit', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'growth_scheme', notes: null },
        { tag: '#gainwithcali', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'growth_scheme', notes: null },
        { tag: '#chloegrewup', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'growth_scheme', notes: null },
        { tag: '#kyliegrewup', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'growth_scheme', notes: null },
        
        // =====================================================================
        // ADULT/NSFW - Hashtags
        // =====================================================================
        { tag: '#nsfw', type: 'hashtag', status: 'restricted', platforms: ['twitter'], category: 'adult', notes: 'Hidden from search when logged out' },
        { tag: '#nsfwtwt', type: 'hashtag', status: 'restricted', platforms: ['twitter'], category: 'adult', notes: null },
        { tag: '#adult', type: 'hashtag', status: 'restricted', platforms: ['all'], category: 'adult', notes: null },
        { tag: '#xxx', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'adult', notes: null },
        { tag: '#porn', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'adult', notes: null },
        { tag: '#sex', type: 'hashtag', status: 'restricted', platforms: ['all'], category: 'adult', notes: null },
        { tag: '#onlyfans', type: 'hashtag', status: 'restricted', platforms: ['instagram', 'tiktok'], category: 'adult', notes: null },
        { tag: '#spicycontent', type: 'hashtag', status: 'restricted', platforms: ['tiktok'], category: 'adult', notes: null },
        { tag: '#linkinbio', type: 'hashtag', status: 'restricted', platforms: ['instagram', 'tiktok'], category: 'adult', notes: 'Often associated with adult content' },
        
        // =====================================================================
        // POLITICAL - Hashtags
        // =====================================================================
        { tag: '#maga', type: 'hashtag', status: 'monitored', platforms: ['twitter'], category: 'political', notes: 'May be deprioritized' },
        { tag: '#qanon', type: 'hashtag', status: 'banned', platforms: ['facebook', 'instagram'], category: 'political', notes: 'Banned on Meta platforms' },
        { tag: '#stopthesteal', type: 'hashtag', status: 'restricted', platforms: ['all'], category: 'political', notes: null },
        { tag: '#wwg1wga', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'political', notes: 'QAnon slogan' },
        { tag: '#electionfraud', type: 'hashtag', status: 'restricted', platforms: ['all'], category: 'political', notes: null },
        
        // =====================================================================
        // INSTAGRAM BANNED HASHTAGS (Extensive List)
        // =====================================================================
        { tag: '#adulting', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: 'Currently banned' },
        { tag: '#alone', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#always', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#americangirl', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#attractive', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#beautyblogger', type: 'hashtag', status: 'restricted', platforms: ['instagram'], category: 'instagram_banned', notes: 'Periodically restricted' },
        { tag: '#besties', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#bikinibody', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#boho', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#costumes', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#curvygirls', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#date', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#dating', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#desk', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: 'Spam-associated' },
        { tag: '#direct', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#dm', type: 'hashtag', status: 'restricted', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#dogsofinstagram', type: 'hashtag', status: 'restricted', platforms: ['instagram'], category: 'instagram_banned', notes: 'Periodically restricted due to spam' },
        { tag: '#drunk', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#eggplant', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: 'Sexual connotation' },
        { tag: '#elevator', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#fitnessgirls', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#girlsonly', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#goddess', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#hardworkpaysoff', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#hotweather', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#hustler', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#ice', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: 'Drug reference' },
        { tag: '#instababe', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#instamood', type: 'hashtag', status: 'restricted', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#italiano', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#kansas', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: 'Spam-associated' },
        { tag: '#killingit', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#kissing', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#lean', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: 'Drug reference' },
        { tag: '#like', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#loseweight', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#master', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#milf', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#mirrorselfie', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#models', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#nasty', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#newyears', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#newyearsday', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#overnight', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#parties', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#petite', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#pornfood', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#prettygirl', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#puberty', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#pushups', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#single', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#singlelife', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#skateboarding', type: 'hashtag', status: 'restricted', platforms: ['instagram'], category: 'instagram_banned', notes: 'Periodically restricted' },
        { tag: '#skype', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#snap', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#snapchat', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#snowstorm', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#sopretty', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#stranger', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#stud', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#submission', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#sugar', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#sugardaddy', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#sultry', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#sunbathing', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#swole', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#tanlines', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#teen', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#teens', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#thought', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#todayimwearing', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#twerk', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#underage', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'instagram_banned', notes: 'Severe - child safety' },
        { tag: '#valentinesday', type: 'hashtag', status: 'restricted', platforms: ['instagram'], category: 'instagram_banned', notes: 'Periodically restricted' },
        { tag: '#workflow', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        { tag: '#wtf', type: 'hashtag', status: 'banned', platforms: ['instagram'], category: 'instagram_banned', notes: null },
        
        // =====================================================================
        // TIKTOK - Hashtags
        // =====================================================================
        { tag: '#suicide', type: 'hashtag', status: 'banned', platforms: ['tiktok', 'instagram'], category: 'sensitive', notes: 'Self-harm prevention' },
        { tag: '#selfharm', type: 'hashtag', status: 'banned', platforms: ['tiktok', 'instagram'], category: 'sensitive', notes: null },
        { tag: '#sh', type: 'hashtag', status: 'banned', platforms: ['tiktok'], category: 'sensitive', notes: 'Self-harm abbreviation' },
        { tag: '#cutting', type: 'hashtag', status: 'banned', platforms: ['tiktok'], category: 'sensitive', notes: null },
        { tag: '#proana', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'eating_disorder', notes: 'Pro-anorexia' },
        { tag: '#promia', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'eating_disorder', notes: 'Pro-bulimia' },
        { tag: '#thinspo', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'eating_disorder', notes: null },
        { tag: '#bonespo', type: 'hashtag', status: 'banned', platforms: ['all'], category: 'eating_disorder', notes: null },
        { tag: '#edtwt', type: 'hashtag', status: 'banned', platforms: ['twitter'], category: 'eating_disorder', notes: 'Eating disorder Twitter' },
        { tag: '#fyp', type: 'hashtag', status: 'restricted', platforms: ['tiktok'], category: 'tiktok_spam', notes: 'Overused, may reduce reach' },
        { tag: '#foryou', type: 'hashtag', status: 'restricted', platforms: ['tiktok'], category: 'tiktok_spam', notes: null },
        { tag: '#foryoupage', type: 'hashtag', status: 'restricted', platforms: ['tiktok'], category: 'tiktok_spam', notes: null },
        { tag: '#viral', type: 'hashtag', status: 'restricted', platforms: ['tiktok'], category: 'tiktok_spam', notes: 'Triggers review' },
        { tag: '#blowthisup', type: 'hashtag', status: 'restricted', platforms: ['tiktok'], category: 'tiktok_spam', notes: null },
        { tag: '#goviral', type: 'hashtag', status: 'restricted', platforms: ['tiktok'], category: 'tiktok_spam', notes: null },
        { tag: '#trending', type: 'hashtag', status: 'restricted', platforms: ['tiktok'], category: 'tiktok_spam', notes: null },
        { tag: '#xyzbca', type: 'hashtag', status: 'restricted', platforms: ['tiktok'], category: 'tiktok_spam', notes: null },
        { tag: '#xyz', type: 'hashtag', status: 'restricted', platforms: ['tiktok'], category: 'tiktok_spam', notes: null },
        
        // =====================================================================
        // OVERUSED/SPAM - Hashtags
        // =====================================================================
        { tag: '#repost', type: 'hashtag', status: 'restricted', platforms: ['instagram'], category: 'overused', notes: null },
        { tag: '#instalike', type: 'hashtag', status: 'restricted', platforms: ['instagram'], category: 'overused', notes: null },
        { tag: '#instadaily', type: 'hashtag', status: 'restricted', platforms: ['instagram'], category: 'overused', notes: null },
        { tag: '#photooftheday', type: 'hashtag', status: 'monitored', platforms: ['instagram'], category: 'overused', notes: null },
        { tag: '#instagood', type: 'hashtag', status: 'monitored', platforms: ['instagram'], category: 'overused', notes: null },
        { tag: '#picoftheday', type: 'hashtag', status: 'monitored', platforms: ['instagram'], category: 'overused', notes: null },
        { tag: '#instapic', type: 'hashtag', status: 'restricted', platforms: ['instagram'], category: 'overused', notes: null },
        
        // =====================================================================
        // CASHTAGS - Crypto (Legitimate)
        // =====================================================================
        { tag: '$BTC', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'crypto', notes: 'Bitcoin - legitimate' },
        { tag: '$ETH', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'crypto', notes: 'Ethereum - legitimate' },
        { tag: '$SOL', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'crypto', notes: 'Solana - legitimate' },
        { tag: '$DOGE', type: 'cashtag', status: 'monitored', platforms: ['twitter'], category: 'crypto', notes: 'May trigger meme coin scrutiny' },
        { tag: '$SHIB', type: 'cashtag', status: 'monitored', platforms: ['twitter'], category: 'crypto', notes: 'May trigger meme coin scrutiny' },
        { tag: '$PEPE', type: 'cashtag', status: 'monitored', platforms: ['twitter'], category: 'crypto', notes: 'May trigger meme coin scrutiny' },
        { tag: '$XRP', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'crypto', notes: null },
        { tag: '$ADA', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'crypto', notes: null },
        { tag: '$LINK', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'crypto', notes: null },
        { tag: '$AVAX', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'crypto', notes: null },
        
        // =====================================================================
        // CASHTAGS - Stocks (Legitimate)
        // =====================================================================
        { tag: '$TSLA', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'stocks', notes: 'Tesla - legitimate' },
        { tag: '$AAPL', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'stocks', notes: 'Apple - legitimate' },
        { tag: '$GOOGL', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'stocks', notes: 'Google - legitimate' },
        { tag: '$MSFT', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'stocks', notes: 'Microsoft - legitimate' },
        { tag: '$AMZN', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'stocks', notes: 'Amazon - legitimate' },
        { tag: '$NVDA', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'stocks', notes: 'Nvidia - legitimate' },
        { tag: '$META', type: 'cashtag', status: 'safe', platforms: ['twitter'], category: 'stocks', notes: 'Meta - legitimate' },
        { tag: '$GME', type: 'cashtag', status: 'monitored', platforms: ['twitter'], category: 'stocks', notes: 'Meme stock - may trigger scrutiny' },
        { tag: '$AMC', type: 'cashtag', status: 'monitored', platforms: ['twitter'], category: 'stocks', notes: 'Meme stock - may trigger scrutiny' },
        
        // =====================================================================
        // CASHTAGS - Scam Indicators
        // =====================================================================
        { tag: '$SCAM', type: 'cashtag', status: 'banned', platforms: ['twitter'], category: 'scam', notes: 'Often used ironically but flagged' },
        { tag: '$FREE', type: 'cashtag', status: 'restricted', platforms: ['twitter'], category: 'scam', notes: 'Scam indicator' },
        { tag: '$AIRDROP', type: 'cashtag', status: 'restricted', platforms: ['twitter'], category: 'scam', notes: 'Often used in scams' },
        { tag: '$GIVEAWAY', type: 'cashtag', status: 'restricted', platforms: ['twitter'], category: 'scam', notes: 'Scam indicator' },
        { tag: '$100X', type: 'cashtag', status: 'banned', platforms: ['twitter'], category: 'scam', notes: 'Unrealistic gain claims' },
        { tag: '$1000X', type: 'cashtag', status: 'banned', platforms: ['twitter'], category: 'scam', notes: 'Unrealistic gain claims' },
        { tag: '$MOON', type: 'cashtag', status: 'restricted', platforms: ['twitter'], category: 'scam', notes: 'Hype language' },
        { tag: '$PUMP', type: 'cashtag', status: 'banned', platforms: ['twitter'], category: 'scam', notes: 'Pump and dump indicator' },
    ],
    
    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================
    
    /**
     * Check a single tag (hashtag or cashtag)
     * @param {string} tag - Tag to check (with # or $)
     * @param {string} platform - Platform ID
     * @returns {object} Tag status
     */
    checkTag: function(tag, platform = 'twitter') {
        if (!tag) return { status: 'safe', found: false };
        
        // Normalize tag
        const normalizedTag = tag.trim().toLowerCase();
        const isHashtag = normalizedTag.startsWith('#');
        const isCashtag = normalizedTag.startsWith('$');
        
        if (!isHashtag && !isCashtag) {
            // Try adding # prefix
            return this.checkTag('#' + tag, platform);
        }
        
        // Search database
        for (const entry of this.tags) {
            if (entry.tag.toLowerCase() === normalizedTag) {
                const appliesToPlatform = entry.platforms.includes('all') || 
                                          entry.platforms.includes(platform);
                if (appliesToPlatform) {
                    return {
                        ...entry,
                        found: true
                    };
                }
            }
        }
        
        return { 
            tag: normalizedTag,
            type: isHashtag ? 'hashtag' : 'cashtag',
            status: 'safe', 
            found: false,
            platforms: [],
            category: 'unknown',
            notes: 'Not in flagged database'
        };
    },
    
    /**
     * Check multiple tags at once
     * @param {array} tags - Array of tags
     * @param {string} platform - Platform ID
     * @returns {object} Bulk check results
     */
    checkBulk: function(tags, platform = 'twitter') {
        const results = {
            total: tags.length,
            banned: [],
            restricted: [],
            monitored: [],
            safe: [],
            summary: {}
        };
        
        for (const tag of tags) {
            const check = this.checkTag(tag, platform);
            
            switch (check.status) {
                case 'banned':
                    results.banned.push(check);
                    break;
                case 'restricted':
                    results.restricted.push(check);
                    break;
                case 'monitored':
                    results.monitored.push(check);
                    break;
                default:
                    results.safe.push(check);
            }
        }
        
        results.summary = {
            bannedCount: results.banned.length,
            restrictedCount: results.restricted.length,
            monitoredCount: results.monitored.length,
            safeCount: results.safe.length,
            riskScore: this._calculateRiskScore(results)
        };
        
        return results;
    },
    
    /**
     * Extract and check all tags from text
     * @param {string} text - Text to scan
     * @param {string} platform - Platform ID
     * @returns {object} Extraction and check results
     */
    extractAndCheck: function(text, platform = 'twitter') {
        if (!text) return { hashtags: [], cashtags: [], allTags: [], results: null };
        
        // Extract hashtags and cashtags
        const hashtags = text.match(/#\w+/g) || [];
        const cashtags = text.match(/\$[A-Za-z]+/g) || [];
        const allTags = [...hashtags, ...cashtags];
        
        // Check all tags
        const results = this.checkBulk(allTags, platform);
        
        return {
            hashtags,
            cashtags,
            allTags,
            results
        };
    },
    
    /**
     * Get all tags for a specific status
     * @param {string} status - Status (banned, restricted, monitored, safe)
     * @param {string} platform - Platform ID (optional)
     * @returns {array} Matching tags
     */
    getByStatus: function(status, platform = null) {
        return this.tags.filter(entry => {
            const matchesStatus = entry.status === status;
            const matchesPlatform = !platform || 
                                    entry.platforms.includes('all') || 
                                    entry.platforms.includes(platform);
            return matchesStatus && matchesPlatform;
        });
    },
    
    /**
     * Get all tags for a specific category
     * @param {string} category - Category name
     * @param {string} platform - Platform ID (optional)
     * @returns {array} Matching tags
     */
    getByCategory: function(category, platform = null) {
        return this.tags.filter(entry => {
            const matchesCategory = entry.category === category;
            const matchesPlatform = !platform || 
                                    entry.platforms.includes('all') || 
                                    entry.platforms.includes(platform);
            return matchesCategory && matchesPlatform;
        });
    },
    
    /**
     * Get database statistics
     * @returns {object} Stats
     */
    getStats: function() {
        const stats = {
            total: this.tags.length,
            hashtags: this.tags.filter(t => t.type === 'hashtag').length,
            cashtags: this.tags.filter(t => t.type === 'cashtag').length,
            byStatus: {},
            byCategory: {},
            byPlatform: {},
            version: this.version,
            lastUpdated: this.lastUpdated
        };
        
        // Count by status
        for (const entry of this.tags) {
            stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
            stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
            
            for (const platform of entry.platforms) {
                stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
            }
        }
        
        return stats;
    },
    
    /**
     * Search tags by partial match
     * @param {string} query - Search query
     * @param {string} platform - Platform ID (optional)
     * @returns {array} Matching tags
     */
    search: function(query, platform = null) {
        const lowerQuery = query.toLowerCase().replace(/[#$]/g, '');
        
        return this.tags.filter(entry => {
            const tagMatch = entry.tag.toLowerCase().includes(lowerQuery);
            const matchesPlatform = !platform || 
                                    entry.platforms.includes('all') || 
                                    entry.platforms.includes(platform);
            return tagMatch && matchesPlatform;
        });
    },
    
    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================
    
    _calculateRiskScore: function(results) {
        // Higher score = more risk
        const bannedWeight = 30;
        const restrictedWeight = 15;
        const monitoredWeight = 5;
        
        let score = 0;
        score += results.banned.length * bannedWeight;
        score += results.restricted.length * restrictedWeight;
        score += results.monitored.length * monitoredWeight;
        
        // Normalize to 0-100
        return Math.min(100, score);
    }
};

// ============================================================================
// BACKWARDS COMPATIBILITY
// ============================================================================
window.flaggedHashtags = window.FlaggedHashtags;
window.bannedHashtags = window.FlaggedHashtags; // Old name

// Legacy function mapping
window.checkHashtagLocal = function(hashtag, platform) {
    const result = window.FlaggedHashtags.checkTag(hashtag, platform);
    return result.status;
};

window.getBannedHashtags = function(platform) {
    return window.FlaggedHashtags.getByStatus('banned', platform).map(t => t.tag);
};

window.getLocalHashtagStats = function() {
    return window.FlaggedHashtags.getStats();
};

// ============================================================================
// INITIALIZATION
// ============================================================================
console.log('✅ FlaggedHashtags database loaded');
console.log('   📊 Stats:', window.FlaggedHashtags.getStats());

})();
