import React from "react";
import assets from "../../assets/assets";

const ThemeToggle = ({ isDark, toggleTheme }) => {
    return (
        <div
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
                top:'2px',
                width: "24px",
                height: "26px",
                borderRadius: "13px",
                backgroundColor: isDark ? "#1a1a2e" : "#e0e0e0",
                border: isDark ? "1.5px solid #444" : "1.5px solid #bbb",
                cursor: "pointer",
                position: "relative",
                transition: "background-color 0.3s ease, border 0.3s ease",
                flexShrink: 0,
            }}
        >
            {/* ── track glow ── */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "13px",
                    background: isDark
                        ? "linear-gradient(90deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))"
                        : "linear-gradient(90deg, rgba(251,191,36,0.2), rgba(245,158,11,0.2))",
                    transition: "background 0.3s ease",
                }}
            />

            {/* ── thumb (دایره متحرک) ── */}
            <div
                style={{
                    position: "absolute",
                    top: "3px",
                    left: isDark ? "3px" : "3px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: isDark ? "#818cf8" : "#f59e0b",
                    boxShadow: isDark
                        ? "0 0 8px rgba(129,140,248,0.8)"
                        : "0 0 8px rgba(245,158,11,0.8)",
                    transition: "left 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "10px",
                }}
            >
                {isDark ? "🌙" : "☀️"}
            </div>
        </div>
    );
};

export default ThemeToggle;
