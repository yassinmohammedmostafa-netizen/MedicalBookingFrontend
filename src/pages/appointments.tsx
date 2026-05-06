import { useState } from "react";
import { format } from "date-fns";
import { useGetAppointments, useRateAppointment, getGetAppointmentsQueryKey } from "../../api-client-react/src/index.js";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Video, MessageSquare, ChevronDown, ChevronUp, Star, Send } from "lucide-react";
import { Link } from "wouter";
import { AppointmentChat } from "@/components/appointment-chat";
import { useT, TranslationKey } from "@/lib/translations";
import { useToast } from "@/hooks/use-toast";

const STATUS_KEY_MAP: Record<string, TranslationKey> = {
  pending:   "status_pending",
  confirmed: "status_confirmed",
  completed: "status_completed",
  cancelled: "status_cancelled",
} as const;

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Appointments() {
  const { data: appointments, isLoading } = useGetAppointments({ 
    query: { refetchInterval: 8000, queryKey: getGetAppointmentsQueryKey() } 
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [openChatId, setOpenChatId] = useState<number | null>(null);
  const [ratingMap, setRatingMap] = useState<Record<number, number>>({});
  const [reviewMap, setReviewMap] = useState<Record<number, string>>({});
  const [cancelling, setCancelling] = useState<number | null>(null);
  const t = useT();

  const rateAppointmentMutation = useRateAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAppointmentsQueryKey() });
        toast({ title: t("appt_ratingSubmitted") });
      },
      onError: (err: any) => {
        toast({ title: t("appt_ratingFailed"), description: err.message, variant: "destructive" });
      },
    },
  });

  const handleRate = (appointmentId: number) => {
    const rating = ratingMap[appointmentId];
    if (!rating) return;
    const review = reviewMap[appointmentId]?.trim() || undefined;
    rateAppointmentMutation.mutate({ id: appointmentId, data: { rating, review } });
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm(t("common_cancelConfirm") || "Are you sure you want to cancel this appointment?")) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("esaal_token")}` },
      });
      if (!res.ok) throw new Error("Failed to cancel");
      await queryClient.invalidateQueries({ queryKey: getGetAppointmentsQueryKey() });
      toast({ title: t("appt_cancelled") || "Appointment cancelled" });
    } catch (err) {
      toast({ title: t("appt_cancelFailed") || "Failed to cancel", variant: "destructive" });
    } finally {
      setCancelling(null);
    }
  };

  return (
    <Layout>
      <div className="container px-4 mx-auto py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">{t("appt_title")}</h1>
            <p className="text-muted-foreground">{t("appt_sub")}</p>
          </div>
          <Link href="/doctors">
            <Button>{t("appt_bookNew")}</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex">
                  <div className="w-56 bg-muted/30 h-28 animate-pulse" />
                  <div className="flex-1 p-6 space-y-3">
                    <div className="h-5 bg-muted rounded animate-pulse w-1/2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-8 bg-muted rounded animate-pulse w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : !appointments || appointments.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center shadow-sm mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">{t("appt_noAppts")}</h3>
              <p className="text-muted-foreground max-w-sm mb-6">{t("appt_noApptsSub")}</p>
              <Link href="/doctors">
                <Button>{t("appt_findDoctor")}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => {
              const chatOpen = openChatId === appointment.id;
              const isCompleted = appointment.status === "completed";
              const alreadyRated = appointment.patientRating !== null && appointment.patientRating !== undefined;
              const pendingRating = ratingMap[appointment.id];

              return (
                <Card key={appointment.id} className="overflow-hidden transition-all">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-56 bg-muted/30 p-5 border-b sm:border-b-0 sm:border-e flex flex-col justify-center">
                      <div className="flex items-center text-primary font-medium mb-1.5">
                        <Calendar className="w-4 h-4 me-2 shrink-0" />
                        {appointment.startTime ? format(new Date(appointment.startTime), "MMM d, yyyy") : "TBD"}
                      </div>
                      <div className="flex items-center text-foreground font-bold text-xl">
                        <Clock className="w-5 h-5 me-2 text-muted-foreground shrink-0" />
                        {appointment.startTime ? format(new Date(appointment.startTime), "h:mm a") : "TBD"}
                      </div>
                    </div>

                    <div className="flex-1 p-5 flex flex-col justify-center">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-lg font-bold">{appointment.doctorName}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.doctorSpecialty}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className={statusColors[appointment.status] ?? ""}>
                            <span className="capitalize">
                              {STATUS_KEY_MAP[appointment.status]
                                ? t(STATUS_KEY_MAP[appointment.status])
                                : appointment.status}
                            </span>
                          </Badge>
                          {appointment.isPaid ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              {t("appt_paid")}
                            </Badge>
                          ) : appointment.status !== "cancelled" ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {t("appt_pendingPayment")}
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      {appointment.status === "cancelled" && (
                        <div className="mb-4 text-xs bg-red-50 text-red-700 p-2 rounded border border-red-100">
                          {t("appt_cancelledBy") || "Cancelled by"}: {" "}
                          <span className="font-bold">
                            {appointment.cancelledBy === appointment.patientId 
                              ? t("common_you") || "You" 
                              : appointment.cancelledBy === appointment.doctorUserId 
                                ? t("profile_roleDoctor") || "Doctor" 
                                : t("profile_roleAdmin") || "Admin"}
                          </span>
                          {appointment.cancelledAt && (
                            <span className="ms-1 opacity-70">
                              ({format(new Date(appointment.cancelledAt), "MMM d, h:mm a")})
                            </span>
                          )}
                        </div>
                      )}

                      {!appointment.isPaid && appointment.status !== "cancelled" && appointment.doctorPaymentInfo && (
                        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-1">
                          <div className="text-xs font-semibold text-primary uppercase tracking-wider">{t("chat_paymentInstruction")}</div>
                          <div className="text-sm font-bold text-foreground break-all">{appointment.doctorPaymentInfo}</div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t text-sm">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center">
                            <Video className="w-3.5 h-3.5 me-1.5" /> {t("appt_onlineSession")}
                          </div>
                          <div className="font-medium text-foreground">EGP {appointment.doctorPrice}</div>
                        </div>
                        <div className="flex gap-2">
                          {appointment.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(appointment.id)}
                              disabled={cancelling === appointment.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                            >
                              {t("common_cancel") || "Cancel"}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenChatId(chatOpen ? null : appointment.id)}
                            className="h-8 gap-1.5"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {t("appt_chat")}
                            {chatOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>

                      {/* Rating + Review section for completed appointments */}
                      {isCompleted && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          {alreadyRated ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">{t("appt_yourRating")}</span>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= (appointment.patientRating ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {appointment.patientReview && (
                                <blockquote className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                                  "{appointment.patientReview}"
                                </blockquote>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-muted-foreground">{t("appt_rateSession")}</span>
                                <StarRating
                                  value={pendingRating ?? 0}
                                  onChange={(v) => setRatingMap(m => ({ ...m, [appointment.id]: v }))}
                                />
                              </div>
                              {pendingRating && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                  <Textarea
                                    placeholder={t("appt_sharePlaceholder")}
                                    value={reviewMap[appointment.id] ?? ""}
                                    onChange={e => setReviewMap(m => ({ ...m, [appointment.id]: e.target.value }))}
                                    className="resize-none h-20 text-sm"
                                    maxLength={1000}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleRate(appointment.id)}
                                    disabled={rateAppointmentMutation.isPending}
                                    className="h-8 text-xs gap-1.5"
                                  >
                                    <Send className="w-3 h-3" />
                                    {t("appt_submitReview")}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {chatOpen && (
                    <div className="border-t p-4 bg-muted/10">
                      <AppointmentChat
                        appointmentId={appointment.id}
                        doctorName={appointment.doctorName}
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
