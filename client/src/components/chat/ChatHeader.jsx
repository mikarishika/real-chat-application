import React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { getTheme } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";
import ImageLightbox from "../attachments/ImageLightbox";
import { axiosInstance } from "../../lib/axios";
import { endpoints } from "../../api/endpoints";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  const palette = getTheme(theme);
  const [profileGallery, setProfileGallery] = useState(null);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    const backendUrl = import.meta.env.MODE === "development" ? "http://localhost:3001" : "";
    return `${backendUrl}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const openProfileGallery = async (event) => {
    event.stopPropagation();
    if (!selectedUser?.username) return;

    const localImages = selectedUser.profilePics?.length
      ? selectedUser.profilePics
      : (selectedUser.profilePic ? [selectedUser.profilePic] : []);
    let images = localImages;

    try {
      const response = await axiosInstance.get(endpoints.profileImages(selectedUser.username));
      const storedImages = response.data.map((image) => image.url).filter(Boolean);
      images = [...new Set([...storedImages, ...localImages])];
    } catch {
      // Use the profile data already loaded in the chat list.
    }

    if (images.length) {
      setProfileGallery({ images: images.map(getImageUrl), index: images.length - 1 });
    }
  };

  return (
    <div
      className="p-2.5 border-b"
      style={{
        borderColor: `${palette.colors[1]}55`,
        backgroundColor: `${palette.colors[2]}b8`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <button
            type="button"
            className="avatar cursor-pointer rounded-full"
            onClick={openProfileGallery}
            aria-label="Open profile pictures"
          >
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.svg"} alt={selectedUser.fullName} />
            </div>
          </button>

          {/* User info */}
          <div>
            <h3 className="font-medium text-white">{selectedUser.fullName}</h3>
            <p className="text-sm text-white/55">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X className="text-white/70" />
        </button>
      </div>
      {profileGallery && (
        <ImageLightbox
          images={profileGallery.images}
          activeIndex={profileGallery.index}
          thumbnailImages={profileGallery.images}
          thumbnailIndex={profileGallery.index}
          onChange={(index) => setProfileGallery((current) => ({ ...current, index }))}
          onThumbnailChange={(index) => setProfileGallery((current) => ({ ...current, index }))}
          onClose={() => setProfileGallery(null)}
        />
      )}
    </div>
  );
};
export default ChatHeader;
