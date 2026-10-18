import { prisma } from "./src/lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  console.log("Existing Users:", users);

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });
  console.log("Existing Categories:", categories);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
