import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import {
  useGetDoctor,
  useGetDoctorSlots,
  useCreateAppointment,
  useGetDoctorReviews,
  getGetAppointmentsQueryKey
} from "../../../api-client-react/src/index.js";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/translations";
import { useLanguage } from "@/lib/language";
import { resolveSpecialtyAr } from "@/lib/specialties";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Video, ChevronLeft, GraduationCap, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/utils";

export default function DoctorProfile() {
  const { id } = useParams();
  const doctorId = parseInt(id || "0", 10);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useT();

  const { lang } = useLanguage();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const { data: doctor, isLoading: isLoadingDoctor } = useGetDoctor(doctorId);
  const { data: slots, isLoading: isLoadingSlots } = useGetDoctorSlots(doctorId);
  const { data: reviews } = useGetDoctorReviews(doctorId);

  const createAppointmentMutation = useCreateAppointment({
    mutation: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: getGetAppointmentsQueryKey() });
        const isInstant = !variables.data.slotId;
        toast({ title: isInstant ? t("profile_instantBookedToast") : t("appt_bookedToast") });
        setLocation("/appointments");
      },
      onError: (error: any) => {
        toast({ title: t("appt_bookFailed"), description: error.message, variant: "destructive" });
      }
    }
  });

  const handleBook = () => {
    if (!user) { setLocation("/login"); return; }
    if (!selectedSlot) return;
    createAppointmentMutation.mutate({
      data: { slotId: selectedSlot, doctorId, notes: notes.trim() || undefined }
    });
  };

  const handleInstantBook = () => {
    if (!user) { setLocation("/login"); return; }
    createAppointmentMutation.mutate({
      data: { doctorId, notes: notes.trim() || undefined }
    });
  };

  const canBookInstantly = !!doctor && doctor.isOnline;

  if (isLoadingDoctor) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">{t("profile_notFound")}</h2>
          <Button onClick={() => setLocation("/doctors")}>{t("profile_backToDirectory")}</Button>
        </div>
      </Layout>
    );
  }

  const availableSlots = slots?.filter(s => !s.isBooked) || [];

  return (
    <Layout>
      <div className="bg-muted/30 py-8 border-b">
        <div className="container px-4 mx-auto">
          <Button variant="ghost" onClick={() => setLocation("/doctors")} className="mb-6 -ms-4 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 me-1" /> {t("profile_backToDirectory")}
          </Button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={doctor.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {getInitials(`${doctor.firstName} ${doctor.lastName}`)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold">{doctor.firstName} {doctor.lastName}</h1>
                <div className="font-bold text-xl bg-background px-4 py-2 rounded-lg border shadow-sm">
                  EGP {doctor.price} <span className="text-sm text-muted-foreground font-normal">{t("profile_perHalfHour") || "for every half hour"}</span>
                </div>
              </div>

              <div className="text-lg text-primary font-medium mb-1">
                {lang === "ar" 
                  ? doctor.specialty.map(s => resolveSpecialtyAr(s)).join(" ، ") 
                  : doctor.specialty.join(", ")}
              </div>
              {doctor.subspecialty && (
                <div className="text-muted-foreground mb-4">{doctor.subspecialty}</div>
              )}

              <div className="flex flex-wrap gap-2 mb-6 mt-4">
                <Badge variant="outline" className="capitalize text-sm font-medium py-1 px-3">
                  {({ psychiatrist: t("reg_psychiatrist"), psychologist: t("reg_psychologist") } as Record<string,string>)[doctor.type] ?? doctor.type}
                </Badge>
                {doctor.isOnline && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                    <Clock className="w-3 h-3 me-1" /> {t("docs_availableNow")}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 me-2" />
                  <span className="font-medium text-foreground">{doctor.rating}</span>
                  <span className="ms-1">({doctor.reviewCount} {doctor.reviewCount === 1 ? t("profile_review") : t("profile_reviews")})</span>
                </div>
                {doctor.yearsExperience && (
                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 me-2" />
                    {doctor.yearsExperience} {t("profile_yearsExp")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 mx-auto py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="border-none shadow-sm bg-background/50">
              <CardHeader>
                <CardTitle className="text-xl">{t("profile_about")}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                {doctor.bio
                  ? <p className="whitespace-pre-wrap leading-relaxed">{doctor.bio}</p>
                  : <p>{t("profile_noBio")}</p>
                }
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-background/50">
              <CardHeader>
                <CardTitle className="text-xl">{t("profile_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-foreground mb-1">{t("profile_sessionType")}</div>
                    <div className="text-muted-foreground capitalize">{({ individual: t("docs_individual"), group: t("docs_group") } as Record<string,string>)[doctor.sessionType] ?? doctor.sessionType}</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-1">{t("profile_languages")}</div>
                    <div className="text-muted-foreground">{doctor.languages?.join(", ") || "Arabic"}</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-1">{t("profile_gender")}</div>
                    <div className="text-muted-foreground capitalize">{({ male: t("reg_male"), female: t("reg_female") } as Record<string,string>)[doctor.gender] ?? doctor.gender}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Reviews */}
            {reviews && reviews.length > 0 && (
              <Card className="border-none shadow-sm bg-background/50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    {t("profile_patientReviews")}
                    <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {review.patientName ? review.patientName[0].toUpperCase() : "P"}
                          </div>
                          <span className="text-sm font-medium">{review.patientName || t("dr_unknownPatient")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed">"{review.comment}"</p>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {format(new Date(review.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-24 shadow-md border-border">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle>{t("profile_bookSession")}</CardTitle>
                <CardDescription>{t("profile_selectSlot")}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {canBookInstantly && (
                  <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2 mb-1 text-blue-900">
                      <Zap className="w-4 h-4" />
                      <span className="font-semibold text-sm">{t("profile_instantTitle")}</span>
                    </div>
                    <p className="text-xs text-blue-800/80 mb-3">{t("profile_instantSub")}</p>
                    <div className="space-y-2 mb-3">
                      <Label htmlFor="instant-notes" className="text-xs text-blue-900">{t("profile_notes")}</Label>
                      <Textarea
                        id="instant-notes"
                        placeholder={t("profile_notesPlaceholder")}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="resize-none h-20 bg-white"
                      />
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleInstantBook}
                      disabled={createAppointmentMutation.isPending}
                    >
                      <Zap className="w-4 h-4 me-2" />
                      {createAppointmentMutation.isPending ? t("profile_booking") : t("profile_bookInstant")}
                    </Button>
                  </div>
                )}
                {isLoadingSlots ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-8 w-8 mb-3 opacity-50" />
                    <p>{t("profile_noSlots")}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {canBookInstantly && (
                      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                        {t("profile_orPickSlot")}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pe-2 pb-2">
                      {availableSlots.map(slot => (
                        <Button
                          key={slot.id}
                          variant={selectedSlot === slot.id ? "default" : "outline"}
                          className="w-full justify-start font-normal text-sm h-12"
                          onClick={() => setSelectedSlot(slot.id)}
                        >
                          <div className="flex flex-col items-start text-start">
                            <span className="font-medium">{format(new Date(slot.startTime), "MMM d, yyyy")}</span>
                            <span className="text-xs opacity-80">{format(new Date(slot.startTime), "h:mm a")}</span>
                          </div>
                        </Button>
                      ))}
                    </div>

                    {selectedSlot && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-2">
                          <Label htmlFor="notes">{t("profile_notes")}</Label>
                          <Textarea
                            id="notes"
                            placeholder={t("profile_notesPlaceholder")}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="resize-none h-24"
                          />
                        </div>
                        <Button
                          className="w-full h-12 text-md"
                          onClick={handleBook}
                          disabled={createAppointmentMutation.isPending}
                        >
                          {createAppointmentMutation.isPending ? t("profile_booking") : t("profile_confirmBooking")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
