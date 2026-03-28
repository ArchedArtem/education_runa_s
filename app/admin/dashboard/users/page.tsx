"use client";

import { useState, useEffect } from 'react';
import styles from './users.module.scss';

const MOCK_USERS = [
    { id: '1042', firstName: 'Иван', lastName: 'Иванов', email: 'ivanov@alfa-trade.ru', companyName: 'ООО Альфа-Трейд', role: 'Client', status: 'Active', createdAt: '12.05.2026' },
    { id: '1043', firstName: 'Анна', lastName: 'Смирнова', email: 'info@smirnov.ru', companyName: 'ИП Смирнов', role: 'Client', status: 'Active', createdAt: '14.05.2026' },
    { id: '1001', firstName: 'Алексей', lastName: 'Петров', email: 'admin@runa-s.ru', companyName: 'Руна С', role: 'Admin', status: 'Active', createdAt: '01.01.2026' },
    { id: '1044', firstName: 'Елена', lastName: 'Соколова', email: 'sokolova@vector.com', companyName: 'ЗАО Вектор', role: 'Client', status: 'Blocked', createdAt: '10.05.2026' },
    { id: '1045', firstName: 'Дмитрий', lastName: 'Волков', email: 'volkov@techprom.ru', companyName: 'ООО ТехПром', role: 'Moderator', status: 'Active', createdAt: '15.05.2026' }
];

type InviteType = {
    id: number;
    code: string;
    description: string | null;
    isActive: boolean;
};

export default function AdminUsersPage() {
    const [activeTab, setActiveTab] = useState<'users' | 'invites'>('users');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const [newInvite, setNewInvite] = useState({ code: '', description: '' });
    const [isSaving, setIsSaving] = useState(false);

    const [invites, setInvites] = useState<InviteType[]>([]);
    const [isLoadingInvites, setIsLoadingInvites] = useState(false);

    const filteredUsers = MOCK_USERS.filter(user => {
        const matchesSearch =
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    useEffect(() => {
        if (activeTab === 'invites') {
            const fetchInvites = async () => {
                setIsLoadingInvites(true);
                try {
                    const res = await fetch('/api/admin/invites');
                    if (res.ok) {
                        const data = await res.json();
                        setInvites(data);
                    }
                } catch (error) {
                    console.error("Ошибка при загрузке кодов:", error);
                } finally {
                    setIsLoadingInvites(false);
                }
            };
            fetchInvites();
        }
    }, [activeTab]);

    const handleCreateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInvite.code) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInvite),
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Код ${newInvite.code} активирован!`);
                setNewInvite({ code: '', description: '' });
                setInvites(prev => [data.invite, ...prev]);
            } else {
                alert(data.error || 'Ошибка сохранения');
            }
        } catch (e) {
            alert('Ошибка сервера');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        setInvites(prev => prev.map(invite =>
            invite.id === id ? { ...invite, isActive: !currentStatus } : invite
        ));

        try {
            const res = await fetch('/api/admin/invites', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) {
                throw new Error('Ошибка обновления');
            }
        } catch (error) {
            setInvites(prev => prev.map(invite =>
                invite.id === id ? { ...invite, isActive: currentStatus } : invite
            ));
            alert('Не удалось обновить статус кода');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите навсегда удалить этот код?')) return;

        const previousInvites = [...invites];

        setInvites(prev => prev.filter(invite => invite.id !== id));

        try {
            const res = await fetch(`/api/admin/invites?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Ошибка удаления');
            }
        } catch (error) {
            setInvites(previousInvites);
            alert('Не удалось удалить код');
        }
    };

    return (
        <div className="p-8 lg:p-10 space-y-6 max-w-[1600px] mx-auto w-full font-sans">

            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Управление доступом</h1>
                    <p className="text-slate-500 font-medium mt-1">Пользователи системы и пригласительные коды.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg w-fit border border-slate-200">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`cursor-pointer px-5 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Пользователи
                    </button>
                    <button
                        onClick={() => setActiveTab('invites')}
                        className={`cursor-pointer px-5 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'invites' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Коды доступа
                    </button>
                </div>
            </section>

            {activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in duration-300">

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full lg:max-w-md">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Поиск по фамилии, email или компании..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
                            {['All', 'Client', 'Admin', 'Moderator'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                        roleFilter === role ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {role === 'All' ? 'Все роли' : role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-20">ID</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Пользователь</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Организация</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Роль</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Статус</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Действия</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6 text-sm font-semibold text-slate-400">#{user.id}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</span>
                                                    <span className="text-xs text-slate-500 truncate">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-700 font-medium">{user.companyName}</td>
                                        <td className="py-4 px-6">
                                                <span className={`inline-flex px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                                    user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'Moderator' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {user.role}
                                                </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="text-sm font-semibold text-slate-700">
                                                        {user.status === 'Active' ? 'Активен' : 'Заблокирован'}
                                                    </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                                <button className="cursor-pointer p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">block</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'invites' && (
                <div className="space-y-6 animate-in fade-in duration-300">

                    <section className="bg-slate-900 rounded-xl p-8 text-white shadow-lg border border-slate-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-400 border border-blue-800/50">
                                <span className="material-symbols-outlined">add_moderator</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Выпуск нового кода</h2>
                                <p className="text-slate-400 text-sm">Создайте ключ доступа для регистрации новых клиентов.</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateInvite} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-4 space-y-1.5">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Текст кода</label>
                                <input
                                    type="text"
                                    placeholder="ALFA-BANK-2026"
                                    value={newInvite.code}
                                    onChange={(e) => setNewInvite({...newInvite, code: e.target.value.toUpperCase()})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 font-mono text-blue-100 outline-none focus:border-blue-500 transition-all text-sm"
                                    required
                                />
                            </div>
                            <div className="lg:col-span-5 space-y-1.5">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Примечание / Организация</label>
                                <input
                                    type="text"
                                    placeholder="Для сотрудников ООО 'Альфа'..."
                                    value={newInvite.description}
                                    onChange={(e) => setNewInvite({...newInvite, description: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="lg:col-span-3 flex items-end">
                                <button
                                    disabled={isSaving}
                                    className="cursor-pointer w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 text-sm"
                                >
                                    {isSaving ? 'Сохранение...' : 'Активировать код'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        {isLoadingInvites ? (
                            <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined animate-spin text-3xl">autorenew</span>
                                <p className="text-sm font-semibold">Загрузка кодов...</p>
                            </div>
                        ) : invites.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Код доступа</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Описание</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Статус</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Действия</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {invites.map(invite => (
                                    <tr key={invite.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono border border-slate-200">
                                                {invite.code}
                                            </code>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600">
                                            {invite.description || '—'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                                invite.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${invite.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                {invite.isActive ? 'Активен' : 'Отключен'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleToggleStatus(invite.id, invite.isActive)} className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Переключить статус">
                                                    <span className="material-symbols-outlined text-[20px]">{invite.isActive ? 'visibility_off' : 'visibility'}</span>
                                                </button>
                                                <button onClick={() => handleDelete(invite.id)} className="cursor-pointer p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Удалить">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">key_off</span>
                                <p className="text-sm font-semibold">Активных кодов пока нет</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}