import { redirect } from "next/navigation";

export default function TournamentsIndexPage() {
    redirect("/admin/tournaments/matches");
}