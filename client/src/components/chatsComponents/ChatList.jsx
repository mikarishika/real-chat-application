import React from "react";
import "../../style/chat.css";

const getProfileImage = (pic, fallback) => {
    if (!pic) return fallback;
    if (pic.startsWith("http")) return pic;
    return `http://localhost:3001${pic}`;
};

const ChatList = ({ chats, username, onSelectUser, theme, isDark, assets, isOnline }) => {

    return (
        <div>
            <div className="chatListp" style={{ color: theme.sidebarText, transition: "color 0.35s ease" }}>
                Chat List
            </div>

            {chats.map((chat) => {
                const otherUser = chat.participants.find((u) => u.username !== username);
                if (!otherUser) return null;

                const online = isOnline(otherUser.username);
                // ✅ فقط عدد بیشتر از صفر badge نشون بده
                const unread = chat.myUnread > 0 ? chat.myUnread : 0;

                return (
                    <div
                        key={chat._id}
                        className="under-div1"
                        onClick={() => onSelectUser(otherUser)}
                        style={{
                            borderBottom: `1px solid ${theme.border}`,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px",
                        }}
                    >
                        {/* عکس پروفایل + نقطه آنلاین */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                            <img
                                className="under-div-photo"
                                src={getProfileImage(otherUser?.profilePic, assets?.duser)}
                                alt="img"
                                onError={(e) => { e.target.src = assets?.duser; }}
                                style={{ objectFit: "cover" }}
                            />
                            {online && (
                                <div style={{
                                    position: "absolute",
                                    bottom: "1px", right: "1px",
                                    width: "10px", height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: "#22c55e",
                                    border: "1.5px solid white",
                                    boxShadow: "0 0 5px rgba(34,197,94,0.7)",
                                }} />
                            )}
                        </div>

                        {/* اسم + آخرین پیام */}
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex",position:'relative',alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                    <h4 style={{
                                        margin: 0,
                                        color: theme.sidebarText,
                                        transition: "color 0.35s ease",
                                        fontWeight: unread > 0 ? "700" : "500",
                                    }}>
                                        {otherUser?.username || "کاربر ناشناس"}
                                    </h4>
                                    {online && (
                                        <span style={{ fontSize: "10px", color: "#22c55e", fontWeight: "500",marginTop:'1px' }}>
                                            Online
                                        </span>
                                    )}
                                </div>

                                {/* ✅ badge فقط وقتی unread > 0 */}
                                {unread > 0 && (
                                    <div style={{
                                        position:'absolute',
                                        top:'10px',
                                        right:'2px',
                                        minWidth: "20px",
                                        height: "20px",
                                        borderRadius: "10px",
                                        backgroundColor: "#22c55e",
                                        color: "white",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "0 5px",
                                        flexShrink: 0,
                                    }}>
                                        {unread > 99 ? "99+" : unread}
                                    </div>
                                )}
                            </div>

                            {/* ✅ آخرین پیام */}
                            <p style={{
                                backgroundColor:'transparent',
                                margin: "4px 0 0 0",
                                fontSize: "12px",
                                opacity: unread > 0 ? 0.9 : 0.6,
                                color: theme.sidebarText,
                                transition: "color 0.35s ease",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontWeight: unread > 0 ? "600" : "400",
                            }}>
                                {chat.lastMessage || ""}
                            </p>

                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatList;