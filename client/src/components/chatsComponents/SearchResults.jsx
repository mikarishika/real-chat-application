import React, { useState } from "react";

const getProfileImage = (pic, fallback) => {
    if (!pic) return fallback;
    if (pic.startsWith("http")) return pic;
    return `http://localhost:3001${pic}`;
};

const SearchResults = ({ results, onSelectUser, theme, assets, isOnline }) => {
    const [hoveredId, setHoveredId] = useState(null);

    return (
        <div className="search-box-div1" style={{ backgroundColor: theme.sidebarBg }}>
            {results.length === 0 && (
                <div style={{ padding: "20px", color: theme.sidebarText, display: "flex", justifyContent: "center", opacity: 0.6 }}>
                    No results
                </div>
            )}

            {results.map((user) => {
                const online = isOnline?.(user.username);

                return (
                    <div
                        key={user._id}
                        className="search-user under-div1"
                        onClick={() => onSelectUser(user)}
                        onMouseEnter={() => setHoveredId(user._id)}
                        onMouseLeave={() => setHoveredId(null)}
                        style={{
                            backgroundColor: hoveredId === user._id ? theme.chatItemHover : theme.chatItemBg,
                            borderBottom: `1px solid ${theme.border}`,
                            transition: "background-color 0.2s ease",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            padding: "8px",
                        }}
                    >
                        {/* عکس + نقطه سبز */}
                        <div style={{ position: "relative", flexShrink: 0, marginRight: "10px" }}>
                            <img
                                src={getProfileImage(user.profilePic, assets?.duser)}
                                alt=""
                                style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }}
                                onError={(e) => { e.target.src = assets?.duser; }}
                            />
                            {online && (
                                <div style={{
                                    position: "absolute",
                                    bottom: "0px", right: "0px",
                                    width: "10px", height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: "#22c55e",
                                    border: "1.5px solid white",
                                    boxShadow: "0 0 5px rgba(34,197,94,0.7)",
                                }} />
                            )}
                        </div>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <span style={{ color: theme.sidebarText }}>{user.username}</span>
                                {online && (
                                    <span style={{ fontSize: "10px", color: "#22c55e", fontWeight: "500" }}>
                                        Online
                                    </span>
                                )}
                            </div>
                            <small style={{ color: theme.sidebarText, opacity: 0.6 }}>{user.userId}</small>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SearchResults;