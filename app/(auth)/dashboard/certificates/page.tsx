"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/app/components/Providers/ToastProvider";
import styles from "./certificates.module.scss";

interface Certificate {
    id: string;
    certificate_number: string;
    pdf_url: string | null;
    issued_at: string;
    course_id: number;
    course: { title: string };
}

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const res = await fetch('/api/user/certificates');
                if (!res.ok) throw new Error();
                const data = await res.json();
                setCertificates(data);
            } catch (error) {
                showToast("Ошибка при загрузке сертификатов", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCertificates();
    }, [showToast]);

    const handleDownload = async (cert: Certificate) => {
        if (cert.pdf_url) {
            window.open(cert.pdf_url, '_blank');
            return;
        }

        setDownloadingId(cert.id);
        showToast("Подготовка документа, подождите...", "info");

        try {
            const res = await fetch(`/api/courses/${cert.course_id}/certificate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ certificateId: cert.id })
            });

            if (res.ok) {
                const data = await res.json();
                window.open(data.url, '_blank');
                setCertificates(prev => prev.map(c => c.id === cert.id ? { ...c, pdf_url: data.url } : c));
            } else {
                throw new Error();
            }
        } catch (error) {
            showToast("Ошибка при открытии документа", "error");
        } finally {
            setDownloadingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
                <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1>Мои сертификаты</h1>
                <p>Документы, подтверждающие успешное завершение курсов</p>
            </div>

            {certificates.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={`material-symbols-outlined ${styles.emptyIcon}`}>workspace_premium</span>
                    <h3>У вас пока нет сертификатов</h3>
                    <p>Пройдите обучение и успешно сдайте финальное тестирование, чтобы получить свой первый сертификат.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {certificates.map((cert) => (
                        <div key={cert.id} className={styles.card}>
                            <div className={styles.cardGlow}></div>
                            <div className={styles.iconWrapper}>
                                <span className="material-symbols-outlined">workspace_premium</span>
                            </div>

                            <h3 className={styles.courseTitle}>{cert.course.title}</h3>

                            <div className={styles.metaInfo}>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaLabel}>Дата выдачи</span>
                                    <span className={styles.metaValue}>
                                        {new Date(cert.issued_at).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaLabel}>Номер</span>
                                    <span className={styles.metaValue}>{cert.certificate_number}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(cert)}
                                disabled={downloadingId === cert.id}
                                className={styles.btnDownload}
                            >
                                <span className="material-symbols-outlined">
                                    {downloadingId === cert.id ? 'hourglass_empty' : 'download'}
                                </span>
                                {downloadingId === cert.id ? 'Генерация...' : 'Скачать PDF'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}