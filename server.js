const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const {
  UniversalEdgeTTS,
  listVoicesUniversal
} = require("edge-tts-universal");

const app = express();

const PORT = process.env.PORT || 3000;

/* =========================
   VOICE CONFIG
========================= */

const VOICES = {
  bn: {
    voice: "bn-IN-TanishaaNeural",
    lang: "bn-IN",
    name: "Bengali - Tanishaa"
  },

  en: {
    voice: "en-US-AriaNeural",
    lang: "en-US",
    name: "English - Aria"
  },

  hi: {
    voice: "hi-IN-SwaraNeural",
    lang: "hi-IN",
    name: "Hindi - Swara"
  },

  ur: {
    voice: "ur-PK-UzmaNeural",
    lang: "ur-PK",
    name: "Urdu - Uzma"
  },

  ar: {
    voice: "ar-SA-ZariyahNeural",
    lang: "ar-SA",
    name: "Arabic - Zariyah"
  },

  es: {
    voice: "es-ES-ElviraNeural",
    lang: "es-ES",
    name: "Spanish - Elvira"
  },

  fr: {
    voice: "fr-FR-DeniseNeural",
    lang: "fr-FR",
    name: "French - Denise"
  },

  de: {
    voice: "de-DE-KatjaNeural",
    lang: "de-DE",
    name: "German - Katja"
  },

  ja: {
    voice: "ja-JP-NanamiNeural",
    lang: "ja-JP",
    name: "Japanese - Nanami"
  },

  ko: {
    voice: "ko-KR-SunHiNeural",
    lang: "ko-KR",
    name: "Korean - SunHi"
  },

  zh: {
    voice: "zh-CN-XiaoxiaoNeural",
    lang: "zh-CN",
    name: "Chinese - Xiaoxiao"
  }
};

/* =========================
   HELPERS
========================= */

function getVoice(lang) {
  return VOICES[lang] || VOICES.en;
}

function safeDelete(file) {
  fs.unlink(file, () => {});
}

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "Rakib TTS API",
    version: "2.0.0",
    engine: "Microsoft Edge Neural TTS",
    package: "edge-tts-universal",
    tokenRequired: false,

    endpoints: {
      health: "/health",
      voices: "/api/voices",
      tts: "/api/tts?text=Hello&lang=en"
    },

    languages: Object.keys(VOICES)
  });
});

/* =========================
   HEALTH
========================= */

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "online",
    service: "Rakib TTS API",
    engine: "Microsoft Edge Neural TTS",
    time: new Date().toISOString()
  });
});

/* =========================
   VOICES
========================= */

app.get("/api/voices", (req, res) => {
  res.json({
    success: true,
    count: Object.keys(VOICES).length,
    voices: VOICES
  });
});

/* =========================
   TTS
========================= */

app.get("/api/tts", async (req, res) => {
  const text = String(req.query.text || "").trim();

  const lang = String(
    req.query.lang || "en"
  )
    .trim()
    .toLowerCase();

  /* Text validation */

  if (!text) {
    return res.status(400).json({
      success: false,
      error: "Text is required",
      example:
        "/api/tts?text=Hello%20Rakib&lang=en"
    });
  }

  /* Limit */

  if (text.length > 2000) {
    return res.status(400).json({
      success: false,
      error: "Text too long",
      maxLength: 2000,
      received: text.length
    });
  }

  const config = getVoice(lang);

  const filename =
    `rakib-tts-${crypto.randomUUID()}.mp3`;

  const outputPath = path.join(
    os.tmpdir(),
    filename
  );

  try {
    console.log(
      `🎙️ TTS | ${config.voice} | ${text.slice(0, 80)}`
    );

    /* =========================
       CREATE TTS
    ========================= */

    const tts = new UniversalEdgeTTS(
      text,
      config.voice,
      {
        rate: "+0%",
        volume: "+0%",
        pitch: "+0Hz"
      }
    );

    const result = await tts.synthesize();

    if (!result || !result.audio) {
      throw new Error(
        "No audio received from Edge TTS"
      );
    }

    const buffer = Buffer.from(
      await result.audio.arrayBuffer()
    );

    if (!buffer.length) {
      throw new Error(
        "Generated audio is empty"
      );
    }

    /* =========================
       SAVE TEMP FILE
    ========================= */

    fs.writeFileSync(
      outputPath,
      buffer
    );

    console.log(
      `✅ Generated ${buffer.length} bytes`
    );

    /* =========================
       RESPONSE
    ========================= */

    res.setHeader(
      "Content-Type",
      "audio/mpeg"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${filename}"`
    );

    res.setHeader(
      "Content-Length",
      buffer.length
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    res.send(buffer);

    /* Cleanup */

    safeDelete(outputPath);

  } catch (error) {

    console.error(
      "❌ TTS ERROR:",
      error
    );

    safeDelete(outputPath);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate speech",
        message: error.message,
        voice: config.voice
      });
    }
  }
});

/* =========================
   404
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});

/* =========================
   START
========================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      "================================="
    );

    console.log(
      "🚀 Rakib TTS API v2.0.0"
    );

    console.log(
      `🌐 Port: ${PORT}`
    );

    console.log(
      "🎙️ Microsoft Edge Neural TTS"
    );

    console.log(
      "📦 edge-tts-universal"
    );

    console.log(
      "🔑 API Token: Not required"
    );

    console.log(
      "================================="
    );
  }
);
