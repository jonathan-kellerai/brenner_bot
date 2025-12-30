"use server";

/**
 * Server Action for Global Search
 *
 * This file contains the server-side search implementation that handles
 * file system access. It's used by the client-side SpotlightSearch component.
 */

import {
  globalSearch as performSearch,
  warmIndex,
  type GlobalSearchResult,
  type SearchCategory,
} from "./globalSearch";

export async function searchAction(
  query: string,
  options?: {
    limit?: number;
    category?: SearchCategory;
    model?: "gpt" | "opus" | "gemini";
  }
): Promise<GlobalSearchResult> {
  return performSearch(query, options);
}

export async function warmSearchIndex(): Promise<void> {
  await warmIndex();
}
