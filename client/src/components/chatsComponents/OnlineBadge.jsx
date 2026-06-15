import React from "react";

// ✅ کامپوننت مشترک — هر سه جا استفاده میشه
const OnlineBadge = ({ isOnline, showText = false, size = 10 }) => {
    if (!isOnline) return null;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {/* نقطه سبز */}
            <div style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                boxShadow: "0 0 6px rgba(34,197,94,0.7)",
                flexShrink: 0,
                animation: "pulse-green 2s infinite",
            }} />

            {/* نوشته Online */}
            {showText && (
                <span style={{
                    fontSize: "11px",
                    color: "#22c55e",
                    fontWeight: "500",
                }}>
                    Online
                </span>
            )}

            <style>{`
                @keyframes pulse-green {
                    0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
                    70%  { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
                    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
                }
            `}</style>
        </div>
    );
};

export default OnlineBadge;
