"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { db, auth } from "@/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";

interface ProductData {
    name: string;
    price: number;
    imageUrl: string;
}

export default function EditProduct() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [product, setProduct] = useState<ProductData | null>(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [img, setImg] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Load data awal
    useEffect(() => {
        const load = async () => {
            const snap = await getDoc(doc(db, "products", id));
            const data = snap.data() as ProductData | undefined;

            if (data) {
                setProduct(data);
                setName(data.name);
                setPrice(String(data.price));
            }
        };
        load();
    }, [id]);

    // Preview gambar baru
    useEffect(() => {
        if (!img) return;
        setPreview(URL.createObjectURL(img));
    }, [img]);

    // Upload ke Cloudinary
    const uploadCloudinary = async (file: File | null): Promise<string | null> => {
        if (!file) return null;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            return data.url || null;
        } catch (err) {
            console.error("🔥 Upload error:", err);
            return null;
        }
    };

    const save = async (e: FormEvent) => {
        e.preventDefault();

        if (!auth.currentUser) return alert("Login dulu sebagai admin!");

        setSaving(true);

        try {
            const tokenResult = await auth.currentUser.getIdTokenResult(true);
            if (!tokenResult.claims.admin) {
                setSaving(false);
                return alert("Hanya admin yang bisa mengubah produk!");
            }

            let imageUrl = product?.imageUrl || "";

            // Upload gambar baru jika ada
            if (img) {
                const newUrl = await uploadCloudinary(img);
                if (!newUrl) {
                    setSaving(false);
                    return alert("Upload gambar gagal!");
                }
                imageUrl = newUrl;
            }

            // Update Firestore
            await updateDoc(doc(db, "products", id), {
                name: name.trim(),
                price: price.trim(),
                imageUrl,
            });

            alert("Produk berhasil diperbarui!");
            router.push("/admin/products");
        } catch (err: any) {
            console.error("🔥 Firestore Error:", err);
            alert("Update gagal: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!product) return <p>Loading...</p>;

    return (
        <div className="p-10 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-black">Edit Produk</h1>

            <form onSubmit={save} className="flex flex-col gap-4 text-black">
                <input
                    type="text"
                    className="border p-2"
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />

                <input
                    type="number"
                    className="border p-2"
                    value={price}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                />

                <p>Gambar saat ini:</p>
                <img src={product.imageUrl} className="w-40 rounded mb-4" alt="current" />

                <p>Upload gambar baru (opsional):</p>
                <input
                    type="file"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setImg(e.target.files?.[0] || null)
                    }
                />

                {preview && (
                    <img src={preview} className="w-40 mt-2 rounded border" alt="preview" />
                )}

                <button
                    type="submit"
                    className={`bg-green-600 text-white p-2 rounded ${saving ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={saving}
                >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </form>
        </div>
    );
}
