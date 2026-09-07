import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  unreadUsers: {},
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const currentUser = useAuthStore.getState().authUser;
      const currentUserId = currentUser?._id || currentUser?.id;
      const res = await axiosInstance.get("/messages/users", {
        params: { userId: currentUserId },
      });
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const currentUser = useAuthStore.getState().authUser;
      const currentUserId = currentUser?._id || currentUser?.id;
      if (!currentUserId || !userId) return;
      const res = await axiosInstance.get(`/messages/${currentUserId}/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  markMessagesRead: async (userId) => {
    const currentUser = useAuthStore.getState().authUser;
    const currentUserId = currentUser?._id || currentUser?.id;
    if (!currentUserId || !userId) return;

    try {
      await axiosInstance.post("/messages/mark-seen", {
        senderId: userId,
        receiverId: currentUserId,
      });
      set((state) => ({
        users: state.users.map((user) => (
          user._id === userId ? { ...user, unreadCount: 0 } : user
        )),
        unreadUsers: { ...state.unreadUsers, [userId]: 0 },
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "خواندن پیام‌ها ناموفق بود");
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const currentUser = useAuthStore.getState().authUser;
    const senderId = currentUser?._id || currentUser?.id;
    try {
      const payload = messageData instanceof FormData
        ? messageData
        : { ...messageData, senderId };
      if (payload instanceof FormData) payload.append("senderId", senderId);
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "ارسال پیام ناموفق بود");
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set({ messages: get().messages.filter((message) => message._id !== messageId) });
    } catch (error) {
      toast.error(error.response?.data?.message || "حذف پیام ناموفق بود");
    }
  },

  deleteMessages: async (messageIds) => {
    try {
      await Promise.all(messageIds.map((messageId) => axiosInstance.delete(`/messages/${messageId}`)));
      set((state) => ({
        messages: state.messages.filter((message) => !messageIds.includes(message._id)),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "حذف پیام‌ها ناموفق بود");
    }
  },

  forwardMessage: async (message, receiverId) => {
    const currentUser = useAuthStore.getState().authUser;
    const senderId = currentUser?._id || currentUser?.id;

    try {
      const response = await axiosInstance.post(`/messages/send/${receiverId}`, {
        senderId,
        text: message.text || "",
        image: message.image || null,
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "فوروارد پیام ناموفق بود");
      return null;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  markUserRead: (userId) => {
    set((state) => ({
      unreadUsers: { ...state.unreadUsers, [userId]: false },
    }));
  },

  receiveSidebarMessage: (message) => {
    const currentUser = useAuthStore.getState().authUser;
    const currentUserId = currentUser?._id || currentUser?.id;
    if (!message || message.senderId === currentUserId) return;

    set((state) => ({
      users: state.users
        .map((user) => (
          user._id === message.senderId
            ? { ...user, lastMessage: message, unreadCount: (user.unreadCount || 0) + 1 }
            : user
        ))
        .sort((first, second) => {
          const unreadDifference = (second.unreadCount || 0) - (first.unreadCount || 0);
          if (unreadDifference) return unreadDifference;
          return new Date(second.lastMessage?.createdAt || 0) - new Date(first.lastMessage?.createdAt || 0);
        }),
      unreadUsers: { ...state.unreadUsers, [message.senderId]: (state.unreadUsers[message.senderId] || 0) + 1 },
    }));
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
