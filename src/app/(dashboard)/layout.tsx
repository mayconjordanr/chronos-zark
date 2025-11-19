import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950">
            <Sidebar />
            <div className="p-4 sm:ml-64">
                <div className="mt-4 rounded-lg border-2 border-dashed border-zinc-800 p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
