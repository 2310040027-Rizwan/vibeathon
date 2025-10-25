# 🤖 KLH Buddy Chatbot - Complete Setup Guide

## ✅ Current Status

### What's Already Configured:
- ✅ **Frontend**: ChatWidget component ready
- ✅ **Backend**: Chatbot controller with Google Gemini integration
- ✅ **Package**: `@google/generative-ai` installed
- ✅ **API Route**: `/api/chatbot` configured
- ✅ **UI**: Beautiful floating chat button (bottom-right)

### What's Missing:
- ❌ **GEMINI_API_KEY** - Need to add to `.env` file

---

## 🔑 Step 1: Get Your Free Gemini API Key

### Option A: Google AI Studio (Recommended)
1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Click **"Create API key in new project"** (or select existing project)
5. Copy the API key (format: `AIzaSyC...`)

### Option B: Google MakerSuite
1. Go to: **https://makersuite.google.com/app/apikey**
2. Follow same steps as above

### Important Notes:
- ✅ **Free Tier**: 60 requests per minute
- ✅ **No Credit Card** required
- ✅ **Generous Limits**: Perfect for development
- 📝 Keep your API key secret!

---

## 🛠️ Step 2: Add API Key to Project

Once you have your API key, add it to:

**File**: `server/.env`

```env
GEMINI_API_KEY=AIzaSyC_YOUR_ACTUAL_API_KEY_HERE
```

**Example**:
```env
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🚀 Step 3: Restart Backend Server

After adding the API key:

```bash
cd server
npm run dev
```

Or just save the `.env` file and nodemon will auto-restart!

---

## 🧪 Step 4: Test the Chatbot

1. **Open your app**: http://localhost:5173
2. **Click the button** (bottom-right): **"🤖 KLH Buddy"**
3. **Send a message**: 
   - "Tell me about KLH University"
   - "What events are happening?"
   - "How do I report a lost item?"
4. **See AI response!** 🎉

---

## 🎯 How It Works

### Architecture Flow:

```
User Input → ChatWidget (Frontend)
           ↓
    askChatbot() service
           ↓
    POST /api/chatbot
           ↓
    chatbotController.js
           ↓
    Google Gemini AI (gemini-1.5-flash model)
           ↓
    AI Response → Display in Chat
```

### Current Prompt:
```javascript
You are a helpful assistant for KLH University. 
Your name is "KLH Buddy". 
Answer questions about our campus platform.
If you don't know, say "I can only answer questions about KLH University."
```

---

## 🎨 UI Features

### Chat Widget:
- 📍 **Position**: Fixed bottom-right
- 🎨 **Theme**: Neon cyan with glassmorphism
- 📱 **Responsive**: Works on mobile and desktop
- 💬 **Messages**: User (cyan) vs Bot (pink)
- ⌨️ **Keyboard**: Press Enter to send
- 📜 **Scrollable**: Auto-scrolls to new messages

### Button States:
- **Closed**: "🤖 KLH Buddy"
- **Open**: "❌ Close Chat"
- **Sending**: Loading spinner

---

## 🔧 Advanced Configuration

### Customize the AI Prompt

**File**: `server/src/controllers/chatbotController.js`

```javascript
const prompt = `You are a helpful assistant for KLH University. 
Your name is "KLH Buddy". 

About KLH University:
- Located in Hyderabad, Telangana
- Offers undergraduate and postgraduate programs
- Strong focus on technology and innovation

Campus Platform Features:
- Lost & Found: Report and claim lost items with GPS
- Events: Students request events, Faculty/Admin approve
- Feedback: Submit grievances anonymously
- Real-time notifications with Socket.IO

Answer the following question: ${message}

If you don't know specific details, provide helpful general guidance.`
```

### Change AI Model

Currently using: `gemini-1.5-flash` (fastest, free)

Other options:
- `gemini-1.5-pro` (more capable, higher limits needed)
- `gemini-pro` (older version)

```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
```

### Add Rate Limiting

Install package:
```bash
npm install express-rate-limit
```

Add to controller:
```javascript
import rateLimit from 'express-rate-limit'

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // 50 requests per window
})

