// Cloudflare Worker for Body Perception Assessment API

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '86400',
                }
            });
        }
        
        // Route requests
        if (url.pathname === '/api/submit' && request.method === 'POST') {
            return handleSubmit(request, env);
        }
        
        if (url.pathname === '/api/stats' && request.method === 'GET') {
            return handleStats(request, env);
        }
        
        // Return 404 for unknown routes
        return new Response('Not Found', { status: 404 });
    }
};

async function handleSubmit(request, env) {
    try {
        const data = await request.json();
        
        // Validate the submitted data
        if (!data.responses || !Array.isArray(data.responses) || data.responses.length !== 12) {
            return createErrorResponse('Invalid response data', 400);
        }
        
        // Generate a unique session ID
        const sessionId = generateSessionId();
        const timestamp = new Date().toISOString();
        
        // Calculate user's fat perception score
        const userScore = calculateUserScore(data.responses);
        
        // Store the submission in KV storage
        const submissionData = {
            sessionId,
            timestamp,
            responses: data.responses,
            imageOrder: data.imageOrder,
            totalTime: data.totalTime,
            score: userScore,
            ip: request.headers.get('CF-Connecting-IP') || 'unknown',
            userAgent: request.headers.get('User-Agent') || 'unknown'
        };
        
        // Store in KV with TTL of 1 year
        await env.ASSESSMENT_DATA.put(
            `submission:${sessionId}`,
            JSON.stringify(submissionData),
            { expirationTtl: 31536000 } // 1 year
        );
        
        // Calculate percentile ranking
        const percentile = await calculatePercentile(userScore, env);
        const category = getCategoryFromScore(userScore, percentile);
        
        // Update global statistics
        await updateGlobalStats(userScore, env);
        
        return createJsonResponse({
            success: true,
            sessionId,
            score: userScore,
            percentile: Math.round(percentile),
            category,
            timestamp
        });
        
    } catch (error) {
        console.error('Error handling submission:', error);
        return createErrorResponse('Internal server error', 500);
    }
}

async function handleStats(request, env) {
    try {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get('session');
        
        if (sessionId) {
            // Get specific session stats
            const sessionData = await env.ASSESSMENT_DATA.get(`submission:${sessionId}`);
            if (!sessionData) {
                return createErrorResponse('Session not found', 404);
            }
            
            const data = JSON.parse(sessionData);
            return createJsonResponse({
                sessionId: data.sessionId,
                score: data.score,
                percentile: await calculatePercentile(data.score, env),
                timestamp: data.timestamp
            });
        } else {
            // Get global statistics
            const globalStats = await getGlobalStats(env);
            return createJsonResponse(globalStats);
        }
        
    } catch (error) {
        console.error('Error handling stats request:', error);
        return createErrorResponse('Internal server error', 500);
    }
}

// Calculate user's score based on their responses
function calculateUserScore(responses) {
    // Score is based on how many images the user marked as "fat"
    // Higher score = more likely to perceive as fat
    const fatCount = responses.filter(r => r.isFat).length;
    
    // Also consider which specific images were marked as fat
    // Images 1-6 are generally considered "not fat" by most people
    // Images 7-12 are generally considered "fat" by most people
    let weightedScore = 0;
    
    responses.forEach(response => {
        if (response.isFat) {
            // If marking lower numbers (1-6) as fat, add more weight
            if (response.imageNumber <= 6) {
                weightedScore += 2;
            } else {
                weightedScore += 1;
            }
        }
    });
    
    // Normalize score to 0-100 range
    // Maximum possible weighted score: (6 * 2) + (6 * 1) = 18
    return Math.min(100, Math.round((weightedScore / 18) * 100));
}

// Calculate user's percentile ranking compared to all users
async function calculatePercentile(userScore, env) {
    try {
        const globalStats = await getGlobalStats(env);
        
        if (globalStats.totalSubmissions < 10) {
            // Not enough data for meaningful percentile, use default
            return Math.max(1, Math.min(99, userScore));
        }
        
        // Estimate percentile based on score distribution
        // This is a simplified calculation - in production you'd want more sophisticated stats
        const avgScore = globalStats.averageScore || 50;
        const stdDev = globalStats.scoreStdDev || 20;
        
        // Simple percentile approximation using normal distribution
        const zScore = (userScore - avgScore) / stdDev;
        let percentile = 50 + (zScore * 15); // Approximate conversion
        
        // Clamp to reasonable bounds (1-99, never 0 or 100)
        return Math.max(1, Math.min(99, Math.round(percentile)));
        
    } catch (error) {
        console.error('Error calculating percentile:', error);
        // Fallback to score-based percentile, clamped to 1-99
        return Math.max(1, Math.min(99, userScore));
    }
}

// Get or create global statistics
async function getGlobalStats(env) {
    try {
        const statsData = await env.ASSESSMENT_DATA.get('global:stats');
        
        if (!statsData) {
            // Initialize stats if they don't exist
            const initialStats = {
                totalSubmissions: 0,
                averageScore: 50,
                scoreStdDev: 20,
                scoreDistribution: {},
                lastUpdated: new Date().toISOString()
            };
            
            await env.ASSESSMENT_DATA.put('global:stats', JSON.stringify(initialStats));
            return initialStats;
        }
        
        return JSON.parse(statsData);
    } catch (error) {
        console.error('Error getting global stats:', error);
        return {
            totalSubmissions: 0,
            averageScore: 50,
            scoreStdDev: 20,
            scoreDistribution: {},
            lastUpdated: new Date().toISOString()
        };
    }
}

// Update global statistics with new submission
async function updateGlobalStats(newScore, env) {
    try {
        const currentStats = await getGlobalStats(env);
        
        // Update submission count
        currentStats.totalSubmissions += 1;
        
        // Update score distribution
        const scoreRange = Math.floor(newScore / 10) * 10; // Group into ranges of 10
        currentStats.scoreDistribution[scoreRange] = (currentStats.scoreDistribution[scoreRange] || 0) + 1;
        
        // Update average score (simple running average)
        const oldAvg = currentStats.averageScore;
        const newAvg = oldAvg + (newScore - oldAvg) / currentStats.totalSubmissions;
        currentStats.averageScore = newAvg;
        
        // Update standard deviation (simplified calculation)
        if (currentStats.totalSubmissions > 1) {
            const variance = ((currentStats.totalSubmissions - 1) * Math.pow(currentStats.scoreStdDev, 2) + Math.pow(newScore - newAvg, 2)) / currentStats.totalSubmissions;
            currentStats.scoreStdDev = Math.sqrt(variance);
        }
        
        currentStats.lastUpdated = new Date().toISOString();
        
        // Store updated stats
        await env.ASSESSMENT_DATA.put('global:stats', JSON.stringify(currentStats));
        
    } catch (error) {
        console.error('Error updating global stats:', error);
        // Don't throw - stats update failure shouldn't break submission
    }
}

// Convert score and percentile to readable category
function getCategoryFromScore(score, percentile) {
    if (percentile < 20) {
        return "Much less likely to perceive as overweight";
    } else if (percentile < 40) {
        return "Somewhat less likely to perceive as overweight";
    } else if (percentile < 60) {
        return "About average in weight perception";
    } else if (percentile < 80) {
        return "Somewhat more likely to perceive as overweight";
    } else {
        return "Much more likely to perceive as overweight";
    }
}

// Generate a unique session ID
function generateSessionId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 5);
    return `${timestamp}-${randomPart}`;
}

// Helper function to create JSON responses with CORS headers
function createJsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}

// Helper function to create error responses with CORS headers
function createErrorResponse(message, status = 400) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}