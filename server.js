import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Store feedback data
let emailFeedback = [];

// API endpoint to generate emails
app.post('/api/generate-emails', async (req, res) => {
  try {
    const { recipient, idea, style } = req.body;
    
    if (!recipient || !idea || !style) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    const prompt = `Write a cold email to ${recipient} about ${idea}. The email should have a compelling subject line that creates FOMO. The tone should be ${style}. Make it feel like it's from a founder who's built something amazing but is humble about it. Include a clear call-to-action at the end. keep the emails short, but witty and ambitious.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system',
            content: 'You are an expert cold‑email copywriter for builders and startup founders. Your emails are always: Conversational, concise and friendly ("builder/innovator energy" not "business formal" or "corporate"). Hook‑driven, with a sharp subject line that sparks FOMO  - Value‑focused: you show immediate benefit (aspiring, ambitious, energetic but humble and always wanting to learn.) Lightly informal yet respectful ("Happy to show you what it can do," "Worst case, you walk away with…") Always end with a simple call‑to‑action and a warm sign‑off ("Want me to send a demo? etc.). keep the emails short , max 4-5 sentences. '
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return res.status(response.status).json({ error: 'Error from OpenAI API', details: errorData });
    }
    
    const data = await response.json();
    const generatedEmail = data.choices[0].message.content.trim();
    
    res.json({ email: generatedEmail });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// API endpoint to receive feedback
app.post('/api/feedback', (req, res) => {
  try {
    const { emailIndex, feedback, recipient, idea, emailContent } = req.body;
    
    if (!emailIndex || !feedback || !recipient || !idea || !emailContent) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Store the feedback
    emailFeedback.push({
      timestamp: new Date(),
      emailIndex,
      feedback,
      recipient,
      idea,
      emailContent
    });
    
    console.log(`Feedback received for email ${emailIndex}: ${feedback}`);
    console.log(`Total feedback collected: ${emailFeedback.length}`);
    
    // In a real application, you might store this in a database
    // or use it to fine-tune your model
    
    res.json({ success: true, message: 'Feedback received' });
  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// API endpoint to get feedback statistics
app.get('/api/feedback/stats', (req, res) => {
  try {
    // Calculate some basic statistics
    const totalFeedback = emailFeedback.length;
    const positiveFeedback = emailFeedback.filter(item => item.feedback === 'up').length;
    const negativeFeedback = emailFeedback.filter(item => item.feedback === 'down').length;
    
    res.json({
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      positivePercentage: totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0
    });
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
