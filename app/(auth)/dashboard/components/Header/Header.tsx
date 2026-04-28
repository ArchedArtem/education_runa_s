"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import styles from './header.module.scss';

interface HeaderProps {
    setIsOpen: (isOpen: boolean) => void;
}

type AuthResponse = {
    user: {
        first_name: string;
        last_name: string;
        role_id?: number;
    }
};

const USER_PAGES = [
    { title: "Мое обучение (Дашборд)", path: "/dashboard", icon: "school", type: "Раздел" },
    { title: "Каталог курсов", path: "/dashboard/courses", icon: "menu_book", type: "Раздел" },
    { title: "Мои тесты", path: "/dashboard/tests", icon: "quiz", type: "Раздел" },
    { title: "Настройки профиля", path: "/dashboard/settings", icon: "settings", type: "Настройки" }
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Header({ setIsOpen }: HeaderProps) {
    const { data: authData, isLoading } = useSWR<AuthResponse>('/api/auth/me', fetcher);

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

    const filteredPages = USER_PAGES.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setIsDropdownOpen(false);
            router.push(`/dashboard/courses?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const user = authData?.user;

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
                            placeholder="Поиск курсов и материалов..."
                        />
                    </div>

                    {isDropdownOpen && searchQuery.trim().length > 0 && (
                        <div className={styles.dropdown}>
                            {filteredPages.length > 0 && (
                                <div className={styles.dropdownSection}>
                                    <p className={styles.dropdownLabel}>Разделы</p>
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
                                <p className={styles.dropdownLabel}>Поиск по контенту</p>
                                <Link
                                    href={`/dashboard/courses?search=${encodeURIComponent(searchQuery)}`}
                                    onClick={() => setIsDropdownOpen(false)}
                                    className={`${styles.dropdownItem} ${styles.globalSearch}`}
                                >
                                    <div className={`${styles.itemIconBox} ${styles.emerald}`}>
                                        <span className="material-symbols-outlined">library_books</span>
                                    </div>
                                    <div className={styles.itemContent}>
                                        <p className={styles.itemTitle}>Искать в курсах: <strong>"{searchQuery}"</strong></p>
                                    </div>
                                    <span className={`material-symbols-outlined ${styles.chevron}`}>chevron_right</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Link href="/dashboard/settings" className={styles.rightSection}>
                <div className={styles.userInfo}>
                    {isLoading ? (
                        <>
                            <div className={`${styles.skeletonLine} ${styles.w24}`}></div>
                            <div className={`${styles.skeletonLine} ${styles.w32}`}></div>
                        </>
                    ) : (
                        <>
                            <span className={styles.userName}>
                                {user ? `${user.last_name} ${user.first_name}` : 'Пользователь'}
                            </span>
                            <span className={styles.userRole}>
                                Клиент платформы
                            </span>
                        </>
                    )}
                </div>

                <div className={styles.avatarWrapper}>
                    <div className={styles.avatar}>
                        {isLoading ? (
                            <span className={`material-symbols-outlined ${styles.spinner}`}>sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-slate-500">person</span>
                        )}
                    </div>
                    {!isLoading && <div className={styles.statusDot}></div>}
                </div>
            </Link>
        </header>
    );
}