const { GoogleGenerativeAI } = require('@google/generative-ai');

// API key rotation counter
let apiKeyCounter = 0;
const TOTAL_API_KEYS = 5;

// Function to get the next API key in rotation
function getNextApiKey() {
  // Increment counter and wrap around if needed
  apiKeyCounter = (apiKeyCounter % TOTAL_API_KEYS) + 1;
  const keyName = `key${apiKeyCounter}`;
  const apiKey = process.env[keyName];

  // Update usage statistics
  if (apiKeyStats[keyName]) {
    apiKeyStats[keyName].uses++;
    apiKeyStats[keyName].lastUsed = new Date().toISOString();
  }

  // Only log errors, not regular API key usage

  if (!apiKey) {
    console.error(`API key ${keyName} not found in environment variables`);
    // Fallback to the first key if the current one is not available
    return process.env.key1;
  }

  return apiKey;
}

// Initialize the Gemini API with the first API key
// We'll create a new instance for each request to use the rotated keys

// Keep track of API key usage statistics
const apiKeyStats = {
  key1: { uses: 0, errors: 0, lastUsed: null },
  key2: { uses: 0, errors: 0, lastUsed: null },
  key3: { uses: 0, errors: 0, lastUsed: null },
  key4: { uses: 0, errors: 0, lastUsed: null },
  key5: { uses: 0, errors: 0, lastUsed: null },
};

// Function to log API key usage - only used for debugging or when errors occur
function logApiKeyUsage() {
  // This function is kept for debugging purposes but not used in normal operation
  // It can be called manually when needed or from error handlers
  return {
    stats: apiKeyStats,
    timestamp: new Date().toISOString()
  };
}

