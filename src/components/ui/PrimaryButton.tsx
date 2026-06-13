import type { ButtonHTMLAttributes } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "indigo" | "emerald" | "secondary" | "red-outline";
}

const variantClasses: Record<NonNullable<PrimaryButtonProps["variant"]>, string> = {
  indigo: "bg-indigo-600 text-white shadow-md hover:bg-indigo-700",
  emerald: "bg-emerald-600 text-white shadow-md hover:bg-emerald-700",
  secondary: "border-2 border-indigo-200 bg-white text-indigo-700 shadow-sm hover:border-indigo-400",
  "red-outline": "border-2 border-red-200 bg-white text-red-600 shadow-sm hover:border-red-400 hover:bg-red-50",
};

export function PrimaryButton({
  variant = "indigo",
  className = "",
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={`w-full rounded-xl px-6 py-4 text-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
