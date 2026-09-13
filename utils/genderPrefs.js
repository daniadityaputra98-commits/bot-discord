// Nyimpen sebutan (Tuan/Nyonya) yang DIPILIH SENDIRI oleh tiap user,
// bukan hasil tebakan dari nama/avatar. Ini biar bot Cuma memanggil
// sesuai apa yang user itu sendiri mau, jadi selalu akurat.

const fs = require("fs");
const path = require("path");
const config = require("../config");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "genders.json");

const ALIASES = {
  pria: "pria", cowok: "pria", cowo: "pria", laki: "pria", "laki-laki": "pria", tuan: "pria", pak: "pria",
  wanita: "wanita", cewek: "wanita", cewe: "wanita", perempuan: "wanita", nyonya: "wanita", nona: "wanita", bu: "wanita",
  netral: null, reset: null, hapus: null, rahasia: null,
};

const LABEL = { pria: "Tuan", wanita: "Nyonya" };

function ensureFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}\n", "utf8");
}
function load() {
  ensureFile();
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return {}; }
}
function save(data) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/** @returns {"pria"|"wanita"|null} */
function get(userId) {
  const data = load();
  return data[userId] || null;
}

/** @returns {{ ok: boolean, value?: "pria"|"wanita"|null, error?: string }} */
function set(userId, rawInput) {
  const key = String(rawInput || "").trim().toLowerCase();
  if (!key || !(key in ALIASES)) {
    return { ok: false, error: "Pilihan tidak dikenali. Gunakan: `pria`, `wanita`, atau `netral` (untuk menghapus)." };
  }
  const value = ALIASES[key];
  const data = load();
  if (value) data[userId] = value; else delete data[userId];
  save(data);
  return { ok: true, value };
}

function honorific(userId) {
  const value = get(userId);
  return value ? LABEL[value] : null;
}

/**
 * Tentukan sebutan Tuan/Nyonya untuk sebuah GuildMember berdasarkan role
 * yang dia punya (lihat config.ROLE_HONORIFICS). Kalau member tidak punya
 * role yang cocok, kembalikan null (biar caller fallback ke cara lain).
 * @param {import("discord.js").GuildMember | null | undefined} member
 * @returns {"Tuan"|"Nyonya"|null}
 */
function honorificFromRoles(member) {
  if (!member?.roles?.cache) return null;
  const map = config.ROLE_HONORIFICS || {};
  for (const role of member.roles.cache.values()) {
    if (map[role.name]) return map[role.name];
  }
  return null;
}

/**
 * Cara resmi untuk dapetin sebutan seorang member: cek role dulu (paling
 * akurat & otomatis), baru fallback ke preferensi manual `!panggilan`.
 * @param {import("discord.js").GuildMember | null | undefined} member
 * @param {string} userId
 * @returns {"Tuan"|"Nyonya"|null}
 */
function resolveHonorific(member, userId) {
  return honorificFromRoles(member) || honorific(userId);
}

module.exports = { get, set, honorific, honorificFromRoles, resolveHonorific };
