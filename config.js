require("dotenv").config();

module.exports = {
  // Prefix untuk command teks, contoh: wo join, wo jodoh, dst.
  prefix: process.env.PREFIX || "!",

  // Jeda minimum (ms) sebelum user yang sama bisa memicu balasan sapaan lagi.
  userCooldown: Number(process.env.USER_COOLDOWN || 1200),

  // Kata-kata yang dianggap "memanggil" bot (di luar mention/reply),
  // dipakai untuk balasan sapaan singkat & ramah.
  CALL_WORD_REGEX: /(?:^|\s)(?:wo+|wok|wo~+|woy+|oi+|bot|wowo|wowo~|bro|bang|min)(?=\s|$|[!?.,~])/iu,

  // === GIF OTOMATIS BERDASARKAN KATA KUNCI ===
  // Setiap ada pesan (bukan command) yang mengandung salah satu kata kunci
  // di bawah, bot otomatis kirim GIF yang cocok.
  //
  // Format key   : kata/frasa pemicu, boleh lebih dari satu dipisah "|"
  // Format value : STRING -> query pencarian ke GIPHY (butuh GIPHY_API_KEY)
  //                ARRAY  -> daftar URL GIF langsung, dipilih random,
  //                          TIDAK butuh API key sama sekali.
  //
  // Sudah dicampur ekspresi umum + istilah/slang yang lagi rame dipakai
  // anak Indonesia tahun 2026. Silakan edit/tambah sesuai selera server kamu.
  // Kata kunci pemicu tetap memakai bahasa gaul sehari-hari (biar bot tetap
  // "nyambung" saat member ngobrol santai), tapi GIF yang dikirim balik
  // sengaja dipilih bernuansa anggun/berkelas, sesuai karakter bot sekarang.
  GIF_KEYWORDS: {
    // --- ekspresi umum sehari-hari ---
    "wkwk|ngakak|kocak|lucu banget|awokwok": "elegant graceful laugh",
    "sedih|nangis|hiks|mewek": "gentle comfort hug elegant",
    "mantap|keren|gg|goks|gaskeun": "elegant applause well done",
    "marah|kesel|bete|emosi": "calm composed deep breath elegant",
    "kaget|anjay|anjir kaget": "elegant surprised gasp",
    "malu|salting": "shy bashful elegant blush",
    "capek|lelah|cape banget": "elegant tired sigh resting",
    "ngantuk": "elegant sleepy yawn",
    "laper|lapar": "elegant fine dining hungry",
    "gabut|bosen|boseng": "bored aristocrat waiting elegant",
    "selamat pagi|pagii|met pagi": "elegant good morning bow",
    "selamat malam|malem semua|met bobo": "elegant good night bow",
    "makasih|terima kasih|thanks|thx": "gracious thank you bow",
    "baper": "elegant blushing shy",
    "nolep|julid": "polite side eye elegant",

    // --- slang/tren 2026, dijawab dengan gestur berkelas ---
    "delulu": "elegant daydreaming fantasy",
    "rizz|jago rizz": "charming gentleman wink elegant",
    "cooked|udah cooked|abis cooked": "dramatic faint elegant",
    "aura|aura farming": "royal aura regal pose",
    "brainrot|brain rot": "elegant confused monocle",
    "lock in|lockin|fokus banget": "elegant focused determined",
    "bet|sip lah": "elegant nod approval",
    "gyat": "elegant scandalized fan face",
    "skibidi": "royal butler formal bow",
    "main character": "regal spotlight elegant walk",

    // --- aksi sayang / interaksi manis ke sesama user ---
    "peluk|hug dong": "elegant warm embrace",
    "cium|kiss|cup|cupp": "elegant hand kiss gentleman",
    "cuddle|cudle|meluk manja|bobo bareng": "elegant cozy embrace",
    "gemes|gemas|cubit pipi|cubit gemes": "affectionate elegant cheek",
    "elus|usap kepala|pat pat|puk puk": "gentle elegant pat head",
    "gandeng|gandengan tangan": "elegant holding hands walk",
    "dadah|bye bye|dadah dadah": "elegant graceful wave goodbye",
    "hai|halo|lambai": "elegant courteous bow greeting",
    "kedip|wink": "elegant charming wink",
    "high five|hifive|tos": "elegant polite high five",
    "sabar": "calm patience elegant",

    // --- aksi kocak / "berantem" ala meme, dibingkai jadi drama teatrikal ---
    "tampar|geplak|slap": "dramatic theatrical slap elegant",
    "tonjok|pukul|bogem mentah": "dramatic theatrical duel elegant",
    "jitak|jitakin": "playful scold elegant",
    "tendang|tendangin": "dramatic theatrical kick elegant",
    "dorong|dorongin": "dramatic theatrical push elegant",
    "kejar|kejar kejaran": "elegant chase ballroom playful",

    // --- gaul & interaksi lainnya ---
    "my bini|bini guweh|bini gw|calon bini": "elegant couple ballroom dance",
    "suami gua|suami guweh|suami gw": "elegant gentleman proposal",
    "apakah ini my|my kisah|kisah": "elegant storytelling narrator",
    "gebetan|crush|pdkt": "elegant shy romantic blush",
    "kena mental|mental breakdown": "dramatic elegant fainting couch",
    "healing|healing dulu": "elegant spa relaxation",
    "santuy|santai aja": "elegant relaxed tea time",
    "kepo|penasaran banget": "elegant curious peeking monocle",
    "pusing|migrain": "elegant headache dizzy",
    "nyerah|give up|udah gak kuat|nggak sanggup": "dramatic elegant surrender",
    "semangat|fighting|ganbatte": "elegant encouragement cheer",
    "pamer|flexing": "elegant proud showing off regal",
    "wowo|prabowo": "prabowo",
    "takut|takut banget|serem": "elegant startled fan face",
    "mole|login": ["https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHBsYTgwYmU5Y2FjMTI5ZDM3Nm5pdmVrejdyMmQ1YjAzNWF1Yml1YSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1mhPcNgITnbEnCIaR0/giphy.gif"],

    // Contoh pakai URL langsung tanpa API key (hapus komentar & isi linknya):
    // "halo|hai": ["https://media.tenor.com/xxxxxxxxxx/hi.gif"],
  },

  // Jeda minimum (ms) antar-pengiriman GIF otomatis per channel, biar tidak spam.
  gifCooldown: Number(process.env.GIF_COOLDOWN || 4000),

  // === SEBUTAN TUAN/NYONYA BERDASARKAN ROLE SERVER ===
  // Kalau member punya salah satu role di bawah, bot otomatis pakai sebutan
  // ini TANPA perlu command manual `!panggilan`. Cocokkan nama role PERSIS
  // (termasuk emoji/simbolnya) dengan yang ada di server Discord kamu.
  ROLE_HONORIFICS: {
    "🜲・Kings": "Tuan",
    "🜲・Cuties🥀": "Nyonya",
  },

  // === TES JODOH ===
  // Tingkatan hasil berdasarkan persentase (dicek dari atas ke bawah,
  // dipakai yang pertama cocok). Urutan "min" HARUS menurun.
  MATCH_TIERS: [
    { min: 90, text: "Langsung VC aja 💍✨", color: 0xff4d6d },
    { min: 70, text: "COCOK Sih, 😍", color: 0xff8fa3 },
    { min: 50, text: "Lumayan, coba dm dulu 👀", color: 0xffc2d1 },
    { min: 30, text: "Haha, Jas plennnn. 🤣", color: 0xffe5ec },
    { min: 0, text: "Kayaknya mending gausah kenal 😅", color: 0xdee2ff },
  ],

  // === KERANG AJAIB ===
  // Jawaban singkat & acak ala kerang ajaib. Sengaja lebih sering "Tidak"
  // biar sesuai spirit aslinya yang jawabannya suka nyebelin/ngasal.
  KERANG_ANSWERS: [
    "Tidak.",
    "Tidak.",
    "Tidak.",
    "TIDAK.",
    "Mungkin suatu hari nanti.",
    "Sepertinya tidak.",
    "Coba tanya lagi.",
    "Bisa jadi.",
    "Kemungkinan besar iya.",
    "Aku rasa begitu.",
    "Jangan harap.",
    "Tanyakan lagi lain kali.",
  ],
};
