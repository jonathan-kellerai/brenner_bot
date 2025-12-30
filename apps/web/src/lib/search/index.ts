/**
 * Search Module
 *
 * Public API for the client-side search system.
 *
 * @example
 * ```tsx
 * import { useSearch } from "@/lib/search";
 *
 * function SearchPage() {
 *   const { query, results, search, clearSearch } = useSearch();
 *   // ...
 * }
 * ```
 *
 * @see brenner_bot-3vc
 */

// Types
export type {
  SearchDocCategory,
  SearchScope,
  StoredSearchEntry,
  SearchResult,
  SearchOptions,
  SearchState,
  SearchActions,
  UseSearchReturn,
  IndexStats,
} from "./types";

// Engine (for direct access)
export {
  searchEngine,
  loadSearchIndex,
  search,
  isSearchIndexLoaded,
  getSearchError,
} from "./engine";

// Hooks (primary API)
export { useSearch, useSearchIndex, useSearchResult } from "./hooks";
