"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { formatRupiah } from "@/lib/invoices";
import { RupiahInput } from "@/components/invoice/rupiah-input";

export type DraftItem = {
  key: number;
  description: string;
  quantity: string;
  unitPriceRupiah: number;
};

export function itemSubtotalSen(item: DraftItem): number {
  const qty = parseFloat(item.quantity);
  return Math.round((Number.isFinite(qty) && qty >= 0 ? qty : 0) * item.unitPriceRupiah * 100);
}

export function LineItemsEditor({
  items,
  setItems,
  taxRateBps,
  taxLabel,
}: {
  items: DraftItem[];
  setItems: Dispatch<SetStateAction<DraftItem[]>>;
  taxRateBps: number;
  taxLabel: string;
}) {
  const subtotalSen = items.reduce((acc, it) => acc + itemSubtotalSen(it), 0);
  const taxSen = Math.round((subtotalSen * taxRateBps) / 10000);
  const totalSen = subtotalSen + taxSen;

  function addRow() {
    setItems((prev) => [
      ...prev,
      { key: Date.now() + Math.random(), description: "", quantity: "1", unitPriceRupiah: 0 },
    ]);
  }

  function updateRow(key: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function removeRow(key: number) {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }

  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Item baris</legend>

      <div className="hidden gap-3 text-xs uppercase tracking-wide text-ink-faint sm:grid sm:grid-cols-[1fr_5rem_8rem_8rem_2rem]">
        <span>Deskripsi</span>
        <span className="text-right">Jumlah</span>
        <span className="text-right">Harga satuan (Rp)</span>
        <span className="text-right">Subtotal</span>
        <span />
      </div>

      {items.map((item) => {
        const subtotal = itemSubtotalSen(item);
        return (
          <div
            key={item.key}
            className="grid gap-2 sm:grid-cols-[1fr_5rem_8rem_8rem_2rem] sm:items-center"
          >
            <input
              name="item_description"
              value={item.description}
              onChange={(e) => updateRow(item.key, { description: e.target.value })}
              placeholder="Deskripsi item atau jasa"
              aria-label="Deskripsi"
              className="w-full min-h-[44px] rounded-xl border-0 bg-surface px-3 py-2 text-sm text-ink shadow-neu-in placeholder:text-ink-faint focus:outline-none"
            />
            <input
              name="item_quantity"
              value={item.quantity}
              onChange={(e) => updateRow(item.key, { quantity: e.target.value })}
              inputMode="decimal"
              placeholder="1"
              aria-label="Jumlah"
              className="w-full min-h-[44px] rounded-xl border-0 bg-surface px-3 py-2 text-right text-sm tabular-nums text-ink shadow-neu-in placeholder:text-ink-faint focus:outline-none"
            />
            <RupiahInput
              name="item_unit_price_rupiah"
              value={item.unitPriceRupiah}
              onValueChange={(unitPriceRupiah) =>
                updateRow(item.key, { unitPriceRupiah })
              }
              aria-label="Harga satuan dalam rupiah"
            />
            <p className="self-center text-right text-sm tabular-nums text-ink-muted">
              {subtotal === 0 ? "—" : formatRupiah(subtotal)}
            </p>
            <button
              type="button"
              onClick={() => removeRow(item.key)}
              aria-label="Hapus baris"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center self-center justify-self-end rounded p-2 text-ink-faint hover:bg-surface-2 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addRow}
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-surface px-3 py-1.5 text-sm text-ink shadow-neu-sm transition-all hover:bg-surface-2 active:shadow-neu-in"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Tambah baris
      </button>

      <div className="space-y-1.5 border-t border-line/60 pt-4 text-sm sm:ml-auto sm:w-72">
        <div className="flex justify-between text-ink-muted">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatRupiah(subtotalSen)}</span>
        </div>
        <div className="flex justify-between text-ink-muted">
          <span>{taxLabel || "Pajak"}</span>
          <span className="tabular-nums">{formatRupiah(taxSen)}</span>
        </div>
        <div className="flex justify-between border-t border-line/60 pt-2 font-semibold text-ink">
          <span>Total</span>
          <span className="tabular-nums">{formatRupiah(totalSen)}</span>
        </div>
      </div>
    </fieldset>
  );
}