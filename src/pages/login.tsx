import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/translations";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLoginUser();
  const t = useT();

  // Redirect if already logged in
  if (user) {
    if (user.role === "patient") setLocation("/doctors");
    else if (user.role === "doctor") setLocation("/doctor/dashboard");
    else if (user.role === "admin") setLocation("/admin");
    else setLocation("/");
    return null;
  }

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await loginMutation.mutateAsync({ data });
      login(response.token, response.user);
      toast({ title: t("login_success") || "Signed in successfully" });
      if (response.user.role === "patient") setLocation("/doctors");
      else if (response.user.role === "doctor") setLocation("/doctor/dashboard");
      else if (response.user.role === "admin") setLocation("/admin");
      else setLocation("/");
    } catch (error: any) {
      toast({
        title: t("login_failed"),
        description: error.message || t("login_checkCreds"),
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-2 text-center pb-8">
            <CardTitle className="text-3xl font-bold tracking-tight">{t("login_title")}</CardTitle>
            <CardDescription className="text-base">{t("login_sub")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("login_email")}</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>{t("login_password")}</FormLabel>
                        <Link
                          href={`/forgot-password?email=${encodeURIComponent(form.getValues("email"))}`}
                          className="text-sm text-primary hover:underline"
                          data-testid="link-forgot-password"
                        >
                          {t("login_forgotPw")}
                        </Link>
                      </div>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} data-testid="input-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-md"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit-login"
                >
                  {loginMutation.isPending ? t("login_loading") : t("login_btn")}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-6">
            <div className="text-sm text-muted-foreground">
              {t("login_noAccount")}{" "}
              <Link href="/register" className="text-primary font-medium hover:underline" data-testid="link-to-register">
                {t("login_signUp")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
