import { Link } from "wouter";
import { useGetAdminStats, setBaseUrl, customFetch } from "../../../api-client-react/src/index.js";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, Calendar, CreditCard, DollarSign, ArrowRight, ClipboardList, Sparkles, CheckCircle, ShieldAlert } from "lucide-react";
import { useT } from "@/lib/translations";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();
  const t = useT();
  const { toast } = useToast();

  const statCards = stats ? [
    { labelKey: "admin_totalPatients" as const, value: stats.totalPatients, color: "bg-primary/5", textColor: "text-primary", iconBg: "bg-primary/10", Icon: Users },
    { labelKey: "admin_totalDoctors" as const, value: stats.totalDoctors, color: "bg-blue-50", textColor: "text-blue-700", iconBg: "bg-blue-100", Icon: Activity },
    { labelKey: "admin_totalRevenue" as const, value: `EGP ${stats.totalRevenue}`, color: "bg-emerald-50", textColor: "text-emerald-700", iconBg: "bg-emerald-100", Icon: DollarSign },
    { labelKey: "admin_allAppts" as const, value: stats.totalAppointments, color: "bg-indigo-50", textColor: "text-indigo-700", iconBg: "bg-indigo-100", Icon: Calendar },
    { labelKey: "admin_paidAppointments" as const, value: stats.paidAppointments, color: "bg-green-50", textColor: "text-green-700", iconBg: "bg-green-100", Icon: CreditCard },
    { labelKey: "admin_pendingPayments" as const, value: stats.pendingAppointments, color: "bg-amber-50", textColor: "text-amber-700", iconBg: "bg-amber-100", Icon: CreditCard },
    { label: "Profile Changes", value: stats.pendingProfileChanges, color: "bg-purple-50", textColor: "text-purple-700", iconBg: "bg-purple-100", Icon: ShieldAlert },
  ] : [];

  const quickLinks = [
    { labelKey: "admin_allAppts" as const, descKey: "admin_allApptsDesc" as const, href: "/admin/appointments", Icon: ClipboardList, color: "text-primary" },
    { labelKey: "admin_manageDoctors" as const, descKey: "admin_manageDoctorsDesc" as const, href: "/admin/doctors", Icon: Activity, color: "text-blue-600" },
    { labelKey: "admin_manageUsers" as const, descKey: "admin_manageUsersDesc" as const, href: "/admin/users", Icon: Users, color: "text-indigo-600" },
    { labelKey: "admin_paidCalendar" as const, descKey: "admin_paidCalendarDesc" as const, href: "/admin/calendar", Icon: Calendar, color: "text-emerald-600" },
  ];

  return (
    <Layout>
      <div className="container px-4 mx-auto py-12 max-w-6xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1">{t("admin_platformTitle")}</h1>
          <p className="text-muted-foreground">{t("admin_platformSub")}</p>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded animate-pulse mb-3 w-1/2" />
                  <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {statCards.map(({ label, labelKey, value, color, textColor, iconBg, Icon }) => (
              <Card key={labelKey || label} className={`${color} border-none shadow-sm`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{labelKey ? t(labelKey) : label}</p>
                      <h3 className={`text-3xl font-bold ${textColor}`}>{value}</h3>
                    </div>
                    <div className={`p-2 ${iconBg} rounded-lg`}>
                      <Icon className={`w-5 h-5 ${textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">{t("admin_quickAccess")}</h2>
            <div className="grid gap-4">
              {quickLinks.map(({ labelKey, descKey, href, Icon, color }) => (
                <Link key={href} href={href}>
                  <Card className="hover-elevate transition-all duration-200 cursor-pointer hover:border-primary/30 group">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors shrink-0">
                        <Icon className={`w-6 h-6 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold mb-0.5">{t(labelKey)}</div>
                        <div className="text-sm text-muted-foreground">{t(descKey)}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 rtl:group-hover:translate-x-0 transition-all shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {t("admin_devTools") || "Dev Tools (Bypass)"}
            </h2>
            <Card className="border-amber-200 bg-amber-50/30">
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("admin_devToolsDesc") || "Quickly manage system checks for development and testing."}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start gap-2 border-amber-200 hover:bg-amber-100"
                    onClick={async () => {
                      if (!confirm("This will verify all currently unverified users. Continue?")) return;
                      try {
                        await customFetch("/api/admin/dev/verify-all", {
                          method: "POST"
                        });
                        toast({ title: "All users verified" });
                      } catch {
                        toast({ title: "Failed to verify users", variant: "destructive" });
                      }
                    }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {t("admin_verifyAllUsers") || "Verify All Users"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start gap-2 border-amber-200 hover:bg-amber-100"
                    onClick={async () => {
                      if (!confirm("This will approve all currently pending doctors. Continue?")) return;
                      try {
                        await customFetch("/api/admin/dev/approve-all", {
                          method: "POST"
                        });
                        toast({ title: "All doctors approved" });
                      } catch {
                        toast({ title: "Failed to approve doctors", variant: "destructive" });
                      }
                    }}
                  >
                    <Activity className="w-4 h-4 text-blue-600" />
                    {t("admin_approveAllDoctors") || "Approve All Doctors"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
