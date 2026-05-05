"use client";

import {useState, useEffect, Suspense} from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './users.module.scss';
import ConfirmModal from '@/app/components/UI/ConfirmModal/ConfirmModal';
import { useToast } from '@/app/components/Providers/ToastProvider';

type InviteType = {
    id: number;
    code: string;
    description: string | null;
    isActive: boolean;
};

type UserType = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    company_name: string | null;
    role_id: number;
    is_block: boolean;
    created_at: string;
};

function UsersPageContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'users' | 'invites'>('users');

    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    const [roleFilter, setRoleFilter] = useState('All');
    const [userRole, setUserRole] = useState<string | null>(null);

    const [newInvite, setNewInvite] = useState({code: '', description: ''});
    const [isSavingInvite, setIsSavingInvite] = useState(false);
    const [invites, setInvites] = useState<InviteType[]>([]);
    const [isLoadingInvites, setIsLoadingInvites] = useState(false);

    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isSavingUser, setIsSavingUser] = useState(false);
    const [newUser, setNewUser] = useState({
        first_name: '',
        last_name: '',
        email: '',
        company_name: '',
        password: '',
        role_id: 2
    });

    const [editingUser, setEditingUser] = useState<UserType | null>(null);

    const [isDeleteInviteModalOpen, setIsDeleteInviteModalOpen] = useState(false);
    const [inviteToDelete, setInviteToDelete] = useState<number | null>(null);

    const { showToast } = useToast();

    useEffect(() => {
        const query = searchParams.get('search');
        if (query !== null) {
            setSearchQuery(query);
            setActiveTab('users');
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchRole = async () => {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
            try {
                const res = await fetch('/api/admin/auth/me', { headers });
                if (res.ok) {
                    const data = await res.json();
                    setUserRole(data.user?.role?.name || data.roleName);
                }
            } catch (err) {}
        };
        fetchRole();
    }, []);

    const getRoleName = (roleId: number) => {
        switch (roleId) {
            case 1: return 'Admin';
            case 2: return 'Client';
            case 3: return 'Moderator';
            default: return 'Client';
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.company_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchQuery.toLowerCase());

        const roleName = getRoleName(user.role_id);
        const matchesRole = roleFilter === 'All' || roleName === roleFilter;

        return matchesSearch && matchesRole;
    });

    useEffect(() => {
        if (activeTab === 'invites' && userRole === 'Admin') {
            const fetchInvites = async () => {
                setIsLoadingInvites(true);
                try {
                    const token = localStorage.getItem('token');
                    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
                    const res = await fetch('/api/admin/invites', { headers });
                    if (res.ok) {
                        const data = await res.json();
                        setInvites(data);
                    }
                } catch (error) {
                } finally {
                    setIsLoadingInvites(false);
                }
            };
            fetchInvites();
        } else if (activeTab === 'users') {
            const fetchUsers = async () => {
                setIsLoadingUsers(true);
                try {
                    const token = localStorage.getItem('token');
                    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
                    const res = await fetch('/api/admin/users', { headers });
                    if (res.ok) {
                        const data = await res.json();
                        setUsers(data);
                    }
                } catch (error) {
                } finally {
                    setIsLoadingUsers(false);
                }
            };
            fetchUsers();
        }
    }, [activeTab, userRole]);

    const handleCreateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInvite.code) return;
        setIsSavingInvite(true);
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const res = await fetch('/api/admin/invites', {
                method: 'POST',
                headers,
                body: JSON.stringify(newInvite),
            });
            const data = await res.json();
            if (res.ok) {
                setNewInvite({code: '', description: ''});
                setInvites(prev => [data.invite, ...prev]);
                showToast('Пригласительный код успешно создан', 'success');
            } else {
                showToast(data.error || 'Ошибка при создании кода', 'error');
            }
        } catch (e) {
            showToast('Ошибка сервера', 'error');
        } finally {
            setIsSavingInvite(false);
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        setInvites(prev => prev.map(invite =>
            invite.id === id ? {...invite, isActive: !currentStatus} : invite
        ));
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const res = await fetch('/api/admin/invites', {
                method: 'PATCH',
                headers,
                body: JSON.stringify({id}),
            });
            if (!res.ok) throw new Error();
        } catch (error) {
            setInvites(prev => prev.map(invite =>
                invite.id === id ? {...invite, isActive: currentStatus} : invite
            ));
            showToast('Не удалось изменить статус', 'error');
        }
    };

    const confirmDeleteInvite = (id: number) => {
        setInviteToDelete(id);
        setIsDeleteInviteModalOpen(true);
    };

    const cancelDeleteInvite = () => {
        setIsDeleteInviteModalOpen(false);
        setInviteToDelete(null);
    };

    const executeDeleteInvite = async () => {
        if (inviteToDelete === null) return;
        const previousInvites = [...invites];
        setInvites(prev => prev.filter(invite => invite.id !== inviteToDelete));
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`/api/admin/invites?id=${inviteToDelete}`, {method: 'DELETE', headers});
            if (!res.ok) throw new Error();
            showToast('Код успешно удален', 'success');
        } catch (error) {
            setInvites(previousInvites);
            showToast('Не удалось удалить код', 'error');
        } finally {
            setIsDeleteInviteModalOpen(false);
            setInviteToDelete(null);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingUser(true);
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers,
                body: JSON.stringify(newUser),
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(prev => [data.user, ...prev]);
                setIsUserModalOpen(false);
                setNewUser({first_name: '', last_name: '', email: '', company_name: '', password: '', role_id: 2});
                showToast('Пользователь успешно добавлен', 'success');
            } else {
                showToast(data.error || 'Ошибка при создании пользователя', 'error');
            }
        } catch (e) {
            showToast('Ошибка сервера', 'error');
        } finally {
            setIsSavingUser(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsSavingUser(true);
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers,
                body: JSON.stringify({action: 'edit', ...editingUser}),
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === editingUser.id ? data.user : u));
                setEditingUser(null);
                showToast('Данные пользователя обновлены', 'success');
            } else {
                showToast(data.error || 'Ошибка при обновлении пользователя', 'error');
            }
        } catch (e) {
            showToast('Ошибка сервера', 'error');
        } finally {
            setIsSavingUser(false);
        }
    };

    const handleToggleUserBlock = async (id: string, currentStatus: boolean) => {
        setUsers(prev => prev.map(user =>
            user.id === id ? {...user, is_block: !currentStatus} : user
        ));
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers,
                body: JSON.stringify({id, action: 'toggle_block'}),
            });
            if (!res.ok) throw new Error();
        } catch (error) {
            setUsers(prev => prev.map(user =>
                user.id === id ? {...user, is_block: currentStatus} : user
            ));
            showToast('Не удалось обновить статус пользователя', 'error');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <ConfirmModal
                isOpen={isDeleteInviteModalOpen}
                title="Удаление кода доступа"
                message="Вы уверены, что хотите навсегда удалить этот код?"
                confirmText="Удалить"
                cancelText="Отмена"
                onConfirm={executeDeleteInvite}
                onCancel={cancelDeleteInvite}
                isDangerous={true}
            />

            <section className={styles.headerSection}>
                <div>
                    <h1 className={styles.title}>Управление доступом</h1>
                    <p className={styles.subtitle}>Пользователи системы и пригласительные коды.</p>
                </div>
                <div className={styles.tabsWrapper}>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={activeTab === 'users' ? styles.tabBtnActive : styles.tabBtn}
                    >
                        Пользователи
                    </button>
                    {userRole === 'Admin' && (
                        <button
                            onClick={() => setActiveTab('invites')}
                            className={activeTab === 'invites' ? styles.tabBtnActive : styles.tabBtn}
                        >
                            Коды доступа
                        </button>
                    )}
                </div>
            </section>

            {activeTab === 'users' && (
                <div className={styles.animateFadeIn}>
                    <div className={styles.toolbar}>
                        <div className={styles.searchWrapper}>
                            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                            <input
                                type="text"
                                placeholder="Поиск по фамилии, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                        <div className={styles.filtersWrapper}>
                            <div className={styles.rolesScroll}>
                                {['All', 'Client', 'Admin', 'Moderator'].map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setRoleFilter(role)}
                                        className={roleFilter === role ? styles.roleBtnActive : styles.roleBtn}
                                    >
                                        {role === 'All' ? 'Все роли' : role}
                                    </button>
                                ))}
                            </div>
                            {userRole === 'Admin' && (
                                <button
                                    onClick={() => setIsUserModalOpen(true)}
                                    className={styles.addBtn}
                                >
                                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>add</span>
                                    Добавить
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.card}>
                        {isLoadingUsers ? (
                            <div className={styles.emptyState}>
                                <span className="material-symbols-outlined animate-spin text-3xl">autorenew</span>
                            </div>
                        ) : (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th} style={{width: '5rem'}}>ID</th>
                                        <th className={styles.th}>Пользователь</th>
                                        <th className={styles.th}>Организация</th>
                                        <th className={styles.th}>Роль</th>
                                        <th className={styles.th}>Статус</th>
                                        <th className={styles.th} style={{textAlign: 'right'}}>Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody className={styles.tbody}>
                                    {filteredUsers.map((user) => {
                                        const roleName = getRoleName(user.role_id);
                                        return (
                                            <tr key={user.id} className={styles.tr}>
                                                <td className={styles.td}
                                                    style={{fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8'}}>
                                                    #{user.id.toString().substring(0, 4)}
                                                </td>
                                                <td className={styles.td}>
                                                    <div
                                                        style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                                        <div className={styles.avatar}>
                                                            {user.first_name[0]}{user.last_name[0]}
                                                        </div>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            minWidth: 0
                                                        }}>
                                                            <span style={{
                                                                fontSize: '0.875rem',
                                                                fontWeight: 700,
                                                                color: '#0f172a',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}>{user.first_name} {user.last_name}</span>
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                color: '#64748b',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}>{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={styles.td} style={{
                                                    fontSize: '0.875rem',
                                                    color: '#334155',
                                                    fontWeight: 500
                                                }}>{user.company_name || '—'}</td>
                                                <td className={styles.td}>
                                                    <span className={
                                                        roleName === 'Admin' ? styles.roleAdminBadge :
                                                            roleName === 'Moderator' ? styles.roleModeratorBadge : styles.roleClientBadge
                                                    }>
                                                        {roleName}
                                                    </span>
                                                </td>
                                                <td className={styles.td}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.375rem'
                                                    }}>
                                                        <div
                                                            className={!user.is_block ? styles.statusDotGreen : styles.statusDotRed}></div>
                                                        <span style={{
                                                            fontSize: '0.875rem',
                                                            fontWeight: 600,
                                                            color: '#334155'
                                                        }}>
                                                            {!user.is_block ? 'Активен' : 'Заблокирован'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className={styles.td} style={{textAlign: 'right'}}>
                                                    <div className={styles.actions}>
                                                        {userRole === 'Admin' && (
                                                            <button
                                                                onClick={() => setEditingUser(user)}
                                                                className={styles.actionBtn}
                                                            >
                                                                <span className="material-symbols-outlined"
                                                                      style={{fontSize: '20px'}}>edit</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleToggleUserBlock(user.id, user.is_block)}
                                                            className={user.is_block ? styles.actionBtnSuccess : styles.actionBtnDanger}
                                                            title={user.is_block ? 'Разблокировать' : 'Заблокировать'}
                                                        >
                                                            <span className="material-symbols-outlined"
                                                                  style={{fontSize: '20px'}}>
                                                                {user.is_block ? 'lock_open' : 'block'}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'invites' && userRole === 'Admin' && (
                <div className={styles.animateFadeIn}>
                    <section className={styles.inviteHeader}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                backgroundColor: 'rgba(30, 58, 138, 0.5)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#60a5fa',
                                border: '1px solid rgba(30, 64, 175, 0.5)',
                                flexShrink: 0
                            }}>
                                <span className="material-symbols-outlined">add_moderator</span>
                            </div>
                            <div>
                                <h2 style={{fontSize: '1.125rem', fontWeight: 700}}>Выпуск нового кода</h2>
                                <p style={{color: '#94a3b8', fontSize: '0.875rem'}}>Создайте ключ доступа для
                                    регистрации новых клиентов.</p>
                            </div>
                        </div>
                        <form onSubmit={handleCreateInvite} className={styles.inviteForm}>
                            <div className={styles.inviteInputWrapper} style={{flex: '0 0 auto'}}>
                                <label className={styles.formLabelDark}>Текст кода</label>
                                <input
                                    type="text"
                                    placeholder="ALFA-BANK-2026"
                                    value={newInvite.code}
                                    onChange={(e) => setNewInvite({...newInvite, code: e.target.value.toUpperCase()})}
                                    className={styles.inviteInput}
                                    required
                                />
                            </div>
                            <div className={styles.inviteInputWrapper}>
                                <label className={styles.formLabelDark}>Примечание / Организация</label>
                                <input
                                    type="text"
                                    placeholder="Для сотрудников ООО 'Альфа'..."
                                    value={newInvite.description}
                                    onChange={(e) => setNewInvite({...newInvite, description: e.target.value})}
                                    className={styles.inviteInputDesc}
                                />
                            </div>
                            <div style={{marginTop: '0.5rem'}}>
                                <button
                                    disabled={isSavingInvite}
                                    className={styles.inviteSubmit}
                                >
                                    {isSavingInvite ? 'Сохранение...' : 'Активировать'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <div className={styles.card}>
                        {isLoadingInvites ? (
                            <div className={styles.emptyState}>
                                <span className="material-symbols-outlined animate-spin text-3xl">autorenew</span>
                            </div>
                        ) : invites.length > 0 ? (
                            <div className={styles.tableWrapper}>
                                <table className={styles.tableInvites}>
                                    <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}>Код доступа</th>
                                        <th className={styles.th}>Описание</th>
                                        <th className={styles.th}>Статус</th>
                                        <th className={styles.th} style={{textAlign: 'right'}}>Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody className={styles.tbody}>
                                    {invites.map(invite => (
                                        <tr key={invite.id} className={styles.tr}>
                                            <td className={styles.td}>
                                                <code className={styles.codeBox}>
                                                    {invite.code}
                                                </code>
                                            </td>
                                            <td className={styles.td} style={{fontSize: '0.875rem', color: '#475569'}}>
                                                {invite.description || '—'}
                                            </td>
                                            <td className={styles.td}>
                                                <div className={invite.isActive ? styles.badgeGreen : styles.badgeRed}>
                                                    <div
                                                        className={invite.isActive ? styles.statusDotGreen : styles.statusDotRed}></div>
                                                    {invite.isActive ? 'Активен' : 'Отключен'}
                                                </div>
                                            </td>
                                            <td className={styles.td} style={{textAlign: 'right'}}>
                                                <div className={styles.actions}>
                                                    <button
                                                        onClick={() => handleToggleStatus(invite.id, invite.isActive)}
                                                        className={styles.actionBtn}>
                                                        <span className="material-symbols-outlined"
                                                              style={{fontSize: '20px'}}>{invite.isActive ? 'visibility_off' : 'visibility'}</span>
                                                    </button>
                                                    <button onClick={() => confirmDeleteInvite(invite.id)}
                                                            className={styles.actionBtnDanger}>
                                                        <span className="material-symbols-outlined"
                                                              style={{fontSize: '20px'}}>delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <span className="material-symbols-outlined" style={{
                                    fontSize: '2.25rem',
                                    marginBottom: '0.5rem',
                                    color: '#cbd5e1'
                                }}>key_off</span>
                                <p style={{fontSize: '0.875rem', fontWeight: 600}}>Активных кодов пока нет</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isUserModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button
                            onClick={() => setIsUserModalOpen(false)}
                            className={styles.modalClose}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            marginBottom: '1.5rem',
                            paddingRight: '2rem'
                        }}>Добавить пользователя</h2>

                        <form onSubmit={handleCreateUser}
                              style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div className={styles.modalGrid}>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                                    <label className={styles.formLabelLight}>Имя</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.first_name}
                                        onChange={e => setNewUser({...newUser, first_name: e.target.value})}
                                        className={styles.modalInput}
                                    />
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                                    <label className={styles.formLabelLight}>Фамилия</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.last_name}
                                        onChange={e => setNewUser({...newUser, last_name: e.target.value})}
                                        className={styles.modalInput}
                                    />
                                </div>
                            </div>

                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                                <label className={styles.formLabelLight}>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newUser.email}
                                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                                    className={styles.modalInput}
                                />
                            </div>

                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                                <label className={styles.formLabelLight}>Пароль</label>
                                <input
                                    type="password"
                                    required
                                    value={newUser.password}
                                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                                    className={styles.modalInput}
                                />
                            </div>

                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                                <label className={styles.formLabelLight}>Компания (опционально)</label>
                                <input
                                    type="text"
                                    value={newUser.company_name || ''}
                                    onChange={e => setNewUser({...newUser, company_name: e.target.value})}
                                    className={styles.modalInput}
                                />
                            </div>

                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                                <label className={styles.formLabelLight}>Роль</label>
                                <select
                                    value={newUser.role_id}
                                    onChange={e => setNewUser({...newUser, role_id: Number(e.target.value)})}
                                    className={styles.modalSelect}
                                >
                                    <option value={2}>Клиент</option>
                                    <option value={3}>Модератор</option>
                                    <option value={1}>Администратор</option>
                                </select>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setIsUserModalOpen(false)}
                                    className={styles.modalCancel}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingUser}
                                    className={styles.modalSubmit}
                                >
                                    {isSavingUser ? 'Сохранение...' : 'Создать'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingUser && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button
                            onClick={() => setEditingUser(null)}
                            className={styles.modalClose}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            marginBottom: '1.5rem',
                            paddingRight: '2rem'
                        }}>Редактировать пользователя</h2>

                        <form onSubmit={handleUpdateUser}
                              style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div className={styles.modalGrid}>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                                    <label className={styles.formLabelLight}>Имя</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingUser.first_name}
                                        onChange={e => setEditingUser({...editingUser, first_name: e.target.value})}
                                        className={styles.modalInput}
                                    />
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                                    <label className={styles.formLabelLight}>Фамилия</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingUser.last_name}
                                        onChange={e => setEditingUser({...editingUser, last_name: e.target.value})}
                                        className={styles.modalInput}
                                    />
                                </div>
                            </div>

                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                                <label className={styles.formLabelLight}>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={editingUser.email}
                                    onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                                    className={styles.modalInput}
                                />
                            </div>

                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                                <label className={styles.formLabelLight}>Компания (опционально)</label>
                                <input
                                    type="text"
                                    value={editingUser.company_name || ''}
                                    onChange={e => setEditingUser({...editingUser, company_name: e.target.value})}
                                    className={styles.modalInput}
                                />
                            </div>

                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                                <label className={styles.formLabelLight}>Роль</label>
                                <select
                                    value={editingUser.role_id}
                                    onChange={e => setEditingUser({...editingUser, role_id: Number(e.target.value)})}
                                    className={styles.modalSelect}
                                >
                                    <option value={2}>Клиент</option>
                                    <option value={3}>Модератор</option>
                                    <option value={1}>Администратор</option>
                                </select>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className={styles.modalCancel}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingUser}
                                    className={styles.modalSubmit}
                                >
                                    {isSavingUser ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8"><span className="material-symbols-outlined animate-spin text-3xl text-blue-600">autorenew</span></div>}>
            <UsersPageContent />
        </Suspense>
    );
}