import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/login.css";
import assets from "../assets/assets.js";
import heic2any from "heic2any";

// ─────────────────────────────────────────────────────────────────────────────
// CropModal
// ─────────────────────────────────────────────────────────────────────────────
function CropModal({ imgSrc, onConfirm, onCancel }) {
    const CIRCLE_SIZE = 350;

    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imgNaturalSize, setImgNaturalSize] = useState({ w: 1, h: 1 });
    const [baseScale, setBaseScale] = useState(1);
    const imgRef = useRef(null);

    const handleImgLoad = () => {
        const { naturalWidth: w, naturalHeight: h } = imgRef.current;

        setImgNaturalSize({ w, h });

        const minSide = Math.min(w, h);
        const initialScale = CIRCLE_SIZE / minSide;

        setBaseScale(initialScale);
        setScale(initialScale);

        setOffset({ x: 0, y: 0 });
    };

    // ── mouse drag ────────────────────────────────────────────────────
    const handleMouseDown = (e) => {
        e.preventDefault();
        setDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = useCallback((e) => {
        if (!dragging) return;
        setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }, [dragging, dragStart]);

    const handleMouseUp = () => setDragging(false);

    // ── touch drag ────────────────────────────────────────────────────
    const handleTouchStart = (e) => {
        const t = e.touches[0];
        setDragging(true);
        setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
    };

    const handleTouchMove = useCallback((e) => {
        if (!dragging) return;
        const t = e.touches[0];
        setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
    }, [dragging, dragStart]);

    const handleTouchEnd = () => setDragging(false);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMouseMove]);

    // ── crop با canvas ────────────────────────────────────────────────
    const handleConfirm = () => {
        const canvas = document.createElement("canvas");
        const OUTPUT = 400;
        canvas.width = canvas.height = OUTPUT;
        const ctx = canvas.getContext("2d");

        const radius = 60;
        ctx.beginPath();
        ctx.roundRect(0, 0, OUTPUT, OUTPUT, radius);
        ctx.clip();

        const imgW = imgNaturalSize.w * scale;
        const imgH = imgNaturalSize.h * scale;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const imgLeft = cx + offset.x - imgW / 2;
        const imgTop = cy + offset.y - imgH / 2;
        const circleLeft = cx - CIRCLE_SIZE / 2;
        const circleTop = cy - CIRCLE_SIZE / 2;

        ctx.drawImage(
            imgRef.current,
            (circleLeft - imgLeft) / scale,
            (circleTop - imgTop) / scale,
            CIRCLE_SIZE / scale,
            CIRCLE_SIZE / scale,
            0, 0, OUTPUT, OUTPUT
        );

        canvas.toBlob((blob) => onConfirm(blob, URL.createObjectURL(blob)), "image/jpeg", 0.92);
    };

    const imgW = imgNaturalSize.w * scale;
    const imgH = imgNaturalSize.h * scale;

    // ── اسلایدر زوم ───────────────────────────────────────────────────
    const MIN_SCALE = baseScale;
    const MAX_SCALE = baseScale * 4;
    const sliderValue = ((scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100;

    const handleSlider = (e) => {
        const val = Number(e.target.value);

        setScale(
            MIN_SCALE +
            (val / 100) * (MAX_SCALE - MIN_SCALE)
        );
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                backgroundColor: "rgb(31, 31, 31)",
                display: "flex", flexDirection: "column",
                justifyContent: "center", alignItems: "center",
                userSelect: "none",
            }}
        >
            {/* ── راهنما بالا ── */}
            <p style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "24px",
                letterSpacing: "0.3px",
            }}>
                Move and zoom the image
            </p>

            {/* ── ناحیه drag ── */}
            <div
                style={{
                    position: "relative",
                    width: `${CIRCLE_SIZE}px`,
                    height: `${CIRCLE_SIZE}px`,
                    cursor: dragging ? "grabbing" : "grab",
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* عکس بیرون دایره — تاریک */}
                <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="crop"
                    draggable={false}
                    onLoad={handleImgLoad}
                    style={{
                        position: "fixed",
                        width: `${imgW}px`,
                        height: `${imgH}px`,
                        top: `calc(50% + ${offset.y}px - ${imgH / 2}px)`,
                        left: `calc(50% + ${offset.x}px - ${imgW / 2}px)`,
                        objectFit: "cover",
                        pointerEvents: "none",
                        opacity: 0,
                    }}
                />

                {/* دایره crop — عکس واضح */}
                <div style={{
                    position: "absolute", inset: 0,
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "2.5px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                    pointerEvents: "none",
                }}>
                    <img
                        src={imgSrc}
                        alt="crop-inner"
                        draggable={false}
                        style={{
                            position: "absolute",
                            width: `${imgW}px`,
                            height: `${imgH}px`,
                            top: `${CIRCLE_SIZE / 2 + offset.y - imgH / 2}px`,
                            left: `${CIRCLE_SIZE / 2 + offset.x - imgW / 2}px`,
                            objectFit: "cover",
                            pointerEvents: "none",
                        }}
                    />
                </div>
            </div>

            {/* ── اسلایدر زوم (مثل اینستاگرام/تلگرام) ── */}
            <div style={{
                marginTop: "32px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "280px",
            }}>
                {/* آیکون زوم کوچک */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                </svg>

                {/* اسلایدر */}
                <input
                    type="range"
                    min="0" max="100"
                    value={sliderValue}
                    onChange={handleSlider}
                    style={{
                        flex: 1,
                        height: "4px",
                        borderRadius: "2px",
                        appearance: "none",
                        background: `linear-gradient(to right, rgba(255,255,255,0.9) ${sliderValue}%, rgba(255,255,255,0.2) ${sliderValue}%)`,
                        outline: "none",
                        cursor: "pointer",
                    }}
                />

                {/* آیکون زوم بزرگ */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" /><line x1="11" y1="8" x2="11" y2="14" />
                </svg>
            </div>

            {/* ── دکمه‌ها ── */}
            <div style={{ display: "flex", gap: "16px", marginTop: "28px" }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: "11px 32px",
                        borderRadius: "12px",
                        border: "1.5px solid rgba(255,255,255,0.6)",
                        background: "transparent",
                        color: "rgba(255,255,255,0.95)",   // ✅ سفید واضح
                        fontSize: "15px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "background 0.2s, border 0.2s",
                    }}
                    onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                >
                    Cancel
                </button>

                <button
                    onClick={handleConfirm}
                    style={{
                        padding: "11px 32px",
                        borderRadius: "12px",
                        border: "none",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "#ffffff",               // ✅ سفید کامل
                        fontSize: "15px",
                        fontWeight: "700",
                        cursor: "pointer",
                        boxShadow: "0 4px 20px rgba(102,126,234,0.55)",
                        transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.04)";
                        e.target.style.boxShadow = "0 6px 24px rgba(102,126,234,0.7)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "0 4px 20px rgba(102,126,234,0.55)";
                    }}
                >
                    Choose →
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding
// ─────────────────────────────────────────────────────────────────────────────
function Onboarding() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("chat_user") || "null");

    const [username, setUsername] = useState(user?.username || "");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [croppedBlob, setCroppedBlob] = useState(null);
    const [rawImgSrc, setRawImgSrc] = useState(null);
    const [showCrop, setShowCrop] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showMsg, setShowMsg] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isHover, setIsHover] = useState(false);
    const [isHover2, setIsHover2] = useState(false);

    const fileInputRef = useRef(null);

    const showMessage = (msg) => {
        setMessage(msg);
        setShowMsg(true);
        setTimeout(() => setShowMsg(false), 1800);
    };

    const handleFileChange = async (e) => {
        let file = e.target.files?.[0];

        if (!file) return;

        if (
            file.type === "image/heic" ||
            file.type === "image/heif" ||
            file.name.toLowerCase().endsWith(".heic")
        ) {

            try {

                const convertedBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.9,
                });

                file = new File(
                    [convertedBlob],
                    file.name.replace(/\.heic$/i, ".jpg"),
                    {
                        type: "image/jpeg",
                    }
                );

            } catch (err) {
                console.error(err);
                alert("Unable to read HEIC image");
                return;
            }
        }

        const reader = new FileReader();

        reader.onload = (ev) => {
            setRawImgSrc(ev.target.result);
            setShowCrop(true);
        };

        reader.readAsDataURL(file);

        e.target.value = "";
    };
    const handleCropConfirm = (blob, url) => {
        setCroppedBlob(blob);
        setPreviewUrl(url);
        setShowCrop(false);
    };

    const handleCropCancel = () => {
        setShowCrop(false);
        setRawImgSrc(null);
    };

    const saveProfileToStorage = (picUrl) => {
        localStorage.setItem("chat_user", JSON.stringify({ ...user, profilePic: picUrl }));
    };

    const handleSubmit = async () => {
        if (!username.trim()) { showMessage("Please enter a username"); return; }
        setLoading(true);
        try {
            if (croppedBlob) {
                const formData = new FormData();

                formData.append("profileImage", croppedBlob, "profile.jpg");
                formData.append("username", username);
                const res = await axios.post(
                    "http://localhost:3001/api/user/profile-image",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
                saveProfileToStorage(res.data?.profilePic || previewUrl);
            } else {
                saveProfileToStorage(assets.duser);
            }

            if (username !== user?.username) {
                const res = await axios.post("http://localhost:3001/api/user/update-username", { username });
                const updated = JSON.parse(localStorage.getItem("chat_user"));
                localStorage.setItem("chat_user", JSON.stringify({
                    ...updated,
                    username: res.data?.username || username,
                }));
            }

            showMessage("All set! 🎉");
            setTimeout(() => navigate("/chat"), 900);
        } catch (err) {
            console.error("Onboarding error:", err);
            showMessage("Something went wrong, try again");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        saveProfileToStorage(assets.duser);
        navigate("/chat");
    };

    return (
        <>
            {showCrop && (
                <CropModal
                    imgSrc={rawImgSrc}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}

            <div
                className="login-page"
                style={{
                    background: `url(${assets.darktheme2}) center/cover no-repeat`,
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    display: "flex", justifyContent: "center", alignItems: "center",
                    overflow: "hidden",
                }}
            >
                <div
                    className="login-formm"
                    style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        gap: "1px", backgroundColor: "white", padding: "6px",
                        borderRadius: "13px", border: "0.5px solid darkgray",
                    }}
                >
                    <p id="para">SET UP PROFILE</p>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            width: "110px", height: "110px",
                            borderRadius: "16px", overflow: "hidden",
                            cursor: "pointer", position: "relative",
                            border: isHovered ? "2.5px solid rgba(100,100,255,0.8)" : "1.3px solid black",
                            boxShadow: isHovered ? "0 0 18px rgba(100,100,255,0.4)" : "none",
                            transition: "border 0.25s ease, box-shadow 0.25s ease",
                        }}
                    >
                        <img
                            src={previewUrl || assets.duser}
                            alt="profile"
                            style={{
                                width: "100%", height: "100%", objectFit: "cover",
                                transition: "filter 0.25s ease",
                                filter: isHovered ? "brightness(0.45)" : "brightness(1)",
                            }}
                        />
                        <div style={{
                            position: "absolute", top: 0, left: 0,
                            width: "100%", height: "100%",
                            display: "flex", flexDirection: "column",
                            justifyContent: "center", alignItems: "center", gap: "4px",
                            opacity: isHovered ? 1 : 0,
                            transition: "opacity 0.25s ease",
                            pointerEvents: "none",
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                                viewBox="0 0 24 24" fill="none" stroke="white"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                            <span style={{ color: "white", fontSize: "10px", fontWeight: "600", letterSpacing: "0.5px" }}>
                                {previewUrl ? "CHANGE" : "ADD PHOTO"}
                            </span>
                        </div>
                    </div>

                    <p style={{ fontSize: "12px", opacity: 0.6, margin: "6px 0 10px", color: "#333" }}>
                        Tap to {previewUrl ? "change" : "add"} photo
                    </p>

                    <input ref={fileInputRef} type="file" accept="image/*"
                        onChange={handleFileChange} style={{ display: "none" }} />

                    <input
                        style={{ textAlign: "center" }}
                        type="text"
                        placeholder="Confirm your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        id="user"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        onMouseEnter={() => setIsHover(true)}
                        onMouseLeave={() => setIsHover(false)}
                        style={{
                            transition: "0.1s ease-out", backgroundColor: "white",
                            borderRadius: "13px",
                            border: isHover ? "1px solid black" : "0px solid black",
                            padding: "6px", opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? "Saving..." : "Let's Go →"}
                    </button>

                    <button
                        className="our-botton-2"
                        onClick={handleSkip}
                        onMouseEnter={() => setIsHover2(true)}
                        onMouseLeave={() => setIsHover2(false)}
                        style={{
                            transition: "0.1s ease-out", borderRadius: "13px",
                            border: isHover2 ? "1px solid black" : "0px solid black",
                            padding: "6px",
                        }}
                    >
                        Skip for now
                    </button>
                </div>

                {showMsg && <div id="div2"><p>{message}</p></div>}
            </div>
        </>
    );
}

export default Onboarding;