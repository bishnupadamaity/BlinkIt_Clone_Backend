import "dotenv/config.js";
import { Customer, DeliveryPartner } from "../../models/user.model.js";
import jwt, { decode } from "jsonwebtoken";

const generateToken = (user) => {
    const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
    return { accessToken, refreshToken };
};

export const loginCustomer = async (req, reply) => {
    try {
        const { phone } = req.body;
        let customer = await Customer.findOne({ phone });
        if (!customer) {
            customer = await Customer.create({
                phone,
                role: "Customer",
                isActivated: true,
            });
            await customer.save();
        }

        const { accessToken, refreshToken } = generateToken(customer);
        return reply.send({
            message: customer
                ? "login successful"
                : "Customer created and logged in ",
            accessToken,
            refreshToken,
            customer,
        });
    } catch (error) {
        return reply.status(500).send({ message: "An error occurred" });
    }
};
export const loginDeliveryPartner = async (req, reply) => {
    try {
        const { email, password } = req.body;
        const deliveryPartner = await DeliveryPartner.findOne({ email });
        if (!deliveryPartner) {
            return reply.status(400).send({ message: "Delivery partner not found" });
        }

        const isMatch = password === deliveryPartner.password;
        if (!isMatch) {
            return reply.status(400).send({ message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = generateToken(deliveryPartner);
        return reply.send({
            message: "login successful",
            accessToken,
            refreshToken,
            deliveryPartner,
        });
    } catch (error) {
        return reply.status(500).send({ message: "An error occurred" });
    }
};

export const refreshToken = async (req, reply) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return reply.status(401).send({ message: "Refresh token required" });
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        let user;
        if (decoded.role === "Customer") {
            user = await Customer.findById(decoded.userId);
        } else if (decoded.role === "DeliveryPartner") {
            user = await DeliveryPartner.findById(decoded.userId);
        } else {
            return reply.status(403).send({ message: "Invalid refresh token" });
        }
        if (!user) {
            return reply.status(403).send({ message: "Invalid refresh token" });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateToken(user);
        return reply.send({message:"Refresh token refreshed", accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        return reply.status(403).send({ message: "Invalid refresh token" });
    }
};

export const fetchUser = async (req, reply) => {
    try {
        const { userId, role } = req.user;
        const user = role === "Customer" ? await Customer.findById(userId) : await DeliveryPartner.findById(userId);
        if (!user) {
            return reply.status(404).send({ message: "User not found" });
        }
        return reply.send({message:"User fetched successfully", user });
    } catch (error) {
        return reply.status(500).send({ message: "An error occurred" });
    }
}
