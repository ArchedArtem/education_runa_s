"use client";

export default function Header() {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-md flex justify-between items-center w-full px-8 border-b border-slate-200 sticky top-0 z-40">
            <div className="flex-1 max-w-xl">
                {/* Оставим пустым или добавим глобальный поиск */}
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-sm font-semibold text-blue-700">Иванов Иван</span>
                    <span className="text-xs text-slate-500 font-medium">Менеджер по закупкам</span>
                </div>
                <div className="relative group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center ring-2 ring-slate-100 group-hover:ring-blue-700 transition-all overflow-hidden">
                        <span className="material-symbols-outlined text-slate-500">person</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
            </div>
        </header>
    );
}