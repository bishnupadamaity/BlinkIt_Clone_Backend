import "dotenv/config"
import fastifySession from '@fastify/session';
import ConnectMongoDBSession from 'connect-mongodb-session';
import { Admin } from "../models/index.js";

const MongoDBStore = ConnectMongoDBSession(fastifySession)

export const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions',
    // expires: 1000 * 60 * 60 * 24
})
sessionStore.on("error",(error) => {
    console.log("Session Store Error : ", error);
})

export const authenticate = async (email, password) => {
    if (email && password) {
        const user = await Admin.findOne({ email })
        if (!user)
            return null;

        if (user.password === password)
            return Promise.resolve({ email: email, password: password });
        else return null
    }
    // if (email == 'bishnu@gmail.com' && password == '12345') {
    //     return Promise.resolve({ email: email, password: password });
    // }
    else return null;
}

export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;