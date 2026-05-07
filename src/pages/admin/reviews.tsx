import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "../../../api-client-react/src/index.js";
import { format } from "date-fns";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/translations";
import { Star, CheckCircle, XCircle, MessageSquare, User, UserRound } from "lucide-react";

interface AdminReview {
  appointmentId: number;
  patientRating: number;
  patientReview: string | null;
  isReviewApproved: boolean;
  createdAt: string;
  patientName: string;
  doctorName: string;
}

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useT();

  const { data: reviews, isLoading } = useQuery<AdminReview[]>({
    queryKey: ["/api/admin/reviews"],
    queryFn: async () => {
      return customFetch<AdminReview[]>("/api/admin/reviews");
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: number; approve: boolean }) => {
      return customFetch(`/api/admin/reviews/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ approve })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: t("admin_reviewUpdated") || "Review status updated" });
    }
  });

  return (
    <Layout>
      <div className="container px-4 mx-auto py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">{t("admin_reviewsTitle") || "Review Moderation"}</h1>
          <p className="text-muted-foreground">{t("admin_reviewsSub") || "Approve or reject patient feedback before it goes public."}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
              <h3 className="text-xl font-medium mb-2">{t("admin_noReviews") || "No reviews found"}</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.appointmentId} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("admin_patient") || "Patient"}</span>
                            <span className="font-bold flex items-center gap-1.5"><UserRound className="w-3.5 h-3.5" /> {review.patientName}</span>
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("profile_roleDoctor") || "Doctor"}</span>
                            <span className="font-bold flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {review.doctorName}</span>
                          </div>
                        </div>
                        <Badge variant={review.isReviewApproved ? "default" : "outline"} className={review.isReviewApproved ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}>
                          {review.isReviewApproved ? (t("admin_statusApproved") || "Approved") : (t("admin_statusPending") || "Pending")}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= review.patientRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                          />
                        ))}
                        <span className="ms-2 text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>

                      {review.patientReview && (
                        <div className="bg-muted/50 p-4 rounded-lg italic text-foreground border-s-4 border-primary/20">
                          "{review.patientReview}"
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col justify-end gap-2 shrink-0">
                      {!review.isReviewApproved ? (
                        <Button
                          onClick={() => approveMutation.mutate({ id: review.appointmentId, approve: true })}
                          disabled={approveMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 h-10"
                        >
                          <CheckCircle className="w-4 h-4 me-2" />
                          {t("admin_approveReview") || "Approve"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => approveMutation.mutate({ id: review.appointmentId, approve: false })}
                          disabled={approveMutation.isPending}
                          className="text-amber-700 border-amber-200 hover:bg-amber-50 h-10"
                        >
                          <XCircle className="w-4 h-4 me-2" />
                          {t("admin_unapproveReview") || "Unapprove"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
