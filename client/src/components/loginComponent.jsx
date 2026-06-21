import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/login.css";
import axios from "axios";
import StarfieldBackground from "./chatsComponents/StarfieldBackground";


function ComponentLogin({ onLogin }) {
    const [showDiv, setShowDiv] = useState(false);
    const [message, setMessage] = useState("");
    const [isSignupMode, setIsSignupMode] = useState(true);

    const navigate = useNavigate();

    const showMessage = (msg, duration = 1500) => {
        setMessage(msg);
        setShowDiv(true);
        setTimeout(() => setShowDiv(false), duration);
    };

    const handleSubmit = async () => {
        const username = document.getElementById("user").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            showMessage("You didn't enter Password and Username");
            return;
        }

        if (password.length < 6) {
            showMessage("Password is too short! (At least 6 characters)");
            return;
        }

        try {
            const url = isSignupMode
                ? "http://localhost:3001/api/signup"
                : "http://localhost:3001/api/login";

            const res = await axios.post(url, { username, password });
            const data = res.data;

            if (data.success) {
                showMessage(isSignupMode ? "Sign Up Successful!" : "Login Successful!", 800);

                localStorage.setItem("chat_user", JSON.stringify(data.user));

                if (typeof onLogin === "function") onLogin(data.user);

                document.getElementById("user").value = "";
                document.getElementById("password").value = "";

                // ✅ SignUp → Onboarding | Login → Chat
                setTimeout(() => {
                    navigate(isSignupMode ? "/onboarding" : "/chat");
                }, 800);

            } else {
                showMessage(data.message || "Something went wrong");
            }

        } catch (err) {
            console.error("Auth error:", err);
            showMessage("Server error");
        }
    };

    return (
        <div
            className="login-page"
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
            }}
        >
            <StarfieldBackground colorMode={isSignupMode ? "emerald":"violet"  } />
            <div className="login-form">
                <p id="para">{isSignupMode ? "REGISTER" : "WELCOME"}</p>

                <input
                    id="user"
                    placeholder={isSignupMode ? "Create Username" : "Enter Your Username"}
                    type="text"
                /><br />

                <input
                    id="password"
                    placeholder={isSignupMode ? "Create Password" : "Enter Your Password"}
                    type="password"
                /><br />

                <button onClick={handleSubmit} className="our-botton">
                    {isSignupMode ? "Sign Up" : "Login"}
                </button>

                <p id="login-para">
                    {isSignupMode ? "Already have an account?" : "Don't have an account?"}
                    <button className="our-botton-2" onClick={() => setIsSignupMode(!isSignupMode)}>
                        {isSignupMode ? "Login" : "Sign Up"}
                    </button>
                </p>
            </div>

            {showDiv && (
                <div id="div2">
                    <p>{message}</p>
                </div>
            )}
        </div>
    );
}

export default ComponentLogin;