const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for now, restrict in production
        methods: ["GET", "POST"],
    },
});

const PORT = process.env.PORT || 4000;

// Store active orders and their latest location
const orders = new Map(); // orderId -> { deliveryPartnerId, lat, lng, timestamp, status }

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Delivery Partner: Join room to broadcast updates
    // Although technically partner doesn't need to join room if we just broadcast TO room,
    // it might be useful for 2-way comms later.
    socket.on("join_track_room", (orderId) => {
        socket.join(orderId);
        console.log(`User ${socket.id} joined room: ${orderId}`);

        // Send last known location if available
        if (orders.has(orderId)) {
            socket.emit("location_update", orders.get(orderId));
        }
    });

    // Delivery Partner: Send location update
    socket.on("location_update", (data) => {
        // data: { orderId, lat, lng, timestamp, deliveryPartnerId }
        const { orderId, lat, lng, timestamp, deliveryPartnerId } = data;

        // Save latest state
        orders.set(orderId, data);

        console.log(`Location update for ${orderId}: ${lat}, ${lng}`);

        // Broadcast to everyone in the room (Customer Dashboard)
        // using .to(orderId) sends to everyone in room including sender if they are in it,
        // but usually dashboard is the one listening.
        io.to(orderId).emit("location_broadcast", data);
    });

    socket.on("order_delivered", (orderId) => {
        const orderData = orders.get(orderId) || { orderId };
        orderData.status = 'delivered';
        orders.set(orderId, orderData);

        io.to(orderId).emit("status_update", { status: 'delivered' });
        console.log(`Order ${orderId} delivered`);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`TRACKING SERVER RUNNING ON PORT ${PORT}`);
});
