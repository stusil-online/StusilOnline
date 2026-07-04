require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.event.updateMany({ data: { status: 'completed' } });
  const events = await prisma.event.findMany();
  console.log(JSON.stringify(events, null, 2));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
