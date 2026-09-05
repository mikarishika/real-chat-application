import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/chat/Sidebar";
import NoChatSelected from "../components/chat/NoChatSelected";
import ChatContainer from "../components/chat/ChatContainer";
import Starfield from "../components/StarFild";
import { useThemeStore } from "../store/useThemeStore";
import { getTheme } from "../constants";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { theme } = useThemeStore();
  const palette = getTheme(theme);

  return (
    <div className="relative h-[calc(100vh-4rem)] mt-16 overflow-hidden bg-[var(--app-bg)]">
      <Starfield key={theme} theme={theme} />

      <div className="relative z-10 h-full w-full">
        <div
          className="w-full h-full backdrop-blur-[1px]"
          style={{ backgroundColor: `${palette.colors[0]}55` }}
        >
          <div className="flex h-full w-full overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
