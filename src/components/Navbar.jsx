import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Ticket, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const { user, logout } = useAuth();

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "organizer") return "/organizer/dashboard";
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    if (user?.role === "admin") return "Admin Dashboard";
    if (user?.role === "organizer") return "Organizer Dashboard";
    return "My Dashboard";
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-primary"
        >
          <Ticket className="w-6 h-6" />
          Venuva
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">

          <Link
            to="/events"
            className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
          >
            All Events
          </Link>

          {user ? (
            <>
              <Link
                to={getDashboardPath()}
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                {getDashboardLabel()}
              </Link>
              
              <div className="flex items-center gap-4 ml-2 border-l pl-6">
                <NotificationBell />
                
                <Button variant="ghost" size="sm" onClick={logout} className="text-slate-600 hover:text-destructive hover:bg-destructive/5">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}

        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-4">
          {user && <NotificationBell />}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] flex flex-col gap-4 pt-12">

              <Link
                to="/events"
                className="text-lg font-medium text-slate-800"
              >
                All Events
              </Link>

              {user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    className="text-lg font-medium text-slate-800"
                  >
                    {getDashboardLabel()}
                  </Link>
                  <Button variant="ghost" onClick={logout} className="justify-start px-0 text-lg font-medium text-destructive hover:bg-transparent">
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="text-lg font-medium text-slate-800"
                >
                  Sign In
                </Link>
              )}

              <Separator className="mt-4" />
              <Button variant="outline" className="w-full mt-2">
                Help Center
              </Button>

            </SheetContent>
          </Sheet>
        </div>

      </div>
    </nav>
  );
}

const Separator = ({ className }) => <div className={`h-px bg-slate-200 ${className}`} />;