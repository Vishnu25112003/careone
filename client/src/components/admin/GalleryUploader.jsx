import { useEffect, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import Button from "../ui/Button";
import { api } from "../../lib/api";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

export default function GalleryUploader({ onUploaded }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function reset() {
    setFile(null);
    setTitle("");
    setCategory("");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleUpload() {
    if (!file) {
      setError("Please choose an image first.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (title.trim()) formData.append("title", title.trim());
      if (category.trim()) formData.append("category", category.trim());
      const image = await api.postForm("/admin/gallery", formData, { auth: true });
      onUploaded(image);
      reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="font-display text-lg font-bold text-navy">Upload Image</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="aspect-[4/3] w-full rounded-xl object-cover" />
            <button
              onClick={() => setFile(null)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-navy/70 text-white hover:bg-navy"
              aria-label="Remove selected image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-teal hover:text-teal"
          >
            <UploadCloud className="h-8 w-8" />
            <span className="text-xs font-semibold">Choose image</span>
          </button>
        )}
        <div className="flex flex-col gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
          />
          <input
            type="text"
            placeholder="Category (optional)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          />
          {error && <p className="text-sm font-medium text-maroon">{error}</p>}
          <Button onClick={handleUpload} disabled={uploading} className="self-start">
            <UploadCloud className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
