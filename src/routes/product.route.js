import fastify from "fastify";
import { getProductsByCategoryId } from "../controllers/product/product.controller.js";
import { getAllCategories } from "../controllers/product/category.controller.js";

export const categoryRoutes = async (fastify, options) => {
    fastify.get("/categories",
        // { preHandler: [fastify.authenticate] },
        getAllCategories);
}

export const productRoutes = async (fastify, options) => {
    fastify.get("/products/:categoryId",
        // { preHandler: [fastify.authenticate] },
        getProductsByCategoryId);
}