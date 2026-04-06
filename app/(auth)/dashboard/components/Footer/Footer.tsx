import Link from "next/link";

export default function Footer() {
    return(
        <footer className="mt-auto py-6 px-4 md:py-8 md:px-10 flex flex-col-reverse md:flex-row justify-center md:justify-between items-center gap-4 md:gap-0 text-slate-400 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs font-medium text-center md:text-left">
                © 2026 Руна С Обучение. Все права защищены.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                <Link href="/support" className="text-xs font-medium hover:text-blue-700 transition-colors">
                    Поддержка
                </Link>
                <Link href="/privacy" className="text-xs font-medium hover:text-blue-700 transition-colors">
                    Политика конфиденциальности
                </Link>
            </div>
        </footer>
    );
}