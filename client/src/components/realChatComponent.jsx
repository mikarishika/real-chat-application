import React, { useState, useEffect, useRef } from "react";
import {
    MenuBar, ProfileModal, AppModal, ChatMessagesModal,
    ContextMenu, IsModalOpen, SelectedVideoAndMessage,
} from "./chatsComponents/Modals";
import { useChatLogic } from "../hooks/useChatLogic";
import { useTheme } from "../hooks/useTheme";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import socket from "../hooks/socket";
import ChatHeader from "./chatsComponents/ChatHeader";
import MessageInput from "./chatsComponents/MessageInput";
import ChatList from "./chatsComponents/ChatList";
import SearchResults from "./chatsComponents/SearchResults";
import ThemeToggle from "../components/chatsComponents/ThemeToggle";
import assets from "../assets/assets";
import "../style/chat.css";
import axios from "axios";

const persianRange = /[\u0600-\u06FF]/;
const englishRange = /[a-zA-Z]/;

const THEMES = {
    dark: {
        sidebarBg:   "#212121",
        sidebarText: "#fffffff5",
        inputBg:     "rgba(20, 20, 35, 0.9)",
        searchBg:    "rgba(30, 30, 50, 0.8)",
    },
    light: {
        sidebarBg:   "white",
        sidebarText: "#1a1a2e",
        inputBg:     "rgba(240, 240, 250, 0.95)",
        searchBg:    "rgba(255, 255, 255, 0.85)",
    },
};

