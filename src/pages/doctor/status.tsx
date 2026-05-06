import { Layout } from "@/components/layout";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Clock, XCircle, ArrowRight, LogOut } from "lucide-react";
import { useGetDoctorProfile, getGetDoctorProfileQueryKey } from "@workspace/api-client-react";

export default function DoctorStatus() {
  const { user, logout } = useAuth();
  const t = useT();
  const [, setLocation] = useLocation();

  const { data: doctorProfile } = useGetDoctorProfile({
    query: {
      queryKey: getGetDoctorProfileQueryKey(),
      enabled: user?.role === "doctor",
    }
  });

  const isRejected = doctorProfile?.isRejected;
  const rejectionReason = doctorProfile?.rejectionReason;

  return (
    <Layout>
      <div className="container max-w-2xl py-12 mx-auto px-4">
        <Card className="border-t-4 border-t-primary shadow-xl overflow-hidden">
          <div className={`h-2 ${isRejected ? "bg-destructive" : "bg-primary animate-pulse"}`} />
          <CardHeader className="text-center pb-2 pt-8">
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${isRejected ? "bg-destructive/10" : "bg-primary/10"}`}>
                {isRejected ? (
                  <XCircle className="w-16 h-16 text-destructive" />
                ) : (
                  <Clock className="w-16 h-16 text-primary" />
                )}
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              {isRejected ? t("status_rejectedTitle") : t("status_pendingTitle")}
            </CardTitle>
            <CardDescription className="text-lg mt-3 max-w-md mx-auto leading-relaxed">
              {isRejected 
                ? t("status_rejectedSub")
                : t("status_pendingSub")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-10 px-8 text-center">
            {isRejected && rejectionReason && (
              <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-6 mb-8 text-start">
                <h4 className="font-bold text-destructive mb-2 uppercase tracking-wider text-xs">{t("admin_rejectionReason") || "Rejection Reason:"}</h4>
                <p className="text-foreground/90 leading-relaxed font-medium">{rejectionReason}</p>
              </div>
            )}

            <div className="space-y-6">
              <p className="text-muted-foreground text-base">
                {isRejected 
                  ? t("status_rejectedAction")
                  : t("status_pendingAction")}
              </p>
              
              {isRejected && (
                <p className="text-sm text-muted-foreground/80 italic">
                  {t("status_rejectedHelp")}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => logout()}
                  className="w-full sm:w-48 h-11"
                >
                  <LogOut className="w-4 h-4 mr-2" /> {t("nav_logout")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
