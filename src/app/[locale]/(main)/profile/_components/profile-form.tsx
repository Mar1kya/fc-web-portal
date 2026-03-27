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
import Image from "next/image"
import { cn, getHighResImage } from "@/lib/utils"
import { useActionState, useEffect, useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile"

type ProfileUser = {
    user: {
        name: string | null,
        email: string | null,
        image: string | null
    }
}

export default function ProfileForm({ user }: ProfileUser) {
    const t = useTranslations("ProfilePage.ProfileForm");
    const [imageUrl, setImageUrl] = useState<string | null>(user.image);
    const [isUploading, setIsUploading] = useState(false);
    const highResImage = imageUrl ? getHighResImage(imageUrl) : null;
    const updateProfileWithImage = updateProfile.bind(null, imageUrl);
    const [state, actionFn, isPending] = useActionState(updateProfileWithImage, undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
        } else if (state?.message) {
            toast.error(state.message);
        }
    }, [state]);

    return (
        <div className="w-full">
            <form action={actionFn} className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-16 items-start">
                <div className="flex-1 w-full space-y-8">
                    <FieldGroup className="space-y-6">
                        <Field className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1 sm:mt-2">
                                <FieldLabel htmlFor="name">{t("name")}</FieldLabel>
                                <p className="text-sm text-muted-foreground">{t("nameDescription")}</p>
                            </div>
                            <div className="w-full sm:max-w-xs flex flex-col gap-1.5">
                                <Input id="name" name="name" type="text" defaultValue={user.name || ""} className="w-full" />
                                {state?.errors?.name && <p className="text-red-500 text-sm">{state.errors.name[0]}</p>}
                            </div>
                        </Field>
                        <Field className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1 sm:mt-2">
                                <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                                <p className="text-sm text-muted-foreground">{t("emailDescription")}</p>
                            </div>
                            <div className="w-full sm:max-w-xs">
                                <Input id="email" type="email" disabled defaultValue={user.email || ""} className="w-full" />
                            </div>
                        </Field>
                    </FieldGroup>
                    <Separator />
                    <FieldGroup className="space-y-6">
                        <Field className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1 sm:mt-2">
                                <FieldLabel htmlFor="currentPassword">{t("currentPassword")}</FieldLabel>
                                <p className="text-sm text-muted-foreground">{t("currentPasswordDescription")}</p>
                            </div>
                            <div className="w-full sm:max-w-xs flex flex-col gap-1.5">
                                <Input id="currentPassword" name="currentPassword" type="password" className="w-full" />
                                {state?.errors?.currentPassword && <p className="text-red-500 text-sm">{state.errors.currentPassword[0]}</p>}
                            </div>
                        </Field>
                        <Field className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1 sm:mt-2">
                                <FieldLabel htmlFor="newPassword">{t("newPassword")}</FieldLabel>
                                <p className="text-sm text-muted-foreground">{t("newPasswordDescription")}</p>
                            </div>
                            <div className="w-full sm:max-w-xs flex flex-col gap-1.5">
                                <Input id="newPassword" name="newPassword" type="password" className="w-full" />
                                {state?.errors?.newPassword && <p className="text-red-500 text-sm">{state.errors.newPassword[0]}</p>}
                            </div>
                        </Field>
                        <Field className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1 sm:mt-2">
                                <FieldLabel htmlFor="confirmPassword">{t("confirmPassword")}</FieldLabel>
                                <p className="text-sm text-muted-foreground">{t("confirmPasswordDescription")}</p>
                            </div>
                            <div className="w-full sm:max-w-xs flex flex-col gap-1.5">
                                <Input id="confirmPassword" name="confirmPassword" type="password" className="w-full" />
                                {state?.errors?.confirmPassword && <p className="text-red-500 text-sm">{state.errors.confirmPassword[0]}</p>}
                            </div>
                        </Field>
                    </FieldGroup>
                    <Button type="submit" disabled={isPending || isUploading}>
                        {t("updateProfileButton")}
                    </Button>
                </div>
                <div className="flex flex-col items-center justify-start shrink-0 w-full lg:w-64 xl:w-72 lg:border-l border-border lg:pl-10 xl:pl-12 pt-2 pb-8 lg:pb-0">
                    <div className="relative flex items-center justify-center w-40 h-40 xl:w-48 xl:h-48 overflow-hidden rounded-2xl border border-border bg-muted mb-4 group cursor-pointer">
                        {highResImage ? (
                            <Image
                                src={highResImage}
                                alt={user.name || "Profile photo"}
                                width={192}
                                height={192}
                                quality={100}
                                priority
                                className={cn(
                                    "w-full h-full object-cover transition-all duration-300",
                                    isUploading && "blur-[2px] opacity-70"
                                )}
                            />
                        ) : (
                            <User className="w-16 h-16 text-muted-foreground" />
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <UploadButton
                                endpoint="profileImage"
                                onUploadBegin={() => setIsUploading(true)}
                                onClientUploadComplete={(res) => {
                                    setIsUploading(false);
                                    if (res && res.length > 0) {
                                        setImageUrl(res[0].url);
                                        toast.success(t("photoUploadedSuccess"));
                                    }
                                }}
                                onUploadError={() => {
                                    setIsUploading(false);
                                    toast.error(t("photoUploadError"));
                                }}
                                content={{
                                    button: t("changePhoto"),
                                    allowedContent: () => null
                                }}
                                appearance={{
                                    container: "w-full h-full absolute inset-0 flex items-center justify-center",
                                    button: "w-full h-full bg-transparent text-white font-medium focus-within:ring-0 after:hidden",
                                    allowedContent: "hidden"
                                }}
                            />
                        </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{t("profilePhoto")}</span>
                </div>
            </form>
        </div>
    )
}