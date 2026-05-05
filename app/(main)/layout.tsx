import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";

export default function MainLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen w-full">
            <Header />
            <main className="flex-grow flex flex-col">
                {children}
            </main>
            <Footer />
        </div>
    );
}