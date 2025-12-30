import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

export type ComposePromptInput = {
  templatePathFromRepoRoot: string;
  excerpt: string;
  theme?: string;
  domain?: string;
  question?: string;
};

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveTemplatePath(filename: string): Promise<string> {
  // First try public/corpus/ (Vercel deployment)
  const publicPath = resolve(process.cwd(), "public/corpus", filename);
  if (await fileExists(publicPath)) {
    return publicPath;
  }

  // Fall back to repo root (local dev)
  const repoRootPath = resolve(process.cwd(), "../..", filename);
  if (await fileExists(repoRootPath)) {
    return repoRootPath;
  }

  throw new Error(`Template file not found: ${filename}`);
}

export async function composePrompt(input: ComposePromptInput): Promise<string> {
  const templatePath = await resolveTemplatePath(input.templatePathFromRepoRoot);
  const template = await readFile(templatePath, "utf8");

  const chunks: string[] = [];
  chunks.push(template.trimEnd());
  chunks.push("");
  chunks.push("---");
  chunks.push("");
  chunks.push("## TRANSCRIPT EXCERPT(S)");
  chunks.push((input.excerpt ?? "").trim());
  chunks.push("");
  if (input.theme) {
    chunks.push("## FOCUS THEME");
    chunks.push(input.theme.trim());
    chunks.push("");
  }
  if (input.domain) {
    chunks.push("## TARGET RESEARCH DOMAIN");
    chunks.push(input.domain.trim());
    chunks.push("");
  }
  if (input.question) {
    chunks.push("## CURRENT RESEARCH QUESTION");
    chunks.push(input.question.trim());
    chunks.push("");
  }
  return chunks.join("\n");
}

