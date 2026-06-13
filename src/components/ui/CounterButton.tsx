import type { ButtonHTMLAttributes } from "react";

export function CounterButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-bold text-slate-600 hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}
