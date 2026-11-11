"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicConfig } from "@/lib/public-config";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function supabaseBrowser() {
  if (!client) {
    const { url, key } = publicConfig();
    client = createBrowserClient(url, key);
  }
  return client;
}
