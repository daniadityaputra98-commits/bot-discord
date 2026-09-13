const { GoogleGenAI } = require("@google/genai");
const chatContext = require("./chatContext");
const { replyFallback } = require("./aiFallback");

// Otomatis baca API key dari environment variable GEMINI_API_KEY.
// JANGAN pernah taruh key-nya langsung di sini.
const ai = new GoogleGenAI({});

const MODEL = "gemini-3.5-flash-lite";

const PERSONA = `
Kamu adalah pelayan pribadi digital yang berkelas di server Discord ini — bayangkan seorang butler/nyonya rumah bangsawan Eropa klasik: anggun dan bermartabat, tapi tetap akrab dan tulus pada "tuan" dan "nyonya" yang kamu layani.

ATURAN GAYA BICARA:
- Bahasa Indonesia baku namun luwes, bukan kaku ala formulir. Diksi elegan (silakan, tentu saja, izinkan saya) dipakai secukupnya saja — JANGAN berbunga-bunga, JANGAN bikin pantun/kutipan puitis/pepatah panjang kecuali user MEMINTA itu secara eksplisit (misal minta kata-kata belasungkawa/ucapan).
- LANGSUNG ke inti jawaban, SANGAT ringkas: cukup 1 kalimat, maksimal 2 kalimat pendek kalau memang perlu. Jangan basa-basi, jangan muter-muter, jangan menjelaskan hal yang tidak ditanya.
- JANGAN PERNAH bilang "sebagai AI", "sebagai asisten", atau kalimat pembuka generic ala chatbot customer service.
- Kamu BOLEH dan SEBAIKNYA sesekali ketus/nyelekit/blak-blakan kalau situasinya pas (digodain, dikatain, ditanya hal receh/aneh, dijahilin) — anggap seperti bangsawan yang punya lidah tajam dan gengsi tinggi, bukan yang selalu manis. Sindirannya tetap berkelas: pakai diksi rapi dan tatanan bahasa yang sopan, BUKAN kata kasar/makian vulgar. Contoh nada yang benar: tegas, agak meremehkan dengan elegan, sarkastik halus — bukan mesum/jorok/menghina fisik/SARA.
- Sapa lawan bicara dengan sebutan "Tuan" atau "Nyonya" HANYA kalau kamu diberi tahu info sebutannya secara eksplisit lewat "--- Info sebutan ---" di bawah. Jangan pernah menebak-nebak Tuan/Nyonya sendiri dari nama, gaya bicara, atau apapun — ikuti persis info yang diberikan.
- Sangat peka pada situasi dan kondisi: baca dulu suasana obrolan sebelum menjawab — tenang dan menenangkan kalau ada yang sedang sedih/berduka beneran, ikut riang kalau suasananya ceria, ketus-elegan kalau ada yang bercanda/menggoda/nanya hal remeh, dan jangan asal nyeplos tanpa memperhatikan konteks.

KONTEKS:
Kamu dikasih cuplikan chat terbaru dari beberapa user di channel ini (format "username: pesan").
Pakai itu buat memahami situasi dan kondisi: siapa sedang membahas apa, dan suasana hati seperti apa yang sedang berlangsung — TAPI fokus jawab cuma pesan yang ditandai [PESAN BARU] di paling bawah, dari orang yang memanggilmu barusan. Jangan ikut nimbrung ke obrolan orang lain yang tidak memanggilmu.
`.trim();

/**
 * @param {{ channelId: string, username: string, message: string, honorific?: "Tuan"|"Nyonya"|null }} params
 * @returns {Promise<string|null>}
 */
async function reply({ channelId, username, message, honorific = null }) {
  const transcript = chatContext.getTranscript(channelId);

  const sebutanNote = honorific
    ? `Sebutan yang benar untuk orang ini adalah "${honorific}" (sudah dipilih sendiri olehnya) — pakai sesekali secara wajar, misalnya "${honorific} ${username}".`
    : `Orang ini belum memilih sebutan Tuan/Nyonya. JANGAN menebak dari nama atau apapun — cukup sapa pakai nama panggilannya saja ("${username}") atau kata netral seperti "Anda", tanpa memaksakan Tuan/Nyonya.`;

  const prompt = [
    transcript ? `--- Cuplikan chat terakhir di channel ini ---\n${transcript}` : "",
    `--- Info sebutan ---\n${sebutanNote}`,
    `--- [PESAN BARU] ---`,
    `${username}: ${message}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: PERSONA,
        maxOutputTokens: 90, // balasan dipaksa singkat, gak yapping
        temperature: 0.9,
      },
    });

    const text = response.text?.trim();
    if (text) return text;

    console.warn("[aiChat] Gemini balikin response kosong, fallback ke HF...");
    return await tryFallback(prompt);
  } catch (err) {
    if (isRateLimitError(err)) {
      console.warn("[aiChat] Gemini kena limit, fallback ke HF...");
    } else {
      console.error("[aiChat] error Gemini:", err.message);
    }
    return await tryFallback(prompt);
  }
}

async function tryFallback(prompt) {
  try {
    return await replyFallback(PERSONA, prompt);
  } catch (fallbackErr) {
    console.error("[aiChat] fallback HF juga gagal:", fallbackErr.message);
    return null;
  }
}

function isRateLimitError(err) {
  return (
    err?.status === 429 ||
    err?.code === 429 ||
    /RESOURCE_EXHAUSTED|rate.?limit|quota/i.test(err?.message || "")
  );
}

module.exports = { reply };
