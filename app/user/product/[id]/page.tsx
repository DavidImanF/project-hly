"use client";

import { JSX, useEffect, useState, MouseEvent } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/firebaseConfig";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import UserSidebar from "@/app/components/UserSidebar";

interface ProductData {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    description?: string;
}

export default function ProductUser(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<ProductData | null>(null);
    const [user, setUser] = useState<null | import("firebase/auth").User>(null);
    const [adding, setAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    const [openSidebar, setOpenSidebar] = useState(false);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const snap = await getDoc(doc(db, "products", id));
                if (snap.exists()) {
                    setProduct(snap.data() as ProductData);
                }
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
        const unsub = auth.onAuthStateChanged((u) => setUser(u));
        return () => unsub();
    }, [id]);

    const addToCart = async () => {
        if (!user) return alert("Kamu harus login!");

        try {
            setAdding(true);
            await addDoc(collection(db, "cart"), {
                uid: user.uid,
                product_id: id,
                qty: 1,
                createdAt: Date.now(),
            });
            alert("Berhasil ditambahkan ke keranjang!");
        } catch {
            alert("Gagal menambahkan!");
        } finally {
            setAdding(false);
        }
    };

    const closeModal = () => history.back();

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) closeModal();
    };

    return (
        <>
            <UserSidebar open={openSidebar} setOpen={setOpenSidebar} showToggle={false} />

            <div
                onClick={handleOverlayClick}
                className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 animate-fadeIn"
            >
                <div className="max-w-4xl w-full bg-white rounded-xl shadow-xl relative text-black animate-popupScale">

                    {/* CLOSE */}
                    {!loading && (
                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-lg"
                        >
                            ✕
                        </button>
                    )}

                    {/* 🔥 LOADING SKELETON */}
                    {loading && (
                        <div className="p-6 animate-pulse">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="md:w-1/2 h-96 bg-gray-200 rounded-lg" />
                                <div className="md:w-1/2 space-y-4">
                                    <div className="h-8 bg-gray-200 rounded w-3/4" />
                                    <div className="h-8 bg-gray-200 rounded w-1/2" />
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                                    <div className="h-12 bg-gray-300 rounded mt-6" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🔥 CONTENT */}
                    {!loading && product && (
                        <div className="flex flex-col md:flex-row gap-6 p-6">
                            <div className="md:w-1/2">
                                <img
                                    src={product.imageUrl || "/no-image.png"}
                                    alt={product.name}
                                    className="w-full h-96 object-cover rounded-lg"
                                />
                            </div>

                            <div className="md:w-1/2 flex flex-col justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold">{product.name}</h1>
                                    <p className="text-3xl font-semibold text-purple-700 my-4">
                                        Rp {product.price.toLocaleString()}
                                    </p>
                                    <p className="text-gray-600">
                                        {product.description ?? "Tidak ada deskripsi."}
                                    </p>
                                </div>

                                <button
                                    disabled={adding}
                                    onClick={addToCart}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg mt-4 disabled:opacity-50"
                                >
                                    {adding ? "Menambahkan..." : "Add to Cart"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .animate-fadeIn { animation: fadeIn .25s ease-out; }
                .animate-popupScale { animation: popupScale .25s ease-out; }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @keyframes popupScale { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
            `}</style>
        </>
    );
}
