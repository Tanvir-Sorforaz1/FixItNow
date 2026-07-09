import dotenv from "dotenv";
import path from "path";


dotenv.config({path: path.join(process.cwd(), ".env") });


export default {
    port : process.env.PORT,
    database_url : process.env.DATABASE_URL,
    app_url : process.env.APP_URL,
    jwt_secret : process.env.JWT_SECRET,
    jwt_expires_in : process.env.JWT_EXPIRES_IN,
}