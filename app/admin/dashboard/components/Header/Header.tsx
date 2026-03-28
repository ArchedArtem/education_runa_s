"use client";

export default function AdminHeader() {
    return (
        <header className="h-20 bg-white flex justify-between items-center w-full px-8 border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-700">search</span>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all duration-300"
                        placeholder="Поиск по ID клиента, email или названию курса..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900">Смирнов А.</span>
                    <span className="text-xs text-blue-700 font-semibold">Главный администратор</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md border-2 border-white ring-2 ring-slate-100">
                    <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                </div>
            </div>
        </header>
    );
}