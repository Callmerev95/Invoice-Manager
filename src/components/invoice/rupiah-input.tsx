"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { clsx } from "clsx";

const formatId = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

function toDigits(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

function formatInput(n: number): string {
  return formatId.format(n);
}

function formatWithCaret(raw: string, caret: number): { text: string; caret: number } {
  const digits = toDigits(raw);
  if (digits === "") return { text: "", caret: 0 };

  const digitsBeforeCaret = toDigits(raw.slice(0, caret)).length;
  const text = formatInput(Number(digits));

  if (digitsBeforeCaret === 0) return { text, caret: 0 };

  let seen = 0;
  let caretPos = text.length;
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i])) seen++;
    if (seen >= digitsBeforeCaret) {
      caretPos = i + 1;
      break;
    }
  }

  return { text, caret: caretPos };
}

export function RupiahInput({
  name,
  value,
  onValueChange,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  value: number;
  onValueChange: (rupiah: number) => void;
}) {
  const [text, setText] = useState(() => (value > 0 ? formatInput(value) : ""));
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const caret = caretRef.current;
    if (caret !== null && inputRef.current) {
      inputRef.current.setSelectionRange(caret, caret);
      caretRef.current = null;
    }
  }, [text]);

  return (
    <span className="relative block">
      <input type="hidden" name={name} value={value} />
      <input
        {...props}
        ref={inputRef}
        name={undefined}
        inputMode="numeric"
        autoComplete="off"
        value={text}
        placeholder="0"
        onChange={(e) => {
          const next = formatWithCaret(e.target.value, e.target.selectionStart ?? 0);
          caretRef.current = next.caret;
          setText(next.text);
          onValueChange(next.text === "" ? 0 : Number(toDigits(next.text)));
        }}
        className={clsx(
          "w-full min-h-[44px] rounded-md border border-line bg-surface px-3 py-2 text-right text-sm tabular-nums text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none",
          className
        )}
      />
    </span>
  );
}