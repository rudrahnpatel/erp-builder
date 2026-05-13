const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const quotations = await prisma.quotation.findMany();
  for (const q of quotations) {
    console.log(`Q ${q.id}: ${q.clientName}`);
  }
}
main()
  .then(() => process.exit(0))
  .catch((e) => process.exit(1));