// Apply to route
router.post('/chatbot', chatLimiter, requireAuth, chat)
```

---

## 🐛 Troubleshooting

### Error: "Chatbot not configured"
**Cause**: `GEMINI_API_KEY` not set in `.env`
**Fix**: Add API key and restart server

### Error: "Failed to get response"
**Possible Causes**:
1. Invalid API key
2. Rate limit exceeded (60/min)
3. Network issues

**Debug**:
```bash
# Check server logs
cd server
npm run dev

# Look for chatbot errors
```

### Error: 401 Unauthorized
**Cause**: Invalid API key
**Fix**: Double-check API key in `.env`

### Error: 429 Too Many Requests
**Cause**: Exceeded free tier limits (60 requests/min)
**Fix**: Wait 1 minute or upgrade API plan

---

## 📊 API Limits (Free Tier)

| Metric | Limit |
|--------|-------|
| Requests per minute | 60 |
| Requests per day | 1,500 |
| Tokens per minute | 32,000 |
| Cost | **FREE** ✅ |

---

## 🎯 Example Conversations

### Example 1: Campus Info
**User**: "Tell me about KLH University"
**Bot**: "KLH University (Koneru Lakshmaiah Education Foundation) is a deemed university located in Hyderabad, Telangana. It offers various undergraduate and postgraduate programs with a focus on engineering, technology, and management..."

### Example 2: Feature Help
**User**: "How do I report a lost item?"
**Bot**: "To report a lost item on our Smart Campus platform: 1) Go to the Lost & Found section. 2) Click 'Report Item' and fill out the form. 3) You can add GPS location by clicking 'Detect My Location'. 4) Upload an optional photo. 5) Submit! Other students will be notified."

### Example 3: Event Requests
**User**: "Can I create an event?"
**Bot**: "If you're a Student, you need to submit an event request for approval by Faculty or Admin. Go to the Events page, click 'Request Event' tab, fill out the form, and submit. Faculty/Admin will review and approve/reject your request. If you're Faculty or Admin, you can create events directly!"

---

## 🚀 Next Steps (Optional Enhancements)

### 1. Add Context Memory
Store conversation history for context-aware responses

### 2. Add File Upload
Let users upload images for AI analysis

### 3. Add Voice Input
Integrate speech-to-text for voice messages

### 4. Add Typing Indicator
Show "KLH Buddy is typing..." animation

### 5. Add Quick Replies
Pre-defined buttons for common questions

### 6. Add Campus Data Integration
Connect to database to provide real-time stats:
- "How many events this month?"
- "Show me latest lost items"
- "Campus feedback summary"

---

## 📝 Testing Checklist

- [ ] Get Gemini API key from Google AI Studio
- [ ] Add key to `server/.env`
- [ ] Restart backend server
- [ ] Click "🤖 KLH Buddy" button
- [ ] Send test message
- [ ] Verify AI response appears
- [ ] Test multiple messages
- [ ] Test on mobile view
- [ ] Check server logs for errors

---

## ✅ Final Checklist

**Backend**:
- [x] `@google/generative-ai` package installed
- [x] `chatbotController.js` configured
- [x] `/api/chatbot` route working
- [ ] `GEMINI_API_KEY` in `.env` ← **YOU NEED THIS**

**Frontend**:
- [x] ChatWidget component created
- [x] Beautiful neon UI
- [x] Imported in App.jsx
- [x] Socket.IO integration ready

**Status**: ⚠️ **Waiting for API Key**

---

## 🎉 Once Configured

After adding the API key, your Smart Campus will have:

✅ **AI-Powered Chatbot**
✅ **24/7 Campus Assistant**
✅ **Instant Answers**
✅ **Beautiful UI**
✅ **Free Forever** (within limits)

---

**Need the API key? Get it here**: https://aistudio.google.com/app/apikey

**Questions?** The chatbot is fully configured and ready - just add the key! 🚀
