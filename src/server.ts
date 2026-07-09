import app from "./app.js";
import config from "./config/index.js";
import prisma from "./lib/prisma.js";

const port = Number(config.port ?? 5000);

async function main() {
    try {
        await prisma.$connect();
        console.log("Connected to the database successfully.");
       app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
       })
    } catch (error) {
        console.error("Error starting the server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

void main();