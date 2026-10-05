# 🎙️ Rakib TTS API

<p align="center">
  <b>🚀 Fast • Natural • Funny • Multi-Language Text-to-Speech API</b>
</p>

<p align="center">
  Powered by Microsoft Edge TTS
</p>

---

## ✨ Features

- 🎙️ High-quality Microsoft Edge Neural Voices
- 🌐 Multi-language support
- 🇧🇩 Bangla voice support
- 🇺🇸 English voice support
- 👩 Female voice
- 👨 Male voice
- 😄 Light funny voice effect
- 🐢 Natural 0.75x slow speech
- ⚡ Simple REST API
- 📦 MP3 output
- 🔊 Suitable for Messenger/Facebook bots
- 🚀 Easy deployment on Render
- 🧹 Automatic temporary audio cleanup
- ❤️ Built for Tessa Prime Bot ecosystem

---

## 🌐 Live API

API Base URL:

https://rakib-tts-api.onrender.com

Health check:

https://rakib-tts-api.onrender.com/health

---

## 🔊 TTS Endpoint

Endpoint:

GET /api/tts

Full URL:

https://rakib-tts-api.onrender.com/api/tts

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| text | Yes | Text to convert into speech |
| lang | No | Language: bn / en |
| gender | No | 1 = Female, 2 = Male |

---

## 🇺🇸 English Female

Example:

https://rakib-tts-api.onrender.com/api/tts?text=Hello%20bro%20how%20are%20you&lang=en&gender=1

---

## 👨 English Male

Example:

https://rakib-tts-api.onrender.com/api/tts?text=Hello%20bro%20how%20are%20you&lang=en&gender=2

---

## 🇧🇩 Bangla Female

Example:

https://rakib-tts-api.onrender.com/api/tts?text=হ্যালো%20ভাই%20কেমন%20আছো&lang=bn&gender=1

---

## 🇧🇩 Bangla Male

Example:

https://rakib-tts-api.onrender.com/api/tts?text=হ্যালো%20ভাই%20কেমন%20আছো&lang=bn&gender=2

---

## 🎭 Voice Modes

The API automatically applies a light funny voice effect.

There is no need to send:

- cartoon
- funny
- speed
- effect

The API automatically handles the voice processing.

Current speech style:

- ⏱️ Speed: 0.75x
- 🎭 Effect: Light funny
- 🎙️ Voice: Mostly natural
- 🔊 Output: MP3

---

## 🎙️ Default Voices

### Bangla

Female:

bn-IN-TanishaaNeural

Male:

bn-BD-PradeepNeural

### English

Female:

en-US-AriaNeural

Male:

en-US-RogerNeural

---

## 📡 API Response

The /api/tts endpoint returns:

Content-Type:

audio/mpeg

The response body is the generated MP3 audio.

---

## 🩺 Health Check

Use:

https://rakib-tts-api.onrender.com/health

This endpoint can be used to check whether the API server is running.

---

## 🎤 Voice List

The API also provides a voice information endpoint:

GET /api/voices

Example:

https://rakib-tts-api.onrender.com/api/voices

You can use this endpoint to inspect available Edge TTS voices.

---

## 💻 Local Installation

Clone the repository:

git clone YOUR_REPOSITORY_URL

Enter the project:

cd rakib-tts-api

Install dependencies:

npm install

Start the server:

node server.js

The API will normally start on:

http://127.0.0.1:3000

---

## 📦 Required Packages

Main dependencies:

- express
- edge-tts-universal

The project also uses FFmpeg for audio processing.

---

## 🎧 FFmpeg

FFmpeg is required for the funny voice processing.

Ubuntu / Debian:

sudo apt update
sudo apt install ffmpeg -y

Check installation:

ffmpeg -version

---

## 🚀 PM2 Deployment

Install PM2:

npm install -g pm2

Start the API:

pm2 start server.js --name tts

Save PM2 process:

pm2 save

Enable startup:

pm2 startup

Check status:

pm2 status

View logs:

pm2 logs tts

Restart:

pm2 restart tts

---

## 🌍 Render Deployment

Recommended settings:

Build Command:

npm install

Start Command:

node server.js

The server automatically uses the PORT environment variable.

Default local port:

3000

---

## 🤖 Messenger Bot Usage

This API can be connected with Messenger bots such as:

- Tessa Prime Bot
- GoatBot
- Won-FCA based bots
- Custom Messenger bots

Example bot flow:

User:

tts Hello bro

Bot:


---

## 🧩 Central API Configuration

The bot can retrieve the TTS API URL from the central API configuration:

https://raw.githubusercontent.com/bdrakib6t9/HOON/main/apiUrl.json

Configuration key:

"tts"

Current API:

https://rakib-tts-api.onrender.com

This allows the bot to use the API without hardcoding the TTS server URL inside every command.

---

## 📁 Project Structure

rakib-tts-api/

 server.js
 package.json
 package-lock.json
 README.md

---

## 🔐 Security Notes

This API does not require a user API key for the basic TTS endpoint.

For public production deployments, consider adding:

- Rate limiting
- Request authentication
- Maximum request limits
- IP protection
- Abuse protection
- Request logging
- CORS restrictions if required

Do not expose private credentials or deployment secrets inside the source code.

---

## ⚡ Example with cURL

English:

curl -o output.mp3 "https://rakib-tts-api.onrender.com/api/tts?text=Hello%20Rakib&lang=en&gender=1"

Bangla:

curl -o output.mp3 "https://rakib-tts-api.onrender.com/api/tts?text=হ্যালো%20রাকিব&lang=bn&gender=1"

Male voice:

curl -o output.mp3 "https://rakib-tts-api.onrender.com/api/tts?text=Hello%20bro&lang=en&gender=2"

---

## 🛠️ Troubleshooting

### API is not responding

Check:

https://rakib-tts-api.onrender.com/health

Then check PM2:

pm2 status

And logs:

pm2 logs tts

### FFmpeg error

Install FFmpeg:

sudo apt update
sudo apt install ffmpeg -y

Then restart:

pm2 restart tts

### TTS generation fails

Check:

1. Internet connection
2. Edge TTS availability
3. FFmpeg installation
4. PM2 logs
5. API request parameters

---

## ❤️ Credits

Created by:

Rakib

Project:

Rakib TTS API

Built with:

Microsoft Edge TTS
+
Node.js
+
Express
+
FFmpeg

---

## 📜 License

This project is provided for personal and educational use.

Please respect the terms and policies of the services used by this project.

---

<p align="center">
  🎙️ Rakib TTS API
</p>

<p align="center">
  <b>Made with ❤️ by Rakib</b>
</p>
