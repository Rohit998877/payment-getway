function Icon({ name, className = "" }) {
  const sharedProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "1.8",
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": "true",
  };

  switch (name) {
    case "home":
      return (
        <svg {...sharedProps}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10.5V20h13V10.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "dashboard":
      return (
        <svg {...sharedProps}>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="11" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="17" width="7" height="3" rx="1.5" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...sharedProps}>
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v1H6.5A2.5 2.5 0 0 0 4 10.5Z" />
          <path d="M4 10.5A2.5 2.5 0 0 1 6.5 8H20v9a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5Z" />
          <circle cx="16.5" cy="13.5" r="1" />
        </svg>
      );
    case "send":
      return (
        <svg {...sharedProps}>
          <path d="M4 12h13" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      );
    case "qr":
      return (
        <svg {...sharedProps}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <path d="M15 14h2v2h-2z" />
          <path d="M18 16h2v4h-4" />
          <path d="M14 18h2" />
        </svg>
      );
    case "recharge":
      return (
        <svg {...sharedProps}>
          <path d="M7 7h6a4 4 0 1 1 0 8H9" />
          <path d="m7 11-3-3 3-3" />
          <path d="M17 17h-6a4 4 0 1 1 0-8h4" />
          <path d="m17 13 3 3-3 3" />
        </svg>
      );
    case "history":
      return (
        <svg {...sharedProps}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      );
    case "profile":
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </svg>
      );
    case "coins":
      return (
        <svg {...sharedProps}>
          <ellipse cx="12" cy="7" rx="6.5" ry="3.5" />
          <path d="M5.5 7v5c0 1.9 2.9 3.5 6.5 3.5s6.5-1.6 6.5-3.5V7" />
          <path d="M5.5 12v5c0 1.9 2.9 3.5 6.5 3.5s6.5-1.6 6.5-3.5v-5" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...sharedProps}>
          <path d="M13 2 6 13h5l-1 9 8-12h-5l0-8Z" />
        </svg>
      );
    case "card":
      return (
        <svg {...sharedProps}>
          <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
          <path d="M3.5 10.5h17" />
          <path d="M7 15.5h3" />
        </svg>
      );
    default:
      return null;
  }
}

export default Icon;
