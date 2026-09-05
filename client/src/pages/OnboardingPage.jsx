import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Mail, User, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Starfield from "../components/StarFild";

const OnboardingPage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
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
    <div className="relative min-h-screen overflow-hidden pt-20 pb-28">
      <Starfield theme="burnt-orange" />

      <div className="relative z-10 max-w-2xl mx-auto p-4 py-8">
        <div className="space-y-8 rounded-2xl border border-orange-200/25 bg-[#3d281e]/55 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-[4px] sm:p-10">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-white">Complete your profile</h1>
            <p className="mt-2 text-white/65">Add a profile picture to help people recognize you</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.svg"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="onboarding-avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="onboarding-avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-white/60">
              {isUpdatingProfile ? "Uploading..." : "Choose a profile photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-white/60 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 rounded-lg border border-orange-100/25 bg-black/20">{authUser?.fullName || authUser?.username}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-white/60 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 rounded-lg border border-orange-100/25 bg-black/20">{authUser?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center border-t border-orange-200/20 bg-[#3d281e]/80 p-4 backdrop-blur-sm">
        <button
          type="button"
          className="btn min-w-40 gap-2 border-orange-100/80 bg-[#f3d3a3] text-[#3d281e] hover:border-orange-50 hover:bg-[#f7dfbb]"
          onClick={() => navigate("/")}
          disabled={isUpdatingProfile}
        >
          Next
          <ArrowRight className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;
