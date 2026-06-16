import React, {
    useState,
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle
} from "react";
import axios from "axios";
import assets from "../../assets/assets";
import '../../style/chat.css'

/* ------------------------------------------------------- ProfileModal ------------------------------------------------------ */

// داده‌ها رو از بالا (والد) می‌گیریم
export const ProfileModal = forwardRef(({ onClose, profileImages, setProfileImages, fetchImages, menuPorofile }, ref) => {
    if (!menuPorofile) return null;

    const user = JSON.parse(localStorage.getItem("chat_user") || "null");
    const username = user?.username;

    const [currentIndex, setCurrentIndex] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (profileImages.length > 0) {
            setCurrentIndex(profileImages.length - 1);
        }
    }, [profileImages.length]);

    const openFilePicker = () => fileInputRef.current?.click();

    // ── آپلود عکس جدید ────────────────────────────────────────────────
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profileImage", file);
        formData.append("username", username); // ✅ username اضافه شد

        try {
            const res = await axios.post(
                "http://localhost:3001/api/user/profile-image",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // ✅ اسم فیلد درست شد: profilePic (نه profileImageUrl)
            const uploadedUrl = res.data.profilePic;
            const fullUrl = uploadedUrl.startsWith("http")
                ? uploadedUrl
                : `http://localhost:3001${uploadedUrl}`;

            // ✅ آپدیت localStorage
            const updatedUser = { ...user, profilePic: uploadedUrl };
            localStorage.setItem("chat_user", JSON.stringify(updatedUser));

            setProfileImages(prev => [...prev, fullUrl]);

        } catch (err) {
            console.error("خطا در آپلود:", err);
        }
    };

    // ── حذف عکس فعلی ──────────────────────────────────────────────────
    const handleDelete = async () => {
        if (profileImages.length === 0) return;

        const imageToDelete = profileImages[currentIndex];

        try {
            // حذف از لیست UI
            await axios.delete("http://localhost:3001/api/user/profile-image", {
                data: {
                    username,
                    url: imageToDelete.replace("http://localhost:3001", "")
                }
            });
            const newImages = profileImages.filter((_, i) => i !== currentIndex);
            setProfileImages(newImages);

            // اگه عکس حذف شده همون profilePic فعلی بود، آپدیت کن
            const currentProfilePic = user?.profilePic
                ? `http://localhost:3001${user.profilePic}`
                : null;

            if (imageToDelete === currentProfilePic || imageToDelete.includes(user?.profilePic)) {
                const newProfilePic = newImages.length > 0
                    ? newImages[newImages.length - 1]
                    : null;

                // آپدیت localStorage
                const updatedUser = { ...user, profilePic: newProfilePic };
                localStorage.setItem("chat_user", JSON.stringify(updatedUser));

                // آپدیت DB
                await axios.post("http://localhost:3001/api/user/update-profile-pic", {
                    username,
                    profilePic: newProfilePic
                });
                await axios.delete("http://localhost:3001/api/user/profile-image", {
                    data: {
                        username,
                        url: imageToDelete.replace("http://localhost:3001", "")
                    }
                });
            }

            // index رو تنظیم کن
            setCurrentIndex(prev =>
                prev >= newImages.length ? Math.max(0, newImages.length - 1) : prev
            );

        } catch (err) {
            console.error("خطا در حذف عکس:", err);
        }
    };

    const handlePrev = () => {
        setCurrentIndex(prev => prev === 0 ? profileImages.length - 1 : prev - 1);
    };

    const handleNext = () => {
        setCurrentIndex(prev => prev === profileImages.length - 1 ? 0 : prev + 1);
    };

    const currentImage = profileImages.length > 0 ? profileImages[currentIndex] : null;

    useImperativeHandle(ref, () => ({
        refresh: fetchImages,
        openPicker: openFilePicker,
    }));

    return (
        <div className="menu-profile">
            <div className="menu-profile-up-icons" style={{ position: "absolute", top: "4px", right: "4px", zIndex: 10 }}>
                {/* آپلود */}
                <label onClick={openFilePicker} style={{ cursor: "pointer" }}>
                    <img src={assets.dragmedia} alt="آپلود عکس" />
                </label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />

                {/* ✅ حذف — onClick اضافه شد */}
                <button
                    style={{ marginLeft: "4px" }}
                    onClick={handleDelete}
                    disabled={profileImages.length === 0}
                >
                    <img src={assets.dlete} alt="حذف عکس" />
                </button>

                {/* بستن */}
                <button
                    style={{ marginLeft: "auto" }}
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                >
                    <img src={assets.close} alt="بستن" />
                </button>
            </div>

            <button className="menu-profile-button" onClick={handlePrev} disabled={profileImages.length === 0}>
                <img src={assets.previous} alt="عکس قبلی" />
            </button>

            {currentImage ? (
                <img className="menu-profile-img" src={currentImage} alt="profile" />
            ) : (
                <div style={{ color: "#aaa", padding: "20px" }}>No image</div>
            )}

            <button className="menu-profile-button" onClick={handleNext} disabled={profileImages.length === 0}>
                <img src={assets.next} alt="عکس بعدی" />
            </button>

            <div style={{
                position: "absolute", bottom: "5px",
                width: "300px", height: "100px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                {/* عکس قبلی */}
                <div style={{
                    width: "58px", height: "58px", borderRadius: "8px",
                    overflow: "hidden", border: "2px solid #ccc",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    opacity: currentIndex > 0 ? 1 : 0.3
                }}>
                    {currentIndex > 0 ? (
                        <img src={profileImages[currentIndex - 1]}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <div style={{ width: "100%", height: "100%", backgroundColor: "#eee" }} />
                    )}
                </div>

                {/* عکس فعلی */}
                <div style={{
                    width: "79px", height: "79px", borderRadius: "10px",
                    overflow: "hidden", border: "3px solid #3a8bff"
                }}>
                    {currentImage ? (
                        <img src={currentImage}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <div style={{ width: "100%", height: "100%", backgroundColor: "#ddd" }} />
                    )}
                </div>

                {/* عکس بعدی */}
                <div style={{
                    width: "58px", height: "58px", borderRadius: "8px",
                    overflow: "hidden", border: "2px solid #ccc",
                    opacity: currentIndex < profileImages.length - 1 ? 1 : 0.3
                }}>
                    {currentIndex < profileImages.length - 1 ? (
                        <img src={profileImages[currentIndex + 1]}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <div style={{ width: "100%", height: "100%", backgroundColor: "#eee" }} />
                    )}
                </div>
            </div>
        </div>
    );
});

