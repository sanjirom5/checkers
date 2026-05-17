import React from "react";
import clsx from "clsx";
import s from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={clsx(s.btn, s[variant], s[size], className)} {...props}>
      {children}
    </button>
  );
}
