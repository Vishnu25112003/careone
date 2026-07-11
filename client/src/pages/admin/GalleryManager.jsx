import { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import GalleryUploader from "../../components/admin/GalleryUploader";
import { api } from "../../lib/api";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

function GalleryItem({ image, onSaved, onDeleted, onError }) {
  const [values, setValues] = useState({
    title: image.title || "",
    category: image.category || "",
    sortOrder: image.sortOrder,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.patch(
        `/admin/gallery/${image.id}`,
        {
          title: values.title,
          category: values.category,
          sortOrder: Number(values.sortOrder) || 0,
        },
        { auth: true }
      );
      onSaved(updated);
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${image.title || "this image"}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/gallery/${image.id}`, { auth: true });
      onDeleted(image.id);
    } catch (err) {
      onError(err.message);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <img src={image.imageUrl} alt={image.title || "Gallery image"} className="aspect-[4/3] w-full object-cover" />
      <div className="flex flex-col gap-2.5 p-4">
        <input
          type="text"
          placeholder="Title"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          className={inputCls}
        />
        <div className="flex gap-2.5">
          <input
            type="text"
            placeholder="Category"
            value={values.category}
            onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Order"
            value={values.sortOrder}
            onChange={(e) => setValues((v) => ({ ...v, sortOrder: e.target.value }))}
            className={`${inputCls} w-20 shrink-0`}
            aria-label="Sort order"
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-dark disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-full bg-maroon/10 px-4 py-1.5 text-xs font-semibold text-maroon transition hover:bg-maroon hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GalleryManager() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/gallery")
      .then((data) => setImages(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Gallery Manager</h1>
      <p className="mt-1 text-sm text-slate-500">Upload, edit and remove public gallery images.</p>

      <div className="mt-6">
        <GalleryUploader onUploaded={(image) => setImages((imgs) => [image, ...imgs])} />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-maroon/10 px-4 py-3 text-sm font-medium text-maroon">{error}</p>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-slate-500">Loading gallery...</p>
        ) : images.length === 0 ? (
          <p className="rounded-2xl bg-white px-6 py-10 text-center text-sm text-slate-500 ring-1 ring-slate-100">
            No images yet. Upload your first image above.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <GalleryItem
                key={image.id}
                image={image}
                onSaved={(updated) => setImages((imgs) => imgs.map((i) => (i.id === updated.id ? updated : i)))}
                onDeleted={(id) => setImages((imgs) => imgs.filter((i) => i.id !== id))}
                onError={setError}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
