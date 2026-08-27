import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { File as FileIcon, Image, Send, X } from "lucide-react";
import heic2any from "heic2any";
import toast from "react-hot-toast";
import { getTheme } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";

const isImageFile = (file) => {
  if (!file) return false;
  const imageExtensions = /\.(avif|bmp|gif|heic|heif|jpe?g|png|webp)$/i;
  return file.type?.startsWith("image/") || imageExtensions.test(file.name || "");
};

const convertHeicFile = async (file) => {
  if (!/\.(heic|heif)$/i.test(file.name)) return file;

  try {
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
    return new window.File([jpegBlob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    toast.error(`امکان تبدیل ${file.name} وجود ندارد`);
    return file;
  }
};

const MessageInput = ({ droppedFiles = [] }) => {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const conversionPromisesRef = useRef([]);
  const selectionIdRef = useRef(0);
  const { sendMessage } = useChatStore();
  const { theme } = useThemeStore();
  const palette = getTheme(theme);

  const handleFiles = useCallback((files) => {
    const incomingFiles = Array.from(files || []);
    const validFiles = incomingFiles.filter((file) => {
      if (!file.type.startsWith("video/") && file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 50MB`);
        return false;
      }
      return true;
    });

    const selectionId = ++selectionIdRef.current;
    const conversions = validFiles.map(convertHeicFile);
    conversionPromisesRef.current = conversions;
    setSelectedFiles(validFiles);
    setFilePreviews(validFiles.map((file) => ({
      file,
      url: isImageFile(file) && !/\.(heic|heif)$/i.test(file.name)
        ? URL.createObjectURL(file)
        : null,
    })));

    Promise.all(conversions).then((preparedFiles) => {
      if (selectionId !== selectionIdRef.current) return;
      setSelectedFiles(preparedFiles);
      setFilePreviews((previews) => previews.map((preview, index) => {
        const preparedFile = preparedFiles[index];
        if (preparedFile === preview.file || !isImageFile(preparedFile)) return preview;
        if (preview.url) URL.revokeObjectURL(preview.url);
        return { file: preparedFile, url: URL.createObjectURL(preparedFile) };
      }));
    });
  }, []);

  useEffect(() => {
    if (droppedFiles.length) handleFiles(droppedFiles);
  }, [droppedFiles, handleFiles]);

  const handleFileChange = (e) => handleFiles(e.target.files);

  const removeFile = (index) => {
    selectionIdRef.current += 1;
    conversionPromisesRef.current = conversionPromisesRef.current.filter((_, fileIndex) => fileIndex !== index);
    const preview = filePreviews[index];
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setSelectedFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
    setFilePreviews((previews) => previews.filter((_, previewIndex) => previewIndex !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFiles.length) return;

    try {
      selectionIdRef.current += 1;
      const filesToSend = await Promise.all(conversionPromisesRef.current);
      const formData = new FormData();
      formData.append("text", text.trim());
      filesToSend.forEach((file) => formData.append("files", file));
      await sendMessage(formData);

      // Clear form
      setText("");
      filePreviews.forEach((preview) => preview.url && URL.revokeObjectURL(preview.url));
      setSelectedFiles([]);
      setFilePreviews([]);
      conversionPromisesRef.current = [];
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div
      className="p-4 w-full"
      style={{ backgroundColor: `${palette.colors[2]}94` }}
    >
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {filePreviews.map((preview, index) => <div className="relative" key={`${preview.file.name}-${index}`}>
            {preview.url ? (
              <img src={preview.url} alt="Preview" className="size-20 rounded-lg border border-zinc-700 object-cover" />
            ) : (
              <div className="flex h-20 w-40 items-center gap-2 rounded-lg border border-zinc-700 px-3 text-xs text-white/70">
                <FileIcon size={18} /> <span className="truncate">{preview.file.name}</span>
              </div>
            )}
            <button
              onClick={() => removeFile(index)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-black/60"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>)}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input rounded-lg input-sm sm:input-md border-white/15 bg-black/25 text-white placeholder:text-white/45 focus:outline-none"
            style={{ borderColor: `${palette.colors[1]}55` }}
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*,.heic,.heif,video/*,audio/*,application/pdf,.pdf,.txt"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle border-white/15 bg-black/20
                     ${selectedFiles.length ? "text-emerald-300" : "text-white/45"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div> 
        <button
          type="submit"
          className="btn btn-circle border-white/15 bg-white/10 text-white hover:bg-white/20"
          disabled={!text.trim() && !selectedFiles.length}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
