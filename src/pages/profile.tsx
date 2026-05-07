import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { useT } from "@/lib/translations";
import { useUpdateProfile, useChangePassword, useUpdateDoctorProfile, useGetDoctorProfile, getGetDoctorProfileQueryKey, customFetch } from "../../api-client-react/src/index.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Lang } from "@/lib/language";
import { User, Globe, Lock, Stethoscope, Wifi, WifiOff, Info, Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SPECIALTIES } from "@/lib/specialties";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SpecialtySelector } from "@/components/specialty-selector";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";

interface DoctorProfile {
  id: number;
  userId: number;
  specialty: string[];
  type: string;
  gender: string;
  price: number;
  bio: string | null;
  isOnline: boolean;
  yearsExperience: number | null;
  languages: string[];
  rating: number;
  reviewCount: number;
  isApproved: boolean;
  pendingBio?: string | null;
  pendingPrice?: number | null;
  pendingSpecialty?: string[] | null;
  pendingLanguages?: string[] | null;
  pendingGender?: string | null;
  paymentInfo?: string | null;
  pendingPaymentInfo?: string | null;
  avatarUrl?: string | null;
  pendingAvatarUrl?: string | null;
  isRejected?: boolean;
  rejectionReason?: string | null;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLanguage();
  const t = useT();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const updateDoctorProfileMutation = useUpdateDoctorProfile();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [bio, setBio] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [price, setPrice] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [gender, setGender] = useState("male");
  const [sessionType, setSessionType] = useState("individual");
  const [yearsExperience, setYearsExperience] = useState<number>(0);
  const [languages, setLanguages] = useState<string[]>(["Arabic"]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  const isDoctor = user?.role === "doctor";

  const { data: doctorProfile } = useGetDoctorProfile({
    query: {
      queryKey: getGetDoctorProfileQueryKey(),
      enabled: isDoctor,
    }
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user?.firstName, user?.lastName, user?.phone]);

  useEffect(() => {
    if (doctorProfile && !hasLoadedProfile) {
      setBio(doctorProfile.pendingBio ?? doctorProfile.bio ?? "");
      setPrice(doctorProfile.pendingPrice ?? doctorProfile.price);
      setPaymentInfo(doctorProfile.pendingPaymentInfo ?? doctorProfile.paymentInfo ?? "");
      setSelectedSpecialties(
        doctorProfile.pendingSpecialty ?? 
        (Array.isArray(doctorProfile.specialty) ? doctorProfile.specialty : [])
      );
      setGender(doctorProfile.pendingGender ?? doctorProfile.gender ?? "male");
      setSessionType(doctorProfile.sessionType ?? "individual");
      setYearsExperience(doctorProfile.yearsExperience ?? 0);
      setLanguages(doctorProfile.pendingLanguages ?? doctorProfile.languages ?? ["Arabic"]);
      setIsOnline(doctorProfile.isOnline);
      setAvatarUrl(doctorProfile.pendingAvatarUrl ?? doctorProfile.avatarUrl ?? "");
      setHasLoadedProfile(true);
    } else if (doctorProfile) {
      // Keep isOnline in sync if it changes on the server (e.g. from another tab or mutation)
      setIsOnline(doctorProfile.isOnline);
    }

    // Handle Approval Notifications
    if (doctorProfile) {
      const hasPendingChanges = !!(doctorProfile.pendingBio || doctorProfile.pendingPrice || doctorProfile.pendingSpecialty || doctorProfile.pendingLanguages || doctorProfile.pendingGender || doctorProfile.pendingPaymentInfo || doctorProfile.pendingAvatarUrl);
      const isRejected = doctorProfile.isRejected;
      const storedPendingState = localStorage.getItem('doctor_was_pending');
      
      if (hasPendingChanges) {
        localStorage.setItem('doctor_was_pending', 'true');
      } else if (storedPendingState === 'true' && !isRejected && doctorProfile.isApproved) {
        // Was pending, now not pending and not rejected -> Approved!
        toast({ 
          title: t("status_approvedTitle") || "Changes Approved!",
          description: t("status_approvedMessage") || "Your profile changes have been reviewed and approved.",
          variant: "default"
        });
        localStorage.removeItem('doctor_was_pending');
      }
    }
  }, [doctorProfile, hasLoadedProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max size is 2MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await customFetch<{ url: string }>("/api/uploads", {
        method: "POST",
        body: formData
      });
      setAvatarUrl(data.url);
      
      // Auto-save the avatar change
      await updateDoctorProfileMutation.mutateAsync({ data: { avatarUrl: data.url } });
      queryClient.invalidateQueries({ queryKey: getGetDoctorProfileQueryKey() });
      toast({ title: "Photo uploaded", description: "Waiting for admin approval" });
    } catch (err) {
      toast({ title: "Upload failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLangChange = async (newLang: Lang) => {
    if (newLang === lang) return;
    setLang(newLang);
    try {
      await updateProfileMutation.mutateAsync({ data: { preferredLang: newLang } });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ description: t("settings_saved") });
    } catch {
      setLang(lang);
      toast({ description: t("settings_saveError"), variant: "destructive" });
    }
  };

  const handleProfileSave = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedFirstName || !trimmedLastName) return;
    try {
      const updatedUser = await updateProfileMutation.mutateAsync({ data: { firstName: trimmedFirstName, lastName: trimmedLastName, phone: phone.trim() } });
      queryClient.setQueryData(["/api/auth/me"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ description: t("settings_profileSaved") });
    } catch {
      toast({ description: t("settings_profileSaveError"), variant: "destructive" });
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast({ description: t("settings_passwordTooShort"), variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ description: t("settings_passwordMismatch"), variant: "destructive" });
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({ data: { currentPassword, newPassword } });
      toast({ description: t("settings_passwordChanged") });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      
      // Force logout on password change
      setTimeout(() => {
        logout();
      }, 2000);
    } catch {
      toast({ description: t("settings_passwordChangeError"), variant: "destructive" });
    }
  };

