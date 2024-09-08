import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number },
    quantity: { type: String, required: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
});

const Product = mongoose.model("Product", productSchema);
export default Product