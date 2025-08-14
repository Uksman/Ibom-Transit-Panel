// src/theme.js
export const theme = {
  colors: {
    primary: "#f97316", // Main orange color
    primaryDark: "#ea580c", // Darker orange for hover effects
    background: "#fff7ed", // Light orange background
    error: "#c2410c", // Orange-toned error text
    errorBackground: "rgba(254, 215, 170, 0.9)", // Light orange error background
    textPrimary: "#1f2937", // Primary text color (dark gray)
    textSecondary: "#6b7280", // Secondary text color (gray)
    textMuted: "#9ca3af", // Muted text color
    border: "#e5e7eb", // Added for input borders
    tableHeader: "#f3f4f6", // Added for table header background
    secondary: "#6b7280", // Added for secondary buttons
    secondaryDark: "#4b5563", // Added for secondary button hover
    errorDark: "#9a3412", // Added for danger button hover
    status: {
      confirmed: {
        background: "#dcfce7", // Green for confirmed
        text: "#15803d",
      },
      pending: {
        background: "#ffedd5", // Light orange for pending
        text: "#c2410c",
      },
      cancelled: {
        background: "#fee2e2", // Red for cancelled
        text: "#dc2626",
      },
      active: {
        background: "#ffedd5", // Light orange for active
        text: "#f97316",
      },
      completed: {
        background: "#dbeafe", // Blue for completed
        text: "#2563eb",
      },
      refunded: {
        background: "#e0e7ff", // Indigo for refunded
        text: "#6366f1",
      },
      noShow: {
        background: "#f3f4f6", // Gray for no-show
        text: "#6b7280",
      },
      default: {
        background: "#f3f4f6", // Default background
        text: "#6b7280",
      },
    },
  },
  shadows: {
    card: "0 4px 12px rgba(0, 0, 0, 0.1)",
    cardHover: "0 6px 16px rgba(0, 0, 0, 0.15)",
  },
  borderRadius: {
    card: "0.75rem",
    button: "0.375rem",
    status: "9999px", // For pill-shaped status
  },
  spacing: {
    small: "clamp(0.75rem, 3vw, 1rem)",
    medium: "clamp(1rem, 4vw, 1.5rem)",
    large: "clamp(1.5rem, 5vw, 2.5rem)",
  },
};
