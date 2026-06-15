import { io } from "socket.io-client";

// ✅ یه instance واحد برای کل اپ
const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    reconnection: true,
});

export default socket;
