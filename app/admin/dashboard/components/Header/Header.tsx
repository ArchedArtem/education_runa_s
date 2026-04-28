"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './header.module.scss';

interface AdminHeaderProps {
    setIsOpen: (isOpen: boolean) => void;
}

type AdminProfile = {
    firstName: string;
    lastName: string;
    roleName: string;
};

const ADMIN_PAGES = [
    { title: "Дашборд (Обзор)", path: "/admin/dashboard", icon: "dashboard", type: "Раздел" },
    { title: "Пользователи и клиенты", path: "/admin/dashboard/users", icon: "group", type: "Раздел" },
    { title: "Каталог курсов и уроков", path: "/admin/dashboard/courses", icon: "menu_book", type: "Раздел" },
    { title: "Создать новый курс", path: "/admin/dashboard/courses/new", icon: "add_circle", type: "Действие", requiresAdmin: true },
    { title: "База тестов", path: "/admin/dashboard/tests", icon: "quiz", type: "Раздел" },
    { title: "Статистика", path: "/admin/dashboard/statistic", icon: "bar_chart", type: "Раздел" },
    { title: "Настройки (Клиентские)", path: "/dashboard/settings", icon: "settings", type: "Раздел" }
];

export default function AdminHeader({ setIsOpen }: AdminHeaderProps) {
    const [admin, setAdmin] = useState<AdminProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await fetch('/api/admin/auth/me', { headers });
                if (res.ok) {
                    const data = await res.json();
                    const userData = data.user || data;
                    const roleName = userData?.role?.name || userData?.roleName || 'Client';

                    setAdmin({
                        firstName: userData.first_name || userData.firstName || '',
                        lastName: userData.last_name || userData.lastName || '',
                        roleName: roleName
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminProfile();
    }, []);

    const filteredPages = ADMIN_PAGES.filter(page => {
        const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (page.requiresAdmin && admin?.roleName?.toLowerCase() !== 'admin') {
            return false;
        }
        return matchesSearch;
    });

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setIsDropdownOpen(false);
            router.push(`/admin/dashboard/users?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const getRoleDisplay = (role?: string) => {
        if (!role) return 'Загрузка...';
        const r = role.toLowerCase();
        if (r === 'admin' || r === 'администратор') return 'Главный администратор';
        if (r === 'moderator' || r === 'модератор') return 'Модератор';
        return 'Сотрудник платформы';
    };

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <button onClick={() => setIsOpen(true)} className={styles.menuBtn}>
                    <span className="material-symbols-outlined">menu</span>
                </button>

                <div className={styles.searchWrapper} ref={searchRef}>
                    <div className={styles.searchInputContainer}>
                        <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            onKeyDown={handleSearch}
                            className={styles.searchInput}
                            placeholder="Поиск по разделам, курсам и пользователям..."
                        />
                    </div>

                    {isDropdownOpen && searchQuery.trim().length > 0 && (
                        <div className={styles.dropdown}>
                            {filteredPages.length > 0 && (
                                <div className={styles.dropdownSection}>
                                    <p className={styles.dropdownLabel}>Разделы и действия</p>
                                    {filteredPages.map((page, idx) => (
                                        <Link
                                            key={idx}
                                            href={page.path}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className={styles.dropdownItem}
                                        >
                                            <div className={`${styles.itemIconBox} ${styles.gray}`}>
                                                <span className="material-symbols-outlined">{page.icon}</span>
                                            </div>
                                            <div className={styles.itemContent}>
                                                <p className={styles.itemTitle}>{page.title}</p>
                                                <p className={styles.itemSub}>{page.type}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className={styles.dropdownSection}>
                                <p className={styles.dropdownLabel}>Глобальный поиск в базе</p>
                                <Link
                                    href={`/admin/dashboard/users?search=${encodeURIComponent(searchQuery)}`}
                                    onClick={() => setIsDropdownOpen(false)}
                                    className={`${styles.dropdownItem} ${styles.globalSearch}`}
                                >
                                    <div className={`${styles.itemIconBox} ${styles.indigo}`}>
                                        <span className="material-symbols-outlined">person_search</span>
                                    </div>
                                    <div className={styles.itemContent}>
                                        <p className={styles.itemTitle}>Пользователи: <strong>"{searchQuery}"</strong></p>
                                    </div>
                                    <span className={`material-symbols-outlined ${styles.chevron}`}>chevron_right</span>
                                </Link>

                                <Link
                                    href={`/admin/dashboard/courses?search=${encodeURIComponent(searchQuery)}`}
                                    onClick={() => setIsDropdownOpen(false)}
                                    className={`${styles.dropdownItem} ${styles.globalSearch}`}
                                >
                                    <div className={`${styles.itemIconBox} ${styles.emerald}`}>
                                        <span className="material-symbols-outlined">library_books</span>
                                    </div>
                                    <div className={styles.itemContent}>
                                        <p className={styles.itemTitle}>В курсах: <strong>"{searchQuery}"</strong></p>
                                    </div>
                                    <span className={`material-symbols-outlined ${styles.chevron}`}>chevron_right</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.rightSection}>
                <div className={styles.adminInfo}>
                    {isLoading ? (
                        <>
                            <div className={`${styles.skeletonLine} ${styles.w24}`}></div>
                            <div className={`${styles.skeletonLine} ${styles.w32}`}></div>
                        </>
                    ) : (
                        <>
                            <span className={styles.adminName}>
                                {admin ? `${admin.lastName} ${admin.firstName?.charAt(0) || ''}.` : 'Неизвестный'}
                            </span>
                            <span className={styles.adminRole}>
                                {getRoleDisplay(admin?.roleName)}
                            </span>
                        </>
                    )}
                </div>
                <div className={styles.avatar}>
                    {isLoading ? (
                        <span className={`material-symbols-outlined ${styles.spinner}`}>sync</span>
                    ) : (
                        <span>
                            {admin ? `${admin.lastName?.charAt(0) || ''}${admin.firstName?.charAt(0) || ''}` : 'A'}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}