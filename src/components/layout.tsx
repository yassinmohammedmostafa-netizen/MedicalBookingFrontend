import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { useT } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import {
  LogOut, Activity, Menu, X,
  LayoutDashboard, Calendar, Clock, Users, ClipboardList, Stethoscope, UserCircle, MessageSquare
} from "lucide-react";
import { useLogoutUser, useUpdateProfile } from "../../api-client-react/src/index.js";
import { useQueryClient } from "@tanstack/react-query";
import type { Lang } from "@/lib/language";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavLink { label: string; href: string; icon?: React.ReactNode }

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogoutUser();
  const updateProfileMutation = useUpdateProfile();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const t = useT();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    logout();
    setLocation("/");
    setMenuOpen(false);
  };

  const handleLangToggle = async () => {
    const newLang: Lang = lang === "en" ? "ar" : "en";
    setLang(newLang);
    if (user) {
      try {
        await updateProfileMutation.mutateAsync({ data: { preferredLang: newLang } });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      } catch {
        setLang(lang);
      }
    }
  };

  const publicLinks: NavLink[] = [
    { label: t("nav_findDoctor"), href: "/doctors", icon: <Stethoscope className="w-4 h-4" /> },
  ];

  const patientLinks: NavLink[] = [
    { label: t("nav_myAppointments"), href: "/appointments",  icon: <ClipboardList className="w-4 h-4" /> },
    { label: t("nav_profile"),        href: "/profile",        icon: <UserCircle className="w-4 h-4" /> },
  ];

  const doctorLinks: NavLink[] = [
    { label: t("nav_dashboard"),    href: "/doctor/dashboard",    icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: t("nav_appointments"), href: "/doctor/appointments", icon: <ClipboardList className="w-4 h-4" /> },
    { label: t("nav_slots"),        href: "/doctor/slots",        icon: <Clock className="w-4 h-4" /> },
    { label: t("nav_calendar"),     href: "/doctor/calendar",     icon: <Calendar className="w-4 h-4" /> },
    { label: t("nav_profile"),      href: "/doctor/profile",      icon: <UserCircle className="w-4 h-4" /> },
  ];

  const adminLinks: NavLink[] = [
    { label: t("nav_dashboard"),    href: "/admin",               icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: t("nav_appointments"), href: "/admin/appointments",  icon: <ClipboardList className="w-4 h-4" /> },
    { label: t("nav_doctors"),      href: "/admin/doctors",       icon: <Stethoscope className="w-4 h-4" /> },
    { label: t("nav_users"),        href: "/admin/users",         icon: <Users className="w-4 h-4" /> },
    { label: t("nav_calendar"),     href: "/admin/calendar",      icon: <Calendar className="w-4 h-4" /> },
    { label: t("nav_reviews") || "Reviews", href: "/admin/reviews", icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const roleLinks =
    user?.role === "patient" ? [...publicLinks, ...patientLinks] :
    user?.role === "doctor"  ? ((user as any).isApproved ? doctorLinks : [{ label: t("common_status") || "Status", href: "/doctor/status", icon: <Activity className="w-4 h-4" /> }]) :
    user?.role === "admin"   ? adminLinks   : [];

  const allLinks = user ? roleLinks : publicLinks;

  const LangToggle = ({ className = "" }: { className?: string }) => (
    <button
      onClick={handleLangToggle}
      aria-label="Toggle language"
      className={`text-sm font-semibold px-2.5 py-1 rounded-md border border-border hover:bg-muted transition-colors ${className}`}
    >
      {lang === "en" ? "عربي" : "EN"}
    </button>
  );

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {allLinks.map(link => {
        const active = location === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-2 transition-colors font-medium
              ${mobile
                ? `px-4 py-3 rounded-lg text-base w-full ${active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`
                : `text-sm ${active ? "text-primary" : "text-muted-foreground hover:text-primary"}`
              }`}
          >
            {mobile && link.icon}
            {link.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center mx-auto px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 me-6 shrink-0" onClick={() => setMenuOpen(false)}>
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-primary">Esaal</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            <NavItems />
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex ms-auto items-center gap-3">
            <LangToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={(user as any).avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                      {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate max-w-[140px]">{user.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="h-4 w-4 me-2" />
                  {t("nav_logout")}
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" data-testid="link-login">{t("nav_login")}</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" data-testid="link-register">{t("nav_signUp")}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: right side */}
          <div className="flex md:hidden ms-auto items-center gap-2">
            <LangToggle />
            {!user && (
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-sm">{t("nav_login")}</Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-3 space-y-1 shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 mb-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("common_menu")}</span>
              <LangToggle />
            </div>
            <NavItems mobile />

            <div className="border-t pt-3 mt-3">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground truncate">{user.name}</div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg w-full text-start text-destructive hover:bg-destructive/10 font-medium"
                  >
                    <LogOut className="w-4 h-4" /> {t("nav_logout")}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full" data-testid="link-login-mobile">{t("nav_login")}</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full" data-testid="link-register-mobile">{t("nav_signUp")}</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