function RealChat() {
    const user     = JSON.parse(localStorage.getItem("chat_user") || "null");
    const username = user?.username;

    const { isDark, toggleTheme } = useTheme();
    const theme = isDark ? THEMES.dark : THEMES.light;
    const { isOnline } = useOnlineUsers(username);

    const [selectedUser, setSelectedUser]   = useState(null);
    const [selectedImg, setSelectedImg]     = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [menuBar, setMenuBar]             = useState(false);
    const [menuPorofile, setMenuPorofile]   = useState(false);
    const [profileImages, setProfileImages] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [modalState, setModalState]       = useState(false);
    const [searchDiv, setSearchDiv]         = useState(false);
    const [underDiv1, setUnderDiv1]         = useState(true);
    const [search, setSearch]               = useState("");
    const [results, setResults]             = useState([]);
    const [chats, setChats]                 = useState([]);
    const [profileVersion, setProfileVersion] = useState(0);

    const messagesEndRef = useRef(null);
    const profileRef     = useRef(null);
    const searchBox      = useRef(null);
    const selectedUserRef = useRef(selectedUser);
    useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

    const {
        divD, setDiv,
        messages, setMessages,
        newMessage, setNewMessage,
        contextMenu,
        selectedFile, setSelectedFile,
        previewUrl, setPreviewUrl,
        isModalOpen, setIsModalOpen,
        handleFileChange, openFilePicker,
        handleSendMessage, sendImageMessage,
        deleteMessage, handleContextMenu,
        fileInputRef,
    } = useChatLogic(username, selectedUser, fetchChats);

    async function fetchChats() {
        try {
            const res  = await fetch(`http://localhost:3001/api/conversations/user/${username}`);
            const data = await res.json();
            if (!Array.isArray(data)) { setChats([]); return; }

            // ✅ unread های local رو حفظ کن — سرور ممکنه هنوز reset نکرده باشه
            setChats((prev) =>
                data.map((newChat) => {
                    const existing = prev.find((c) => c._id === newChat._id);
                    return {
                        ...newChat,
                        myUnread: existing ? (existing.myUnread || 0) : (newChat.myUnread || 0),
                    };
                })
            );
        } catch (err) {
            console.error("Error fetching chats:", err);
            setChats([]);
        }
    }

    const fetchImages = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/api/user/profile-images/${username}`);
            const images = res.data.map(img =>
                img.url.startsWith("http") ? img.url : `http://localhost:3001${img.url}`
            );
            setProfileImages(images);
        } catch (err) {
            console.error("Error fetching profile images:", err);
            setProfileImages([]);
        }
    };

    const getDirection = (text = "") => {
        const trimmed = text.trim();
        if (!trimmed)                   return "rtl";
        if (persianRange.test(trimmed)) return "rtl";
        if (englishRange.test(trimmed)) return "ltr";
        return "rtl";
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => { fetchImages(); }, []);

    useEffect(() => {
        if (username) fetchChats();
    }, [username]);

    // ✅ real-time chat list update — بدون fetchChats
    useEffect(() => {
        if (!username) return;

        const handleNewMessage = (data) => {
            const currentSelected = selectedUserRef.current;

            // پیام از طرف مقابل به ما
            if (data.receiverId === username) {
                setChats((prev) => {
                    const idx = prev.findIndex((chat) =>
                        chat.participants.some((p) => p.username === data.senderId)
                    );
                    if (idx === -1) return prev;
                    const updated = {
                        ...prev[idx],
                        lastMessage: data.text || "فایل",
                        // اگه الان تو اون چت هستیم unread نزن
                        myUnread: currentSelected?.username === data.senderId
                            ? (prev[idx].myUnread || 0)
                            : (prev[idx].myUnread || 0) + 1,
                    };
                    return [updated, ...prev.filter((_, i) => i !== idx)];
                });
            }

            // پیام از ما به طرف مقابل — بیار بالا بدون unread
            if (data.senderId === username) {
                setChats((prev) => {
                    const idx = prev.findIndex((chat) =>
                        chat.participants.some((p) => p.username === data.receiverId)
                    );
                    if (idx === -1) return prev;
                    const updated = {
                        ...prev[idx],
                        lastMessage: data.text || "فایل",
                    };
                    return [updated, ...prev.filter((_, i) => i !== idx)];
                });
            }
        };

        socket.on("receive_message", handleNewMessage);

        return () => {
            socket.off("receive_message", handleNewMessage);
        };
    }, [username]);

    // ✅ وقتی کاربر رو از چت لیست انتخاب میکنه، unread رو صفر کن
    const handleSelectUserFromList = (otherUser) => {
        setSelectedUser(otherUser);
        setDiv(true);
        // ✅ فوری UI رو صفر کن
        setChats((prev) =>
            prev.map((chat) => {
                const isThisChat = chat.participants.some(
                    (p) => p.username === otherUser.username
                );
                if (!isThisChat) return chat;
                return { ...chat, myUnread: 0 };
            })
        );
        // ✅ از socket استفاده کن تا DB هم reset بشه — بعد از refresh هم صفر میمونه
        socket.emit("mark_read", {
            username,
            otherUsername: otherUser.username,
        });
    };

    const handleSelectUserFromSearch = (u) => {
        setSelectedUser(u);
        setMessages([]);
        setDiv(true);
        setSearchDiv(false);
        setUnderDiv1(true);
        setSearch("");
    };

    useEffect(() => {
        if (!search) { setResults([]); return; }
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/api/users/search?query=${search}`);
                setResults(res.data);
            } catch (err) {
                console.error("Error searching users:", err);
            }
        };
        fetchUsers();
    }, [search]);

    return (
        <div
            className="grid-container"
            style={{
                background: isDark
                    ? `url(${assets.darkgold}) center/cover no-repeat`
                    : `url(${assets.lighttheme}) center/cover no-repeat`,
            }}
        >
            <div className="sidebar-div1-container">
                <div
                    className="div1"
                    style={{
                        display: menuBar ? "none" : "block",
                        backgroundColor: theme.sidebarBg,
                        color: theme.sidebarText,
                        transition: "background-color 0.35s ease, color 0.35s ease",
                    }}
                >
                    <div className="div1-header" style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <div
                            className="div1-header-menu"
                            onClick={(e) => { e.stopPropagation(); setMenuBar(true); }}
                        >
                            <img src={assets.menu} alt="menu" style={{ cursor: "pointer" }} />
                        </div>

                        <input
                            type="text"
                            ref={searchBox}
                            placeholder="Search ..."
                            className="div1-search-box"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={() => { setUnderDiv1(false); setSearchDiv(true); }}
                            style={{
                                backgroundColor: theme.searchBg,
                                color: theme.sidebarText,
                                transition: "background-color 0.35s ease",
                            }}
                        />

                        {!searchDiv && (
                            <div style={{ marginRight: "3px" }}>
                                <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
                            </div>
                        )}

                        {searchDiv && (
                            <button
                                onClick={() => { setSearchDiv(false); setUnderDiv1(true); setSearch(""); }}
                                style={{
                                    backgroundColor: "transparent", border: "none",
                                    padding: "0", cursor: "pointer", flexShrink: 0,
                                }}
                            >
                                <img src={assets.cancelIcon} alt="" style={{ width: "27px", height: "27px" }} />
                            </button>
                        )}
                    </div>

                    {underDiv1 && (
                        <ChatList
                            chats={chats}
                            username={username}
                            onSelectUser={handleSelectUserFromList}
                            theme={theme}
                            isDark={isDark}
                            assets={assets}
                            isOnline={isOnline}
                        />
                    )}

                    {searchDiv && (
                        <SearchResults
                            results={results}
                            onSelectUser={handleSelectUserFromSearch}
                            theme={theme}
                            assets={assets}
                            isOnline={isOnline}
                        />
                    )}
                </div>

                <MenuBar
                    menuBar={menuBar}
                    profileVersion={profileVersion}
                    profileImages={profileImages}
                    setMenuBar={setMenuBar}
                    setMenuPorofile={setMenuPorofile}
                    profileRef={profileRef}
                    setActiveSection={setActiveSection}
                    setIsModalOpen={setModalState}
                />
            </div>

            {divD && (
                <div id="div2" className="div2" style={{ position: "relative" }}>
                    <ChatHeader
                        selectedUser={selectedUser}
                        onClose={() => setDiv(false)}
                        isDark={isDark}
                        assets={assets}
                        isOnline={isOnline}
                    />

                    <div className="chat-text-div2">
                        <ChatMessagesModal
                            username={username}
                            messages={messages}
                            selectedUser={selectedUser}
                            messagesEndRef={messagesEndRef}
                            setSelectedImg={setSelectedImg}
                            setSelectedVideo={setSelectedVideo}
                            handleContextMenu={handleContextMenu}
                        />
                        <ContextMenu
                            contextMenu={contextMenu}
                            deleteMessage={deleteMessage}
                            divD={divD}
                        />
                    </div>

                    <SelectedVideoAndMessage
                        selectedImg={selectedImg}
                        selectedVideo={selectedVideo}
                        setSelectedImg={setSelectedImg}
                        setSelectedVideo={setSelectedVideo}
                    />

                    <MessageInput
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleSendMessage={handleSendMessage}
                        openFilePicker={openFilePicker}
                        handleFileChange={handleFileChange}
                        fileInputRef={fileInputRef}
                        isDark={isDark}
                        theme={theme}
                        assets={assets}
                    />
                </div>
            )}

            {/* ✅ IsModalOpen خارج از div2 تا overflow:hidden مشکل نسازه */}
            <IsModalOpen
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                setPreviewUrl={setPreviewUrl}
                setSelectedFile={setSelectedFile}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                getDirection={getDirection}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                sendImageMessage={sendImageMessage}
            />

            <ProfileModal
                ref={profileRef}
                menuPorofile={menuPorofile}
                setProfileVersion={setProfileVersion}
                onClose={() => setMenuPorofile(false)}
                profileImages={profileImages}
                setProfileImages={setProfileImages}
                setActiveSection={setActiveSection}
                fetchImages={fetchImages}
            />

            <AppModal
                isOpen={modalState}
                onClose={() => setModalState(false)}
                activeSection={activeSection}
            />
        </div>
    );
}

export default RealChat;