import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useResetPassword } from "../../api-client-react/src/index.js";
import { useT } from "@/lib/translations";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const resetPasswordSchema = z.object({
  token: z.string().length(6, "Reset code must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const resetMutation = useResetPassword();
  const t = useT();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await resetMutation.mutateAsync({ data: { token: data.token, newPassword: data.newPassword } });
      setSuccess(true);
      setTimeout(() => setLocation("/login"), 3000);
    } catch (error: any) {
      const message = error.message || "";
      if (message.toLowerCase().includes("token") || message.toLowerCase().includes("code") || message.toLowerCase().includes("invalid")) {
        form.setError("token", { message: t("resetpw_invalidCode") || "invalid or expired code" });
      } else {
        toast({
          title: t("resetpw_errorTitle"),
          description: message || t("resetpw_errorDesc"),
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-2 text-center pb-8">
            <CardTitle className="text-3xl font-bold tracking-tight">{t("resetpw_title")}</CardTitle>
            <CardDescription className="text-base">{t("resetpw_sub")}</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">✅</div>
                <p className="text-base font-medium">{t("resetpw_successTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("resetpw_successDesc")}</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center">
                        <FormLabel className="text-center w-full">{t("resetpw_code")}</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormDescription>{t("resetpw_codeDesc")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("resetpw_newPassword")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            data-testid="input-new-password"
                          />
                        </FormControl>
                        <PasswordStrengthMeter password={field.value} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("resetpw_confirmPassword")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            data-testid="input-confirm-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 text-md"
                    disabled={resetMutation.isPending}
                    data-testid="button-submit-reset"
                  >
                    {resetMutation.isPending ? t("resetpw_loading") : t("resetpw_btn")}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          {!success && (
            <CardFooter className="flex justify-center border-t p-6">
              <div className="text-sm text-muted-foreground">
                {t("forgotpw_rememberPw")}{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  {t("login_btn")}
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </Layout>
  );
}
