/**
 * Theme persistence constants shared by:
 *  - the client ThemeProvider (`ThemeProvider.tsx`)
 *  - the pre-paint inline script in `app/layout.tsx` (server component)
 *
 * Kept in a plain (non `"use client"`) module so the root layout can read it
 * without pulling client-only code into the server bundle.
 */
export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "placedesk-theme";
