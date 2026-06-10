const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const email = "stusil.online@gmail.com";
  const password = "stusil@098";
  
  // Hash the password with 10 salt rounds (standard for bcrypt)
  const password_hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password_hash,
      role: 'admin',
      is_verified: true,
      // Provide fallback for required fields if they get overwritten
      full_name: 'Admin',
    },
    create: {
      email,
      username: 'admin', // or could be extracted from email
      password_hash,
      role: 'admin',
      is_verified: true,
      full_name: 'Admin'
    }
  });

  console.log("✅ Admin user verified/registered successfully!");
  console.log("Email:", admin.email);
  console.log("Role:", admin.role);
}

main()
  .catch(e => {
    console.error("❌ Error registering admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
