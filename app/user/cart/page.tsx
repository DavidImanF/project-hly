"use client";

import UserSidebar from "@/app/components/UserSidebar";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";

interface ProductData {
    name?: string;
    price?: number;
    imageUrl?: string;
}

interface CartItem {
    id: string;
    qty: number;
    product: ProductData | null;
}

export default function CartPage() {
    const { user } = useUser();
    const [items, setItems] = useState<CartItem[]>([]);
    const [openSidebar, setOpenSidebar] = useState(false);

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            const q = query(collection(db, "cart"), where("uid", "==", user.uid));
            const snap = await getDocs(q);

            const result: CartItem[] = [];

            for (const cartDoc of snap.docs) {
                const data = cartDoc.data();
                if (!data.product_id) continue;

                const prodRef = doc(db, "products", data.product_id);
                const prodSnap = await getDoc(prodRef);

                result.push({
                    id: cartDoc.id,
                    qty: data.qty ?? 1,
                    product: prodSnap.exists()
                        ? (prodSnap.data() as ProductData)
                        : null,
                });
            }

            setItems(result);
        };

        load();
    }, [user]);

    const deleteItem = async (cartId: string) => {
        await deleteDoc(doc(db, "cart", cartId));
        setItems(prev => prev.filter(i => i.id !== cartId));
    };

    return (
        <>
            {/* Sidebar */}
            <UserSidebar open={openSidebar} setOpen={setOpenSidebar} />

            {/* WRAPPER KONTEN */}
            <div
                className={`
                    min-h-screen bg-gray-100 p-6 transition-all duration-300
                    ${openSidebar ? "ml-64" : "ml-0"}
                `}
            >
                <h1 className="text-2xl font-bold mb-6 text-black">Keranjang Saya</h1>

                {items.length === 0 ? (
                    <p className="text-gray-600">Keranjang kosong.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="border rounded-lg p-4 flex gap-4 items-center bg-white shadow"
                            >
                                <img
                                    src={item.product?.imageUrl || "/no-image.png"}
                                    className="w-24 h-24 object-cover rounded"
                                />

                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800">
                                        {item.product?.name}
                                    </h3>
                                    <p className="text-gray-700">
                                        Rp {item.product?.price?.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Qty: {item.qty}
                                    </p>
                                </div>

                                <button
                                    onClick={() => deleteItem(item.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Hapus
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
