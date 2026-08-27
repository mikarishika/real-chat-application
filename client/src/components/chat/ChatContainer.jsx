import React from "react";
import { useChatStore } from "../../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import AttachmentRenderer from "../attachments/AttachmentRenderer";
import ImageLightbox from "../attachments/ImageLightbox";
import { useAuthStore } from "../../store/useAuthStore";
import { formatMessageTime } from "../../lib/utils";
import { Copy, Forward, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { getTheme } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";

const isImageFile = (file = {}) => {
  if (!file) return false;
  const imageExtensions = /\.(avif|bmp|gif|heic|heif|jpe?g|png|webp)$/i;
  return file.type?.startsWith("image/") || imageExtensions.test(file.name || file.url || "");
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    deleteMessages,
    forwardMessage,
    users,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const messageEndRef = useRef(null);
  const currentUserId = authUser?._id || authUser?.id;
  const palette = getTheme(theme);
  const [contextMenu, setContextMenu] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [forwardSearchQuery, setForwardSearchQuery] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [lightbox, setLightbox] = useState({
    images: [],
    index: 0,
    thumbnailImages: [],
    thumbnailIndex: 0,
  });
  const [droppedFiles, setDroppedFiles] = useState([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const selectingMessagesRef = useRef(false);
  const skipSelectionClickRef = useRef(false);
  const pointerStartRef = useRef(null);

  useEffect(() => {
    const closeContextMenu = () => setContextMenu(null);
    const stopSelectingMessages = () => {
      selectingMessagesRef.current = false;
      pointerStartRef.current = null;
    };
    const closeLightbox = (event) => {
      if (event.key === "Escape") setLightbox({ images: [], index: 0, thumbnailImages: [], thumbnailIndex: 0 });
    };
    window.addEventListener("click", closeContextMenu);
    window.addEventListener("pointerup", stopSelectingMessages);
    window.addEventListener("keydown", closeLightbox);
    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("pointerup", stopSelectingMessages);
      window.removeEventListener("keydown", closeLightbox);
    };
  }, []);

  const handleCopy = async (message) => {
    const copyValue = message.text || message.image || "";
    if (!copyValue) return;
    await navigator.clipboard.writeText(copyValue);
    toast.success("پیام کپی شد");
    setContextMenu(null);
  };

  const getFileUrl = (url) => {
    if (!url) return "";
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    const backendUrl = import.meta.env.MODE === "development" ? "http://localhost:3001" : "";
    return `${backendUrl}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const getConversationImages = () => messages.flatMap((message) => {
    if (Array.isArray(message.file)) {
      return message.file
        .filter(isImageFile)
        .map((file) => getFileUrl(file.url));
    }

    if (isImageFile(message.file)) {
      return [getFileUrl(message.file.url)];
    }

    return message.image ? [getFileUrl(message.image)] : [];
  });

  const getMessageImageGroups = () => messages.map((message) => {
    if (Array.isArray(message.file)) {
      return message.file
        .filter(isImageFile)
        .map((file) => getFileUrl(file.url));
    }

    if (isImageFile(message.file)) {
      return [getFileUrl(message.file.url)];
    }

    return message.image ? [getFileUrl(message.image)] : [];
  }).filter((group) => group.length);

  const updateLightboxIndex = (index) => {
    setLightbox((current) => {
      const selectedImage = current.images[index];
      const nextGroup = getMessageImageGroups().find((group) => group.includes(selectedImage));
      const nextThumbnailIndex = nextGroup ? nextGroup.indexOf(selectedImage) : 0;

      return {
        ...current,
        index,
        thumbnailImages: nextGroup || current.thumbnailImages,
        thumbnailIndex: nextThumbnailIndex,
      };
    });
  };

  const openConversationLightbox = (images, localIndex) => {
    const conversationImages = getConversationImages();
    const selectedImage = images[localIndex];
    const conversationIndex = conversationImages.indexOf(selectedImage);
    const lightboxImages = conversationIndex >= 0 ? conversationImages : images;

    setLightbox({
      images: lightboxImages,
      index: conversationIndex >= 0 ? conversationIndex : localIndex,
      thumbnailImages: images,
      thumbnailIndex: localIndex,
    });
  };

  const handleForward = async (receiverId) => {
    const messagesToForward = selectionMode
      ? messages.filter((message) => selectedMessageIds.includes(message._id))
      : [forwardingMessage];
    for (const message of messagesToForward) {
      await forwardMessage(message, receiverId);
    }
    if (messagesToForward.length) toast.success(`${messagesToForward.length} message(s) forwarded`);
    setForwardingMessage(null);
    setForwardSearchQuery("");
    setContextMenu(null);
    setSelectionMode(false);
    setSelectedMessageIds([]);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessageIds((ids) => {
      if (!ids.includes(messageId)) return [...ids, messageId];

      const nextIds = ids.filter((id) => id !== messageId);
      if (!nextIds.length) setSelectionMode(false);
      return nextIds;
    });
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedMessageIds([]);
  };

  useEffect(() => {
    if (!selectedUser) return undefined;
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!selectedUser) return null;

  return (
    <div
      className="relative flex-1 flex flex-col overflow-auto"
      onDragEnter={(event) => {
        event.preventDefault();
        if (event.dataTransfer.types.includes("Files")) setIsDraggingFiles(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setIsDraggingFiles(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDraggingFiles(false);
        setDroppedFiles(Array.from(event.dataTransfer.files || []));
      }}
    >
      {isDraggingFiles && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center border-2 border-dashed border-white/70 bg-black/45 text-lg font-semibold text-white">
          Drop files to attach
        </div>
      )}
      <ChatHeader />

      {selectionMode && (
        <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: `${palette.colors[1]}44` }}>
            <span className="text-sm text-white/75">{selectedMessageIds.length} selected</span>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-xs border-0 bg-red-400/15 text-red-200"
                disabled={!selectedMessageIds.length}
                onClick={() => {
                  deleteMessages(selectedMessageIds);
                  clearSelection();
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
              <button
                className="btn btn-xs border-0 bg-white/10 text-white"
                disabled={!selectedMessageIds.length}
                onClick={() => {
                  setForwardingMessage({ bulk: true });
                  setForwardSearchQuery("");
                  setContextMenu({
                    message: null,
                    x: Math.max(12, window.innerWidth - 300),
                    y: 120,
                  });
                }}
              >
                <Forward size={14} /> Send
              </button>
              <button className="btn btn-square btn-xs border-0 bg-white/10 text-white" onClick={clearSelection}>
                <X size={14} />
              </button>
            </div>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ backgroundColor: `${palette.colors[2]}cc` }}
      >
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat relative select-none ${message.senderId === currentUserId ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              pointerStartRef.current = {
                id: message._id,
                x: event.clientX,
                y: event.clientY,
              };
              selectingMessagesRef.current = false;
              skipSelectionClickRef.current = false;
            }}
            onPointerMove={(event) => {
              const pointerStart = pointerStartRef.current;
              if (!pointerStart || selectingMessagesRef.current) return;

              const deltaX = event.clientX - pointerStart.x;
              const deltaY = event.clientY - pointerStart.y;
              if (Math.abs(deltaY) < 8 || Math.abs(deltaY) <= Math.abs(deltaX)) return;

              selectingMessagesRef.current = true;
              skipSelectionClickRef.current = true;
              setSelectionMode(true);
              toggleMessageSelection(pointerStart.id);
              if (message._id !== pointerStart.id) {
                setSelectedMessageIds((ids) => ids.includes(message._id) ? ids : [...ids, message._id]);
              }
            }}
            onPointerEnter={() => {
              if (selectingMessagesRef.current) {
                setSelectionMode(true);
                setSelectedMessageIds((ids) => ids.includes(message._id) ? ids : [...ids, message._id]);
              }
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              setForwardingMessage(null);
              setForwardSearchQuery("");
              setContextMenu({
                message,
                x: Math.max(12, Math.min(event.clientX - 180, window.innerWidth - 280)),
                y: Math.min(event.clientY, window.innerHeight - 180),
              });
            }}
            onClick={(event) => {
              if (selectingMessagesRef.current || skipSelectionClickRef.current) {
                event.preventDefault();
                skipSelectionClickRef.current = false;
              }
            }}
          >
            <div className=" chat-image avatar">
              <div
                className="size-10 rounded-full border"
                style={{ borderColor: `${palette.colors[1]}66` }}
              >
                <img
                  src={
                    message.senderId === currentUserId
                      ? authUser.profilePic || "/avatar.svg"
                      : selectedUser.profilePic || "/avatar.svg"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="ml-1 text-xs text-white/45">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div
                className={`chat-bubble relative flex flex-col shadow-sm ${
                  message.image ||
                  (message.file &&
                    (Array.isArray(message.file)
                      ? message.file.some(isImageFile)
                      : isImageFile(message.file)))
                    ? "p-0"
                    : ""
                }`}
              style={
                message.senderId === currentUserId
                  ? { backgroundColor: palette.colors[1], color: palette.colors[2] }
                  : { backgroundColor: `${palette.colors[0]}aa`, color: "white" }
              }
            >
              {selectionMode && (
                <input
                  type="checkbox"
                  checked={selectedMessageIds.includes(message._id)}
                  onChange={() => toggleMessageSelection(message._id)}
                  onClick={(event) => event.stopPropagation()}
                  style={{
                    accentColor: palette.colors[1],
                    borderColor: palette.colors[1],
                    "--chkbg": palette.colors[1],
                    "--chkfg": palette.colors[2],
                  }}
                  className={`checkbox checkbox-sm absolute top-1/2 z-[60] m-0 -translate-y-1/2 cursor-pointer bg-base-100 shadow-md ${
                    message.senderId === currentUserId
                      ? "left-0 -ml-[18px] -translate-x-full"
                      : "right-0 -mr-[18px] translate-x-full"
                  }`}
                />
              )}
              {(message.file || message.image) && (
                <AttachmentRenderer
                  attachment={message.file || {
                    url: message.image,
                    type: "image/*",
                    name: "Image attachment",
                  }}
                  onImageClick={openConversationLightbox}
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 min-w-56 max-w-64 overflow-hidden rounded-lg border p-1 shadow-xl backdrop-blur"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: `${palette.colors[2]}f5`,
            borderColor: `${palette.colors[1]}55`,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          {!forwardingMessage ? (
            <>
              <button
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-white/10"
                onClick={() => handleCopy(contextMenu.message)}
              >
                <Copy size={16} /> Copy
              </button>
              {contextMenu.message.senderId === currentUserId && (
                <button
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-300 hover:bg-red-400/10"
                  onClick={() => {
                    deleteMessage(contextMenu.message._id);
                    setContextMenu(null);
                  }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              <div
                className="sticky top-0 z-10 px-2 pb-2 pt-1"
                style={{ backgroundColor: `${palette.colors[2]}f5` }}
              >
                <div className="px-1 py-1 text-xs text-white/50">Send to...</div>
                <input
                  type="text"
                  autoFocus
                  value={forwardSearchQuery}
                  onChange={(event) => setForwardSearchQuery(event.target.value)}
                  placeholder="Search contacts..."
                  className="input input-sm h-8 w-full border-white/15 bg-black/20 text-xs text-white placeholder:text-white/45 focus:outline-none"
                />
              </div>
              {users
                .filter((user) => user._id !== currentUserId)
                .filter((user) => {
                  const query = forwardSearchQuery.trim().toLowerCase();
                  if (!query) return true;
                  return [user.fullName, user.name, user.username, user.email]
                    .some((value) => value?.toLowerCase().includes(query));
                })
                .map((user) => (
                  <button
                    key={user._id}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-white/10"
                    onClick={() => handleForward(user._id)}
                  >
                    <img src={user.profilePic || "/avatar.svg"} alt="" className="size-6 rounded-full" />
                    <span className="truncate">{user.fullName || user.name || user.username}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      <ImageLightbox
        images={lightbox.images}
        activeIndex={lightbox.index}
        onChange={updateLightboxIndex}
        thumbnailImages={lightbox.thumbnailImages}
        thumbnailIndex={lightbox.thumbnailIndex}
        onThumbnailChange={(thumbnailIndex) => {
          const selectedImage = lightbox.thumbnailImages[thumbnailIndex];
          const conversationIndex = lightbox.images.indexOf(selectedImage);
          setLightbox((current) => ({
            ...current,
            index: conversationIndex >= 0 ? conversationIndex : current.index,
            thumbnailIndex,
          }));
        }}
        onClose={() => setLightbox({ images: [], index: 0, thumbnailImages: [], thumbnailIndex: 0 })}
      />

      <MessageInput droppedFiles={droppedFiles} />
    </div>
  );
};
export default ChatContainer;