/* ------------------------------------------------------- MenuBar ------------------------------------------------------ */
export const MenuBar = ({
    menuBar,
    setMenuBar,
    setMenuPorofile,
    profileRef,
    setActiveSection,
    setIsModalOpen
}) => {
    if (!menuBar) return null;

    // ✅ مستقیم از localStorage بخون
    const user = JSON.parse(localStorage.getItem("chat_user") || "null");
    const profilePic = user?.profilePic
        ? (user.profilePic.startsWith("http")
            ? user.profilePic
            : `http://localhost:3001${user.profilePic}`)
        : assets.duser;

    return (
        <div className="menuBar">
            <div style={{ position: 'relative' }}>
                <img
                    style={{ position: 'absolute', zIndex: '2' }}
                    src={assets.arrowprev}
                    alt="arrowprev"
                    onClick={() => setMenuBar(false)}
                />
                <img
                    style={{ position: 'absolute' }}
                    className='menubar-profile-photo'
                    src={profilePic}
                    onError={(e) => { e.target.src = assets.ax3; }}
                    onClick={() => setMenuPorofile(true)}
                    alt=""
                />
            </div>
            <div style={{ backgroundColor: 'white', position: 'relative', top: '250px' }} >
                <span style={{ position: 'relative' }}>
                    <p> Phone nuber</p>
                </span>
                <span style={{ position: 'relative' }}>
                    <p> @Id </p>
                </span>

                <div onClick={() => { setActiveSection("profile"); setIsModalOpen(true); }}><p> Profile</p></div>
                <div onClick={() => { setActiveSection("settings"); setIsModalOpen(true); }}><p> Setting </p></div>
                <div onClick={() => { setActiveSection("account"); setIsModalOpen(true); }}><p> Account </p></div>
                <div onClick={() => { setActiveSection("help"); setIsModalOpen(true); }}><p> Help </p></div>
            </div>
        </div>
    );
};
/* ------------------------------------------------------- AppModal ------------------------------------------------------ */

