import React from "react";
import assets from "../../assets/assets";

const getProfileImage = (pic) => {
    if (!pic) return assets.duser;
    if (pic.startsWith("http")) return pic;
    return `http://localhost:3001${pic}`;
};

const ChatHeader = ({ selectedUser, onClose, isOnline }) => {
    const online = isOnline?.(selectedUser?.username);

    return (
        <div
            className="chat-header-div2"
            style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}
        >
            <div className="profile-header-div2" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* عکس + نقطه سبز */}
                <div style={{ position: "relative" }}>
                    <img
                        className="under-div-photo"
                        src={getProfileImage(selectedUser?.profilePic)}
                        alt="user"
                        onError={(e) => { e.target.src = assets.duser; }}
                    />
                    {online && (
                        <div style={{
                            position: "absolute",
                            bottom: "1px", right: "1px",
                            width: "11px", height: "11px",
                            borderRadius: "50%",
                            backgroundColor: "#22c55e",
                            border: "2px solid white",
                            boxShadow: "0 0 6px rgba(34,197,94,0.8)",
                        }} />
                    )}
                </div>

                {/* اسم + Online */}
                <div>
                    <span style={{ fontWeight: "bold", color: "white", display: "block" }}>
                        {selectedUser?.username || "Saved Messages"}
                    </span>
                    {online && (
                        <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: "500" }}>
                            Online
                        </span>
                    )}
                </div>
            </div>

            <button className="button-div2" onClick={onClose}>
                Close
            </button>
        </div>
    );
};

export default ChatHeader;