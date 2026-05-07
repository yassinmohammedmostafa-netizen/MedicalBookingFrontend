import { useState, useMemo } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useDeleteDoctor, useGetAdminDoctors, useApproveDoctor, customFetch } from "../../../api-client-react/src/index.js";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, Search, Trash2, CheckCircle, XCircle, Info, User as UserIcon, Mail, Phone, Briefcase, DollarSign, Languages, Edit, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/translations";
import { SPECIALTIES } from "@/lib/specialties";
import { useLanguage } from "@/lib/language";
import { useToast } from "@/hooks/use-toast";

export default function AdminDoctors() {
  const { data: doctors, isLoading } = useGetAdminDoctors();
  const deleteDoctorMutation = useDeleteDoctor();
  const approveDoctorMutation = useApproveDoctor();
  const queryClient = useQueryClient();
  const t = useT();
  const { toast } = useToast();
  const { lang } = useLanguage();

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [status, setStatus] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!doctors) return [];
    const q = search.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
      if (q && !fullName.includes(q) && !doctor.email.toLowerCase().includes(q)) {
        return false;
      }
      if (specialty !== "all" && !doctor.specialty.includes(specialty)) {
        return false;
      }
      if (status === "online" && !doctor.isOnline) return false;
      if (approvalFilter === "pending" && doctor.isApproved) return false;
      if (approvalFilter === "approved" && !doctor.isApproved) return false;
      return true;
    });
  }, [doctors, search, specialty, status, approvalFilter]);

  const handleDelete = async (doctorId: number, doctorName: string) => {
    const confirmed = window.confirm(t("admin_deleteDoctorConfirm").replace("{name}", doctorName));
    if (!confirmed) return;
    await deleteDoctorMutation.mutateAsync({ id: doctorId });
    await queryClient.invalidateQueries({ queryKey: ["/api/admin/doctors"] });
  };

  const handleApprove = async (doctorId: number, approve: boolean) => {
    let reason = "";
    if (!approve) {
      const input = window.prompt(t("admin_enterRejectionReason") || "Enter rejection reason (optional):");
      if (input === null) return; // Cancelled
      reason = input;
    }
    await approveDoctorMutation.mutateAsync({ id: doctorId, data: { approve, reason } });
    await queryClient.invalidateQueries({ queryKey: ["/api/admin/doctors"] });
  };

  const [approvingChanges, setApprovingChanges] = useState<number | null>(null);
  const handleApproveChanges = async (doctorId: number, approve: boolean) => {
    let reason = "";
    if (!approve) {
      const input = window.prompt(t("admin_enterRejectionReason") || "Enter rejection reason (optional):");
      if (input === null) return; // Cancelled
      reason = input;
    }

    setApprovingChanges(doctorId);
    try {
      await customFetch(`/api/admin/doctors/${doctorId}/approve-changes`, {
        method: "PATCH",
        body: JSON.stringify({ approve, reason }),
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/doctors"] });
    } finally {
      setApprovingChanges(null);
    }
  };

  const [editingDoctor, setEditingDoctor] = useState<any | null>(null);
  const [viewingReviewsDoctor, setViewingReviewsDoctor] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ price: 0, specialty: [] as string[] });

  const handleEditDoctor = (doctor: any) => {
    setEditingDoctor(doctor);
    setEditForm({ 
      price: doctor.price, 
      specialty: Array.isArray(doctor.specialty) ? doctor.specialty : [doctor.specialty] 
    });
  };

  const handleSaveEdit = async () => {
    if (!editingDoctor) return;
    try {
      await customFetch(`/api/admin/doctors/${editingDoctor.id}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/doctors"] });
      setEditingDoctor(null);
      toast({ title: t("admin_doctorUpdated") || "Doctor updated successfully" });
    } catch (err) {
      toast({ title: t("admin_doctorUpdateError") || "Failed to update doctor", variant: "destructive" });
    }
  };

  const { data: doctorReviews, isLoading: isLoadingReviews } = useQuery<any[]>({
    queryKey: ["/api/admin/reviews", { doctorId: viewingReviewsDoctor?.id }],
    queryFn: async () => {
      if (!viewingReviewsDoctor) return [];
      return customFetch<any[]>(`/api/admin/reviews?doctorId=${viewingReviewsDoctor.id}`);
    },
    enabled: !!viewingReviewsDoctor,
  });

  return (
    <Layout>
      <div className="container px-4 mx-auto py-12 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">{t("admin_registeredDoctors")}</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="ps-9"
              placeholder={t("admin_searchDoctors")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("admin_filterSpecialty")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin_filterSpecialty")}</SelectItem>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s.en} value={s.en}>{lang === "ar" ? s.ar : s.en}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={approvalFilter} onValueChange={setApprovalFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={t("admin_approvalStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin_allDoctors")}</SelectItem>
              <SelectItem value="pending">{t("admin_pendingApproval")}</SelectItem>
              <SelectItem value="approved">{t("admin_approved")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={t("admin_filterStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin_filterStatus")}</SelectItem>
              <SelectItem value="online">{t("admin_filterStatusOnline")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>{t("admin_doctorCol")}</TableHead>
                    <TableHead>{t("admin_typeSpecialty")}</TableHead>
                    <TableHead>{t("admin_price")}</TableHead>
                    <TableHead>{t("admin_rating")}</TableHead>
                    <TableHead>{t("admin_status")}</TableHead>
                    <TableHead>{t("admin_approval")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={doctor.avatarUrl || undefined} />
                            <AvatarFallback>{doctor.firstName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{doctor.firstName} {doctor.lastName}</div>
                            <div className="text-xs text-muted-foreground">{doctor.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium capitalize">{doctor.type}</div>
                        <div className="text-xs text-muted-foreground">{doctor.specialty.join(", ")}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{t("common_egp")} {doctor.price}</div>
                        <div className="text-xs text-muted-foreground capitalize">{doctor.sessionType}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 me-1" />
                          <span className="font-medium">{doctor.rating}</span>
                          <span className="text-xs text-muted-foreground ms-1">({doctor.reviewCount})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {doctor.isOnline && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">{t("admin_badgeOnline")}</Badge>
                          )}
                          {doctor.immediateAvailable && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0">{t("admin_badgeImmediate")}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {doctor.isApproved ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 me-1" /> {t("admin_approved")}
                            </Badge>
                            {(doctor.pendingBio || doctor.pendingPrice !== null || doctor.pendingSpecialty || doctor.pendingPaymentInfo) && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] animate-pulse">
                                {t("admin_pendingEdits") || "Pending Edits"}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant="outline" 
                              className={doctor.isRejected 
                                ? "bg-red-50 text-red-700 border-red-200" 
                                : "bg-amber-50 text-amber-700 border-amber-200"}
                            >
                              {doctor.isRejected ? t("admin_rejected") : t("admin_pending")}
                            </Badge>
                            <div className="flex gap-1 mt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                onClick={() => handleApprove(doctor.id, true)}
                                disabled={approveDoctorMutation.isPending}
                              >
                                <CheckCircle className="w-3 h-3 me-1" /> {t("admin_approve")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                onClick={() => handleApprove(doctor.id, false)}
                                disabled={approveDoctorMutation.isPending}
                              >
                                <XCircle className="w-3 h-3 me-1" /> {t("admin_reject")}
                              </Button>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8">
                                <Info className="h-4 w-4 me-2" />
                                {t("common_details") || "Details"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{t("admin_doctorDetails")}</DialogTitle>
                              </DialogHeader>
                              <ScrollArea className="max-h-[70vh] p-4">
                                <div className="space-y-6">
                                  <div className="flex items-center gap-4 border-b pb-4">
                                    <Avatar className="h-16 w-16">
                                      <AvatarImage src={doctor.avatarUrl || undefined} />
                                      <AvatarFallback>{doctor.firstName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl font-bold">{doctor.firstName} {doctor.lastName}</h3>
                                      <div className="flex flex-col gap-1 mt-1 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {doctor.email}</div>
                                        <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> {doctor.type}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground uppercase">{t("admin_specialties")}</Label>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {(Array.isArray(doctor.specialty) ? doctor.specialty : [doctor.specialty]).map((s: string) => (
                                          <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                                        ))}
                                      </div>
                                      {doctor.pendingSpecialty && (
                                        <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-100">
                                          <div className="text-[10px] font-bold text-amber-700 uppercase flex justify-between items-center">
                                            {t("admin_pendingChanges")}
                                            <Badge className="bg-amber-100 text-amber-800 border-none h-4 px-1 text-[9px]">{t("common_new")}</Badge>
                                          </div>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {doctor.pendingSpecialty.map((s: string) => (
                                              <Badge key={s} variant="outline" className="text-[10px] bg-white border-amber-200 text-amber-800">{s}</Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground uppercase">{t("admin_price")}</Label>
                                      <div className="font-bold text-lg">{t("common_egp")} {doctor.price}</div>
                                      {doctor.pendingPrice !== undefined && doctor.pendingPrice !== null && (
                                        <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-100">
                                          <div className="text-[10px] font-bold text-amber-700 uppercase">
                                            {t("admin_pendingChanges")}
                                          </div>
                                          <div className="font-bold text-lg text-amber-800">{t("common_egp")} {doctor.pendingPrice}</div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground uppercase">{t("profile_paymentMethod")}</Label>
                                      <div className="font-medium text-sm break-all">{doctor.paymentInfo || t("common_notSet") || "Not set"}</div>
                                      {doctor.pendingPaymentInfo && (
                                        <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-100">
                                          <div className="text-[10px] font-bold text-amber-700 uppercase">
                                            {t("admin_pendingChanges")}
                                          </div>
                                          <div className="font-bold text-sm text-amber-800 break-all">{doctor.pendingPaymentInfo}</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase">{t("profile_bioTitle")}</Label>
                                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{doctor.bio || t("profile_noBioProvided")}</p>
                                    {doctor.pendingBio && (
                                      <div className="mt-2 p-3 bg-amber-50 rounded border border-amber-100">
                                        <div className="text-[10px] font-bold text-amber-700 uppercase mb-1">
                                          {t("admin_pendingChanges")}
                                        </div>
                                        <p className="text-sm leading-relaxed text-amber-900 whitespace-pre-wrap italic">{doctor.pendingBio}</p>
                                      </div>
                                    )}
                                  </div>

                                  {(doctor.pendingBio || doctor.pendingPrice !== null || doctor.pendingSpecialty || doctor.pendingPaymentInfo) && (
                                    <div className="flex gap-2 pt-4 border-t">
                                      <Button 
                                        className="flex-1 bg-green-600 hover:bg-green-700" 
                                        onClick={() => handleApproveChanges(doctor.id, true)}
                                        disabled={approvingChanges === doctor.id}
                                      >
                                        <CheckCircle className="w-4 h-4 me-2" />
                                        {t("admin_approveChanges")}
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => handleApproveChanges(doctor.id, false)}
                                        disabled={approvingChanges === doctor.id}
                                      >
                                        <XCircle className="w-4 h-4 me-2" />
                                        {t("admin_rejectChanges")}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => handleEditDoctor(doctor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => setViewingReviewsDoctor(doctor)}
                          >
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(doctor.id, `${doctor.firstName} ${doctor.lastName}`)}
                            disabled={deleteDoctorMutation.isPending}
                            className="h-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        {doctors?.length === 0 ? t("admin_noDoctors") : t("admin_noResults")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Doctor Dialog */}
        <Dialog open={!!editingDoctor} onOpenChange={(open) => !open && setEditingDoctor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin_editDoctor")}: {editingDoctor?.firstName} {editingDoctor?.lastName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">{t("admin_priceLabel")}</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin_specialties")}</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {SPECIALTIES.map((s) => (
                    <div key={s.en} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-spec-${s.en}`}
                        checked={editForm.specialty.includes(s.en)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditForm(prev => ({ ...prev, specialty: [...prev.specialty, s.en] }));
                          } else {
                            setEditForm(prev => ({ ...prev, specialty: prev.specialty.filter(i => i !== s.en) }));
                          }
                        }}
                      />
                      <Label htmlFor={`edit-spec-${s.en}`} className="text-xs font-normal">
                        {lang === "ar" ? s.ar : s.en}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingDoctor(null)}>{t("common_cancel")}</Button>
              <Button onClick={handleSaveEdit}>{t("common_save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Doctor Reviews Dialog */}
        <Dialog open={!!viewingReviewsDoctor} onOpenChange={(open) => !open && setViewingReviewsDoctor(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {t("admin_doctorReviews") || "Doctor Reviews"}: {viewingReviewsDoctor?.firstName} {viewingReviewsDoctor?.lastName}
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-6">
              {isLoadingReviews ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !doctorReviews || doctorReviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground italic">
                  {t("admin_noReviewsFound") || "No reviews found for this doctor."}
                </div>
              ) : (
                <div className="space-y-4">
                  {doctorReviews.map((review) => (
                    <Card key={review.appointmentId} className="border-muted bg-muted/10">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1.5 rounded-full">
                              <UserIcon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-semibold text-sm">{review.patientName}</span>
                          </div>
                          <Badge variant={review.isReviewApproved ? "default" : "outline"} className={review.isReviewApproved ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}>
                            {review.isReviewApproved ? (t("admin_statusApproved") || "Approved") : (t("admin_statusPending") || "Pending")}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.patientRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                            />
                          ))}
                          <span className="ms-2 text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {review.patientReview && (
                          <p className="text-sm text-foreground bg-white/50 p-3 rounded border border-dashed italic">
                            "{review.patientReview}"
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <DialogFooter className="p-4 border-t bg-muted/20">
              <Button onClick={() => setViewingReviewsDoctor(null)}>{t("common_close") || "Close"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
