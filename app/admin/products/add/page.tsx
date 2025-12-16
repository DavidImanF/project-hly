"use client";

import { JSX, useState, useEffect, ChangeEvent, FormEvent } from "react";
import { db, auth } from "@/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AddProduct(): JSX.Element {
    const router = useRouter();

    const [name, setName] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [img, setImg] = useState<File | null>(null);
    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    // Preview image
    useEffect(() => {
        if (!img) {
            setImgPreview(null);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImgPreview(reader.result as string);
        };
        reader.readAsDataURL(img);
    }, [img]);

    // Upload ke Cloudinary via API Route
    const uploadCloudinary = async (file: File | null): Promise<string | null> => {
        if (!file) return null;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            console.log("📌 HASIL API UPLOAD:", data);

            return (data.url as string) || null;
        } catch (err) {
            console.error("🔥 Upload error:", err);
            return null;
        }
    };

    const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!name.trim() || !price || !img) {
            alert("Semua field wajib diisi!");
            return;
        }

        if (!auth.currentUser) {
            alert("Login dulu sebagai admin!");
            return;
        }

        setUploading(true);

        try {
            // 🔹 Cek admin
            const tokenResult = await auth.currentUser.getIdTokenResult(true);
            if (!tokenResult.claims.admin) {
                setUploading(false);
                alert("Hanya admin yang bisa menambahkan produk!");
                return;
            }

            // 🔹 Upload gambar
            const imageUrl = await uploadCloudinary(img);
            if (!imageUrl) {
                setUploading(false);
                alert("Upload gambar gagal!");
                return;
            }

            // 🔹 Simpan data ke Firestore
            await addDoc(collection(db, "products"), {
                name: name.trim(),
                price: price.trim(),
                imageUrl,
                createdAt: serverTimestamp(),
            });

            alert("Produk berhasil ditambahkan!");
            router.push("/admin/products");
        } catch (err: any) {
            console.error("🔥 Firestore Error:", err);
            alert("Gagal menambahkan produk: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-10 max-w-lg mx-auto text-black">
            <h1 className="text-2xl font-bold mb-6">Tambah Produk</h1>

            <form onSubmit={submit} className="flex flex-col gap-4 text-black">
                <input
                    type="text"
                    placeholder="Nama produk"
                    className="border p-2"
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Harga produk"
                    className="border p-2"
                    value={price}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setImg(e.target.files?.[0] ?? null)
                    }
                />

                {imgPreview && (
                    <img
                        src={imgPreview}
                        alt="Preview"
                        className="mt-2 max-h-60 object-contain border p-1"
                    />
                )}

                <button
                    type="submit"
                    className={`bg-blue-600 text-white p-2 rounded ${uploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={uploading}
                >
                    {uploading ? "Menyimpan..." : "Simpan"}
                </button>
            </form>
        </div>
    );
}