export const AppModal = ({ isOpen, onClose, activeSection }) => {
    if (!isOpen) return null;

    let content;

    switch (activeSection) {
        case "settings":
            content = (
                <div>
                    <h2>Settings</h2>
                    <ul>
                        <li>Dark / Light Mode</li>
                        <li>Notifications</li>
                        <li>Privacy</li>
                    </ul>
                </div>
            );
            break;
        case "account":
            content = (
                <div>
                    <h2>Account</h2>
                    <ul>
                        <li>Logout</li>
                        <li>Delete Account</li>
                    </ul>
                </div>
            );
            break;
        case "help":
            content = (
                <div>
                    <h2>Help</h2>
                    <p>About this Project</p>
                    <p>GitHub Repository</p>
                </div>
            );
            break;
        case "profile":
            content = (
                <div>
                    <h2>Profile</h2>
                    <p>Edit your username, bio, photo, etc.</p>
                </div>
            );
            break;
        default:
            content = <p>Select a section from the sidebar.</p>;
    }

    return (
        <div
            className="information-bar-container"
            onClick={onClose}  // کلیک بیرون → بستن
        >
            <button
                onClick={onClose}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    color: "white",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                }}
            >
                {/* ✕ */}
            </button>

            <div
                className="information-bar"
                onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن وقتی داخل کلیک می‌کنی
            >
                {content}
            </div>
        </div>
    );
};
/* ------------------------------------------------------- ChatMessagesModal ------------------------------------------------------ */
import FileDownloadItem from "./MyPdfViewer";

