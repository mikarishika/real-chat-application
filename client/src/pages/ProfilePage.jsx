import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import ImageLightbox from "../components/attachments/ImageLightbox";
import { axiosInstance } from "../lib/axios";
import { endpoints } from "../api/endpoints";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, deleteProfileImage } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [storedProfileImages, setStoredProfileImages] = useState([]);
  const profileImages = storedProfileImages.length
    ? storedProfileImages
    : (authUser?.profilePics?.length
      ? authUser.profilePics
      : (authUser?.profilePic ? [authUser.profilePic] : []));
    const lastImageIndex = Math.max(profileImages.length - 1, 0);
    const profileImage = selectedImg || profileImages[lastImageIndex] || "/avatar.svg";
  const hasUploadedImage = Boolean(selectedImg || profileImages.length);

  const handleDeleteImage = async (imageUrl) => {
    const deleted = await deleteProfileImage(imageUrl);
    if (!deleted) return;

    const remainingImages = profileImages.filter((image) => image !== imageUrl);
    setStoredProfileImages(remainingImages);
    if (!remainingImages.length) {
      setIsLightboxOpen(false);
      setActiveImageIndex(0);
      return;
    }
    setActiveImageIndex((currentIndex) => Math.min(currentIndex, remainingImages.length - 1));
  };

  useEffect(() => {
    if (!authUser?.username) return undefined;

    let cancelled = false;
    axiosInstance.get(endpoints.profileImages(authUser.username))
      .then((response) => {
        if (cancelled) return;
        const storedUrls = response.data
          .map((image) => image.url)
          .filter(Boolean);
        const userUrls = authUser.profilePics || [];
        const fallbackUrl = authUser.profilePic ? [authUser.profilePic] : [];
        setStoredProfileImages([...new Set([...storedUrls, ...userUrls, ...fallbackUrl])]);
      })
      .catch(() => {
        if (!cancelled) setStoredProfileImages(authUser.profilePics || (authUser.profilePic ? [authUser.profilePic] : []));
      });

    return () => {
      cancelled = true;
    };
  }, [authUser?.username, authUser?.profilePic, authUser?.profilePics]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setSelectedImg(reader.result);
      const updated = await updateProfile({ profileImage: file });
      if (!updated) setSelectedImg(null);
    };
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <button
                type="button"
                className={`block rounded-full ${hasUploadedImage ? "cursor-zoom-in" : "cursor-default"}`}
                onClick={() => {
                  if (!hasUploadedImage) return;
                  setActiveImageIndex(lastImageIndex);
                  setIsLightboxOpen(true);
                }}
                aria-label={hasUploadedImage ? "Open profile picture" : "Default profile avatar"}
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  className="size-32 rounded-full object-cover border-4"
                />
              </button>
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isLightboxOpen && (
        <ImageLightbox
          images={profileImages.length ? profileImages : [profileImage]}
          activeIndex={activeImageIndex}
          onChange={setActiveImageIndex}
          thumbnailImages={profileImages.length ? profileImages : [profileImage]}
            thumbnailIndex={activeImageIndex}
          onThumbnailChange={setActiveImageIndex}
          onDelete={handleDeleteImage}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
};
export default ProfilePage;
