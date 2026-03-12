import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function RootLayout({ children, params }: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
