import { Metadata } from "next"
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttributeManager } from "./_components/attribute-manager";

export const metadata: Metadata = {
    title: "Атрибути товарів",
    description: "Керування кольорами та типами одягу у фаншопі."
}

export default async function AttributesPage() {
    const [colors, apparelTypes] = await Promise.all([
        prisma.color.findMany({
            where: { deletedAt: null },
            include: { translations: true },
            orderBy: { position: "asc" }
        }),
        prisma.apparelType.findMany({
            where: { deletedAt: null },
            include: { translations: true },
            orderBy: { position: "asc" }
        }),
    ]);

    const colorItems = colors.map(c => ({
        id: c.id,
        hexCode: c.hexCode,
        name_uk: c.translations.find(t => t.language === "uk")?.name ?? "",
        name_en: c.translations.find(t => t.language === "en")?.name ?? "",
    }));

    const apparelTypeItems = apparelTypes.map(a => ({
        id: a.id,
        name_uk: a.translations.find(t => t.language === "uk")?.name ?? "",
        name_en: a.translations.find(t => t.language === "en")?.name ?? "",
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Атрибути товарів</h1>
            <Tabs defaultValue="colors">
                <TabsList>
                    <TabsTrigger value="colors">Кольори</TabsTrigger>
                    <TabsTrigger value="apparelTypes">Типи одягу</TabsTrigger>
                </TabsList>
                <TabsContent value="colors" className="pt-4">
                    <AttributeManager kind="color" initialItems={colorItems} />
                </TabsContent>
                <TabsContent value="apparelTypes" className="pt-4">
                    <AttributeManager kind="apparelType" initialItems={apparelTypeItems} />
                </TabsContent>
            </Tabs>
        </div>
    );
}