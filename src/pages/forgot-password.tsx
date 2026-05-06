import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForgotPassword } from "../../api-client-react/src/index.js";
import { useT } from "@/lib/translations";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const forgotMutation = useForgotPassword();
  const t = useT();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { 
      email: new URLSearchParams(window.location.search).get("email") || "" 
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await forgotMutation.mutateAsync({ data });
      toast({
        title: t("forgotpw_sentTitle"),
        description: t("forgotpw_sentDesc"),
      });
      setLocation("/reset-password");
    } catch (error: any) {
      const errorMsg = error.message || "";
      const isNotFound = errorMsg.includes("No account found");
      
      toast({
        title: t("forgotpw_errorTitle"),
        description: isNotFound ? t("forgotpw_emailNotFound") : (error.message || t("forgotpw_errorDesc")),
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-2 text-center pb-8">
            <CardTitle className="text-3xl font-bold tracking-tight">{t("forgotpw_title")}</CardTitle>
            <CardDescription className="text-base">{t("forgotpw_sub")}</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">📬</div>
                <p className="text-base font-medium">{t("forgotpw_sentTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("forgotpw_sentDesc")}</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("login_email")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            {...field}
                            data-testid="input-forgot-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 text-md"
                    disabled={forgotMutation.isPending}
                    data-testid="button-submit-forgot"
                  >
                    {forgotMutation.isPending ? t("forgotpw_sending") : t("forgotpw_btn")}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t p-6">
            <div className="text-sm text-muted-foreground">
              {t("forgotpw_rememberPw")}{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                {t("login_btn")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
