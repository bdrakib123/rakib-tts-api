const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");

const {
  UniversalEdgeTTS,
  listVoicesUniversal
} = require("edge-tts-universal");

const app = express();
const PORT = process.env.PORT || 3000;

let voices = [];

/*
|--------------------------------------------------------------------------
| Default voices
|--------------------------------------------------------------------------
| 1 = Female
| 2 = Male
*/
const DEFAULT_VOICES = {
  bn: {
    female: "bn-IN-TanishaaNeural",
    male: "bn-BD-PradeepNeural"
  },
  en: {
    female: "en-US-AriaNeural",
    male: "en-US-RogerNeural"
  }
};

/*
|--------------------------------------------------------------------------
| Load Edge TTS voices
|--------------------------------------------------------------------------
*/
async function loadVoices() {
  try {
    console.log("🔄 Loading Edge TTS voices...");

    const result = await listVoicesUniversal();

    if (Array.isArray(result)) {
      voices = result;
    } else if (result && Array.isArray(result.voices)) {
      voices = result.voices;
    } else {
      voices = [];
    }

    const male = voices.filter(
      v => String(v.gender || "").toLowerCase() === "male"
    ).length;

    const female = voices.filter(
      v => String(v.gender || "").toLowerCase() === "female"
    ).length;

    console.log(`✅ Loaded ${voices.length} Edge TTS voices`);
    console.log(`👨 Male voices: ${male}`);
    console.log(`👩 Female voices: ${female}`);

  } catch (error) {
    console.error(
      "❌ Voice loading failed:",
      error.message
    );
  }
}

/*
|--------------------------------------------------------------------------
| Normalize language
|--------------------------------------------------------------------------
*/
function normalizeLanguage(lang) {
  const value = String(lang || "en").toLowerCase().trim();

  if (
    value === "bn" ||
    value === "bangla" ||
    value === "bengali" ||
    value.startsWith("bn-")
  ) {
    return "bn";
  }

  return "en";
}

/*
|--------------------------------------------------------------------------
| Normalize gender
|--------------------------------------------------------------------------
|
| 1 = Female
| 2 = Male
|
*/
function normalizeGender(gender) {
  const value = String(gender || "1")
    .toLowerCase()
    .trim();

  if (
    value === "2" ||
    value === "male" ||
    value === "m"
  ) {
    return "male";
  }

  return "female";
}

/*
|--------------------------------------------------------------------------
| Get voice
|--------------------------------------------------------------------------
*/
function getVoice(lang, gender, requestedVoice) {

  /*
   * Manual voice request
   */
  if (requestedVoice) {
    const requested = String(requestedVoice)
      .toLowerCase()
      .trim();

    const found = voices.find(
      v =>
        String(v.name || "")
          .toLowerCase()
          .trim() === requested
    );

    if (found) {
      return found.name;
    }
  }

  /*
   * Default voice
   */
  return DEFAULT_VOICES[lang][gender];
}

/*
|--------------------------------------------------------------------------
| Cartoon / Funny audio effect
|--------------------------------------------------------------------------
|
| Female:
|   +5 semitones
|
| Male:
|   +6 semitones
|
| The pitch is increased while keeping the duration
| approximately the same.
|
*/
function getCartoonFilter(gender) {
  // 25% slower + mostly natural voice
  const pitch = gender === "male" ? 0.5 : 0.3;

  return [
    `asetrate=44100*${Math.pow(2, pitch / 12).toFixed(4)}`,
    "aresample=44100",
    "atempo=0.75",
    "equalizer=f=2500:t=q:w=1:g=0.8",
    "acompressor=threshold=-20dB:ratio=1.5:attack=20:release=150",
    "volume=1.0"
  ].join(",");
}

/*
|--------------------------------------------------------------------------
| Apply cartoon effect using FFmpeg
|--------------------------------------------------------------------------
*/
function applyCartoonEffect(
  inputFile,
  outputFile,
  gender
) {
  return new Promise((resolve, reject) => {

    const filter = getCartoonFilter(gender);

    execFile(
      "ffmpeg",
      [
        "-y",
        "-i",
        inputFile,

        "-af",
        filter,

        "-codec:a",
        "libmp3lame",

        "-b:a",
        "128k",

        outputFile
      ],
      {
        timeout: 120000
      },
      (error, stdout, stderr) => {

        if (error) {
          console.error(
            "❌ FFmpeg error:",
            error.message
          );

          console.error(stderr);

          return reject(error);
        }

        resolve(outputFile);
      }
    );
  });
}

/*
|--------------------------------------------------------------------------
| Home
|--------------------------------------------------------------------------
*/
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "🚀 Rakib TTS API Running",
    version: "2.0.0",
    defaultLanguage: "en",
    defaultGender: "female",
    cartoonMode: true,
    endpoints: [
      "/",
      "/health",
      "/api/voices",
      "/api/tts"
    ]
  });
});

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/
app.get("/health", (req, res) => {
  res.json({
    status: true,
    service: "Rakib TTS API",
    voices: voices.length,
    cartoonMode: true,
    ffmpeg: true,
    defaults: {
      language: "en",
      gender: "female"
    }
  });
});

