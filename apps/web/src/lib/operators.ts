/**
 * Operator data source for the web UI.
 *
 * This is intentionally data-driven: it parses `specs/operator_library_v0.1.md`
 * and joins against the quote bank by canonical operator tags.
 *
 * NOTE: This module reads files via `operator-library.ts`, which uses Node.js
 * APIs and must only be imported from server code.
 */

import type { OperatorWithQuotes } from "./operator-library";
import { getOperatorPalette } from "./operator-library";

export type BrennerOperatorPaletteEntry = OperatorWithQuotes;

export async function loadBrennerOperatorPalette(): Promise<BrennerOperatorPaletteEntry[]> {
  return getOperatorPalette();
}
