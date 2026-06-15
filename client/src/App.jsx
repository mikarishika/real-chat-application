import { Routes, Route, Navigate } from "react-router-dom";
import ComponentLogin from "./components/loginComponent";
import RealChat from "./components/realChatComponent";
import Onboarding from "./components/Onboarding";

function App() {
    return (
        <Routes>
            <Route path="/login"       element={<ComponentLogin />} />
            <Route path="/onboarding"  element={<Onboarding />} />
            <Route path="/chat"        element={<RealChat />} />
            <Route path="*"            element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default App;

// import { useEffect, useState } from "react";
// import RealChat from "./components/realChatComponent";
// import ComponentLogin from "./loginComponent";


// function App() {
//   const [me, setMe] = useState(null);

//   // فقط یک بار موقع لود برنامه، یوزر ذخیره‌شده رو از localStorage بخون
//   useEffect(() => {
//     const savedUser = localStorage.getItem("chat_user");
//     if (savedUser) {
//       try {
//         setMe(JSON.parse(savedUser));
//       } catch (e) {
//         console.error("Cannot parse chat_user", e);
//         localStorage.removeItem("chat_user");
//       }
//     }
//   }, []);

//   const handleLogin = (user) => {
//     console.log("handleLogin called with:", user); // برای تست
//     setMe(user);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("chat_user");
//     setMe(null);
//   };

//   console.log("App render, me =", me); // برای تست

//   return (
//     <>
//       {!me ? (
//         <ComponentLogin onLogin={handleLogin} />
//       ) : (
//         <RealChat me={me} onLogout={handleLogout} />
//       )}
//     </>
//   );
// }

// export default App;







// import ComponentLogin from "./loginComponent"
// import RealChat from "./components/realChatComponent"
// import Starfield from "./features/starComponent"
// function App() {

//     return (
//         <div>
//             <RealChat/>
//         </div>
//     )
// }

// export default App
