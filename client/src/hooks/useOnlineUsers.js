import { useState, useEffect } from "react";
import socket from "./socket"; // ✅ shared instance

export const useOnlineUsers = (username) => {
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (!username) return;

        socket.emit("user_online", username);

        socket.on("online_users", (users) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off("online_users");
        };
    }, [username]);

    const isOnline = (targetUsername) => onlineUsers.includes(targetUsername);

    return { onlineUsers, isOnline };
};