import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    sequenceValue: {
        type: Number,
        default:0,
        required: true
    },
});

const Counter = mongoose.model("Counter", counterSchema);
export default Counter