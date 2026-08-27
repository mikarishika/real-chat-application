import React from "react";
import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { Search } from "lucide-react";
import { getTheme } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";
const Sidebar = () => {
  const {
    getUsers,
    users,
    unreadUsers,
    selectedUser,
    setSelectedUser,
    markUserRead,
    markMessagesRead,
    receiveSidebarMessage,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers, authUser, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const palette = getTheme(theme);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const currentUserId = authUser?._id || authUser?.id;

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (!socket) return undefined;
    socket.on("newMessage", receiveSidebarMessage);
    return () => socket.off("newMessage", receiveSidebarMessage);
  }, [socket, receiveSidebarMessage]);

  const otherUsers = users
    .filter((user) => user._id !== currentUserId)
    .sort((first, second) => {
      const unreadDifference = (second.unreadCount || unreadUsers[second._id] || 0)
        - (first.unreadCount || unreadUsers[first._id] || 0);
      if (unreadDifference) return unreadDifference;
      return new Date(second.lastMessage?.createdAt || 0) - new Date(first.lastMessage?.createdAt || 0);
    });
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredUsers = otherUsers.filter((user) => {
    const matchesSearch = !normalizedQuery || [
      user.fullName,
      user.name,
      user.username,
      user.email,
    ].some((value) => value?.toLowerCase().includes(normalizedQuery));

    const matchesOnlineFilter = !showOnlineOnly || onlineUsers.includes(user._id);
    return matchesSearch && matchesOnlineFilter;
  });

  const getLastMessagePreview = (message) => {
    if (!message) return "";
    if (message.text?.trim()) return message.text;

    const files = Array.isArray(message.file) ? message.file : [message.file];
    const file = files.find(Boolean);
    if (!file) return message.image ? "Photo" : "";

    const type = file.type || "";
    if (type.startsWith("image/")) return "Photo";
    if (type.startsWith("video/")) return "Video";
    if (type.startsWith("audio/")) return "Audio";
    if (type === "application/pdf") return "PDF file";
    if (type.startsWith("text/") || type.includes("document")) return "Document";
    if (type.includes("zip") || type.includes("compressed")) return "Archive";
    return "File";
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside
      className="h-full w-20 min-w-[10rem] lg:w-72 lg:min-w-[18rem] flex flex-col overflow-hidden text-white transition-all duration-200"
      style={{
        backgroundColor: `${palette.colors[2]}d1`,
        borderRight: `1px solid ${palette.colors[1]}55`,
      }}
    >
      <div
        className="w-full min-w-0 border-b p-3 lg:p-5"
        style={{ borderColor: `${palette.colors[1]}55` }}
      >
        <div className="flex items-center gap-2 w-full min-w-0">
          <Users className="size-6 shrink-0 text-white/85" />
          <span className="truncate font-medium text-white/90">Contacts</span>
        </div>
        <label
          className="input flex items-center gap-2 w-full min-w-0 mt-4 h-10 text-white/80"
          style={{
            borderColor: `${palette.colors[1]}66`,
            backgroundColor: `${palette.colors[0]}55`,
          }}
        >
          <Search className="size-4 text-white/50 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="grow min-w-0 text-white placeholder:text-white/45 focus:outline-none"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <div className="mt-3 flex items-center gap-2 min-w-0">
          <label className="cursor-pointer flex items-center gap-2 min-w-0">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="truncate text-sm text-white/75">Show online only</span>
          </label>
          <span className="text-xs text-white/45 shrink-0">({Math.max(onlineUsers.length - 1, 0)} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3 min-w-0">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              markUserRead(user._id);
              markMessagesRead(user._id);
            }}
            className={`
              w-full p-3 flex items-center gap-3 min-w-0
              hover:bg-white/10 transition-colors
            `}
            style={selectedUser?._id === user._id ? {
              backgroundColor: `${palette.colors[1]}2e`,
            } : undefined}
          >
            <div className="relative mx-auto lg:mx-0 shrink-0">
              <img
                src={user.profilePic || "/avatar.svg"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-400 ring-2 ring-[#071a19]"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden min-w-0 flex-1 overflow-hidden text-left lg:block">
              <div className="flex items-center justify-between gap-2">
                <div className={`truncate font-medium ${(user.unreadCount || unreadUsers[user._id] || 0) > 0 ? "text-white" : ""}`}>
                  {user.fullName || user.name || user.username}
                </div>
                {onlineUsers.includes(user._id) && (
                  <span className="size-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399] mr-1" />
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className={`min-w-0 truncate text-sm ${(user.unreadCount || unreadUsers[user._id] || 0) > 0 ? "font-semibold text-white" : "text-white/55"}`}>
                  {getLastMessagePreview(user.lastMessage)}
                </div>
                {(user.unreadCount || unreadUsers[user._id] || 0) > 0 && (
                  <span className="ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-400 p-0 text-xs font-bold leading-none text-slate-950 shadow-[0_0_2px_#34d399]">
                    {user.unreadCount || unreadUsers[user._id]}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="py-4 text-center text-white/45">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
