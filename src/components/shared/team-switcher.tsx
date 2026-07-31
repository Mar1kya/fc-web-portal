import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { teamContextTranslations } from "@/lib/constants";
import { TeamContext } from "../../../generated/prisma";

type TeamSwitcherProps = {
    availableTeams: TeamContext[];
    currentTeam: TeamContext;
    basePath: string;
}

export function TeamSwitcher({ availableTeams, currentTeam, basePath }: TeamSwitcherProps) {
    if (availableTeams.length === 0) {
        return <Button>Основна команда</Button>;
    }

    return (
        <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full md:w-auto">
            {availableTeams.map((teamEnum) => {
                const isActive = currentTeam === teamEnum;
                return (
                    <Link key={teamEnum} href={`${basePath}?team=${teamEnum}`}>
                        <Button
                            variant={isActive ? "default" : "outline"}
                            className={isActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                        >
                            {teamContextTranslations[teamEnum] || teamEnum}
                        </Button>
                    </Link>
                );
            })}
        </div>
    );
}