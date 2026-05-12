import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/layout";
import { Search, Shield, Clock, Video, Heart, Brain, Sparkles, Smile, ArrowRight, BookOpen } from "lucide-react";
import { useT } from "@/lib/translations";

export default function Home() {
  const [, setLocation] = useLocation();
  const t = useT();

  const specialtyCards = [
    { labelKey: "home_specialtyAnxiety"  as const, specialty: "Anxiety & Stress",  icon: Brain },
    { labelKey: "home_specialtyDepression" as const, specialty: "Depression",       icon: Heart },
    { labelKey: "home_specialtyStress"   as const, specialty: "Trauma & PTSD",     icon: Sparkles },
    { labelKey: "home_specialtyRelationships" as const, specialty: "Relationships", icon: Smile },
  ];

  const steps = [
    { step: "1", titleKey: "home_step1Title" as const, descKey: "home_step1Desc" as const, icon: Search },
    { step: "2", titleKey: "home_step2Title" as const, descKey: "home_step2Desc" as const, icon: BookOpen },
    { step: "3", titleKey: "home_step3Title" as const, descKey: "home_step3Desc" as const, icon: Video },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-primary/5 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5" />
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              {t("home_heroTitle")}
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              {t("home_heroSub")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/doctors">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8" data-testid="link-browse-doctors">
                  <Search className="me-2 h-5 w-5" />
                  {t("home_findDoctor")}
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8" data-testid="link-register-hero">
                  {t("home_createAccount")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">{t("home_whyRelax")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("home_verified")}</h3>
              <p className="text-muted-foreground">{t("home_verifiedDesc")}</p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("home_onlineSession")}</h3>
              <p className="text-muted-foreground">{t("home_onlineSessionDesc")}</p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("home_instantBooking")}</h3>
              <p className="text-muted-foreground">{t("home_instantBookingDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("home_findSpecialist")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("home_findSpecialistSub")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {specialtyCards.map(({ labelKey, specialty, icon: Icon }) => (
              <Card
                key={labelKey}
                className="hover-elevate cursor-pointer transition-all border-none shadow-sm group"
                onClick={() => setLocation(`/doctors?specialty=${encodeURIComponent(specialty)}`)}
              >
                <CardContent className="p-6 text-center">
                  <Icon className="h-10 w-10 mx-auto text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium">{t(labelKey)}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/doctors">
              <Button variant="link" className="text-primary font-medium" data-testid="link-view-all-specialties">
                {t("home_viewAll")} <ArrowRight className="w-4 h-4 ms-1 inline" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">{t("home_howItWorks")}</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map(({ step, titleKey, descKey, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="mx-auto w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4 shadow-md">
                  <span className="text-primary-foreground font-bold text-xl">{step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t(titleKey)}</h3>
                <p className="text-muted-foreground text-sm">{t(descKey)}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register">
              <Button size="lg" data-testid="link-get-started">
                {t("home_getStarted")} <ArrowRight className="w-4 h-4 ms-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
