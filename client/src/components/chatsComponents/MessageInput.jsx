import React from "react";
import assets from "../../assets/assets";

const MessageInput = ({
    newMessage,isDark,
    setNewMessage,
    handleSendMessage,
    openFilePicker,
    handleFileChange,
    fileInputRef,
}) => {
    return (
        <div className="input-div2">
            <label
                style={{ cursor: "pointer", fontSize: "24px", color: "#4CAF50", marginRight: "10px" }}
                onClick={openFilePicker}
            >
                <img className="input-div2-icons" src={assets.add} alt="add" />
            </label>

            <input
                style={{ display: "none" }}
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                id="file-input"
            />

            <span style={{ marginRight: "10px" }}>
                <img className="input-div2-icons" src={assets.mic} alt="mic" />
            </span>

            <input
                style={{ color:isDark? "white" :"black"}}
                id="input-vorodi"
                type="text"
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                        await handleSendMessage();
                    }
                }}
            />

            <button id="button-input-div2" onClick={handleSendMessage}>
                <img src={assets.send} alt="send" />
            </button>
        </div>
    );
};

export default MessageInput;
