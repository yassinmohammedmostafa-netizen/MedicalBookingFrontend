import { format, isToday, isTomorrow, isPast } from "date-fns";
import {
  useGetDoctorDashboard,
  useUpdateAppointmentStatus,
  getGetDoctorDashboardQueryKey
} from "../../../api-client-react/src/index.js";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/translations";
import {
  Users, CheckCircle, DollarSign, Clock, Star,
  CalendarDays, ArrowRight, UserRound, AlertCircle, Banknote
} from "lucide-react";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

function DrReviews() {
  const t = useT();
  return <>{t("dr_reviewsCount")}</>;
}

function StarDisplay({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i <= full
                ? "fill-amber-400 text-amber-400"
                : half && i === full + 1
                ? "fill-amber-400/50 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-amber-600">{rating > 0 ? rating.toFixed(1) : "—"}</span>
      <span className="text-xs text-muted-foreground">({count} <DrReviews />)</span>
    </div>
  );
}

function useSlotHelpers() {
  const t = useT();
  const getSlotLabel = (startTime: string | null): string => {
    if (!startTime) return t("dr_unscheduled");
    const d = new Date(startTime);
    if (isToday(d)) return `${t("dr_today")}, ${format(d, "h:mm a")}`;
    if (isTomorrow(d)) return `${t("dr_tomorrow")}, ${format(d, "h:mm a")}`;
    return format(d, "EEE, MMM d • h:mm a");
  };
  const getSlotBadge = (startTime: string | null, status: string) => {
    if (!startTime || status === "completed" || status === "cancelled") return null;
    const d = new Date(startTime);
    if (isToday(d)) return <Badge className="bg-primary/10 text-primary border-none text-xs py-0">{t("dr_today")}</Badge>;
    if (isPast(d) && status !== "completed") return <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs py-0" variant="outline">{t("dr_overdue")}</Badge>;
    return null;
  };
  return { getSlotLabel, getSlotBadge };
}

