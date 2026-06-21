import React, { useRef, useEffect } from "react";

/**
 * StarfieldBackground
 * بک‌گراند زنده با افکت آرورا سبز تاریک + ستاره‌های در حال حرکت (پارالاکس آروم)
 *
 * استفاده:
 *   <StarfieldBackground />
 * یا با کانتینر:
 *   <div style={{ position: "relative", minHeight: "100vh" }}>
 *     <StarfieldBackground />
 *     <YourContent />
 *   </div>
 *
 * این کامپوننت با position: fixed/absolute پشت محتوا قرار میگیره — کافیه والدش position: relative داشته باشه.
 */

const THEMES = {
    emerald: {
        bg: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20, 70, 45, 0.55) 0%, rgba(5, 15, 10, 1) 55%), #050b08",
        glowA: "rgba(34, 139, 80, 0.35)",
        glowB: "rgba(20, 110, 70, 0.3)",
        star: "255, 255, 255",
    },
    violet: {
        bg: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(76, 29, 110, 0.55) 0%, rgba(10, 5, 18, 1) 55%), #0a0512",
        glowA: "rgba(188, 117, 255, 0.35)",
        glowB: "rgba(99, 30, 200, 0.3)",
        star: "230, 210, 255",
    },
};

const StarfieldBackground = ({ fixed = true, starCount = 140, colorMode = "emerald" }) => {
    const theme = THEMES[colorMode] || THEMES.emerald;
    const canvasRef = useRef(null);
    const starsRef = useRef([]);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let width, height;

        const resize = () => {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        const createStars = () => {
            const stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.4 + 0.3,
                    baseOpacity: Math.random() * 0.5 + 0.3,
                    twinkleSpeed: Math.random() * 0.015 + 0.005,
                    twinklePhase: Math.random() * Math.PI * 2,
                    driftX: (Math.random() - 0.5) * 0.04,
                    driftY: (Math.random() - 0.5) * 0.04,
                });
            }
            starsRef.current = stars;
        };

        const handleResize = () => {
            resize();
            createStars();
        };

        resize();
        createStars();
        window.addEventListener("resize", handleResize);

        const draw = (time) => {
            ctx.clearRect(0, 0, width, height);

            starsRef.current.forEach((star) => {
                // حرکت آروم
                star.x += star.driftX;
                star.y += star.driftY;

                // wrap around edges
                if (star.x < 0) star.x = width;
                if (star.x > width) star.x = 0;
                if (star.y < 0) star.y = height;
                if (star.y > height) star.y = 0;

                // چشمک‌زدن
                const twinkle =
                    Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
                const opacity = star.baseOpacity * twinkle;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${theme.star}, ${opacity})`;
                ctx.shadowColor = `rgba(${theme.star}, 0.8)`;
                ctx.shadowBlur = star.radius * 2;
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(draw);
        };

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [starCount, colorMode]);

    return (
        <div
            style={{
                position: fixed ? "fixed" : "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%",
                overflow: "hidden",
                zIndex: -1,
                background: theme.bg,
            }}
        >
            {/* لایه‌های آرورا — بالا */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse 60% 40% at 20% 10%, ${theme.glowA}, transparent 60%)`,
                    animation: "auroraDrift1 18s ease-in-out infinite alternate",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse 50% 35% at 80% 15%, ${theme.glowB}, transparent 60%)`,
                    animation: "auroraDrift2 22s ease-in-out infinite alternate",
                    pointerEvents: "none",
                }}
            />

            {/* لایه‌های آرورا — پایین */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse 60% 40% at 25% 95%, ${theme.glowA}, transparent 60%)`,
                    animation: "auroraDrift1 18s ease-in-out infinite alternate-reverse",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse 50% 35% at 75% 90%, ${theme.glowB}, transparent 60%)`,
                    animation: "auroraDrift2 22s ease-in-out infinite alternate-reverse",
                    pointerEvents: "none",
                }}
            />

            {/* canvas ستاره‌ها */}
            <canvas
                ref={canvasRef}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                }}
            />

            <style>{`
                @keyframes auroraDrift1 {
                    0%   { transform: translate(0, 0) scale(1); opacity: 0.8; }
                    50%  { transform: translate(4%, 3%) scale(1.08); opacity: 1; }
                    100% { transform: translate(-3%, -2%) scale(1); opacity: 0.7; }
                }
                @keyframes auroraDrift2 {
                    0%   { transform: translate(0, 0) scale(1); opacity: 0.7; }
                    50%  { transform: translate(-4%, 2%) scale(1.05); opacity: 0.9; }
                    100% { transform: translate(3%, -3%) scale(1); opacity: 0.6; }
                }
            `}</style>
        </div>
    );
};

export default StarfieldBackground;