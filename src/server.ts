import app from "./app";
import "dotenv/config"
import { prisma } from "./lib/prisma";
import config from "./config";


const PORT = config.PORT

async function main() {
  try {
    await prisma.$connect()
    console.log("database connected")
    app.listen(PORT, () => {
      console.log(`Example app listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
