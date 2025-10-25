# 🤖 KLH Buddy - Multi-Provider AI Chatbot

KLH Buddy is an intelligent AI assistant integrated into the Smart Campus Ecosystem platform. It provides 24/7 support to students, faculty, and administrators with information about campus features, university details, and platform navigation.

## ✨ Features

- **Multi-Provider Support**: Works with OpenAI, Google Gemini, Claude, and HuggingFace
- **Conversation History**: Maintains context across multiple messages
- **Real-time Status**: Shows which AI provider is currently active
- **Beautiful UI**: Neon cyberpunk theme matching the platform design
- **Error Handling**: Graceful fallback when services are unavailable
- **Context-Aware**: Enhanced prompts with detailed campus information

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Backend dependencies (already included in package.json)
cd server
npm install

# Frontend dependencies (already included in package.json)
cd client
npm install
```

### 2. Choose Your AI Provider

Add one of these API keys to your `server/.env` file:

#### Option A: OpenAI GPT (Recommended)
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```
- **Cost**: Pay-per-use (very affordable for light usage)
- **Quality**: Excellent responses, great context understanding
- **Setup**: 2-minute signup at [platform.openai.com](https://platform.openai.com)
- **Models**: Uses GPT-3.5-turbo (fast and cost-effective)

#### Option B: Google Gemini (Free Tier)
```env
GEMINI_API_KEY=your-gemini-api-key-here
```
- **Cost**: Free tier available (60 requests/minute)
- **Quality**: Very good, especially for technical questions
- **Setup**: Get free API key at [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **Models**: Uses Gemini 1.5 Flash (fast responses)

#### Option C: Claude by Anthropic
```env
ANTHROPIC_API_KEY=sk-ant-your-claude-api-key-here
```
- **Cost**: Pay-per-use, competitive pricing
- **Quality**: Excellent for detailed, thoughtful responses
- **Setup**: Signup at [console.anthropic.com](https://console.anthropic.com)
- **Models**: Uses Claude 3 Haiku (fast and affordable)

#### Option D: HuggingFace (Free)
```env
HUGGINGFACE_API_KEY=hf_your-huggingface-token-here
```
- **Cost**: Free tier with 30,000 requests/month
- **Quality**: Good for basic conversations
- **Setup**: Free signup at [huggingface.co](https://huggingface.co)
- **Models**: Uses DialoGPT or FLAN-T5

### 3. Environment Configuration

Update your `server/.env` file:
```env
# Choose ONE of the following (the system will auto-detect which is available)
OPENAI_API_KEY=sk-your-openai-key-here
# OR
GEMINI_API_KEY=your-gemini-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-claude-key-here
# OR
HUGGINGFACE_API_KEY=hf_your-huggingface-token-here

# Required existing variables
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-here
```

### 4. Start the Application

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 5. Test the Chatbot

1. Open http://localhost:5173
2. Login with any account (or create one)
3. Look for the floating "🤖 KLH Buddy" button in the bottom right
4. Click it to open the chat interface
5. You should see which AI provider is active in the button badge
6. Try asking: "How do I report a lost item?"

## 🎯 Provider Priority

The system automatically selects the first available provider in this order:
1. **OpenAI** (if `OPENAI_API_KEY` is set)
2. **Gemini** (if `GEMINI_API_KEY` is set)
3. **Claude** (if `ANTHROPIC_API_KEY` is set)
4. **HuggingFace** (if `HUGGINGFACE_API_KEY` is set)

## 💬 Chatbot Capabilities

### Campus Information
- KLH University details and history
- Program offerings and departments
- Campus facilities and infrastructure
- Academic calendar and important dates

### Platform Features
- Lost & Found system usage
- Event management and approvals
- Feedback submission process
- Real-time notifications
- User roles and permissions

### General Assistance
- Navigation help within the platform
- Technical support guidance
- General campus life questions
- Step-by-step instructions for features

## 🔧 Advanced Configuration

### Custom Prompts
The chatbot uses an enhanced system prompt that includes:
- Detailed university information
- Complete platform feature descriptions
- Technical specifications
- User role explanations

### Conversation Context
- Maintains last 10 messages for context
- Filters out system messages
- Handles conversation history in API requests

### Error Handling
- Graceful degradation when APIs are unavailable
- User-friendly error messages
- Automatic provider fallback
- Retry mechanisms for transient failures

## 📊 API Usage & Costs

### OpenAI GPT-3.5-turbo
- **Input**: ~$0.0015 per 1K tokens
- **Output**: ~$0.002 per 1K tokens
- **Example**: 100 conversations = ~$0.50-1.00

### Google Gemini
- **Free Tier**: 60 requests/minute, 1,500 requests/day
- **Paid**: $0.00025 per 1K characters

### Claude 3 Haiku
- **Input**: $0.00025 per 1K tokens
- **Output**: $0.00125 per 1K tokens
- **Cost**: Very competitive with GPT-3.5

### HuggingFace
- **Free Tier**: 30,000 requests/month
- **Pro**: $9/month for more requests

## 🛠️ Development

### Adding New Providers
1. Update `getAvailableProvider()` function
2. Add new generation function (follow existing pattern)
3. Update provider icons and colors in frontend
4. Add environment variable documentation

### Customizing Responses
Edit the `getSystemPrompt()` function in `chatbotController.js` to modify:
- University information
- Feature descriptions
- Response style and tone
- Available capabilities

### Analytics & Monitoring
The system logs:
- Provider usage statistics
- Response times
- Error rates
- Popular question types

## 🔒 Security Considerations

- API keys are loaded from environment variables only
- No API keys are exposed to the frontend
- All AI requests are server-side only
- Conversation history is not stored in database (privacy)
- Rate limiting can be added if needed

## 🐛 Troubleshooting

### Common Issues

**Chatbot button shows "not available"**
- Check that at least one API key is set in `.env`
- Verify API keys are valid and have quota
- Check server logs for provider detection

**Slow responses**
- HuggingFace models are slower than commercial APIs
- Consider switching to OpenAI or Gemini for better performance
- Check your internet connection

**Inconsistent responses**
- Each provider has different capabilities
- HuggingFace models may be less reliable
- Consider using OpenAI or Claude for production

**Error messages**
- Check server console for detailed error logs
- Verify API key validity
- Ensure sufficient API quota/credits

### Testing Different Providers

You can test multiple providers by temporarily commenting out API keys:

```env
# Test OpenAI only
OPENAI_API_KEY=sk-your-key-here
# GEMINI_API_KEY=your-gemini-key-here  # Comment out to test OpenAI

# Test Gemini only
# OPENAI_API_KEY=sk-your-key-here      # Comment out to test Gemini
GEMINI_API_KEY=your-gemini-key-here
```

## 🚀 Production Deployment

For production deployment:

1. **Choose OpenAI or Claude** for best reliability
2. **Set up monitoring** for API usage and costs
3. **Configure rate limiting** to prevent abuse
4. **Use environment-specific API keys** (development vs production)
5. **Monitor costs** and set up billing alerts

## 📚 Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Claude API Documentation](https://docs.anthropic.com/claude/reference)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference/index)

## 🎉 Getting Started Examples

Try asking the chatbot:
- "How do I report a lost item?"
- "What events are happening this week?"
- "How do I submit feedback?"
- "What programs does KLH University offer?"
- "How do I create an event as a faculty member?"

The chatbot will guide users through each process step-by-step! 🎓✨
