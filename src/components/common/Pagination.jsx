// src/components/common/Pagination.jsx
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

function buildPages(page, totalPages) {
  // total halaman 3 atau kurang: tampilkan semua
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // tentukan jendela 3 angka yang mengikuti halaman aktif
  let start = page - 1;
  if (start < 1) start = 1;
  if (start > totalPages - 2) start = totalPages - 2;

  const pages = [start, start + 1, start + 2];
  const result = [];

  // elipsis di depan jika ada halaman yang tersembunyi
  if (start > 1) result.push("gap");
  result.push(...pages);
  // elipsis di belakang jika ada halaman yang tersembunyi
  if (start + 2 < totalPages) result.push("gap");

  return result;
}

export default function Pagination({ page, totalPages, onPage }) {
  const [jumpTo, setJumpTo] = useState(page);

  // sinkronkan dropdown saat halaman berubah dari tombol lain
  useEffect(() => {
    setJumpTo(page);
  }, [page]);

  if (totalPages <= 1) return null;

  return (
    <nav className="pg-wrap" aria-label="Pagination">
      <button
        type="button"
        className="pg-circle"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="pg-pill">
        {buildPages(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="pg-gap">…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pg-num${p === page ? " active" : ""}`}
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="pg-circle"
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight size={18} />
      </button>

      <div className="pg-jump">
        <span className="pg-jump-label">Go to page:</span>
        <div className="pg-select-wrap">
          <select
            className="pg-select"
            value={jumpTo}
            onChange={(e) => setJumpTo(Number(e.target.value))}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pg-select-icon" />
        </div>
        <button
          type="button"
          className="pg-circle pg-go"
          onClick={() => onPage(jumpTo)}
        >
          GO
        </button>
      </div>
    </nav>
  );
}