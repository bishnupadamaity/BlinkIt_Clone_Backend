import { Customer, DeliveryPartner } from "../../models/index.js";

export const updateUser = async (req, reply) => {
    try {
        const { userId } = req.user;
        const updatedData = req.body;

        let user = await Customer.findById(userId) || await DeliveryPartner.findById(userId);
        
        if(!user) {
            return reply.status(404).send({ message: "User not found" });
        }

        let UserModel;
        if(user.role === "Customer") {
            UserModel = Customer;
        } else if(user.role === "DeliveryPartner") {
            UserModel = DeliveryPartner;
        } else {
            return reply.status(400).send({ message: "Invalid use role" });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: updatedData },
            { new: true, runValidators: true }
        );
        if(updatedUser) {
            return reply.send({ message: "User updated successfully", user: updatedUser });
        }
    } catch (error) {
        return reply.send({message: "An error occurred"});
    }
}