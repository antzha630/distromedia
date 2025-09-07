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

## 🌐 Live Application

DistroMedia is currently hosted and available at: **[Your Vercel URL]**

The application is fully functional and ready to use for content creation and social media distribution across all supported platforms.

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

## 🔮 Future Roadmap

### MCP (Model Context Protocol) Integration
- **Enhanced AI Capabilities**: Integration with MCP to provide more sophisticated content generation and analysis
- **Advanced Context Understanding**: Better understanding of content context and user intent
- **Improved Platform Optimization**: More nuanced platform-specific content adaptation

### NLP Pipeline for Style Analysis
- **Competitor Analysis**: Advanced NLP pipeline to analyze how other companies write their articles
- **Style Mimicking**: Automatically adapt content to match successful writing styles from industry leaders
- **Content Optimization**: Learn from high-performing content patterns and apply them to generated posts
- **Brand Voice Adaptation**: Customize content generation to match specific brand voices and tones

### Enhanced Features
- **Multi-language Support**: Content generation in multiple languages
- **Advanced Analytics**: Detailed performance metrics across platforms
- **Content Calendar**: Visual scheduling and content planning tools
- **Team Collaboration**: Multi-user support with role-based permissions

## 🚀 Deployment

DistroMedia is deployed on Vercel with automatic deployments from the main branch. The application is configured with all necessary environment variables for production use.

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