/**
 * سید کاربران - اجرا با:
 *   node src/scripts/seed.js
 *
 * این فایل رو تو مسیر server/src/scripts/seed.js بذار،
 * چون مسیرهای require زیر بر همین اساس نوشته شدن.
 */
const bcrypt = require("bcrypt");
const chatDb = require("../config/chatDb");
const { User: UserModel } = require("../model/users");

// تنظیمات آواتار (DiceBear - استایل Micah)
const AVATAR_BASE = "https://api.dicebear.com/7.x/micah/svg";
const MOUTH = "smile,laughing,smirk"; // فقط حالت‌های لبخند/خنده
const BG_COLORS = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "c1f4c5", "f4e3b6", "e3b6f4"];
const SKIN_TONES = ["f2b280", "e8a874", "d68a5c", "c47a4a"];
const HAIR_COLORS = ["1c0a00", "2c1608", "0d0d0d", "3b2410"];

const buildAvatar = (name, index) => {
  const bg = BG_COLORS[index % BG_COLORS.length];
  const skin = SKIN_TONES[index % SKIN_TONES.length];
  const hair = HAIR_COLORS[index % HAIR_COLORS.length];
  const seed = encodeURIComponent(name);
  return `${AVATAR_BASE}?seed=${seed}&backgroundColor=${bg}&mouth=${MOUTH}&baseColor=${skin}&hairColor=${hair}`;
};

const rawUsers = [
  // خانم‌ها
  { name: "Sara Ahmadi", email: "sara.ahmadi@example.com" },
  { name: "Niloofar Karimi", email: "niloofar.karimi@example.com" },
  { name: "Elnaz Hosseini", email: "elnaz.hosseini@example.com" },
  { name: "Yasaman Rezaei", email: "yasaman.rezaei@example.com" },
  { name: "Parisa Moradi", email: "parisa.moradi@example.com" },
  { name: "Setareh Norouzi", email: "setareh.norouzi@example.com" },
  { name: "Mahsa Ghasemi", email: "mahsa.ghasemi@example.com" },
  { name: "Roya Sadeghi", email: "roya.sadeghi@example.com" },
  // آقایون
  { name: "Amirreza Jafari", email: "amirreza.jafari@example.com" },
  { name: "Kian Farahani", email: "kian.farahani@example.com" },
  { name: "Arash Mohammadi", email: "arash.mohammadi@example.com" },
  { name: "Pouya Najafi", email: "pouya.najafi@example.com" },
  { name: "Reza Sharifi", email: "reza.sharifi@example.com" },
  { name: "Navid Rostami", email: "navid.rostami@example.com" },
];

const users = rawUsers.map((u, i) => ({
  ...u,
  userId: `seed_${String(i + 1).padStart(3, "0")}`,
  username: u.email.split("@")[0],
  fullName: u.name,
  profilePic: buildAvatar(u.name, i),
  password: "123456",
}));

const seed = async () => {
  try {
    await new Promise((resolve, reject) => {
      if (chatDb.readyState === 1) return resolve();
      chatDb.once("connected", resolve);
      chatDb.once("error", reject);
    });
    console.log("✅ به دیتابیس متصل شد");

    const emails = users.map((u) => u.email);
    await UserModel.deleteMany({ email: { $in: emails } });

    // با create (نه insertMany) صدا می‌زنیم تا هوک pre("save") فعال بشه
    // و پسورد هر کاربر هش بشه
    for (const userData of users) {
      const user = await UserModel.create({
        ...userData,
        password: await bcrypt.hash(userData.password, 10),
      });
      console.log(`👤 ساخته شد: ${user.name} (${user.email})`);
    }

    console.log(`🌱 سید با موفقیت انجام شد (${users.length} کاربر)`);
  } catch (error) {
    console.error("❌ خطا در سید کردن:", error);
  } finally {
    await chatDb.close();
    process.exit(0);
  }
};

seed();
