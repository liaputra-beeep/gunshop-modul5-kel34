// src/pages/GunDetailPage.jsx
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useGuns from "../hooks/useGuns"; // sesuaikan: default atau named export
import ShareButton from "../components/common/ShareButton";

export default function GunDetailPage() {
  const { id } = useParams();
  const { guns } = useGuns(); // sesuaikan dengan isi hook-mu

  const gun = guns?.find((g) => String(g.id) === id);

  if (!guns) return <p className="detail-msg">Memuat...</p>;
  if (!gun) {
    return (
      <div className="detail-msg">
        <p>Produk tidak ditemukan.</p>
        <Link to="/">Kembali ke katalog</Link>
      </div>
    );
  }

  return (
    <main className="detail">
      <Link to="/" className="detail-back"><ArrowLeft size={16} /> Kembali</Link>

      <div className="detail-card">
        <img src={gun.image} alt={gun.name} className="detail-img" />
        <div className="detail-info">
          <h1>{gun.name}</h1>
          <p className="detail-meta">{gun.type} · {gun.caliber}</p>
          <p className="detail-price">{gun.price}</p>
          <ShareButton gun={gun} />
        </div>
      </div>
    </main>
  );
}