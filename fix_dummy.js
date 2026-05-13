const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating Quotations...");
  const quotations = await prisma.quotation.findMany();
  for (const q of quotations) {
    if (q.clientName && q.clientName.includes("Dummy Client")) {
      const newName = q.clientName.replace("Dummy Client", "Acme Corp");
      
      // Update data JSON if it has receiver name
      const data = q.data;
      if (data && data.receiver && data.receiver.name) {
        data.receiver.name = data.receiver.name.replace("Dummy Client", "Acme Corp");
      }
      if (data && data.receiver && data.receiver.company) {
        data.receiver.company = data.receiver.company.replace("Dummy Client", "Acme Corp");
      }
      
      await prisma.quotation.update({
        where: { id: q.id },
        data: {
          clientName: newName,
          data: data
        }
      });
      console.log(`Updated quotation ${q.id}`);
    }
  }

  console.log("Updating Estimates...");
  const estimates = await prisma.estimate.findMany();
  for (const e of estimates) {
    if (e.clientName && e.clientName.includes("Dummy Client")) {
      const newName = e.clientName.replace("Dummy Client", "Acme Corp");
      
      const data = e.data;
      if (data && data.receiver && data.receiver.name) {
        data.receiver.name = data.receiver.name.replace("Dummy Client", "Acme Corp");
      }
      if (data && data.receiver && data.receiver.company) {
        data.receiver.company = data.receiver.company.replace("Dummy Client", "Acme Corp");
      }
      
      await prisma.estimate.update({
        where: { id: e.id },
        data: {
          clientName: newName,
          data: data
        }
      });
      console.log(`Updated estimate ${e.id}`);
    }
  }
}

main()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
