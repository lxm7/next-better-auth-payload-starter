import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { content } from "@/lib/content";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [landingPage, t] = await Promise.all([
    content.getLandingPage(locale),
    getTranslations("Home"),
  ]);

  // Field by field: a null entry (CMS down, or not published) and a null
  // field (editor left it empty) both land on the same message.
  const heading = landingPage?.heading ?? t("heading");
  const subheading = landingPage?.subheading ?? t("subheading");
  const ctaPrimary = landingPage?.ctaPrimaryLabel ?? t("ctaPrimary");
  const ctaSecondary = landingPage?.ctaSecondaryLabel ?? t("ctaSecondary");

  return (
    <>
      <header className="absolute top-0 right-0 flex items-center justify-end p-4">
        <ModeSwitcher />
      </header>
      <div className="flex h-screen flex-col items-center justify-center gap-5 px-5 text-center">
        <Image
          alt="Better Auth"
          className="rounded-lg dark:invert"
          height={100}
          src="/better-auth-starter.png"
          width={100}
        />

        <h1 className="font-bold text-4xl">{heading}</h1>

        <p className="text-lg">{subheading}</p>

        <div className="flex gap-2">
          <Link href="/login">
            <Button>{ctaPrimary}</Button>
          </Link>
          <Link href="/signup">
            <Button>{ctaSecondary}</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
