"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminMaintenancePage() {
    const router = useRouter();

    const [maintenance, setMaintenance] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [processing, setProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const configRef = doc(db, "config", "site");

    // =========================
    // AUTH + ROLE GUARD
    // =========================
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.replace("/auth/login");
                return;
            }

            // cek role admin
            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (!userSnap.exists() || userSnap.data().role !== "admin") {
                router.replace("/");
                return;
            }

            // load maintenance status
            await loadStatus();
        });

        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =========================
    // LOAD STATUS
    // =========================
    const loadStatus = async () => {
        try {
            const snap = await getDoc(configRef);

            if (snap.exists()) {
                setMaintenance(snap.data().maintenance === true);
            } else {
                // 🔥 BUAT DEFAULT DOCUMENT JIKA BELUM ADA
                await setDoc(configRef, { maintenance: false });
                setMaintenance(false);
            }
        } catch (err: any) {
            console.error(err);
            setError("Gagal memuat status maintenance");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // TOGGLE MAINTENANCE
    // =========================
    const toggleMaintenance = async () => {
        if (processing) return;

        setProcessing(true);
        setError(null);

        try {
            await setDoc(
                configRef,
                { maintenance: !maintenance },
                { merge: true } // 🔑 PALING PENTING
            );

            setMaintenance(!maintenance);
        } catch (err: any) {
            console.error(err);
            setError("Gagal mengubah status maintenance");
        } finally {
            setProcessing(false);
        }
    };

    // =========================
    // UI STATES
    // =========================
    if (loading) {
        return (
            <div className="p-10 ml-64 text-gray-600">
                Memuat status maintenance...
            </div>
        );
    }

    return (
        <div className="p-10 ml-64">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">
                Maintenance Mode
            </h1>

            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md border">
                <p className="mb-4 text-gray-700">
                    Status website saat ini:
                    <span
                        className={`ml-2 font-bold ${maintenance ? "text-red-600" : "text-green-600"
                            }`}
                    >
                        {maintenance ? "MAINTENANCE" : "AKTIF"}
                    </span>
                </p>

                {error && (
                    <p className="mb-4 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <button
                    onClick={toggleMaintenance}
                    disabled={processing}
                    className={`w-full py-3 rounded-xl text-white font-semibold transition
                        ${maintenance
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }
                        ${processing ? "opacity-60 cursor-not-allowed" : ""}
                    `}
                >
                    {processing
                        ? "Memproses..."
                        : maintenance
                            ? "Nonaktifkan Maintenance"
                            : "Aktifkan Maintenance"}
                </button>

                <p className="mt-4 text-sm text-gray-500">
                    Saat maintenance aktif, user tidak dapat login atau mengakses produk.
                    Admin tetap bisa masuk.
                </p>
            </div>
        </div>
    );
}
