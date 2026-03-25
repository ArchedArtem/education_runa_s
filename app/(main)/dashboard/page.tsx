"use client";

import styles from './page.module.scss';
import {useEffect, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";

export default function Dashboard(){
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                setIsAuth(true);
            } else {
                router.push('/login');
            }
        };
        checkAuth();
    }, []);

    return(
        <div>
        </div>
    );
}