async function generateGeminiResponse(promptData) {
  const { text, type, genre, mood, length } = promptData;

  // Base length guide for all types with formatting instructions
  let lengthGuide = '';

  switch(length) {
    case 'Very Short':
      lengthGuide = `
        Length: Very Short (50-100 words)

        For this very short length:
        - If poetry: 1-2 short stanzas with clear line breaks
        - If prose: 1-2 short paragraphs with blank lines between them
        - If quotes: 2-3 impactful quotes, each on separate lines
        - If dialogue: A brief exchange of 3-5 lines with proper formatting

        Despite the brevity, ensure proper formatting with appropriate line breaks and paragraph spacing.
      `;
      break;
    case 'Short':
      lengthGuide = `
        Length: Short (100-250 words)

        For this short length:
        - If poetry: 2-3 stanzas with clear line breaks
        - If prose: 2-3 paragraphs with blank lines between them
        - If quotes: 3-5 meaningful quotes, each on separate lines
        - If dialogue: A concise scene with 5-10 exchanges and proper formatting

        Maintain proper formatting with appropriate line breaks and paragraph spacing.
      `;
      break;
    case 'Medium':
      lengthGuide = `
        Length: Medium (250-500 words)

        For this medium length:
        - If poetry: 3-5 well-developed stanzas with clear line breaks
        - If prose: 4-6 paragraphs with blank lines between them
        - If quotes: 5-7 substantial quotes, each on separate lines
        - If dialogue: A developed scene with 10-15 exchanges and proper formatting

        Use proper formatting with clear section breaks, paragraph spacing, and emphasis where appropriate.
      `;
      break;
    case 'Long':
      lengthGuide = `
        Length: Long (500-1000 words)

        For this long length:
        - If poetry: 5-7 rich stanzas or multiple poem sections with clear line breaks
        - If prose: 7-10 well-developed paragraphs with blank lines between them
        - If quotes: 7-10 in-depth quotes with context, each on separate lines
        - If dialogue: An extended scene with 15-25 exchanges and descriptive elements

        Use proper formatting with clear section breaks, paragraph spacing, and emphasis where appropriate.
        Consider using subheadings or section breaks for longer pieces to improve readability.
      `;
      break;

    default:
      lengthGuide = `
        Length: Medium (250-500 words)

        Use proper formatting with clear paragraph breaks and appropriate spacing.
        Ensure the piece is well-structured with a beginning, middle, and end.
        Format according to the content type with appropriate line breaks and emphasis.
      `;
  }

  // Type-specific formatting instructions
  let typeSpecificInstructions = '';

  switch(type) {
    case 'Social Media Caption':
      typeSpecificInstructions = `
        Create engaging social media captions that are optimized for the platform.
        Generate multiple caption options (3-5) that reflect the ${mood} mood and ${genre} theme.
        Each caption should be separated by blank lines for clarity.

        For Instagram:
        - Create captions that are attention-grabbing and visually descriptive
        - Include relevant hashtags (5-7) at the end of each caption
        - Keep captions concise but engaging
        - Use emojis strategically to enhance the message

        For Twitter:
        - Create short, impactful captions that fit within character limits
        - Include 1-2 relevant hashtags
        - Make the content shareable and conversation-starting

        For LinkedIn:
        - Create more professional captions that still maintain the ${mood} tone
        - Focus on value-adding content related to the ${genre}
        - Keep a professional tone while being engaging

        Format each caption option clearly with a number or platform indicator:

        INSTAGRAM OPTION 1:
        Caption text here with engaging content. #hashtag1 #hashtag2 #hashtag3

        TWITTER OPTION 1:
        Shorter caption text here. #relevanthashtag

        LINKEDIN OPTION 1:
        Professional caption text here that provides value and insight.

        Use emphasis (italics) for key words by placing _underscores_ around them.
        Make the captions authentic, engaging, and aligned with the specified mood and genre.
      `;
      break;

    case 'Poetry':
      typeSpecificInstructions = `
        Format your response as a poem with clear stanza breaks (double line breaks between stanzas).
        Use proper line breaks for each line of poetry (single line breaks).
        Employ poetic devices like metaphor, simile, and imagery that reflect the ${mood} mood.
        Consider using a structure appropriate for the ${genre} genre.
        Use emphasis (italics) for important words or phrases by placing _underscores_ around them.
        Make sure the poem has a clear theme and emotional impact.
        Separate stanzas with blank lines.
        Do not include a title unless specifically requested.
        Example format:
        Line one of first stanza
        Line two of first stanza
        Line three of first stanza

        Line one of second stanza
        Line two of second stanza
        Line three of second stanza
      `;
      break;

    case 'Short Story':
      typeSpecificInstructions = `
        Format your response as a short story with a clear beginning, middle, and end.
        Use proper paragraph breaks with blank lines between paragraphs.
        Include character development, setting descriptions, and a plot that reflects the ${genre} genre.
        Maintain a ${mood} mood throughout the narrative.
        Format dialogue properly with quotation marks and paragraph breaks for new speakers.
        Use emphasis (italics) for internal thoughts by placing _underscores_ around them.
        Create vivid imagery and sensory details.
        Vary sentence length and structure for rhythm and pacing.
        Do not include a title unless specifically requested.
      `;
      break;

    case 'Quotes':
      typeSpecificInstructions = `
        Generate a set of meaningful quotes that reflect the ${mood} mood and ${genre} theme.
        Each quote should be impactful and standalone.
        Format each quote on a new line with a dash or attribution.
        Separate quotes with blank lines for clarity.
        Format:
        "Quote text here." - Attribution (if applicable)

        "Another quote text here." - Attribution (if applicable)

        Make the quotes profound and thought-provoking.
        Use emphasis (italics) for key words by placing _underscores_ around them.
        Aim for 3-7 quotes depending on the requested length.
      `;
      break;

    case 'Dialogue Scene':
      typeSpecificInstructions = `
        Create a dialogue scene between characters that reflects the ${genre} genre.
        Format the dialogue properly with a new paragraph for each speaker.
        Use proper dialogue formatting with quotation marks.
        Include character names before or after dialogue when needed for clarity.
        Include minimal narrative description between dialogue lines.
        Format:
        Character name: "Dialogue text here."

        Other character: "Response dialogue here."

        First character: "More dialogue here."

        Maintain a ${mood} mood throughout the conversation.
        Use emphasis (italics) for emphasized words by placing _underscores_ around them.
        Make the dialogue reveal character personalities and advance a mini-plot.
      `;
      break;

    case 'Essay':
      typeSpecificInstructions = `
        Write an essay with a clear thesis, supporting arguments, and conclusion.
        Organize the content into well-defined paragraphs with topic sentences.
        Use proper paragraph breaks with blank lines between paragraphs.
        Maintain a ${mood} tone throughout the essay.
        Focus on a subject appropriate for the ${genre} genre.
        Use emphasis (italics) for key terms or concepts by placing _underscores_ around them.
        Include transitions between paragraphs for smooth flow.
        Use formal or informal language as appropriate for the genre and mood.
        Consider using section breaks for longer essays.
      `;
      break;

    case 'Flash Fiction':
      typeSpecificInstructions = `
        Create a complete story in an extremely condensed form.
        Use proper paragraph breaks with blank lines between paragraphs.
        Include a hook, conflict, and resolution despite the brevity.
        Every word should serve the story's purpose.
        Use emphasis (italics) for important moments by placing _underscores_ around them.
        Maintain a ${mood} mood throughout.
        Ensure the story fits the ${genre} genre conventions.
        Create vivid imagery with minimal words.
        End with impact - the last line should resonate.
      `;
      break;

    case 'Affirmations':
      typeSpecificInstructions = `
        Generate positive affirmations that reflect the ${mood} mood.
        Each affirmation should be on a new line and begin with "I" statements.
        Separate each affirmation with a blank line for clarity.
        Format:
        I am [positive attribute].

        I [positive action] with confidence.

        I embrace [positive concept].

        Make the affirmations empowering and aligned with the ${genre} theme.
        Use emphasis (italics) for key words by placing _underscores_ around them.
        Create affirmations that are specific, present-tense, and positive.
        Aim for 5-10 affirmations depending on the requested length.
      `;
      break;

    case 'Play Script':
      typeSpecificInstructions = `
        Format your response as a script with character names, dialogue, and stage directions.
        Use proper script formatting with character names in uppercase before their lines.
        Include stage directions in parentheses.
        Format:
        CHARACTER NAME:
        (stage direction)
        Dialogue text here.

        ANOTHER CHARACTER:
        (stage direction)
        Response dialogue here.

        Create a scene that reflects the ${genre} genre with a ${mood} mood.
        Include a clear dramatic situation with a beginning, middle, and end.
        Use blank lines between different characters' dialogue blocks.
      `;
      break;

    case 'Philosophical Writing':
      typeSpecificInstructions = `
        Create a philosophical exploration of a concept related to the ${genre} genre.
        Use a ${mood} tone throughout the writing.
        Organize into clear paragraphs with blank lines between them.
        Include thought-provoking questions and insights.
        Use emphasis (italics) for key philosophical concepts by placing _underscores_ around them.
        Structure the writing with clear paragraphs that build on each other.
        Consider using section breaks for different aspects of the philosophical exploration.
        Include references to philosophical traditions or thinkers if appropriate.
        Conclude with a meaningful insight or question for reflection.
      `;
      break;

    case 'Expository Writing':
      typeSpecificInstructions = `
        Write an informative piece that explains a topic related to the ${genre} genre.
        Organize the information logically with clear paragraphs and transitions.
        Use proper paragraph breaks with blank lines between paragraphs.
        Maintain a ${mood} tone throughout the explanation.
        Use emphasis (italics) for key terms or concepts by placing _underscores_ around them.
        Consider using subheadings for different sections (if appropriate).
        Use examples and details to clarify concepts.
        Ensure the writing is accessible and educational.
        Conclude with a summary of the main points.
      `;
      break;

    default:
      typeSpecificInstructions = `
        Format your response as a complete piece of writing with proper structure.
        Use appropriate paragraph breaks with blank lines between paragraphs.
        Ensure the writing reflects the ${genre} genre and maintains a ${mood} mood.
        Use emphasis (italics) for important words or phrases by placing _underscores_ around them.
        Organize your writing with appropriate structure and clear transitions.
        Make the content engaging and original.
        Use appropriate formatting for the type of content you're creating.
      `;
  }

  // Construct the full prompt
  const structuredPrompt = `
    You are a creative writing assistant. Please generate a ${length} ${type} in the ${genre} genre with a ${mood} mood.

    The writing should be original, engaging, and reflect the specified genre and mood accurately.

    Additional instructions from the user: ${text}

    ${typeSpecificInstructions}

    ${lengthGuide}

    IMPORTANT FORMATTING INSTRUCTIONS:
    1. Use proper paragraph breaks with blank lines between paragraphs.
    2. For poetry, use line breaks for each line and blank lines between stanzas.
    3. For dialogue, use proper quotation marks and paragraph breaks for new speakers.
    4. For emphasis, use _underscores_ around words or phrases that should be emphasized (this will be rendered as italics).
    5. For lists or structured content, use proper formatting with line breaks.
    6. Ensure your response is visually organized and easy to read.
    7. Do not include any additional commentary, explanations, or titles unless specifically requested.
    8. Maintain consistent formatting throughout the entire piece.
    9. Use blank lines to separate sections or stanzas for better readability.
    10. For quotes or affirmations, place each one on a separate line with proper attribution if applicable.

    Your response will be displayed exactly as you format it, so proper spacing and line breaks are essential.

    CRITICAL: The user experience depends heavily on your formatting. Poor formatting will make your content difficult to read and less engaging. Take extra care with:
    1. Line breaks for poetry and dialogue
    2. Paragraph spacing for prose
    3. Proper emphasis using _underscores_ for italics
    4. Clear separation between quotes or affirmations
    5. Consistent formatting throughout the piece

    Remember that your response will be displayed in a web interface where proper formatting significantly impacts readability and user experience.
  `;

  try {
    // Get the next API key in rotation
    const currentApiKey = getNextApiKey();

    // Create a new Gemini API instance with the current API key
    const genAI = new GoogleGenerativeAI(currentApiKey);

    // Use the Gemini 1.5 Flash model which is free
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Set generation config based on content type
    let temperature = 0.9; // Default temperature

    // Adjust temperature based on content type
    if (type === 'Poetry' || type === 'Flash Fiction') {
      temperature = 0.95; // Higher creativity for poetry and flash fiction
    } else if (type === 'Essay' || type === 'Expository Writing') {
      temperature = 0.7; // Lower temperature for more factual content
    } else if (type === 'Social Media Caption') {
      temperature = 0.9; // Balanced creativity for social media captions
    }

    // Set generation config for better results
    const generationConfig = {
      temperature: temperature,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,  // Ensure we can generate longer content
    };

    // For longer content types, increase the token limit
    if (length === 'Long' || length === 'Very Long' || length === 'Epic') {
      generationConfig.maxOutputTokens = 4096;
    }

    // Generate the content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: structuredPrompt }] }],
      generationConfig,
    });

    // Get the response text
    const response = result.response;
    let responseText = response.text();

    // Process the response text to ensure proper formatting

    // Convert underscores to italics using CSS styling
    responseText = responseText.replace(/_(.*?)_/g, '<em>$1</em>');

    // Ensure proper paragraph breaks are maintained
    // Double newlines should be preserved for paragraph breaks
    responseText = responseText.replace(/\n\n/g, '\n\n');

    // For poetry, ensure line breaks are preserved
    if (type === 'Poetry') {
      // Make sure single line breaks in poetry are preserved
      responseText = responseText.replace(/\n(?!\n)/g, '\n');
    }

    return responseText;
  } catch (error) {
    const keyName = `key${apiKeyCounter}`;
    console.error(`API Error:`, error.message);

    // Update error statistics
    if (apiKeyStats[keyName]) {
      apiKeyStats[keyName].errors++;
    }

    // Create a more specific error response based on the error type
    let errorMessage = `I apologize, but I couldn't generate the ${type} you requested.`;

    if (error.message && error.message.includes('quota')) {
      errorMessage = `API quota exceeded. The system will automatically try a different API key on your next request. Please try again.`;

      // Force the next API key to be used on the next request
      // This ensures we immediately switch keys on quota errors
      getNextApiKey();
    } else if (error.message && error.message.includes('content filtered')) {
      errorMessage = `The requested content couldn't be generated due to content safety filters. Please try a different prompt or adjust your parameters.`;
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = `The request timed out. This might happen for very long content. Please try with a shorter length or simplify your prompt.`;
    } else if (error.message && (error.message.includes('invalid') || error.message.includes('unauthorized'))) {
      errorMessage = `There was an issue with the API key. The system will automatically try a different API key on your next request. Please try again.`;

      // Force the next API key to be used on the next request
      getNextApiKey();
    }

    return errorMessage + ` (Type: ${type}, Genre: ${genre}, Mood: ${mood}, Length: ${length})`;
  }
}

module.exports = {
  generateGeminiResponse,
  getApiKeyStats: () => ({ ...apiKeyStats }),
  logApiKeyUsage
};
