export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen w-full">
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
}