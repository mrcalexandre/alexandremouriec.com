// Navigation items
export const MENU_ITEMS = [
  { path: "/about", title: "About" },
  { path: "/blog", title: "Blog" },
  { path: "https://links.alexandremouriec.com/", title: "Links" },
  { path: "/books", title: "Books" },
] as const;

// Footer items
export const FOOTER_ITEMS = [
  { external: false, href: "/now", label: "Now" },
  { external: false, href: "/colophon", label: "Colophon" },
  { external: false, href: "/uses", label: "Uses" },
  { external: false, href: "/contact", label: "Contact" },
] as const;

// Common CSS classes
export const COMMON_CLASSES = {
  card: "border-zinc/15 hover:bg-zinc/5 relative gap-2 rounded-2xl border border-dashed transition-colors duration-300 ease-in-out dark:border-white/20 dark:hover:bg-white/5",
  listItem: "border-zinc/15 hover:bg-zinc/5 h-entry u-url group relative flex items-center gap-4 rounded-lg border border-dashed px-4 py-3 shadow-xs transition-colors duration-300 ease-in-out hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/5",
  button: "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-black/5 dark:hover:bg-gray-700",
} as const; 