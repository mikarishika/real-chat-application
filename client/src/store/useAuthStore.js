import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { endpoints } from "../api/endpoints.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get(endpoints.checkAuth);

      if (!res.data.success) throw new Error("Authentication failed");
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post(endpoints.signup, {
        username: data.username || data.fullName,
        email: data.email,
        password: data.password,
      });
      if (!res.data.success) throw new Error(res.data.message || "Signup failed");
      set({ authUser: res.data.user });
      toast.success("Account created successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Signup failed");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });

    try {
      const res = await axiosInstance.post(endpoints.login, data);
      if (!res.data.success) throw new Error(res.data.message || "Login failed");
      set({ authUser: res.data.user });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message ||
        (error.code === "ERR_NETWORK"
          ? "Backend server is not running."
          : "Login failed.");

      toast.error(message);
      console.error("Login error:", error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post(endpoints.logout);
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      formData.append("username", get().authUser.username);
      formData.append("profileImage", data.profileImage);

      const res = await axiosInstance.post(endpoints.profileImage, formData);
      set({
        authUser: {
          ...get().authUser,
          profilePic: res.data.profilePic,
          profilePics: res.data.profilePics,
        },
      });
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || error.message || "Profile update failed");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  deleteProfileImage: async (url) => {
    try {
      const res = await axiosInstance.delete(endpoints.profileImage, {
        data: { username: get().authUser.username, url },
      });
      set({
        authUser: {
          ...get().authUser,
          profilePic: res.data.profilePic,
          profilePics: res.data.profilePics,
        },
      });
      toast.success("Profile photo removed");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Profile photo removal failed");
      return false;
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser.id || authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
    socket.on("online_users", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
