import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Ticket } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
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
            className="text-sm font-medium text-slate-600 hover:text-primary"
          >
            All Events
          </Link>

          <Link
            to="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-primary"
          >
            Dashboard
          </Link>

          <Button variant="outline">
            Help
          </Button>

        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
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

              <Link
                to="/dashboard"
                className="text-lg font-medium text-slate-800"
              >
                Dashboard
              </Link>

              <Button variant="outline" className="w-full mt-4">
                Help
              </Button>

            </SheetContent>
          </Sheet>
        </div>

      </div>
    </nav>
  );
}