/*
|--------------------------------------------------------------------------
| Voices
|--------------------------------------------------------------------------
*/
app.get("/api/voices", (req, res) => {

  const {
    lang,
    gender
  } = req.query;

  let result = voices;

  if (lang) {
    result = result.filter(v =>
      String(v.locale || "")
        .toLowerCase()
        .startsWith(
          String(lang).toLowerCase()
        )
    );
  }

  if (gender) {
    result = result.filter(v =>
      String(v.gender || "")
        .toLowerCase() ===
      String(gender).toLowerCase()
    );
  }

  res.json({
    status: true,
    total: result.length,
    filters: {
      lang: lang || null,
      gender: gender || null
    },
    voices: result
  });
});

/*
|--------------------------------------------------------------------------
| TTS
|--------------------------------------------------------------------------
|
| Examples:
|
| /api/tts?text=Hello
| /api/tts?text=Hello&lang=en
| /api/tts?text=Hello&lang=en&gender=2
| /api/tts?text=Hello&lang=bn&gender=1
|
|--------------------------------------------------------------------------
*/
app.get("/api/tts", async (req, res) => {

  let {
    text,
    lang = "en",
    gender = "1",
    voice
  } = req.query;

  let rawFile = null;
  let finalFile = null;

  try {

    /*
     * Validate text
     */
    if (!text) {
      return res.status(400).json({
        status: false,
        error: "Text is required"
      });
    }

    text = String(text).trim();

    if (!text) {
      return res.status(400).json({
        status: false,
        error: "Text is empty"
      });
    }

    /*
     * Maximum text
     */
    if (text.length > 2000) {
      return res.status(400).json({
        status: false,
        error: "Maximum text length is 2000 characters"
      });
    }

    /*
     * Normalize
     */
    lang = normalizeLanguage(lang);
    gender = normalizeGender(gender);

    /*
     * Select voice
     */
    const selectedVoice = getVoice(
      lang,
      gender,
      voice
    );

    console.log(
      `🎙️ TTS request | lang=${lang} | gender=${gender} | voice=${selectedVoice}`
    );

    /*
     * Generate TTS
     */
    const tts = new UniversalEdgeTTS(
      text,
      selectedVoice
    );

    const result = await tts.synthesize();

    const audioBuffer = Buffer.from(
      await result.audio.arrayBuffer()
    );

    /*
     * Unique temp files
     */
    const id =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

    rawFile = path.join(
      os.tmpdir(),
      `rakib-tts-raw-${id}.mp3`
    );

    finalFile = path.join(
      os.tmpdir(),
      `rakib-tts-cartoon-${id}.mp3`
    );

    /*
     * Save raw TTS
     */
    fs.writeFileSync(
      rawFile,
      audioBuffer
    );

    console.log(
      `📦 Raw audio: ${audioBuffer.length} bytes`
    );

    /*
     * Always apply cartoon/funny effect
     */
    await applyCartoonEffect(
      rawFile,
      finalFile,
      gender
    );

    /*
     * Read final audio
     */
    const finalBuffer =
      fs.readFileSync(finalFile);

    console.log(
      `🎨 Cartoon audio: ${finalBuffer.length} bytes`
    );

    /*
     * Cleanup temp files
     */
    try {
      if (fs.existsSync(rawFile)) {
        fs.unlinkSync(rawFile);
      }

      if (fs.existsSync(finalFile)) {
        fs.unlinkSync(finalFile);
      }
    } catch {}

    rawFile = null;
    finalFile = null;

    /*
     * Send MP3
     */
    res.setHeader(
      "Content-Type",
      "audio/mpeg"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="say-${id}.mp3"`
    );

    res.setHeader(
      "Content-Length",
      finalBuffer.length
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.send(finalBuffer);

  } catch (error) {

    console.error(
      "❌ TTS Error:",
      error
    );

    /*
     * Cleanup after error
     */
    try {
      if (
        rawFile &&
        fs.existsSync(rawFile)
      ) {
        fs.unlinkSync(rawFile);
      }

      if (
        finalFile &&
        fs.existsSync(finalFile)
      ) {
        fs.unlinkSync(finalFile);
      }
    } catch {}

    return res.status(500).json({
      status: false,
      error:
        error.message ||
        "TTS generation failed"
    });
  }
});

/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/
(async () => {

  await loadVoices();

  app.listen(PORT, () => {
    console.log(
      `🚀 Rakib TTS API running on port ${PORT}`
    );

    console.log(
      "🎨 Cartoon/Funny mode: ENABLED"
    );

    console.log(
      "👩 Default: Female (1)"
    );

    console.log(
      "👨 Male: 2"
    );
  });

})();
