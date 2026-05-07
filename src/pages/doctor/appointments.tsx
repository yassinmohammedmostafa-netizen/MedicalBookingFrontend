import { useState } from "react";
import { format } from "date-fns";
import {
  useGetAppointments,
  useUpdateAppointmentStatus,
  getGetAppointmentsQueryKey,
  customFetch,
} from "../../../api-client-react/src/index.js";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/translations";
import { CheckCircle, DollarSign, Users, Calendar, MessageSquare, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { AppointmentChat } from "@/components/appointment-chat";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function DoctorAppointments() {
  const { data: appointments, isLoading } = useGetAppointments();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useT();
  const [openChatId, setOpenChatId] = useState<number | null>(null);

  const updateStatusMutation = useUpdateAppointmentStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAppointmentsQueryKey() });
        toast({ title: t("admin_statusUpdated") });
      },
    },
  });

  return (
    <Layout>
      <div className="container px-4 mx-auto py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">{t("dr_apptTitle")}</h1>
            <p className="text-muted-foreground">{t("dr_apptSub")}</p>
          </div>
          {appointments && (
            <div className="text-sm text-muted-foreground">
              {appointments.length} {t("admin_total")} · {appointments.filter(a => a.isPaid).length} {t("status_paid")}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                    <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-28 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !appointments || appointments.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
              <h3 className="text-xl font-medium mb-2">{t("dr_noApptSub")}</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {appointments.map(app => {
              const chatOpen = openChatId === app.id;
              return (
                <Card key={app.id} className="overflow-visible transition-all">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Time */}
                      <div className="flex items-center gap-2 w-full sm:w-48 shrink-0">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <div className="font-semibold text-sm text-primary">
                            {app.startTime ? format(new Date(app.startTime), "MMM d, yyyy") : "TBD"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {app.startTime ? format(new Date(app.startTime), "h:mm a") : ""}
                          </div>
                        </div>
                      </div>

                      {/* Patient */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{app.patientName}</div>
                        <div className="text-xs text-muted-foreground truncate">{app.patientEmail} · {app.patientPhone}</div>
                      </div>

                      {/* Price */}
                      <div className="text-sm font-medium shrink-0">EGP {app.doctorPrice}</div>

                      {/* Status */}
                      <div className="shrink-0 flex gap-2">
                        {app.status === "completed" ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 py-1.5 px-3">
                            <CheckCircle className="w-3 h-3 me-1" /> {t("status_completed")}
                          </Badge>
                        ) : app.status === "cancelled" ? (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border py-1.5 px-3">
                            <XCircle className="w-3 h-3 me-1" /> {t("status_cancelled")}
                          </Badge>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              onClick={() => updateStatusMutation.mutate({ id: app.id, data: { status: "completed" as any } })}
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="w-3 h-3" /> {t("dr_markDone")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={async () => {
                                if (!window.confirm(t("common_cancelConfirm") || "Are you sure you want to cancel this appointment?")) return;
                                try {
                                  await customFetch(`/api/appointments/${app.id}/cancel`, {
                                    method: "PATCH",
                                  });
                                  queryClient.invalidateQueries({ queryKey: getGetAppointmentsQueryKey() });
                                  toast({ title: t("appt_cancelled") || "Appointment cancelled" });
                                } catch (err) {
                                  toast({ title: t("appt_cancelFailed") || "Failed to cancel", variant: "destructive" });
                                }
                              }}
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="w-3 h-3" /> {t("common_cancel")}
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Payment status - display only */}
                      <div className="shrink-0">
                        {app.isPaid ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1.5 px-3">
                            <CheckCircle className="w-3 h-3 me-1" /> {t("status_paid")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 py-1.5 px-3">
                            <DollarSign className="w-3 h-3 me-1" /> {t("appt_pendingPayment")}
                          </Badge>
                        )}
                      </div>

                      {/* Chat toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenChatId(chatOpen ? null : app.id)}
                        className="shrink-0 gap-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {chatOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    </div>

                    {app.status === "cancelled" && (
                      <div className="mt-3 text-xs bg-red-50 text-red-700 px-3 py-2 rounded-md border border-red-100">
                        {t("appt_cancelledBy") || "Cancelled by"}: {" "}
                        <span className="font-bold">
                          {app.cancelledBy === app.patientId 
                            ? t("profile_rolePatient") || "Patient" 
                            : app.cancelledBy === app.doctorUserId 
                              ? t("common_you") || "You" 
                              : t("profile_roleAdmin") || "Admin"}
                        </span>
                        {app.cancelledAt && (
                          <span className="ms-1 opacity-70">
                            ({format(new Date(app.cancelledAt), "MMM d, h:mm a")})
                          </span>
                        )}
                      </div>
                    )}

                    {app.notes && (
                      <div className="mt-3 text-xs bg-muted/50 px-3 py-2 rounded-md text-muted-foreground italic border-s-2 border-primary/30">
                        "{app.notes}"
                      </div>
                    )}

                    {chatOpen && (
                      <div className="mt-4 pt-4 border-t">
                        <AppointmentChat
                          appointmentId={app.id}
                          patientName={app.patientName}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
