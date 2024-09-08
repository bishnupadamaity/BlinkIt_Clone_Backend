import fastify from "fastify";
import { fetchUser, loginCustomer, loginDeliveryPartner, refreshToken } from "../controllers/auth/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { updateUser } from "../controllers/tracking/user.controller.js";

export const authRoutes = async (fastify, Options) => {
    fastify.post('/customer/login', loginCustomer);
    fastify.post('/delivery/login', loginDeliveryPartner);
    fastify.post('/refresh-token', refreshToken);
    fastify.get('/user', { preHandler: [verifyToken] }, fetchUser);
    fastify.patch('/user', { preHandler: [verifyToken] }, updateUser);

}