// ✅ کامپوننت تیک — یه تیک = ارسال شد، دو تیک خاکستری = تحویل، دو تیک سبز = خونده شد
const MessageStatus = ({ isSent, seen }) => {
    if (!isSent) return null; // فقط برای پیام‌های ارسالی نشون بده

    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            marginLeft: "3px",
            verticalAlign: "middle",
            lineHeight: 1,
        }}>
            {seen ? (
                // ✅ دو تیک سبز — خونده شد
                <svg width="15" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5.5L4.5 9L10 3" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 5.5L8.5 9L14 3" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : (
                // ✅ یه تیک خاکستری — ارسال شد، هنوز ندیده
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#aaaaaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </span>
    );
};

export const ChatMessagesModal = ({
    username,
    selectedUser,
    messages,
    messagesEndRef,
    setSelectedImg,
    setSelectedVideo,
    handleContextMenu
}) => {

    const otherUser = selectedUser?.username;

    const filteredMessages = messages.filter(msg =>
        (msg.senderId === username && msg.receiverId === otherUser) ||
        (msg.senderId === otherUser && msg.receiverId === username)
    );

    return (
        <>
            {filteredMessages && filteredMessages.map((msg, index) => {

                const rawTime = msg.timestamp?.$date || msg.createdAt || msg.timestamp;
                const timeString = rawTime
                    ? new Date(rawTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "";

                const isSent = msg.senderId === username;

                return (
                    <div key={msg._id?.$oid || msg._id || index} className="message-wrapper">

                        {/* پیام متنی */}
                        {msg.text && !msg.file && (
                            <div
                                className={`sd2 ${isSent ? "sent" : "received"}`}
                                onContextMenu={(e) => handleContextMenu(e, msg._id)}
                                style={{ position: "relative", paddingBottom: "14px" }}
                            >
                                <span className={`sd2-span ${isSent ? "sent" : "received"}`}>{msg.text}</span>
                                <span className="poshesh-span">
                                    {timeString}
                                    {/* ✅ تیک کنار زمان */}
                                    <MessageStatus isSent={isSent} seen={msg.seen} />
                                </span>
                            </div>
                        )}

                        {/* پیام فایل‌دار */}
                        {msg.file && msg.file.url && (
                            <div
                                className={`file-box ${isSent ? "sent" : "received"}`}
                                onContextMenu={(e) => handleContextMenu(e, msg._id)}
                                style={{ position: "relative", paddingBottom: "14px" }}
                            >
                                <div className={`poshesh ${isSent ? "sent" : "received"}`}>

                                    {msg.file.type?.includes('video') ? (
                                        <div style={{ paddingBottom: '4px', borderRadius: '15px', backgroundColor: '#262626' }}>
                                            <video
                                                src={`http://localhost:3001${msg.file.url}`}
                                                autoPlay
                                                loop
                                                muted
                                                onClick={() => setSelectedVideo(`http://localhost:3001${msg.file.url}`)}
                                                className="my-video"
                                            />
                                            <span>{msg ? msg.text : ''}</span>
                                        </div>

                                    ) : msg.file.type?.includes('audio') ? (
                                        <div style={{ minWidth: '100px' }}>
                                            <audio
                                                controls
                                                src={`http://localhost:3001${msg.file.url}`}
                                                className="my-audio"
                                            />
                                            <span>{msg ? msg.text : ''}</span>
                                        </div>

                                    ) : msg.file.type?.includes('image') ? (
                                        <div>
                                            <img
                                                src={`http://localhost:3001${msg.file.url}`}
                                                className="my-img"
                                                alt="file"
                                                onClick={() => setSelectedImg(`http://localhost:3001${msg.file.url}`)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span className="dynamic-text">{msg.text}</span>
                                        </div>

                                    ) : (msg.file.type === 'application/pdf' || msg.file.type?.includes('zip')) ? (
                                        <div>
                                            <FileDownloadItem
                                                fileUrl={`http://localhost:3001${msg.file.url}`}
                                                fileName={msg.file.name || msg.file.filename}
                                                originalName={msg.file.originalname}
                                                fileSizeLabel={msg.file.sizeLabel}
                                                fileType={msg.file.type}
                                                fileSize={msg.file.size}
                                            />
                                            <span className="dynamic-text">{msg.text}</span>
                                        </div>
                                    ) : (
                                        <div style={{
                                            color: 'black',
                                            padding: '5px',
                                            backgroundColor: 'white',
                                            borderRadius: '4px'
                                        }}>
                                            this file doesn’t known
                                        </div>
                                    )}

                                    {/* ✅ تیک کنار زمان پیام فایل‌دار */}
                                    <span className="poshesh-span">
                                        {timeString}
                                        <MessageStatus isSent={isSent} seen={msg.seen} />
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                );
            })}
        </>
    );
};


/* ------------------------------------------------------- ContextMenu ------------------------------------------------------ */

export const ContextMenu = ({ contextMenu, deleteMessage, divD }) => {
    if (!divD) return null
    return (
        <>
            {
                contextMenu.show && (
                    <div
                        className="custom-context-menu"
                        style={{
                            top: `${contextMenu.y}px`,
                            left: `${contextMenu.x}px`,
                            position: 'fixed',
                            zIndex: 10000
                        }}
                        onClick={() => deleteMessage(contextMenu.msgId)}
                    >
                        Delete Message
                    </div>
                )
            }
        </>
    )
}
/* ------------------------------------------------------- IsModalOpen ------------------------------------------------------ */

export const IsModalOpen = ({

    isModalOpen,
    setIsModalOpen,
    setPreviewUrl,
    setSelectedFile,
    selectedFile,
    previewUrl,
    getDirection,
    newMessage,
    setNewMessage,
    sendImageMessage }) => {

    if (!isModalOpen) return null;
    return (
        <>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content" style={{minWidth:'280px',maxWidth:'50%',paddingInline:'13px'}}>
                        <button id="modal-button"   onClick={() => { setIsModalOpen(false); setPreviewUrl(null); setSelectedFile(null); }}>
                            <img className='image-button-modal' src={assets.cancelIcon} alt="img"></img>
                        </button>

                        <h3 className="modal-h3">Send Media ...</h3>

                        {previewUrl && (
                            // این قسمت اصلاح شد: از selectedFile.type استفاده می‌کنیم
                            selectedFile && selectedFile.type.startsWith('video/') ? (

                                <video src={previewUrl} className="modal-image" controls autoPlay />

                            ) : selectedFile && selectedFile.type.startsWith('image/') ? (

                                <img src={previewUrl} className="modal-image" alt="preview" />

                            ) : selectedFile && selectedFile.type.startsWith('audio/') ? (

                                <audio src={previewUrl} className="modal-audio" alt="preview" />

                            ) : (
                                <div style={{ color: 'black', padding: '5px' }}></div>
                            )
                        )}

                        <input
                            style={{
                                direction: getDirection(newMessage),
                                unicodeBidi: "bidi-override"
                            }}
                            className="modal-input"
                            type="text"
                            placeholder="Type a message ..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button id="modal-button-2" onClick={() => { sendImageMessage() }}>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

/* -------------------------------------------SelectedVideoAndMessage-------------------------------------------- */

export const SelectedVideoAndMessage = ({ selectedImg, selectedVideo, setSelectedImg, setSelectedVideo }) => {
    return (
        <>
            {(selectedImg || selectedVideo) && (
                <div
                    className="modal-overlay"
                    onClick={() => {
                        setSelectedImg(null); // عکس رو ریست کن
                        setSelectedVideo(null); // ویدیو رو ریست کن

                    }}
                >
                    <span className="close-btn" onClick={(e) => {
                        e.stopPropagation(); // جلوگیری از بسته شدن مودال با کلیک روی دکمه بستن
                        setSelectedImg(null);
                        setSelectedVideo(null);
                    }}>&times;</span>

                    {selectedVideo ? (
                        <video
                            src={selectedVideo}
                            className="modal-content" // یا کلاس مناسب برای ویدیو
                            controls
                            autoPlay
                            onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن مودال با کلیک روی ویدیو
                        />
                    ) : (
                        <img
                            src={selectedImg}
                            className="modal-content" // کلاس مناسب برای عکس
                            alt="Full size"
                            onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن مودال با کلیک روی عکس
                        />
                    )}
                </div>
            )}
        </>
    )
}