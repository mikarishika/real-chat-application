import React from "react";
const MessageSkeleton = () => (
  <div className="flex h-full flex-col gap-4 p-6" aria-label="Loading messages">
    {Array.from({ length: 6 }, (_, index) => (
      <div
        key={index}
        className={`h-12 w-2/3 animate-pulse rounded-lg bg-white/10 ${index % 2 ? "self-end" : ""}`}
      />
    ))}
  </div>
);

export default MessageSkeleton;
