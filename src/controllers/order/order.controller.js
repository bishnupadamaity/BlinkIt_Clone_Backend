import {
    Branch,
    Customer,
    DeliveryPartner,
    Order,
} from "../../models/index.js";

export const createOrder = async (req, reply) => {
    try {
        const { userId } = req.user;
        const { items, branch, totalPrice } = req.body;
        
        const customerData = await Customer.findById(userId);
        const branchData = await Branch.findById(branch);
        console.log(branchData);
        
        if (!customerData) {
            return reply.status(404).send({ message: "Customer not found" });
        }

        console.log(customerData.liveLocation.latitude)
        console.log(branchData.location.latitude);
        
        const newOrder = new Order({
            customer: userId,
            items: items.map((item) => ({
                id: item.id,
                item: item.item,
                count: item.count,
            })),
            branch,
            totalPrice,
            deliveryLocation: {
                latitude: customerData.liveLocation.latitude,
                longitude: customerData.liveLocation.longitude,
                address: customerData.address || "No address available",
            },
            pickupLocation: {
                latitude: branchData.location.latitude,
                longitude: branchData.location.longitude,
                address: branchData.address || "No address available",
            },
        });
        
        console.log("I am runned ------------------------------------------------------")
        const savedOrder = await newOrder.save();
        return reply
            .status(201)
            .send({ message: "Order created successfully", order: savedOrder });
    } catch (error) {
        console.log(error)
        return reply
            .status(500)
            .send({ message: "Failed to create order : ", error });
    }
};

export const confirmOrder = async (req, reply) => {
    try {
        const { orderId } = req.params;
        const { userId } = req.user;
        const { deliveryPersonLocation } = req.body;

        const deliveryPerson = await DeliveryPartner.findById(userId);
        if (!deliveryPerson) {
            return reply.status(404).send({ message: "Delivery person not found" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return reply.status(404).send({ message: "Order not found" });
        }
        if (order.status !== "available") {
            return reply.status(400).send({ message: "Order is not available" });
        }
        order.status = "confirmed";
        order.deliveryPerson = deliveryPerson._id;
        order.deliveryPersonLocation = {
            latitude: deliveryPersonLocation.latitude,
            longitude: deliveryPersonLocation.longitude,
            address: deliveryPerson.address || "No address available",
        };
        req.server.io.to(orderId).emit("orderConfirmed",order);
        const updatedOrder = await order.save();
        return reply
            .status(200)
            .send({ message: "Order confirmed successfully", order: updatedOrder });
    } catch (error) {
        return reply
            .status(500)
            .send({ message: "Failed to confirm order : ", error });
    }
};
export const updateOrderStatus = async (req, reply) => {
    try {

        const { orderId } = req.params;
        const { status, deliveryPersonLocation } = req.body;

        const { userId } = req.user;

        const deliveryPerson = await DeliveryPartner.findById(userId);
        if (!deliveryPerson) {
            return reply.status(404).send({ message: "Delivery person not found" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return reply.status(404).send({ message: "Order not found" });
        }

        if (['cancelled', 'delivered'].includes(order.status)) {
            return reply.status(400).send({ message: "Order is already cancelled or delivered" });
        }
        if (order.deliveryPartner.toString() !== userId) {
            return reply.status(400).send({ message: "You are not authorized " });
        }
        order.status = status;
        order.deliveryPerson = userId;
        order.deliveryPersonLocation = {
            latitude: deliveryPersonLocation.latitude,
            longitude: deliveryPersonLocation.longitude,
            address: deliveryPerson.address || "No address available",
        };
        const updatedOrder = await order.save();
        req.server.io.to(orderId).emit("liveTrackingUpdate", order);
        return reply
            .status(200)
            .send({ message: "Order status updated successfully", order: updatedOrder });

    } catch (error) {
        return reply
            .status(500)
            .send({ message: "Failed to update order status : ", error });
    }
};

export const getOrders = async (req, reply) => {
    try {
        const { status, customerId, deliveryPartnerId, branchId } = req.query;
        let query = {};
        if (status) {
            query.status = status;
        }
        if (customerId) {
            query.customer = customerId;
        }
        if (deliveryPartnerId) {
            query.deliveryPartner = deliveryPartnerId;
            query.branch = branchId;
        }
        const orders = await Order.find(query).populate("customer deliveryPartner item.item branch");
        return reply.send(orders);
    } catch (error) {
        return reply
            .status(500)
            .send({ message: "Failed to fetch orders : ", error });
    }
};

export const getOrderById = async (req, reply) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate("customer deliveryPartner item.item branch");
        if(!order) {
            return reply.status(404).send({ message: "Order not found" });
        }
        return reply.send(order);
    } catch (error) {
        return reply
            .status(500)
            .send({ message: "Failed to fetch order : ", error });
    }
}
