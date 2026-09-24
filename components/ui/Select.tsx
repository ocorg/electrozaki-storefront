// No "use client": only client components import it (CatalogFilters,
// CompatibilitySelector, ProductVariantExperience), which already put it in
// the browser bundle — and a client entry would get "props must be
// serializable" warnings for onChange.
import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────
// Styled drop-in replacement for the native select element.
// A native select's open list is drawn by the phone/OS and can't be styled;
// this keeps the same API (<option> children, value/defaultValue,
// onChange(e => e.target.value), name, className) with a list in the site's
// ink/gold style. With `name`, a hidden input carries the value so forms
// (and requestSubmit() right after a change) keep working.
// ─────────────────────────────────────────────────────────────────────────

type Opt = { value: string; label: string; disabled: boolean };

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children);
  return "";
}

function collect(children: React.ReactNode, out: Opt[]) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as { value?: unknown; children?: React.ReactNode; disabled?: boolean };
    if (child.type === "option") {
      const label = textOf(props.children);
      out.push({ value: props.value === undefined ? label : String(props.value), label, disabled: !!props.disabled });
    } else if (child.type === React.Fragment) {
      collect(props.children, out);
    }
  });
}

type Props = {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
  name?: string;
  id?: string;
  "aria-label"?: string;
};

export function Select({ value, defaultValue, onChange, children, className = "", name, id, "aria-label": ariaLabel }: Props) {
  const options = useMemo(() => {
    const out: Opt[] = [];
    collect(children, out);
    return out;
  }, [children]);
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value ?? "");
  const current = controlled ? value : inner;
  const selected = options.find((o) => o.value === current);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; width: number; maxHeight: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const place = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom - 8;
    const above = r.top - 8;
    const left = Math.min(Math.max(8, r.left), window.innerWidth - r.width - 8);
    if (below >= 240 || below >= above) setPos({ left, top: r.bottom + 4, width: r.width, maxHeight: Math.min(320, below) });
    else setPos({ left, bottom: window.innerHeight - r.top + 4, width: r.width, maxHeight: Math.min(320, above) });
  }, []);

  function openList() {
    place();
    const i = options.findIndex((o) => o.value === current);
    setActive(i >= 0 ? i : 0);
    setOpen(true);
  }

  function choose(o: Opt) {
    if (o.disabled) return;
    if (!controlled) setInner(o.value);
    if (hiddenRef.current) hiddenRef.current.value = o.value;
    setOpen(false);
    triggerRef.current?.focus();
    if (o.value !== current) {
      const target = { value: o.value, name: name ?? "" };
      onChange?.({ target, currentTarget: target } as unknown as React.ChangeEvent<HTMLSelectElement>);
    }
  }

  useLayoutEffect(() => {
    if (!open) return;
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function move(delta: number) {
    let i = active;
    for (let n = 0; n < options.length; n++) {
      i = (i + delta + options.length) % options.length;
      if (!options[i].disabled) break;
    }
    setActive(i);
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (options[active]) choose(options[active]); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "Tab") setOpen(false);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKey}
        className={`relative flex items-center bg-white pr-9 text-left ${className} ${open ? "border-gold" : ""}`}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <ChevronDown
          size={16}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {name && <input ref={hiddenRef} type="hidden" name={name} value={current} readOnly />}

      {open &&
        pos &&
        createPortal(
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            onKeyDown={onKey}
            className="fixed z-[80] overflow-y-auto rounded-xl border border-black/10 bg-white py-1 shadow-xl"
            style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width, maxHeight: pos.maxHeight }}
          >
            {options.map((o, i) => {
              const isSel = o.value === current;
              return (
                <div
                  key={`${o.value}|${i}`}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={o.disabled}
                  data-index={i}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(o)}
                  className={`mx-1 flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm ${
                    o.disabled ? "cursor-not-allowed text-neutral-400 line-through" : "cursor-pointer text-neutral-800"
                  } ${i === active && !o.disabled ? "bg-gold/10" : ""} ${isSel ? "font-semibold" : ""}`}
                >
                  <span className="flex-1">{o.label}</span>
                  {isSel && <Check size={16} className="shrink-0 text-gold" />}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
