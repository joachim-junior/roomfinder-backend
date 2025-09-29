const { prisma } = require("../src/utils/database");

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/deleteUser.js <email>");
    process.exit(1);
  }
  try {
    await prisma.user.delete({ where: { email } });
    console.log(`Deleted user: ${email}`);
  } catch (e) {
    console.error("Delete failed:", e && e.message ? e.message : e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
