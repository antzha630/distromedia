# DistroMedia - Social Media Content Distribution Platform

DistroMedia is a comprehensive social media management platform that allows users to create, optimize, and distribute content across multiple social media platforms from a single interface. Built with Next.js and powered by AI, it streamlines the process of content creation and cross-platform posting.

## 🚀 Features

### Multi-Platform Content Distribution
- **LinkedIn** - Professional business-focused posts
- **Twitter/X** - Concise, engaging tweets
- **Bluesky** - Casual, conversational posts
- **Telegram** - Direct, informative channel posts

### AI-Powered Content Optimization
- **Smart Summarization** - Uses OpenAI GPT-3.5-turbo to automatically create platform-specific content
- **Platform-Specific Tuning** - Each platform gets content optimized for its unique audience and character limits
- **Professional Tone Adaptation** - Content automatically adjusts tone based on platform (professional for LinkedIn, casual for Bluesky, etc.)

### Content Management
- **Article URL Processing** - Automatically fetches and processes article metadata
- **Scheduled Posting** - Built-in scheduler for timed content distribution
- **Content Preview** - Preview generated content before posting
- **Character Limit Management** - Automatically ensures content fits platform requirements

### Secure Authentication
- **OAuth Integration** - Secure login for LinkedIn and Twitter
- **App Password Support** - Bluesky integration using secure app passwords
- **Telegram Core API** - Advanced Telegram authentication with phone verification

## 🛠️ Technology Stack

- **Frontend**: Next.js, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Express.js
- **AI**: OpenAI GPT-3.5-turbo
- **Social APIs**: 
  - LinkedIn API
  - Twitter API v2
  - Bluesky AT Protocol
  - Telegram Core API
- **Deployment**: Vercel
- **Environment**: Node.js with ES modules

## 📋 Prerequisites

Before running this project, you'll need:

- Node.js 18+ 
- npm or yarn
- API keys for the social platforms you want to use:
  - OpenAI API key
  - LinkedIn Developer App credentials
  - Twitter Developer App credentials
  - Bluesky account with app password
  - Telegram API credentials (API ID, API Hash, Bot Token)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/antzha630/distromedia.git
cd distromedia
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# LinkedIn Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Twitter Configuration
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret

# Telegram Configuration
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 Platform Setup Guides

### LinkedIn Setup
1. Create a LinkedIn Developer App
2. Configure OAuth redirect URLs
3. Add your client ID and secret to environment variables

### Twitter Setup
1. Apply for Twitter Developer Account
2. Create a new app in Twitter Developer Portal
3. Generate API keys and access tokens
4. Add credentials to environment variables

### Bluesky Setup
1. Create a Bluesky account
2. Generate an app password at [bsky.app/settings/app-passwords](https://bsky.app/settings/app-passwords)
3. Use your handle and app password for authentication

### Telegram Setup
See [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) for detailed Telegram configuration instructions.

## 🏗️ Project Structure

```
distromedia/
├── pages/
│   ├── api/                 # API routes
│   │   ├── bluesky/         # Bluesky integration
│   │   ├── linkedin/        # LinkedIn integration
│   │   ├── telegram/        # Telegram integration
│   │   ├── twitter/         # Twitter integration
│   │   ├── summarize.js     # AI content generation
│   │   └── fetchMetadata.js # Article metadata fetching
│   ├── index.js            # Main dashboard
│   ├── post.js             # Content creation page
│   └── scheduler.js        # Content scheduling
├── public/                 # Static assets
├── styles/                 # CSS and styling
└── server.js              # Express server (optional)
```

## 🤖 AI Content Generation

The platform uses OpenAI's GPT-3.5-turbo to automatically generate platform-optimized content:

- **LinkedIn**: Professional, business-focused posts (1200 char limit)
- **Twitter**: Engaging, conversational tweets (250 char limit)
- **Bluesky**: Casual, authentic posts (250 char limit)
- **Telegram**: Direct, informative content (4000 char limit)

## 🔒 Security Features

- Environment variables for all sensitive data
- OAuth 2.0 authentication for social platforms
- Secure API key management
- No hardcoded credentials in source code

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables in Production
Make sure to add all required environment variables in your deployment platform's environment settings.

## 📝 Usage

1. **Login to Platforms**: Authenticate with your social media accounts
2. **Input Content**: Paste article URL or enter text content
3. **Generate Content**: Let AI create platform-specific versions
4. **Review & Edit**: Preview and modify generated content
5. **Post**: Distribute content across selected platforms
6. **Schedule**: Set up automated posting schedules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This application requires valid API credentials for all integrated platforms. Make sure to follow each platform's terms of service and API usage guidelines.