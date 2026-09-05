import { getTheme, THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const palette = getTheme(theme);

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">Choose a theme for your chat interface</p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`
                group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                ${theme === t.id ? "bg-base-200" : "hover:bg-base-200/50"}
              `}
              onClick={() => setTheme(t.id)}
            >
              <div className="relative h-8 w-full rounded-md overflow-hidden" style={{ backgroundColor: t.colors[0] }}>
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  {t.colors.map((color) => <div key={color} className="rounded" style={{ backgroundColor: color }}></div>)}
                </div>
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {t.name}
              </span>
            </button>
          ))}
        </div>

        {/* Preview Section */}
        <h3 className="text-lg font-semibold mb-3">Preview</h3>
        <div
          className="overflow-hidden rounded-xl border shadow-lg"
          style={{ borderColor: `${palette.colors[1]}66`, backgroundColor: palette.colors[2] }}
        >
          <div className="p-4" style={{ backgroundColor: `${palette.colors[0]}99` }}>
            <div className="max-w-lg mx-auto">
              {/* Mock Chat UI */}
              <div
                className="overflow-hidden rounded-xl shadow-sm"
                style={{ backgroundColor: `${palette.colors[2]}dd` }}
              >
                {/* Chat Header */}
                <div
                  className="border-b px-4 py-3"
                  style={{ borderColor: `${palette.colors[1]}55` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full font-medium"
                      style={{ backgroundColor: palette.colors[1], color: palette.colors[2] }}
                    >
                      J
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">John Doe</h3>
                      <p className="text-xs text-white/60">Online</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div
                  className="min-h-[200px] max-h-[200px] space-y-4 overflow-y-auto p-4"
                  style={{ backgroundColor: `${palette.colors[2]}cc` }}
                >
                  {PREVIEW_MESSAGES.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className="max-w-[80%] rounded-xl p-3 shadow-sm"
                        style={message.isSent
                          ? { backgroundColor: palette.colors[1], color: palette.colors[2] }
                          : { backgroundColor: `${palette.colors[0]}aa`, color: "white" }}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`
                            text-[10px] mt-1.5
                            text-white/65
                          `}
                        >
                          12:00 PM
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div
                  className="border-t p-4"
                  style={{ borderColor: `${palette.colors[1]}55` }}
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input h-10 flex-1 border-white/20 bg-black/20 text-sm text-white placeholder:text-white/45"
                      placeholder="Type a message..."
                      value="This is a preview"
                      readOnly
                    />
                    <button
                      className="btn h-10 min-h-0 border-0"
                      style={{ backgroundColor: palette.colors[1], color: palette.colors[2] }}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
