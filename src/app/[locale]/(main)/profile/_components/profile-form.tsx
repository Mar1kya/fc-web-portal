"use client"

import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react";
import { useTranslations } from "next-intl"

export default function ProfileForm() {
    const t = useTranslations("ProfilePage.ProfileForm")
    return (
        <div className="w-full">
            <form className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-16 items-start">
                <div className="flex-1 w-full space-y-8">
                    <FieldGroup className="space-y-6">
                        <Field className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <FieldLabel htmlFor="name">{t("name")}</FieldLabel>
                                <p className="text-sm text-muted-foreground">{t("nameDescription")}</p>
                            </div>
                            <Input id="name" name="name" type="text" className="sm:max-w-xs" />
                        </Field>
                        <Field className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                                <p className="text-sm text-muted-foreground">{t("emailDescription")}</p>
                            </div>
                            <Input id="email" type="email" disabled className="sm:max-w-xs" />
                        </Field>
                    </FieldGroup>
                    <Separator />
                    <FieldGroup className="space-y-6">
                        <Field className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <FieldLabel htmlFor="currentPassword">{t("currentPassword")}</FieldLabel>
                                <p className="text-sm text-muted-foreground">{t("currentPasswordDescription")}</p>
                            </div>
                            <Input id="currentPassword" name="currentPassword" type="password" className="sm:max-w-xs" />
                        </Field>
                        <Field className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <FieldLabel htmlFor="newPassword">{t("newPassword")}</FieldLabel>
                                <p className="text-sm text-muted-foreground">{t("newPasswordDescription")}</p>
                            </div>
                            <Input id="newPassword" name="newPassword" type="password" className="sm:max-w-xs" />
                        </Field>
                        <Field className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <FieldLabel htmlFor="confirmPassword">{t("confirmPassword")}</FieldLabel>
                                <p className="text-sm text-muted-foreground">{t("confirmPasswordDescription")}</p>
                            </div>
                            <Input id="confirmPassword" name="confirmPassword" type="password" className="sm:max-w-xs" />
                        </Field>
                    </FieldGroup>
                    <Button type="submit">
                        {t("updateProfileButton")}
                    </Button>
                </div>
                <div className="flex flex-col items-center justify-start shrink-0 w-full lg:w-64 xl:w-72 lg:border-l border-border lg:pl-10 xl:pl-12 pt-2 pb-8 lg:pb-0">
                    <div className="relative flex items-center justify-center w-40 h-40 xl:w-48 xl:h-48 overflow-hidden rounded-2xl border border-border bg-muted mb-4">
                        <User className="w-16 h-16" />
                    </div>
                    <span className="text-sm text-muted-foreground">{t("profilePhoto")}</span>
                </div>
            </form>
        </div>
    )
}