"use client";

import { JSX, useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { collection, getDocs, deleteDoc, doc, DocumentData } from "firebase/firestore";
import Link from "next/link";

// tipe data produk
interface Product {
    id: string;
    name?: string;
    price?: number;
    imageUrl?: string;
    [key: string]: any;
}

export default function ProductsPage(): JSX.Element {
    const [products, setProducts] = useState<Product[]>([]);

    const load = async (): Promise<void> => {
        const snap = await getDocs(collection(db, "products"));
        const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as DocumentData)
        }));
        setProducts(list);
    };

    const remove = async (id: string): Promise<void> => {
        if (!confirm("Yakin ingin menghapus?")) return;
        await deleteDoc(doc(db, "products", id));
        load();
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="p-10">
            <div className="flex justify-between mb-5">
                <h1 className="text-2xl font-bold text-black">Daftar Produk</h1>
                <Link
                    href="/admin/products/add"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Tambah Produk
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map((p) => (
                    <div key={p.id} className="bg-white shadow rounded p-4">
                        <img
                            src={p.imageUrl || "/no-image.png"}
                            className="w-full h-40 object-cover rounded"
                            alt={p.name ?? "Produk"}
                        />

                        <h2 className="text-lg font-bold mt-3 text-black">
                            {p.name ?? "Produk Tanpa Nama"}
                        </h2>

                        <p className="text-gray-700">
                            Rp {(p.price ?? 0).toLocaleString()}
                        </p>

                        <div className="flex gap-3 mt-4">
                            <Link
                                href={`/admin/products/edit/${p.id}`}
                                className="bg-yellow-500 text-white px-3 py-1 rounded"
                            >
                                Edit
                            </Link>

                            <button
                                onClick={() => remove(p.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
