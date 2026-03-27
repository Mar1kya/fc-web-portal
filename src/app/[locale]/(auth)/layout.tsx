import SelectLanguage from "@/components/layout/select-language";
import { Link } from "@/i18n/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh w-full">
      <div className="container mx-auto flex min-h-svh flex-col px-4 gap-6 sm:gap-0">
        <header className="flex w-full items-center justify-between py-4 border-b border-border/50">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="text-xl font-extrabold uppercase hover:text-emerald-600 transition-colors">
              Emerald Gang
            </span>
          </Link>
          <SelectLanguage />
        </header>
        <main className="flex flex-1 items-baseline sm:items-center justify-center">
          <div className="flex w-full max-w-sm flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}