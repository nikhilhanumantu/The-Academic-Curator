const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StudentProfile = require('../models/StudentProfile');

// POST /api/ai/suggestions
router.post('/suggestions', auth, async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(503).json({
        suggestions: [
          { text: 'Add a Gemini API key to enable personalised AI insights.' },
          { text: 'Connect your GitHub and LinkedIn to strengthen your profile.' },
          { text: 'Complete your profile to 100% to maximise recruiter visibility.' },
        ],
        fallback: true,
      });
    }

    // Fetch the student profile
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Profile not found' });

    // Build a compact profile summary for the prompt
    const profileSummary = {
      name: req.user.name,
      major: student.major || 'Not specified',
      bio: student.bio || 'No bio',
      skills: (student.skills || []).join(', ') || 'None',
      projectCount: (student.projects || []).length,
      educationCount: (student.education || []).length,
      hasGitHub: !!student.github,
      hasLinkedIn: !!student.linkedin,
      hasWebsite: !!student.websiteUrl,
      location: student.location || 'Not specified',
    };

    const prompt = `
You are an expert career coach for a student named "${profileSummary.name}" on a platform called The Academic Curator.

Here is their profile summary:
- Major: ${profileSummary.major}
- Bio: ${profileSummary.bio}
- Skills: ${profileSummary.skills}
- Projects added: ${profileSummary.projectCount}
- Education entries: ${profileSummary.educationCount}
- GitHub linked: ${profileSummary.hasGitHub ? 'Yes' : 'No'}
- LinkedIn linked: ${profileSummary.hasLinkedIn ? 'Yes' : 'No'}
- Portfolio website: ${profileSummary.hasWebsite ? 'Yes' : 'No'}
- Location: ${profileSummary.location}

Generate exactly 3 short, highly personalised, actionable career profile improvement suggestions for this student.
Each suggestion must be a single sentence, max 20 words, specific and helpful.
Return ONLY a valid JSON array like: ["suggestion 1", "suggestion 2", "suggestion 3"]
No markdown, no explanation, just the JSON array.
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // Optional, for OpenRouter rankings
        'X-Title': 'The Academic Curator', // Optional, for OpenRouter rankings
      },
      body: JSON.stringify({
        model: 'openai/gpt-5.4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300 // Added explicitly to prevent OpenRouter credit limit errors
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content?.trim() || '';

    // Parse the JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const suggestionsArray = JSON.parse(jsonMatch[0]);
    const suggestions = suggestionsArray.slice(0, 3).map(s => ({ text: s }));

    res.json({ suggestions, fallback: false });
  } catch (err) {
    console.error('AI suggestions error:', err.message);
    // Return graceful fallback on any error
    res.json({
      suggestions: [
        { text: 'Add 2 more projects to enter the top 10% of developers in your region.' },
        { text: 'Link your GitHub to increase recruiter discovery by 30%.' },
        { text: 'Write a detailed bio to improve your keyword match score.' },
      ],
      fallback: true,
    });
  }
});

// POST /api/ai/curo
// Chat with the Curo AI Assistant
router.post('/curo', auth, async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    const { message, context } = req.body;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.json({
        reply: "I am Curo, your AI Resume Assistant! Unfortunately, my AI brain (Gemini API Key) isn't connected right now. Please add your credentials so I can help you craft the perfect resume!"
      });
    }

    const systemPrompt = `
You are Curo, an expert AI Resume Assistant built into the platform 'The Academic Curator'.
You are chatting with a student. The user is currently editing a LaTeX resumé template.
Their current typed message is: "${message}"

Here is the current content of their LaTeX resume for context:
\`\`\`latex
${context ? context : '(User has not generated a template yet)'}
\`\`\`

Provide a short, direct, and actionable response. If they ask for better phrasing, provide the exact text they can copy-paste. Never break character. Be supportive and professional.
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'The Academic Curator',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5.4',
        messages: [{ role: 'user', content: systemPrompt }],
        max_tokens: 1000 // Added explicitly to prevent OpenRouter credit limit errors
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter error details:', errorData);
      throw new Error(`OpenRouter error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content?.trim() || "I'm having trouble connecting to my neural network right now. Please try again later!";

    res.json({ reply: text });
  } catch (err) {
    console.error('Curo AI error:', err.message);
    res.json({ reply: "I'm having trouble connecting to my neural network right now. Please try again later!" });
  }
});

module.exports = router;