export default function DoctorDashboard() {
  const { data: dashboard, isLoading, error } = useGetDoctorDashboard({
    query: { refetchInterval: 8000, queryKey: getGetDoctorDashboardQueryKey() }
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useT();
  const { getSlotLabel, getSlotBadge } = useSlotHelpers();

  const updateStatusMutation = useUpdateAppointmentStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDoctorDashboardQueryKey() });
        toast({ title: t("status_updated") });
      },
      onError: () => {
        toast({ title: t("dr_failedStatus"), variant: "destructive" });
      },
    }
  });

  const handleStatusChange = (id: number, status: string) =>
    updateStatusMutation.mutate({ id, data: { status: status as any } });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !dashboard) {
    return (
      <Layout>
        <div className="container px-4 mx-auto py-20 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("common_error") || "Something went wrong"}</h2>
          <p className="text-muted-foreground mb-6">
            {(error as any)?.response?.data?.error || t("common_tryAgain") || "We couldn't load your dashboard. Please try again later."}
          </p>
          <Button onClick={() => window.location.reload()}>
            {t("common_reload") || "Reload Page"}
          </Button>
        </div>
      </Layout>
    );
  }

  const todayAppts = dashboard.recentAppointments.filter(
    a => a.startTime && isToday(new Date(a.startTime)) && a.status !== "cancelled"
  );

  const upcomingAppts = dashboard.recentAppointments.filter(
    a => a.status === "pending" || a.status === "confirmed"
  );

  return (
    <Layout>
      <div className="container px-4 mx-auto py-10 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t("dr_dashTitle")}</h1>
            <p className="text-muted-foreground mt-1">
              {(dashboard as any).specialty && `${(dashboard as any).specialty} • `}
              {t("dr_welcomeBack")}, {(dashboard as any).doctorName?.split(" ")[0] ?? t("dr_doctor")}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <StarDisplay rating={(dashboard as any).rating ?? 0} count={(dashboard as any).reviewCount ?? 0} />
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/doctor/slots">
              <Button variant="outline" size="sm">{t("dr_manageSlots")}</Button>
            </Link>
            <Link href="/doctor/appointments">
              <Button size="sm">{t("dr_viewAllAppts")} <ArrowRight className="w-3.5 h-3.5 ms-1.5" /></Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{t("dr_pending")}</p>
                  <p className="text-3xl font-bold text-primary">{dashboard.upcomingCount}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg"><Clock className="w-4 h-4 text-primary" /></div>
              </div>
              {todayAppts.length > 0 && (
                <p className="text-xs text-primary/70 mt-2 font-medium">{todayAppts.length} {t("dr_todayCount")}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-50">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{t("status_completed")}</p>
                  <p className="text-3xl font-bold text-blue-700">{dashboard.completedCount}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg"><CheckCircle className="w-4 h-4 text-blue-700" /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-amber-50">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{t("dr_pendingPayment")}</p>
                  <p className="text-3xl font-bold text-amber-700">{dashboard.pendingPaymentCount}</p>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg"><Banknote className="w-4 h-4 text-amber-700" /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-emerald-50">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{t("dr_revenue")}</p>
                  <p className="text-3xl font-bold text-emerald-700">
                    <span className="text-base">{t("common_egp")}</span> {dashboard.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg"><DollarSign className="w-4 h-4 text-emerald-700" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments Alert */}
        {todayAppts.length > 0 && (
          <Card className="border-primary/30 bg-primary/5 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary">{t("dr_todaysSchedule")} ({todayAppts.length} {todayAppts.length > 1 ? t("dr_appointments") : t("dr_appointment")})</span>
              </div>
              <div className="flex flex-col gap-2">
                {todayAppts.map(appt => (
                  <div key={appt.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                        {appt.patientName?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{appt.patientName}</div>
                        <div className="text-xs text-muted-foreground">{appt.startTime ? format(new Date(appt.startTime), "h:mm a") : "TBD"}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={STATUS_COLORS[appt.status] ?? ""}>
                      {appt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Appointments */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t("dr_recentAppts")}</h2>
          <Link href="/doctor/appointments">
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              {t("dr_allAppointments")} <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-3">
          {dashboard.recentAppointments.length === 0 ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-lg font-medium mb-1">{t("dr_noAppts")}</h3>
                <p className="text-sm text-muted-foreground">{t("dr_emptySub")}</p>
              </CardContent>
            </Card>
          ) : (
            dashboard.recentAppointments.map(appt => {
              const slotLabel = getSlotLabel(appt.startTime ?? null);
              const todayBadge = getSlotBadge(appt.startTime ?? null, appt.status);

              return (
                <Card key={appt.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">

                    {/* Patient Avatar + Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {appt.patientName?.charAt(0)?.toUpperCase() ?? <UserRound className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{appt.patientName ?? t("dr_unknownPatient")}</div>
                        <div className="text-xs text-muted-foreground truncate">{appt.patientEmail}</div>
                      </div>
                    </div>

                    {/* Slot Time */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground sm:w-52 shrink-0">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{slotLabel}</span>
                      {todayBadge}
                    </div>

                    {/* Status + Payment */}
                    <div className="flex items-center gap-2 shrink-0">
                      {appt.status === "completed" ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-1 px-2.5">
                          <CheckCircle className="w-3 h-3 me-1" /> {t("status_completed")}
                        </Badge>
                      ) : appt.status === "cancelled" ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs py-1 px-2.5">
                          {t("status_cancelled")}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          onClick={() => handleStatusChange(appt.id, "completed")}
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle className="w-3 h-3" /> {t("dr_markDone")}
                        </Button>
                      )}

                      {appt.isPaid ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0 text-xs">
                          <CheckCircle className="w-3 h-3 me-1" /> {t("dr_paid")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shrink-0 text-xs">
                          {t("dr_unpaid")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {appt.notes && (
                    <div className="px-4 pb-3 pt-0">
                      <p className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-1.5">
                        <span className="font-medium">{t("dr_note")}</span> {appt.notes}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
