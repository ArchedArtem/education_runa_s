export default function AdminFooter() {
    return (
        <footer className="mt-auto py-6 px-10 flex justify-between items-center text-slate-400 border-t border-slate-200 bg-white">
            <p className="text-xs font-medium">© 2026 Руна С Обучение. Система управления.</p>
            <p className="text-xs font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span>
                Система работает стабильно
            </p>
        </footer>
    );
}