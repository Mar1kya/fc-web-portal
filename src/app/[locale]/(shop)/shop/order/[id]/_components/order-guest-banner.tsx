import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GoogleLoginButton from "./google-login-button";

export default async function OrderGuestBanner({ email }: { email: string }) {
    const t = await getTranslations("Shop.OrderPage");
    return (
        <Card className="border-emerald-600/30 bg-emerald-600/5 shadow-none rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-600">
                    <User className="w-5 h-5" />
                    {t("guestBannerTitle")}
                </CardTitle>
                <CardDescription className="text-foreground/80 text-sm leading-relaxed pt-1">
                    {t("guestBannerDesc", { email })}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex flex-wrap gap-3 items-center">
                <GoogleLoginButton text={t("google-button")} />
                <div className="hidden sm:block text-muted-foreground/50 text-sm font-medium">|</div>
                <Link href="/auth/register">
                    <Button size="sm" variant="ghost" className="font-bold text-xs h-9 hover:text-emerald-700">
                        {t("register")}
                    </Button>
                </Link>
                <Link href="/auth/login">
                    <Button size="sm" variant="ghost" className="font-bold text-xs h-9 hover:text-emerald-700">
                        {t("login")}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}