const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI
console.log('🔧 Initializing Google Generative AI...');

// Get API key from environment variable
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || 'AlzaSyCnJzKVQ_10_zbpTFbJiH1VI3N1_Vk1Lzk';

if (!GOOGLE_AI_API_KEY) {
    console.warn('⚠️  Warning: GOOGLE_AI_API_KEY not found in environment variables');
} else {
    console.log('✅ Google AI API Key configured:', GOOGLE_AI_API_KEY.substring(0, 10) + '...' + GOOGLE_AI_API_KEY.substring(GOOGLE_AI_API_KEY.length - 5));
}

// Initialize the AI client
let genAI = null;
try {
    genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
    console.log('✅ Google Generative AI initialized successfully');
    
    // Test connection with a simple model
    (async () => {
        try {
            const testModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
            console.log('✅ Test model connection successful');
        } catch (testError) {
            console.warn('⚠️  Test model connection warning:', testError.message);
        }
    })();
} catch (error) {
    console.error('❌ Failed to initialize Google Generative AI:', error.message);
}

// Base system prompt
const BASE_SYSTEM_PROMPT = 'You are EduShare AI, a smart and friendly academic assistant built for students. You summarize, explain, and answer questions related to academic content in simple and structured form.';

// Mode-specific task instructions
const MODE_INSTRUCTIONS = {
    'summarize': 'Your task is to summarize academic notes or text clearly in short bullet points. Focus on key points and main ideas. Be concise and well-structured.',
    'explain': 'Your task is to explain topics or definitions in beginner-friendly language. Break down complex concepts into simple terms and use examples when helpful.',
    'qa': 'Your task is to answer study-related questions concisely with examples if possible. Provide clear, accurate, and helpful responses.',
    'recommend': 'Your task is to suggest relevant notes or resources. Although you cannot directly access the EduShare database yet, provide general recommendations based on the topic and explain what types of resources would be helpful.'
};

// @desc    Chat with AI using Google Generative AI
// @route   POST /api/chatbot
// @access  Private (requires token)
exports.chatWithAI = async (req, res) => {
    try {
        const { message, mode = 'qa' } = req.body;

        console.log('📥 Incoming request - Message:', message?.substring(0, 50) + '...', 'Mode:', mode);

        // Validate input
        if (!message || !message.trim()) {
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }

        // Validate mode
        const validModes = ['summarize', 'explain', 'qa', 'recommend'];
        const selectedMode = mode.toLowerCase();
        if (!validModes.includes(selectedMode)) {
            return res.status(400).json({ 
                error: `Invalid mode. Must be one of: ${validModes.join(', ')}` 
            });
        }

        // Check if AI is initialized
        if (!genAI) {
            console.error('❌ Google Generative AI not initialized');
            return res.status(500).json({
                error: 'AI service is not properly configured. Please check your API key.'
            });
        }

        // Get mode-specific instruction
        const modeInstruction = MODE_INSTRUCTIONS[selectedMode] || MODE_INSTRUCTIONS['qa'];
        
        // Build the full prompt with system instructions and user message
        const systemInstruction = `${BASE_SYSTEM_PROMPT}\n\n${modeInstruction}`;
        const userMessage = message.trim();

        // Try model names in order (fallback if one doesn't work)
        // Updated for 2025 - using correct model names for current API
        // Standard model names that work with Google Generative AI SDK
        const modelNames = [
            'gemini-pro',                  // Original Gemini Pro (most reliable, always available)
            'gemini-1.5-flash-002',       // Versioned flash model
            'gemini-1.5-pro-002',         // Versioned pro model  
            'gemini-1.5-flash',           // Flash without version
            'gemini-1.5-pro',             // Pro without version
            'gemini-2.0-flash-exp'        // Experimental newer model
        ];
        let aiResponse = null;
        let lastError = null;

        for (const modelName of modelNames) {
            try {
                console.log(`🔹 Trying model: ${modelName}`);
                console.log(`   Mode: ${selectedMode}, Message length: ${userMessage.length} characters`);

                // Get the model
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    systemInstruction: systemInstruction
                });

                // Generate content with timeout
                console.log(`   📤 Sending request to ${modelName}...`);
                const generateContentPromise = model.generateContent(userMessage);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
                );

                const result = await Promise.race([generateContentPromise, timeoutPromise]);
                console.log(`   📥 Received response from ${modelName}`);
                
                const response = result.response;
                
                // Try to get text response - use the SDK's text() method which handles it correctly
                try {
                    aiResponse = response.text();
                } catch (textError) {
                    // Fallback: try to extract from candidates if text() fails
                    console.warn(`   ⚠️ response.text() failed, trying direct access:`, textError.message);
                    if (response.candidates && response.candidates.length > 0) {
                        const candidate = response.candidates[0];
                        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                            aiResponse = candidate.content.parts[0].text;
                        }
                    }
                    if (!aiResponse) {
                        throw new Error('Could not extract text from response');
                    }
                }

                // Clean up the response
                if (aiResponse) {
                    aiResponse = aiResponse.trim();
                    
                    if (aiResponse.length > 0) {
                        console.log(`✅ Successfully generated response using ${modelName}`);
                        console.log(`   Response length: ${aiResponse.length} characters`);
                        break; // Success, exit loop
                    }
                }
            } catch (modelError) {
                console.error(`   ❌ Model ${modelName} failed:`, modelError.message);
                if (modelError.stack) {
                    console.error(`   Stack:`, modelError.stack.substring(0, 300));
                }
                lastError = modelError;
                // Continue to next model
                continue;
            }
        }

        // Check if we got a successful response
        if (!aiResponse || aiResponse.length === 0) {
            let errorMsg = 'Failed to get AI response. ';

            // Handle specific Google AI errors
            if (lastError) {
                if (lastError.message?.includes('API key')) {
                    errorMsg = 'Invalid API key. Please check your GOOGLE_AI_API_KEY.';
                } else if (lastError.message?.includes('quota') || lastError.message?.includes('rate limit')) {
                    errorMsg = 'Rate limit exceeded. Please try again later.';
                } else if (lastError.message?.includes('safety')) {
                    errorMsg = 'The request was blocked due to safety filters. Please rephrase your message.';
                } else if (lastError.message?.includes('not found') || lastError.message?.includes('invalid model') || lastError.message?.includes('404')) {
                    errorMsg = 'Model not available. Please check the model name. ';
                    errorMsg += 'Tried models: ' + modelNames.join(', ') + '. ';
                    errorMsg += 'Please verify your API key has access to Gemini models at https://aistudio.google.com/apikey';
                } else if (lastError.message) {
                    errorMsg = `AI Error: ${lastError.message}`;
                } else {
                    errorMsg = 'An unexpected error occurred while generating the response.';
                }
            } else {
                errorMsg = 'All models failed. Please try again later.';
            }

            console.error('❌', errorMsg);
            return res.status(500).json({
                error: errorMsg
            });
        }

        // Return the response in the format expected by the frontend
        return res.status(200).json({
            response: aiResponse
        });

    } catch (err) {
        console.error('❌ Chat API Error:', err);
        console.error('   Error name:', err.name);
        console.error('   Error message:', err.message);
        if (err.stack) {
            console.error('   Stack trace:', err.stack.substring(0, 500));
        }

        // Handle specific errors
        let errorMessage = 'Failed to process chat request';

        if (err.message) {
            errorMessage = err.message;
        } else if (err.error) {
            errorMessage = err.error.message || JSON.stringify(err.error);
        }

        console.error('   Returning error to client:', errorMessage);

        return res.status(500).json({
            error: errorMessage || 'Failed to process chat request. Please try again later.'
        });
    }
};

