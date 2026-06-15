import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import socket from "./socket"; // ✅ shared instance

export const useChatLogic = (username, selectedUser, fetchChats) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [divD, setDiv] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, msgId: null });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

  const API_URL = "http://localhost:3001/api/messages";

  const updateConversation = async (senderUsername, receiverUsername, lastMessage) => {
    try {
      await axios.post("http://localhost:3001/api/conversations/update", {
        senderUsername, receiverUsername, lastMessage,
      });
    } catch (err) {
      console.error("Conversation update error:", err);
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!username || !selectedUser?.username) { setMessages([]); return; }
    try {
      const response = await axios.get(`${API_URL}/${username}/${selectedUser.username}`);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("خطا در دریافت پیام‌ها:", err);
      setMessages([]);
    }
  }, [username, selectedUser]);

  // ✅ UI + socket — بدون HTTP
  const markSeenLocally = useCallback((senderUsername) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.senderId === senderUsername && m.receiverId === username
          ? { ...m, seen: true }
          : m
      )
    );
    socket.emit("messages_seen", {
      senderId: senderUsername,
      receiverId: username,
    });
  }, [username]);

  // ✅ HTTP + local — موقع باز کردن چت
  const markMessagesAsSeen = useCallback(async () => {
    if (!username || !selectedUser?.username) return;
    try {
      await axios.post(`${API_URL}/mark-seen`, {
        senderId: selectedUser.username,
        receiverId: username,
      });
      markSeenLocally(selectedUser.username);
    } catch (err) {
      console.error("خطا در mark seen:", err);
    }
  }, [username, selectedUser, markSeenLocally]);

  // ✅ Socket listeners — یه بار mount
  useEffect(() => {
    socket.on("receive_message", (data) => {
      const currentSelected = selectedUserRef.current;
      const isCurrentChat =
        (data.senderId === username && data.receiverId === currentSelected?.username) ||
        (data.senderId === currentSelected?.username && data.receiverId === username);

      if (!isCurrentChat) return;

      setMessages((prev) => [...prev, data]);

      if (data.receiverId === username && currentSelected?.username) {
        axios.post(`${API_URL}/mark-seen`, {
          senderId: currentSelected.username,
          receiverId: username,
        }).catch(() => {});
        markSeenLocally(currentSelected.username);
      }
    });

    socket.on("message_deleted", (deletedId) => {
      setMessages((prev) => prev.filter((m) => m._id !== deletedId));
    });

    // ✅ تیک فرستنده سبز بشه
    socket.on("messages_seen_update", ({ senderId, receiverId }) => {
      const currentSelected = selectedUserRef.current;
      if (senderId === username && receiverId === currentSelected?.username) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === username && m.receiverId === currentSelected?.username
              ? { ...m, seen: true }
              : m
          )
        );
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_deleted");
      socket.off("messages_seen_update");
    };
  }, [username, markSeenLocally]);

  // ✅ لود + seen موقع سوییچ چت
  useEffect(() => {
    if (!selectedUser?.username) { setMessages([]); return; }
    fetchMessages().then(() => {
      markMessagesAsSeen();
    });
  }, [username, selectedUser]);

  useEffect(() => {
    const closeMenu = () => setContextMenu((prev) => ({ ...prev, show: false }));
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser?.username) return;
    try {
      const response = await axios.post(API_URL, {
        senderId: username, receiverId: selectedUser.username, text: newMessage,
      });
      const savedMessage = response.data;
      setMessages((prev) => [...prev, savedMessage]);
      socket.emit("send_message", savedMessage);
      await updateConversation(username, selectedUser.username, newMessage);
      await fetchChats?.();
      setNewMessage("");
    } catch (err) {
      console.error("خطا در ارسال پیام متنی:", err);
    }
  };

  const sendImageMessage = async () => {
    if (!selectedFile || !selectedUser?.username) return;
    try {
      const formData = new FormData();
      formData.append("senderId", username);
      formData.append("receiverId", selectedUser.username);
      formData.append("text", newMessage);
      formData.append("file", selectedFile);
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const savedMessage = response.data;
      setMessages((prev) => [...prev, savedMessage]);
      socket.emit("send_message", savedMessage);
      await updateConversation(username, selectedUser.username, newMessage || "فایل ارسال شد");
      await fetchChats?.();
      setNewMessage("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("خطا در ارسال عکس/فایل:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsModalOpen(true);
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const deleteMessage = async () => {
    if (!contextMenu.msgId) return;
    try {
      await axios.delete(`${API_URL}/${contextMenu.msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== contextMenu.msgId));
      socket.emit("delete_message", contextMenu.msgId);
      setContextMenu((prev) => ({ ...prev, show: false, msgId: null }));
    } catch (err) {
      console.error("خطا در حذف پیام:", err);
    }
  };

  const handleContextMenu = (e, msgId) => {
    e.preventDefault();
    const menuWidth = 150, menuHeight = 50;
    let posX = e.pageX, posY = e.pageY;
    if (posX + menuWidth > window.innerWidth) posX -= menuWidth;
    if (posY + menuHeight > window.innerHeight) posY -= menuHeight;
    setContextMenu({ show: true, x: posX, y: posY, msgId });
  };

  return {
    messages, setMessages, newMessage, setNewMessage,
    divD, setDiv,
    contextMenu, setContextMenu,
    selectedFile, setSelectedFile,
    previewUrl, setPreviewUrl,
    isModalOpen, setIsModalOpen,
    handleFileChange, openFilePicker,
    handleSendMessage, sendImageMessage,
    deleteMessage, handleContextMenu,
    fileInputRef, fetchMessages, markMessagesAsSeen,
  };
};