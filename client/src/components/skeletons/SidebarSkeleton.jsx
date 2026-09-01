import React from "react";
const SidebarSkeleton = () => (
  <aside className="h-full w-20 min-w-[10rem] space-y-4 p-4 lg:w-72" aria-label="Loading contacts">
    <div className="h-10 animate-pulse rounded-lg bg-white/10" />
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="flex items-center gap-3">
        <div className="size-12 animate-pulse rounded-full bg-white/10" />
        <div className="hidden flex-1 space-y-2 lg:block">
          <div className="h-3 animate-pulse rounded bg-white/10" />
          <div className="h-2 w-2/3 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    ))}
  </aside>
);

export default SidebarSkeleton;
