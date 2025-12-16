"use client";

import { JSX, useEffect, useState } from "react";
import CardStat from "@/app/components/CardStat";
import { collection, getDocs, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

export default function AdminDashboard(): JSX.Element {
    const [productCount, setProductCount] = useState<number>(0);

    const loadStats = async (): Promise<void> => {
        try {
            const snap: QuerySnapshot<DocumentData> = await getDocs(collection(db, "products"));
            setProductCount(snap.size);
        } catch (error) {
            console.error("Error memuat data:", error);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-black">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-black">
                <CardStat title="Total Produk" value={productCount} />
                <CardStat title="Kategori" value="—" />
                <CardStat title="Pesanan" value="—" />
            </div>

            <div className="mt-10 p-6 bg-white shadow rounded">
                <h2 className="text-xl font-semibold mb-4 text-black">
                    Selamat datang di halaman Admin 👋
                </h2>
                <p className="text-gray-600">Gunakan menu di kiri untuk mengelola produk.</p>
            </div>
        </div>
    );
}
