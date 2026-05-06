import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/translations";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { registerDoctor } from "@/hooks/use-messages";
import { SpecialtySelector } from "@/components/specialty-selector";
import { User, Stethoscope, CheckCircle } from "lucide-react";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";

const patientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const doctorSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number is required for doctors"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
  specialty: z.array(z.string()).min(1, "Please select at least one specialty"),
  type: z.enum(["psychiatrist", "psychologist"], { required_error: "Please select a type" }),
  gender: z.enum(["male", "female"], { required_error: "Please select your gender" }),
  price: z.number({ invalid_type_error: "Price must be a number" }).int().min(0, "Price must be 0 or more"),
  bio: z.string().optional(),
  yearsExperience: z.number({ invalid_type_error: "Must be a number" }).int().min(0).optional(),
  paymentInfo: z.string().min(5, "Payment information is required for doctors"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PatientForm = z.infer<typeof patientSchema>;
type DoctorForm  = z.infer<typeof doctorSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const t = useT();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const registerMutation = useRegisterUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorPendingApproval, setDoctorPendingApproval] = useState(false);
  const [patientPendingVerification, setPatientPendingVerification] = useState(false);

  const patientForm = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const doctorForm = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "", specialty: [], bio: "", price: 0, paymentInfo: "" },
  });

  const onSubmitPatient = async (data: PatientForm) => {
    try {
      await registerMutation.mutateAsync({ data });
      setPatientPendingVerification(true);
    } catch (error: any) {
      toast({ title: t("reg_failed"), description: error.message, variant: "destructive" });
    }
  };

  const onSubmitDoctor = async (data: DoctorForm) => {
    setIsSubmitting(true);
    try {
      await registerDoctor({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        specialty: data.specialty,
        type: data.type,
        gender: data.gender,
        price: data.price,
        bio: data.bio || undefined,
        yearsExperience: data.yearsExperience,
        languages: ["Arabic"],
        sessionType: "individual",
        paymentInfo: data.paymentInfo,
      });
      setDoctorPendingApproval(true);
    } catch (error: any) {
      toast({ title: t("reg_failed"), description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (doctorPendingApproval || patientPendingVerification) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-lg border-border shadow-lg text-center">
            <CardContent className="p-10 flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <CheckCircle className="h-9 w-9 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">
                {doctorPendingApproval ? (t("reg_submittedTitle") || "Verify email & wait for approval") : "Verify your email"}
              </h2>
              <p className="text-muted-foreground max-w-sm">
                {doctorPendingApproval 
                  ? (t("reg_submittedDesc") || "We've sent a verification link to your email address. Please click it to verify your email. Note: Your doctor profile is also pending admin approval before you can log in.") 
                  : "We've sent a verification link to your email address. Please click the link to activate your account."}
              </p>
              <Button className="mt-4" onClick={() => setLocation("/login")}>{t("reg_goToLogin")}</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[calc(100vh-4rem)]">

        {/* Role Selector */}
        <div className="w-full max-w-lg mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                role === "patient"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              }`}
            >
              <User className="h-7 w-7" />
              <div>
                <div className="font-semibold text-sm">{t("reg_iAmPatient")}</div>
                <div className="text-xs opacity-70">{t("reg_iAmPatientSub")}</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                role === "doctor"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Stethoscope className="h-7 w-7" />
              <div>
                <div className="font-semibold text-sm">{t("reg_iAmDoctor")}</div>
                <div className="text-xs opacity-70">{t("reg_iAmDoctorSub")}</div>
              </div>
            </button>
          </div>
        </div>

        <Card className="w-full max-w-lg border-border shadow-lg">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {role === "patient" ? t("reg_createPatient") : t("reg_createDoctor")}
            </CardTitle>
            <CardDescription className="text-sm">
              {role === "patient" ? t("reg_patientSub") : t("reg_doctorSub")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {role === "patient" ? (
              <Form {...patientForm} key="patient-registration-form">
                <form onSubmit={patientForm.handleSubmit(onSubmitPatient)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={patientForm.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reg_firstName")}</FormLabel>
                        <FormControl><Input {...field} data-testid="input-firstName" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={patientForm.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reg_lastName")}</FormLabel>
                        <FormControl><Input {...field} data-testid="input-lastName" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={patientForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("reg_email")}</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={patientForm.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("reg_phone")} <span className="text-muted-foreground font-normal">{t("reg_optional")}</span></FormLabel>
                      <FormControl><Input placeholder="01000000000" {...field} data-testid="input-phone" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={patientForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reg_password")}</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} data-testid="input-password" /></FormControl>
                        <PasswordStrengthMeter password={field.value} />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={patientForm.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reg_confirmPassword") || "Confirm Password"}</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} data-testid="input-confirm-password" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <Button type="submit" className="w-full h-12 mt-4" disabled={registerMutation.isPending} data-testid="button-submit-register">
                    {registerMutation.isPending ? t("reg_creatingAccount") : t("reg_createPatientBtn")}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...doctorForm} key="doctor-registration-form">
                <form onSubmit={doctorForm.handleSubmit(onSubmitDoctor)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={doctorForm.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reg_firstName")}</FormLabel>
                        <FormControl><Input {...field} data-testid="input-firstName-doctor" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={doctorForm.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reg_lastName")}</FormLabel>
                        <FormControl><Input {...field} data-testid="input-lastName-doctor" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={doctorForm.control} name="email" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>{t("reg_email")}</FormLabel>
                        <FormControl><Input type="email" placeholder="doctor@example.com" {...field} data-testid="input-email-doctor" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={doctorForm.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reg_phone")}</FormLabel>
                        <FormControl><Input placeholder="01000000000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={doctorForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reg_password")}</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <PasswordStrengthMeter password={field.value} />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={doctorForm.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reg_confirmPassword") || "Confirm Password"}</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("reg_professionalDet")}</p>
                    <div className="space-y-4">

                      {/* Type selector */}
                      <FormField control={doctorForm.control} name="type" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("reg_type")}</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {(["psychiatrist", "psychologist"] as const).map(typ => (
                              <button key={typ} type="button"
                                onClick={() => field.onChange(typ)}
                                className={`py-2.5 rounded-lg border text-sm font-medium transition-all capitalize ${
                                  field.value === typ ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                                }`}>
                                {typ === "psychiatrist" ? t("reg_psychiatrist") : t("reg_psychologist")}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Multi-select specialty checklist */}
                      <FormField control={doctorForm.control} name="specialty" render={({ field }) => {
                        const isMainTypeSelected = !!doctorForm.watch("type");
                        return (
                          <FormItem>
                            <SpecialtySelector
                              value={field.value}
                              onChange={(vals) => field.onChange(vals)}
                              showLabels
                              multi={true}
                              disabled={!isMainTypeSelected}
                            />
                            {!isMainTypeSelected && (
                              <p className="text-xs text-amber-600 mt-1">{t("spec_selectMainFirst") || "Please select a main profession first."}</p>
                            )}
                            <FormMessage />
                          </FormItem>
                        );
                      }} />

                      {/* Gender */}
                      <FormField control={doctorForm.control} name="gender" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("reg_gender")}</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {(["male", "female"] as const).map(g => (
                              <button key={g} type="button"
                                onClick={() => field.onChange(g)}
                                className={`py-2.5 rounded-lg border text-sm font-medium transition-all capitalize ${
                                  field.value === g ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                                }`}>
                                {g === "male" ? t("reg_male") : t("reg_female")}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={doctorForm.control} name="price" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("reg_price")}</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} placeholder="350" {...field} onChange={e => field.onChange(+e.target.value)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={doctorForm.control} name="yearsExperience" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("reg_experience")}</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} placeholder="5" {...field} onChange={e => field.onChange(e.target.value ? +e.target.value : undefined)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      
                      <FormField control={doctorForm.control} name="paymentInfo" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("reg_paymentMethod")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("reg_paymentPlaceholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={doctorForm.control} name="bio" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("reg_bio")} <span className="text-muted-foreground font-normal">{t("reg_optional")}</span></FormLabel>
                          <FormControl>
                            <Textarea placeholder={t("reg_bioPlaceholder")} className="resize-none h-24" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                    {isSubmitting ? t("reg_creatingAccount") : t("reg_createDoctorBtn")}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t p-6">
            <div className="text-sm text-muted-foreground">
              {t("reg_haveAccount")}{" "}
              <Link href="/login" className="text-primary font-medium hover:underline" data-testid="link-to-login">
                {t("reg_logIn")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
