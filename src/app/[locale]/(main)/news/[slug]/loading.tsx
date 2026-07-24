export default function Loading() {
    return (
        <article className="w-full animate-pulse">
            <div className="h-5 w-32 rounded bg-muted mb-6" />
            <header className="mb-8">
                <div className="flex gap-2 mb-4">
                    <div className="h-6 w-24 rounded-full bg-muted" />
                    <div className="h-6 w-28 rounded-full bg-muted" />
                </div>
                <div className="h-9 w-3/4 rounded bg-muted mb-3" />
                <div className="h-9 w-1/2 rounded bg-muted mb-4" />
                <div className="h-4 w-40 rounded bg-muted" />
            </header>
            <div className="w-full aspect-video mb-8 rounded-xl bg-muted" />
            <div className="space-y-3 mb-12">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-5/6 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
        </article>
    );
}