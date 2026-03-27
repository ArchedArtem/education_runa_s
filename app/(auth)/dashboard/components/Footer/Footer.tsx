import Link from "next/link";

export default function Footer() {
    return(
        <footer className="mt-auto py-8 px-10 flex justify-between items-center text-slate-400 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs font-medium">© 2026 Руна С Обучение. Все права защищены.</p>
            <div className="flex gap-6">
                <Link href="/support" className="text-xs font-medium hover:text-blue-700 transition-colors">Поддержка</Link>
                <Link href="/privacy" className="text-xs font-medium hover:text-blue-700 transition-colors">Политика конфиденциальности</Link>
            </div>
        </footer>
    );
}
