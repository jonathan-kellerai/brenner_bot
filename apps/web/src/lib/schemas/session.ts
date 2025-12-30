import { z } from "zod";

/**
 * Session Kickoff Form Schema
 *
 * Validates all fields for the Brenner Loop session creation form.
 * Used with TanStack Form for field-level validation.
 */

// Thread ID format: alphanumeric with optional dashes (e.g., FEAT-123, RS-20251230-topic)
const threadIdPattern = /^[A-Za-z0-9][\w-]*$/;

export const sessionFormSchema = z.object({
  threadId: z
    .string()
    .min(1, "Thread ID is required")
    .max(64, "Thread ID must be 64 characters or less")
    .regex(threadIdPattern, "Use alphanumeric characters and dashes (e.g., FEAT-123)"),

  sender: z
    .string()
    .min(1, "Sender name is required")
    .max(32, "Sender name must be 32 characters or less")
    .regex(/^[A-Za-z][A-Za-z0-9]*$/, "Use PascalCase without spaces (e.g., GreenCastle)"),

  recipients: z
    .string()
    .min(1, "At least one recipient is required")
    .transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .refine((arr) => arr.length > 0, "At least one recipient is required"),

  subject: z.string().max(128, "Subject must be 128 characters or less").optional(),

  excerpt: z
    .string()
    .min(10, "Transcript excerpt must be at least 10 characters")
    .max(50000, "Transcript excerpt is too long"),

  theme: z.string().max(64, "Theme must be 64 characters or less").optional(),

  domain: z.string().max(64, "Domain must be 64 characters or less").optional(),

  question: z.string().max(256, "Question must be 256 characters or less").optional(),

  ackRequired: z.boolean().default(false),
});

export type SessionFormData = z.infer<typeof sessionFormSchema>;

/**
 * Individual field validators for use with TanStack Form's onBlur validation.
 * These provide immediate feedback when users leave a field.
 *
 * Note: Field validators accept string (not string | undefined) because
 * TanStack Form always provides string values (empty string when blank).
 * Optional fields validate max length but allow empty strings.
 */
export const sessionFieldValidators = {
  threadId: sessionFormSchema.shape.threadId,
  sender: sessionFormSchema.shape.sender,
  recipients: z.string().min(1, "At least one recipient is required"),
  // Optional fields: validate max length but allow empty strings
  subject: z.string().max(128, "Subject must be 128 characters or less"),
  excerpt: sessionFormSchema.shape.excerpt,
  theme: z.string().max(64, "Theme must be 64 characters or less"),
  domain: z.string().max(64, "Domain must be 64 characters or less"),
  question: z.string().max(256, "Question must be 256 characters or less"),
  ackRequired: sessionFormSchema.shape.ackRequired,
};