  const handleDoctorProfileSave = async () => {
    try {
      const originalBio = doctorProfile?.pendingBio ?? doctorProfile?.bio ?? "";
      const originalPrice = doctorProfile?.pendingPrice ?? doctorProfile?.price ?? 0;
      const originalSpecialty = doctorProfile?.pendingSpecialty ?? doctorProfile?.specialty ?? [];
      const originalGender = doctorProfile?.pendingGender ?? doctorProfile?.gender ?? "male";
      const originalPaymentInfo = doctorProfile?.pendingPaymentInfo ?? doctorProfile?.paymentInfo ?? "";
      const originalSessionType = doctorProfile?.sessionType ?? "individual";
      const originalYearsExperience = doctorProfile?.yearsExperience ?? 0;
      const originalLanguages = doctorProfile?.pendingLanguages ?? doctorProfile?.languages ?? ["Arabic"];

      const arraysEqual = (a: string[], b: string[]) => a.length === b.length && a.every((val, index) => val === b[index]);

      const dataToUpdate: any = {};
      
      const newBio = bio.trim();
      if (newBio !== originalBio) dataToUpdate.bio = newBio;
      
      if (price !== originalPrice) dataToUpdate.price = price;
      if (!arraysEqual(selectedSpecialties, originalSpecialty)) dataToUpdate.specialty = selectedSpecialties;
      if (gender !== originalGender) dataToUpdate.gender = gender;
      
      const newPaymentInfo = paymentInfo.trim();
      if (newPaymentInfo !== originalPaymentInfo) dataToUpdate.paymentInfo = newPaymentInfo;
      
      if (sessionType !== originalSessionType) dataToUpdate.sessionType = sessionType;
      if (yearsExperience !== originalYearsExperience) dataToUpdate.yearsExperience = yearsExperience;
      if (!arraysEqual(languages, originalLanguages)) dataToUpdate.languages = languages;
      if (isOnline !== doctorProfile?.isOnline) dataToUpdate.isOnline = isOnline;
      if (avatarUrl !== (doctorProfile?.pendingAvatarUrl ?? doctorProfile?.avatarUrl ?? "")) dataToUpdate.avatarUrl = avatarUrl;

      if (Object.keys(dataToUpdate).length === 0) {
        toast({ description: t("settings_noChanges") || "No changes to save" });
        return;
      }

      await updateDoctorProfileMutation.mutateAsync({ data: dataToUpdate });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/profile"] });
      
      if (doctorProfile?.isApproved) {
        toast({ description: t("profile_doctorUpdatePending") || "Profile update submitted for admin approval" });
      } else {
        toast({ description: t("profile_doctorUpdated") || "Profile updated successfully" });
      }
    } catch {
      toast({ description: t("profile_doctorUpdateFail") || "Failed to update profile", variant: "destructive" });
    }
  };

