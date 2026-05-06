import { useMemo } from "react";
import { format } from "date-fns";
import {
  useGetAdminAppointments,
  useMarkAppointmentPaid,
  useMarkAppointmentUnpaid,
  useUpdateAppointmentStatus,
  getGetAdminAppointmentsQueryKey
} from "../../../api-client-react/src/index.js";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, DollarSign, Calendar, Zap, Undo2, Search, Filter, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { AppointmentChat } from "@/components/appointment-chat";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminAppointments() {
  const { data: appointments, isLoading } = useGetAdminAppointments();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useT();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [openChatId, setOpenChatId] = useState<number | null>(null);

  const markPaidMutation = useMarkAppointmentPaid({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminAppointmentsQueryKey() });
        toast({ title: t("admin_apptMarkedPaid") });
      }
    }
  });

  const markUnpaidMutation = useMarkAppointmentUnpaid({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminAppointmentsQueryKey() });
        toast({ title: t("admin_apptMarkedUnpaid") });
      }
    }
  });

  const updateStatusMutation = useUpdateAppointmentStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminAppointmentsQueryKey() });
        toast({ title: t("admin_statusUpdated") });
      }
    }
  });

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    const q = search.trim().toLowerCase();
    const seen = new Set<number>();
    
    return appointments.filter(a => {
      if (seen.has(a.id)) return false;
      
      const matchesSearch = !q || 
        (a.patientName?.toLowerCase().includes(q)) || 
        (a.doctorName?.toLowerCase().includes(q)) ||
        (a.patientEmail?.toLowerCase().includes(q));
      
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      
      const matchesDate = !dateFilter || (a.startTime && a.startTime.startsWith(dateFilter));

      if (matchesSearch && matchesStatus && matchesDate) {
        seen.add(a.id);
        return true;
      }
      return false;
    });
  }, [appointments, search, statusFilter, dateFilter]);

  return (
    <Layout>
      <div className="container px-4 mx-auto py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">{t("admin_allAppts")}</h1>
          {filteredAppointments && (
            <span className="text-sm text-muted-foreground">
              {filteredAppointments.length} {t("admin_total")}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-8 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="ps-9"
              placeholder={t("admin_searchAppts") || "Search by patient or doctor..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" />
                  <SelectValue placeholder={t("admin_filterStatus")} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin_allStatuses") || "All Statuses"}</SelectItem>
                <SelectItem value="pending">{t("status_pending")}</SelectItem>
                <SelectItem value="confirmed">{t("status_confirmed")}</SelectItem>
                <SelectItem value="completed">{t("status_completed")}</SelectItem>
                <SelectItem value="cancelled">{t("status_cancelled")}</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              className="w-[160px]"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            
            {(search || statusFilter !== "all" || dateFilter) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSearch(""); setStatusFilter("all"); setDateFilter(""); }}
                className="text-muted-foreground text-xs"
              >
                {t("common_reset") || "Reset"}
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4 h-20 animate-pulse bg-muted/30" /></Card>
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">{t("admin_noApptsFound")}</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {filteredAppointments.map((app) => (
              <Card key={app.id} className="overflow-visible">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center text-primary font-semibold text-sm">
                          <Calendar className="w-3.5 h-3.5 me-1.5 shrink-0" />
                          {app.isInstant
                            ? t("admin_instantSession")
                            : app.startTime
                              ? format(new Date(app.startTime), "MMM d, yyyy · h:mm a")
                              : "TBD"}
                        </div>
                        {app.isInstant && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            <Zap className="w-3 h-3 me-1" /> {t("admin_instantBadge")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t("admin_patient")} </span>
                          <span className="font-medium">{app.patientName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("admin_doctor")} </span>
                          <span className="font-medium">{app.doctorName}</span>
                          {app.doctorSpecialty && (
                            <span className="text-muted-foreground"> · {app.doctorSpecialty}</span>
                          )}
                        </div>
                        <div className="font-semibold text-foreground">EGP {app.doctorPrice}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Select
                        value={app.status}
                        onValueChange={(val) => updateStatusMutation.mutate({ id: app.id, data: { status: val as any } })}
                      >
                        <SelectTrigger className={`w-[130px] h-8 text-xs border ${statusColors[app.status] ?? ""}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t("status_pending")}</SelectItem>
                          <SelectItem value="confirmed">{t("status_confirmed")}</SelectItem>
                          <SelectItem value="completed">{t("status_completed")}</SelectItem>
                          <SelectItem value="cancelled">{t("status_cancelled")}</SelectItem>
                        </SelectContent>
                      </Select>

                      {app.isPaid ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap">
                            <CheckCircle className="w-3 h-3 me-1" /> {t("status_paid")}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-muted-foreground hover:text-foreground whitespace-nowrap"
                            onClick={() => markUnpaidMutation.mutate({ id: app.id })}
                            disabled={markUnpaidMutation.isPending}
                            data-testid={`button-admin-mark-unpaid-${app.id}`}
                          >
                            <Undo2 className="w-3 h-3 me-1" /> {t("admin_markUnpaid")}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 whitespace-nowrap"
                          onClick={() => markPaidMutation.mutate({ id: app.id })}
                          disabled={markPaidMutation.isPending}
                          data-testid={`button-admin-mark-paid-${app.id}`}
                        >
                          <DollarSign className="w-3 h-3 me-1" /> {t("status_markPaid")}
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenChatId(openChatId === app.id ? null : app.id)}
                      className="shrink-0 gap-1 h-8"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {openChatId === app.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>

                  {openChatId === app.id && (
                    <div className="mt-4 pt-4 border-t">
                      <AppointmentChat
                        appointmentId={app.id}
                        doctorName={app.doctorName}
                        patientName={app.patientName}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
