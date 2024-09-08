import "dotenv/config.js";
import mongoose from "mongoose";
import { Category, Product } from "./src/models/index.js";
import {categories,products}from './seedData.js';

async function seedDatabase() {
    try {
        console.log("I have runned");
        await mongoose.connect(process.env.MONGO_URI);
        await Product.deleteMany({});
        await Category.deleteMany({});

        const categoryDocs = await Category.insertMany(categories);
        const categoryMaps = categoryDocs.reduce((map, category) => {
            map[category.name] = category._id;
            return map;
        }, {});
        
        const productWithCategoryIds = products.map((product) => (
            {
                ...product,
                category: categoryMaps[product.category]
            }
        ));
        await Product.insertMany(productWithCategoryIds);

        console.log("Database Seeded successfully ✅");
    } catch (error) {
        console.log("Seeding Error : ",error);
    } finally {
        mongoose.connection.close();
        console.log("DB CLOSED ✅");
    }
}

seedDatabase();