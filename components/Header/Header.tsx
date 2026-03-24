export default function Header() {
    return (
        <header className="flex justify-between items-center p-4 bg-white border-b shadow-sm">
            <div className="font-bold text-xl text-blue-900">Руна С</div>
            <nav className="space-x-6">
                <a href="/" className="hover:text-blue-600">Главная</a>
                <a href="/catalog" className="hover:text-blue-600">Курсы 1С</a>
                <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md">Вход</a>
            </nav>
        </header>
    );
}