  const handleToggleOnline = async (checked: boolean) => {
    setIsOnline(checked);
    try {
      await updateDoctorProfileMutation.mutateAsync({ data: { isOnline: checked } });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/profile"] });
      toast({ description: checked ? t("profile_youAreOnline") : t("profile_youAreOffline") });
    } catch {
      setIsOnline(!checked);
      toast({ description: t("profile_statusUpdateFail"), variant: "destructive" });
    }
  };

  const roleLabel = user?.role === "doctor" ? t("profile_roleDoctor") : user?.role === "admin" ? t("profile_roleAdmin") : t("profile_rolePatient");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("settings_title")}</h1>
          <p className="text-muted-foreground mt-1">{t("settings_sub")}</p>
        </div>

        {isDoctor && doctorProfile?.isRejected && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6">
            <h4 className="font-semibold mb-1">{t("status_rejectedTitle") || "Profile Changes Rejected"}</h4>
            <p className="text-sm">{doctorProfile.rejectionReason}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Avatar Card */}
          {isDoctor && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                      <AvatarImage src={avatarUrl} alt={user?.firstName} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xl">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="avatar-upload" 
                      className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${isUploading ? "opacity-100" : ""}`}
                    >
                      {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                    </label>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold">{t("profile_photoTitle") || "Profile Photo"}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doctorProfile?.pendingAvatarUrl ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] animate-pulse">
                          {t("admin_pending") || "Pending Approval"}
                        </Badge>
                      ) : (
                        t("profile_photoSub") || "Visible to patients after approval"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctor Online Status Card */}
          {isDoctor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-muted-foreground" />}
                  {t("profile_availTitle")}
                </CardTitle>
                <CardDescription>{t("profile_availSub")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={isOnline}
                    onCheckedChange={handleToggleOnline}
                    disabled={updateDoctorProfileMutation.isPending}
                  />
                  <div>
                    <div className={`font-semibold text-sm ${isOnline ? "text-green-700" : "text-muted-foreground"}`}>
                      {isOnline ? t("profile_statusOnline") : t("profile_statusOffline")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isOnline ? t("profile_onlineDesc") : t("profile_offlineDesc")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctor Bio Card */}
          {isDoctor && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Stethoscope className="w-4 h-4" />
                    {t("profile_bioTitle")}
                  </CardTitle>
                  {doctorProfile?.pendingBio && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                      {t("admin_pending")}
                    </Badge>
                  )}
                </div>
                <CardDescription>{t("profile_bioSub")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const hasChanges = (doctorProfile?.bio && (bio !== (doctorProfile.pendingBio ?? doctorProfile.bio)));
                  return (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bio">{t("profile_bio")}</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder={t("profile_bioPlaceholder")}
                          className="resize-none h-32"
                        />
                        
                        {doctorProfile?.isRejected && (
                          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md animate-in fade-in slide-in-from-top-1">
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                              {t("profile_doctorUpdateRejected")}
                            </p>
                            {doctorProfile.rejectionReason && (
                              <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                                {doctorProfile.rejectionReason}
                              </p>
                            )}
                          </div>
                        )}

                        {hasChanges && (
                          <div className="mt-2 p-3 bg-muted/40 rounded-md border border-border/50 animate-in fade-in slide-in-from-top-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                              {t("profile_currentApprovedBio")}
                            </p>
                            <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {doctorProfile?.bio}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="price">{t("admin_price") || "Session Price (EGP)"}</Label>
                      {doctorProfile?.pendingPrice !== undefined && doctorProfile?.pendingPrice !== null && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                          {t("admin_pending")}
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                    <p className="text-[10px] text-amber-600 italic font-medium">
                      {t("profile_currentSessionPrice") || "Current Session Price"}: {t("common_egp")} {doctorProfile?.price}
                    </p>
                    {doctorProfile?.priceChangedByAdmin && (
                      <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-700 font-bold uppercase animate-pulse">
                        <Info className="w-3 h-3" />
                        {t("profile_priceChangedByAdmin") || "Session price changed by admin"}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="payment-info">{t("profile_paymentMethod")}</Label>
                      {doctorProfile?.pendingPaymentInfo && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                          {t("admin_pending")}
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="payment-info"
                      value={paymentInfo}
                      onChange={(e) => setPaymentInfo(e.target.value)}
                      placeholder={t("reg_paymentPlaceholder")}
                    />
                    {doctorProfile?.pendingPaymentInfo && (
                      <p className="text-[10px] text-amber-600 italic">
                        Current: {doctorProfile.paymentInfo}
                      </p>
                    )}
                  </div>
                </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">{t("admin_specialties")}</Label>
                      {doctorProfile?.pendingSpecialty && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                          {t("admin_pending")}
                        </Badge>
                      )}
                    </div>
                    <SpecialtySelector
                      value={selectedSpecialties}
                      onChange={setSelectedSpecialties}
                      showLabels={false}
                      multi={true}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("reg_gender")}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["male", "female"] as const).map(g => (
                          <button key={g} type="button"
                            onClick={() => setGender(g)}
                            className={`py-2 rounded-lg border text-xs font-medium transition-all capitalize ${
                              gender === g ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                            }`}>
                            {g === "male" ? t("reg_male") : t("reg_female")}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t("profile_sessionType")}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["individual", "group"] as const).map(st => (
                          <button key={st} type="button"
                            onClick={() => setSessionType(st)}
                            className={`py-2 rounded-lg border text-xs font-medium transition-all capitalize ${
                              sessionType === st ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                            }`}>
                            {st === "individual" ? t("docs_individual") : t("docs_group")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exp">{t("profile_yearsExp")}</Label>
                      <Input
                        id="exp"
                        type="number"
                        min={0}
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="langs">{t("profile_languages")}</Label>
                      <Input
                        id="langs"
                        placeholder="Arabic, English"
                        value={languages.join(", ")}
                        onChange={(e) => setLanguages(e.target.value.split(",").map(l => l.trim()).filter(Boolean))}
                      />
                    </div>
                  </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-[10px] text-muted-foreground max-w-[200px]">
                    {doctorProfile?.isApproved && (
                      <span className="text-amber-600 font-medium italic">
                        *{t("profile_pendingNote") || "Changes to bio, price, and specialties require admin approval."}
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={handleDoctorProfileSave}
                    disabled={updateDoctorProfileMutation.isPending}
                    size="sm"
                  >
                    {updateDoctorProfileMutation.isPending ? t("profile_savingShort") : t("profile_doctorSave")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4" />
                {t("settings_accountInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground" htmlFor="profile-firstName">
                    {t("reg_firstName")}
                  </label>
                  <input
                    id="profile-firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder=""
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground" htmlFor="profile-lastName">
                    {t("reg_lastName")}
                  </label>
                  <input
                    id="profile-lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder=""
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground" htmlFor="profile-email">
                    {t("settings_email")}
                  </label>
                  <p className="rounded-md border border-transparent bg-muted/40 px-3 py-2 text-sm font-medium">
                    {user?.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground" htmlFor="profile-phone">
                    {t("settings_phone")}
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("settings_phonePlaceholder")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("settings_role")}</p>
                  <p className="rounded-md border border-transparent bg-muted/40 px-3 py-2 text-sm font-medium">
                    {roleLabel}
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleProfileSave}
                  disabled={updateProfileMutation.isPending || !firstName.trim() || !lastName.trim()}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("settings_saveProfile")}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-4 h-4" />
                {t("settings_changePassword")}
              </CardTitle>
              <CardDescription>{t("settings_changePasswordSub")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground" htmlFor="current-password">
                  {t("settings_currentPassword")}
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground" htmlFor="new-password">
                  {t("settings_newPassword")}
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <PasswordStrengthMeter password={newPassword} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground" htmlFor="confirm-new-password">
                  {t("settings_confirmNewPassword")}
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={handlePasswordChange}
                  disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmNewPassword}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {changePasswordMutation.isPending ? t("settings_updatingPassword") : t("settings_updatePassword")}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="w-4 h-4" />
                {t("settings_langPref")}
              </CardTitle>
              <CardDescription>{t("settings_langPrefSub")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleLangChange("en")}
                  disabled={updateProfileMutation.isPending}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors
                    ${lang === "en"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted"
                    }`}
                >
                  <span className="text-lg">🇬🇧</span>
                  {t("settings_langEn")}
                </button>
                <button
                  onClick={() => handleLangChange("ar")}
                  disabled={updateProfileMutation.isPending}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors
                    ${lang === "ar"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted"
                    }`}
                >
                  <span className="text-lg">🇸🇦</span>
                  {t("settings_langAr")}
                </button>
              </div>
              {updateProfileMutation.isPending && (
                <p className="text-xs text-muted-foreground mt-2">{t("settings_saving")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
