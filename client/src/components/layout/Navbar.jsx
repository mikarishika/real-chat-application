import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { getTheme } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const palette = getTheme(theme);

  return (
    <header
      className="fixed top-0 z-40 w-full border-b text-white backdrop-blur-lg"
      style={{
        backgroundColor: `${palette.colors[2]}e8`,
        borderColor: `${palette.colors[1]}55`,
      }}
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div
                className="flex size-9 items-center justify-center rounded-lg border"
                style={{
                  backgroundColor: `${palette.colors[1]}22`,
                  borderColor: `${palette.colors[1]}55`,
                }}
              >
                <MessageSquare className="h-5 w-5" style={{ color: palette.colors[1] }} />
              </div>
              <h1 className="text-lg font-bold text-white/90">HAM SEDA</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className="btn btn-sm gap-2 border text-white/85 transition-colors hover:text-white"
              style={{
                backgroundColor: `${palette.colors[0]}55`,
                borderColor: `${palette.colors[1]}44`,
              }}
            >
                <Settings className="h-4 w-4" style={{ color: palette.colors[1] }} />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to={"/profile"}
                  className="btn btn-sm gap-2 border text-white/85 transition-colors hover:text-white"
                  style={{
                    backgroundColor: `${palette.colors[0]}55`,
                    borderColor: `${palette.colors[1]}44`,
                  }}
                >
                  <User className="size-5" style={{ color: palette.colors[1] }} />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  onClick={logout}
                >
                  <LogOut className="size-5" style={{ color: palette.colors[1] }} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
