"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { GoogleButton } from "@/components/forms/google-button";
import { LegalNotice } from "@/components/forms/legal-notice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { signIn } from "@/server/users";
import { Badge } from "../ui/badge";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("LoginForm");

  const lastMethod = authClient.getLastUsedLoginMethod();

  const [isPending, startTransition] = useTransition();
  const [isGooglePending, setIsGooglePending] = useState(false);

  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Transition covers the server action *and* the navigation after it, so
    // the button stays busy until /todos has rendered.
    startTransition(async () => {
      const { success, message } = await signIn(values.email, values.password);

      if (!success) {
        toast.error(message as string);
        return;
      }

      toast.success(message as string);
      // Updates after an `await` fall outside the outer transition; re-enter
      // it so `isPending` tracks the navigation.
      startTransition(() => router.push("/todos"));
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <GoogleButton
                    badge={lastMethod === "google" ? t("lastUsed") : null}
                    callbackHref="/todos"
                    disabled={isPending}
                    label={t("google")}
                    onPendingChange={setIsGooglePending}
                  />
                </div>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
                  <span className="relative z-10 bg-card px-2 text-muted-foreground">
                    {t("divider")}
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>{t("emailLabel")}</FormLabel>

                            {lastMethod === "email" && (
                              <Badge className="text-[9px]">
                                {t("lastUsed")}
                              </Badge>
                            )}
                          </div>
                          <FormControl>
                            <Input
                              placeholder={t("emailPlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex flex-col gap-2">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("passwordLabel")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("passwordPlaceholder")}
                                {...field}
                                type="password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Link
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                        href="/forgot-password"
                      >
                        {t("forgotPassword")}
                      </Link>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    disabled={isGooglePending}
                    loading={isPending}
                    type="submit"
                  >
                    {t("submit")}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  {t("noAccount")}{" "}
                  <Link className="underline underline-offset-4" href="/signup">
                    {t("signUpLink")}
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <LegalNotice />
    </div>
  );
}
