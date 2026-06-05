"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DictionaryActions } from "./dictionary-actions";
import { getTranslation } from "@/lib/utils/get-translation";
import { TeamDictionary, TeamDictionaryTranslation } from "../../../../../../../../generated/prisma";

type DictionaryWithTranslations = TeamDictionary & {
    translations: TeamDictionaryTranslation[];
};

export const columns: ColumnDef<DictionaryWithTranslations>[] = [
    {
        accessorKey: "sofascoreId",
        header: "SofaScore ID",
        cell: ({ row }) => <Badge variant="outline">{row.original.sofascoreId}</Badge>,
    },
    {
        accessorKey: "originalName",
        header: "Оригінал (SofaScore)",
        cell: ({ row }) => <div className="font-medium text-muted-foreground">{row.original.originalName}</div>,
    },
    {
        id: "nameUk",
        header: "Українською",
        cell: ({ row }) => {
            const name = getTranslation(row.original, "uk")?.name || "—";
            return <div className="font-semibold">{name}</div>;
        },
    },
    {
        id: "nameEn",
        header: "Англійською",
        cell: ({ row }) => {
            const name = getTranslation(row.original, "en")?.name || "—";
            return <div>{name}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <div className="flex justify-end"><DictionaryActions entry={row.original} /></div>,
    },
];