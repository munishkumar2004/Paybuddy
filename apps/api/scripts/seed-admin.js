require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

(async () => {
  try {
    const hash = await bcrypt.hash("1234", 10);

    const user = await prisma.user.upsert({
      where: { phone: "9000000001" },
      update: {
        pinHash: hash,
        isAdmin: true,
        isBlocked: false,
      },
      create: {
        name: "Admin",
        phone: "9000000001",
        pinHash: hash,
        balance: 0,
        isAdmin: true,
      },
    });

    console.log("✅ Admin ready:", user.phone, "| isAdmin:", user.isAdmin);

    // Verify
    const check = await bcrypt.compare("1234", user.pinHash);
    console.log("✅ PIN 1234 matches:", check);
  } catch (e) {
    console.error("❌ Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
})();