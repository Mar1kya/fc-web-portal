import Flag from "react-world-flags";
import { normalizeFlagCode, isCustomFlag } from "@/lib/utils/country-code";

const CUSTOM_FLAGS: Record<string, string> = {
    ENG: "/flags/england.svg",
    SCO: "/flags/scotland.svg",
    WAL: "/flags/wales.svg",
};

type NationalityFlagProps = {
    code: string;
    className?: string;
    fallback?: React.ReactNode;
};

export default function NationalityFlag({ code, className, fallback }: NationalityFlagProps) {
    const upperCode = code.toUpperCase();

    if (isCustomFlag(upperCode)) {
        return (
            <img
                src={CUSTOM_FLAGS[upperCode]}
                alt={upperCode}
                className={className}
            />
        );
    }

    return (
        <Flag
            code={normalizeFlagCode(upperCode)}
            className={className}
            fallback={fallback}
        />
    );
}