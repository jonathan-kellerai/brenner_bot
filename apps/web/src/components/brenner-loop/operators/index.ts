/**
 * Operator UI Components
 *
 * Common UI components for the Brenner Loop operator sessions.
 * These components provide consistent navigation, progress tracking,
 * and Brenner quote integration across all operator types.
 *
 * @see brenner_bot-vw6p.6 (bead)
 * @module components/brenner-loop/operators
 */

// Shell component
export { OperatorShell, type OperatorShellProps } from "./OperatorShell";

// Progress indicator
export { OperatorProgress, type OperatorProgressProps } from "./OperatorProgress";

// Brenner quotes sidebar
export {
  BrennerQuoteSidebar,
  type BrennerQuoteSidebarProps,
} from "./BrennerQuoteSidebar";

// Navigation controls
export {
  OperatorNavigation,
  CompactNavigation,
  type OperatorNavigationProps,
  type CompactNavigationProps,
} from "./OperatorNavigation";
