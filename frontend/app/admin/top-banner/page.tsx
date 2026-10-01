"use client";

import { useEffect, useState } from "react";
import {
  PanelTop,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ExternalLink,
  ArrowRight,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface TopBannerItem {
  id: string;
  title: string;
  link_url: string | null;
  link_text: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  created_by_name?: string;
}

export default function AdminTopBannerPage() {
  const [banners, setBanners] = useState<TopBannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<TopBannerItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    linkUrl: "",
    linkText: "Selengkapnya",
    isActive: true,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/top-banners/admin");
      setBanners(response.data?.data?.banners || []);
    } catch (error) {
      console.error("Error fetching top banners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      linkUrl: "",
      linkText: "Selengkapnya",
      isActive: true,
      startDate: "",
      endDate: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (banner: TopBannerItem) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      linkUrl: banner.link_url || "",
      linkText: banner.link_text || "Selengkapnya",
      isActive: banner.is_active,
      startDate: banner.start_date ? banner.start_date.slice(0, 16) : "",
      endDate: banner.end_date ? banner.end_date.slice(0, 16) : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: formData.title.trim(),
        linkUrl: formData.linkUrl.trim() || null,
        linkText: formData.linkText.trim() || "Selengkapnya",
        isActive: formData.isActive,
      };

      if (formData.startDate) {
        payload.startDate = new Date(formData.startDate).toISOString();
      }
      if (formData.endDate) {
        payload.endDate = new Date(formData.endDate).toISOString();
      }

      if (editingBanner) {
        await api.put(`/top-banners/admin/${editingBanner.id}`, payload);
      } else {
        await api.post("/top-banners/admin", payload);
      }

      setShowModal(false);
      fetchBanners();
    } catch (error: any) {
      console.error("Error saving top banner:", error);
      alert(error.response?.data?.message || "Gagal menyimpan top banner");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.post(`/top-banners/admin/${id}/toggle`);
      fetchBanners();
    } catch (error) {
      console.error("Error toggling top banner:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Top Banner ini?")) return;
    try {
      await api.delete(`/top-banners/admin/${id}`);
      fetchBanners();
    } catch (error) {
      console.error("Error deleting top banner:", error);
    }
  };

  const activeBanner = banners.find((b) => b.is_active);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <PanelTop className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Top Banner Website
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kelola banner pita di paling atas header navigasi website (terpisah mandiri dari Popup Promo).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Top Banner</span>
        </button>
      </div>

      {/* Live Preview of Active Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Pratinjau Langsung di Website
          </span>
          <span className="text-xs font-medium text-slate-400">
            {activeBanner ? "Sedang Aktif" : "Tidak ada banner aktif saat ini"}
          </span>
        </div>

        {activeBanner ? (
          <div className="rounded-xl overflow-hidden shadow-sm border border-blue-400/30">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-2.5 flex items-center justify-center relative">
              <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-medium z-10 w-full max-w-4xl mx-auto pr-8">
                <span>✨ {activeBanner.title}</span>
                {activeBanner.link_url && (
                  <span className="flex items-center gap-1 bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full">
                    {activeBanner.link_text || "Selengkapnya"}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/70">
                <X className="w-4 h-4" />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
            Top Banner saat ini dinonaktifkan. Pengunjung tidak akan melihat pita banner di atas header.
          </div>
        )}
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Daftar Top Banner ({banners.length})
        </h2>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-sm">Belum ada data Top Banner</p>
            <p className="text-xs mt-1">Klik tombol &ldquo;Buat Top Banner&rdquo; untuk menambahkan pesan pertama.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        banner.is_active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {banner.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {banner.title}
                    </h3>
                  </div>

                  {banner.link_url && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Label: {banner.link_text || "Selengkapnya"}
                      </span>
                      <span>·</span>
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate max-w-xs"
                      >
                        {banner.link_url}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Dibuat: {new Date(banner.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleToggle(banner.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      banner.is_active
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                    }`}
                    title={banner.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {banner.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{banner.is_active ? "Nonaktifkan" : "Aktifkan"}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(banner)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingBanner ? "Edit Top Banner" : "Buat Top Banner Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Banner / Pesan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Promo Buat Website Hanya 100k!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teks Tombol Aksi
                  </label>
                  <input
                    type="text"
                    placeholder="Selengkapnya"
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Link Tujuan (URL)
                  </label>
                  <input
                    type="text"
                    placeholder="https://... atau /communities"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center pt-1">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500/20 border-slate-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Aktifkan banner ini sekarang (langsung tampil di website)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm transition-all"
                >
                  {editingBanner ? "Simpan Perubahan" : "Buat Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
