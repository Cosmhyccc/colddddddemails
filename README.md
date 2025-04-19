# Email Generator App

An AI-powered cold email generator that creates professional emails based on user input, with a sleek dark mode interface and feedback collection system.

## Features

- Uses OpenAI's GPT-4o model to generate cold emails tailored to specific recipients
- Dark mode UI with clean, minimalist design
- Generates 3 different email variations with varying tones
- Feedback system with thumbs up/down to collect user preferences
- Copy-to-clipboard functionality for easy use

## Deployment Instructions (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add the following environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

## Local Development

1. Clone the repository
2. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
3. Install dependencies: `npm install`
4. Start the server: `npm start`
5. Open http://localhost:3000 in your browser

## Technologies Used

- Express.js (Backend)
- HTML/CSS/JavaScript (Frontend)
- OpenAI GPT-4o API
- Node.js
