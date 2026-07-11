import dotenv from "dotenv";
import path from "path";


dotenv.config({path: path.join(process.cwd(), ".env") });


const config = {
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    app_url: process.env.APP_URL,
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPIRES_IN,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_price_id: process.env.STRIPE_PRICE_ID,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
};

export default config;