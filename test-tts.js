const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const {
  MsEdgeTTS,
  OUTPUT_FORMAT
} = require("msedge-tts");

(async () => {
  try {
    console.log("🌐 DNS mode: ipv4first");

    const tts = new MsEdgeTTS({
      enableLogger: true
    });

    console.log("🔊 Connecting Edge TTS...");

    await tts.setMetadata(
      "en-US-GuyNeural",
      OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
      {
        voiceLocale: "en-US"
      }
    );

    console.log("✅ Metadata ready");

    const { audioStream } =
      tts.toStream("Hello bro, this is Rakib TTS API.");

    const chunks = [];
    let size = 0;

    audioStream.on("data", chunk => {
      chunks.push(Buffer.from(chunk));
      size += chunk.length;
      console.log("🎵 audio:", size, "bytes");
    });

    audioStream.on("end", () => {
      const audio = Buffer.concat(chunks);

      require("fs").writeFileSync(
        "test-edge.mp3",
        audio
      );

      console.log("✅ TTS SUCCESS");
      console.log("📦 Audio:", audio.length, "bytes");

      process.exit(0);
    });

    audioStream.on("error", err => {
      console.error("❌ STREAM ERROR:");
      console.error(err);
      process.exit(1);
    });

  } catch (err) {
    console.error("❌ TTS ERROR:");
    console.error(err);
    process.exit(1);
  }
})();
