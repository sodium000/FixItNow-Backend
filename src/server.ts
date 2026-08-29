import app from "./app";
import "dotenv/config"
import { prisma } from "./lib/prisma";
import config from "./config/index";
import { client } from "./lib/redis/redis";


const PORT = config.PORT

async function main() {
  try {
    await prisma.$connect()
    console.log("database connected");
    await client.connect()
     client.on("error", (err) => console.log("Redis Client Error", err))
    console.log("Redis connecting")
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
