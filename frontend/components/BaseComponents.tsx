"use client";

import React from "react";

// Base UI Components for consistent styling

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
};

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = ""
}) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-all duration-200";
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white",
    danger: "bg-red-600 hover:bg-red-700 disabled:bg-red-500 text-white"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  className = ""
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 ${className}`}
    />
  );
};

interface TextAreaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  placeholder,
  value,
  onChange,
  disabled = false,
  rows = 4,
  className = ""
}) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
      className={`w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none ${className}`}
    />
  );
};

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${sizeClasses[size]} ${className}`} />
  );
};

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, className = "" }) => {
  const typeClasses = {
    success: "bg-green-500/20 border-green-500/50 text-green-200",
    error: "bg-red-500/20 border-red-500/50 text-red-200",
    warning: "bg-yellow-500/20 border-yellow-500/50 text-yellow-200",
    info: "bg-blue-500/20 border-blue-500/50 text-blue-200"
  };

  return (
    <div className={`p-3 border rounded-md text-sm ${typeClasses[type]} ${className}`}>
      {message}
    </div>
  );
};
