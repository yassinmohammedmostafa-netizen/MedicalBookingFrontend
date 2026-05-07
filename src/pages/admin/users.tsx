import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  useGetAdminUsers,
  useDeleteUser,
  useCreateAdminUser,
  getGetAdminUsersQueryKey,
  customFetch,
} from "../../../api-client-react/src/index.js";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Trash2, UserPlus, Key, CheckCircle, XCircle, User, ShieldAlert } from "lucide-react";
import { useT } from "@/lib/translations";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminUsers() {
  const { data: users, isLoading } = useGetAdminUsers();
  const deleteUserMutation = useDeleteUser();
  const queryClient = useQueryClient();
  const t = useT();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [languages, setLanguages] = useState<string[]>(["Arabic"]);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [role, setRole] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" });

  const createAdminMutation = useCreateAdminUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
        toast({ title: t("admin_adminCreated") });
        setCreateOpen(false);
        setNewAdmin({ firstName: "", lastName: "", email: "", password: "", phone: "" });
      },
      onError: (error: any) => {
        toast({
          title: t("admin_adminCreateFailed"),
          description: error?.message ?? "",
          variant: "destructive",
        });
      },
    },
  });

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const firstName = newAdmin.firstName.trim();
    const lastName = newAdmin.lastName.trim();
    const email = newAdmin.email.trim();
    const password = newAdmin.password;
    if (!firstName || !lastName || !email) {
      toast({ title: t("admin_adminMissingFields"), variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: t("admin_adminPasswordShort"), variant: "destructive" });
      return;
    }
    createAdminMutation.mutate({
      data: {
        firstName,
        lastName,
        email,
        password,
        phone: newAdmin.phone.trim() || undefined,
      },
    });
  };

  const roleLabel = (r: string) => {
    if (r === "admin") return t("admin_roleAdmin");
    if (r === "patient") return t("admin_rolePatient");
    if (r === "doctor") return t("admin_roleDoctor") || "Doctor";
    return r;
  };

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      if (q && !fullName.includes(q) && !user.email.toLowerCase().includes(q)) {
        return false;
      }
      if (role !== "all" && user.role !== role) {
        return false;
      }
      return true;
    });
  }, [users, search, role]);

  const handleDelete = async (userId: number, userName: string) => {
    const confirmed = window.confirm(t("admin_deleteUserConfirm").replace("{name}", userName));
    if (!confirmed) return;
    await deleteUserMutation.mutateAsync({ id: userId });
    await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
  };

  const [resettingPassword, setResettingPassword] = useState<number | null>(null);
  const handleResetPassword = async (userId: number) => {
    const newPassword = window.prompt(t("admin_enterNewPassword") || "Enter new password for this user (min 8 chars):");
    if (!newPassword) return;
    if (newPassword.length < 8) {
      toast({ title: t("admin_passwordTooShort"), variant: "destructive" });
      return;
    }
    setResettingPassword(userId);
    try {
      await customFetch(`/api/admin/users/${userId}/reset-password`, {
        method: "PATCH",
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error("Failed to reset password");
      toast({ title: t("admin_passwordResetSuccess") || "Password reset successfully" });
    } catch (err) {
      toast({ title: t("admin_passwordResetError") || "Failed to reset password", variant: "destructive" });
    } finally {
      setResettingPassword(null);
    }
  };

  return (
    <Layout>
      <div className="container px-4 mx-auto py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">{t("admin_allUsers")}</h1>
          <Button onClick={() => setCreateOpen(true)} data-testid="button-create-admin">
            <UserPlus className="h-4 w-4 me-2" />
            {t("admin_createAdmin")}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="ps-9"
              placeholder={t("admin_searchUsers")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={t("admin_filterRole")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin_filterRole")}</SelectItem>
              <SelectItem value="admin">{t("admin_roleAdmin")}</SelectItem>
              <SelectItem value="patient">{t("admin_rolePatient")}</SelectItem>
              <SelectItem value="doctor">{t("admin_roleDoctor") || "Doctor"}</SelectItem>
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
                    <TableHead>{t("admin_colId")}</TableHead>
                    <TableHead>{t("admin_colName")}</TableHead>
                    <TableHead>{t("admin_colEmail")}</TableHead>
                    <TableHead>{t("admin_colPhone")}</TableHead>
                    <TableHead>{t("admin_colRole")}</TableHead>
                    <TableHead>{t("admin_colVerified")}</TableHead>
                    <TableHead>{t("admin_colJoined")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-muted-foreground text-xs">
                        #{user.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border">
                            <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                            <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{user.firstName} {user.lastName}</span>
                            {user.role === "doctor" && (user.pendingBio || user.pendingPrice || user.pendingAvatarUrl) && (
                              <Badge variant="outline" className="w-fit h-4 text-[8px] bg-amber-50 text-amber-700 border-amber-200 mt-1">
                                <ShieldAlert className="h-2 w-2 me-1" /> {t("admin_pendingChanges") || "Pending Changes"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.phone || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.role === 'admin'   ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            user.role === 'patient' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }
                        >
                          {roleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          {/* Email Verification */}
                          <div className="flex items-center gap-2">
                            {user.isEmailVerified ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] h-5">
                                <CheckCircle className="h-3 w-3 me-1" /> {t("common_verified")}
                              </Badge>
                            ) : (
                              <>
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] h-5">
                                  <XCircle className="h-3 w-3 me-1" /> {t("common_unverified")}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 text-[9px] px-1 text-primary hover:bg-primary/10"
                                  onClick={async () => {
                                    try {
                                      await customFetch(`/api/admin/users/${user.id}/verify-email`, {
                                        method: "PATCH",
                                      });
                                      if (!res.ok) throw new Error();
                                      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                                      toast({ title: "User email verified" });
                                    } catch {
                                      toast({ title: "Failed to verify email", variant: "destructive" });
                                    }
                                  }}
                                >
                                  {t("admin_verifyManual") || "Verify"}
                                </Button>
                              </>
                            )}
                          </div>

                          {/* Doctor Approval */}
                          {user.role === "doctor" && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {!user.doctorId ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-6 text-[9px] px-2"
                                  onClick={async () => {
                                    try {
                                      await customFetch(`/api/admin/users/${user.id}/repair-doctor`, {
                                        method: "POST",
                                      });
                                      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                                      toast({ title: "Doctor profile repaired" });
                                    } catch {
                                      toast({ title: "Failed to repair profile", variant: "destructive" });
                                    }
                                  }}
                                >
                                  {t("admin_repair") || "Repair Profile"}
                                </Button>
                              ) : (
                                <>
                                  {/* Status Badges */}
                                  {user.isApproved ? (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] h-5">
                                      <CheckCircle className="h-3 w-3 me-1" /> {t("admin_approved") || "Approved"}
                                    </Badge>
                                  ) : user.isRejected ? (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] h-5">
                                      <XCircle className="h-3 w-3 me-1" /> {t("admin_rejected") || "Rejected"}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] h-5">
                                      <XCircle className="h-3 w-3 me-1" /> {t("admin_pending") || "Pending"}
                                    </Badge>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="flex gap-1">
                                    {!user.isApproved && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-[9px] px-2 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                                        onClick={async () => {
                                          if (!user.doctorId) return;
                                          try {
                                            await customFetch(`/api/admin/doctors/${user.doctorId}/approve`, {
                                              method: "PATCH",
                                              body: JSON.stringify({ approve: true })
                                            });
                                            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                                            toast({ title: "Doctor account approved" });
                                          } catch {
                                            toast({ title: "Failed to approve doctor", variant: "destructive" });
                                          }
                                        }}
                                      >
                                        {t("admin_approve") || "Approve"}
                                      </Button>
                                    )}
                                    {!user.isApproved && !user.isRejected && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-[9px] px-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                        onClick={async () => {
                                          if (!user.doctorId) return;
                                          const reason = window.prompt("Enter rejection reason (optional):") || "";
                                          try {
                                            await customFetch(`/api/admin/doctors/${user.doctorId}/approve`, {
                                              method: "PATCH",
                                              body: JSON.stringify({ approve: false, reason })
                                            });
                                            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                                            toast({ title: "Doctor account rejected" });
                                          } catch {
                                            toast({ title: "Failed to reject doctor", variant: "destructive" });
                                          }
                                        }}
                                      >
                                        {t("admin_reject") || "Reject"}
                                      </Button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                          {user.createdAt ? (() => {
                            try {
                              const d = new Date(user.createdAt);
                              // If year is suspiciously large (e.g. > 10000), it's likely a millisecond timestamp being interpreted as seconds
                              if (d.getFullYear() > 10000) {
                                return format(new Date(Number(user.createdAt) / 1000), "MMM d, yyyy");
                              }
                              return (
                                <>
                                  {format(d, "MMM d, yyyy")}
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24))} {t("admin_total") || "days"} ago
                                  </div>
                                </>
                              );
                            } catch {
                              return "-";
                            }
                          })() : "-"}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(user.id)}
                            disabled={resettingPassword === user.id}
                            className="h-8"
                          >
                            <Key className="h-4 w-4 me-1" />
                            {t("admin_resetPass") || "Reset"}
                          </Button>
                          {user.role !== "admin" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                              disabled={deleteUserMutation.isPending}
                              className="h-8"
                            >
                              <Trash2 className="h-4 w-4 me-1" />
                              {t("common_delete")}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        {users?.length === 0 ? t("admin_noUsers") : t("admin_noResults")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateAdmin}>
            <DialogHeader>
              <DialogTitle>{t("admin_createAdminTitle")}</DialogTitle>
              <DialogDescription>{t("admin_createAdminSub")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-admin-firstName">{t("reg_firstName")}</Label>
                  <Input
                    id="new-admin-firstName"
                    value={newAdmin.firstName}
                    onChange={(e) => setNewAdmin((p) => ({ ...p, firstName: e.target.value }))}
                    required
                    data-testid="input-admin-firstName"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-admin-lastName">{t("reg_lastName")}</Label>
                  <Input
                    id="new-admin-lastName"
                    value={newAdmin.lastName}
                    onChange={(e) => setNewAdmin((p) => ({ ...p, lastName: e.target.value }))}
                    required
                    data-testid="input-admin-lastName"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-admin-email">{t("admin_adminEmail")}</Label>
                <Input
                  id="new-admin-email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
                  required
                  data-testid="input-admin-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-admin-password">{t("admin_adminPassword")}</Label>
                <Input
                  id="new-admin-password"
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
                  required
                  minLength={8}
                  data-testid="input-admin-password"
                />
                <p className="text-xs text-muted-foreground">{t("admin_adminPasswordHint")}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-admin-phone">{t("admin_adminPhone")}</Label>
                <Input
                  id="new-admin-phone"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, phone: e.target.value }))}
                  data-testid="input-admin-phone"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                {t("common_cancel")}
              </Button>
              <Button type="submit" disabled={createAdminMutation.isPending} data-testid="button-submit-create-admin">
                {createAdminMutation.isPending ? t("admin_creatingAdmin") : t("admin_createAdmin")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
