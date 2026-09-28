// app/api/pois/route.ts
import { NextRequest, NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/* Optional JSON projection (see `?fields=` / `?counts=` below)         */
/* ------------------------------------------------------------------ */

/** Split a comma separated query parameter into trimmed, non-empty entries. */
function splitParam(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Read a dotted path (`pois.count`) out of a loosely typed JSON object. */
function readPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && !Array.isArray(acc)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

/** Write a dotted path into a plain object, creating the missing parents. */
function writePath(
  target: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const keys = path.split(".");
  let node = target;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const next = node[key];
    if (!next || typeof next !== "object" || Array.isArray(next)) node[key] = {};
    node = node[key] as Record<string, unknown>;
  }
  node[keys[keys.length - 1]] = value;
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * Size of a field: array length, object key count, or the length of the
 * collection stored inside a JSON string (the report feed ships most
 * collections as stringified JSON, e.g. `top_brands`).
 * Returns `null` when the field carries no countable collection.
 */
function sizeOf(value: unknown): number | null {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = tryParseJson(value);
    return parsed === undefined ? null : sizeOf(parsed);
  }
  if (value && typeof value === "object") return Object.keys(value).length;
  return null;
}

/**
 * Keep only `fields` and replace every `counts` path with its size.
 * Unknown paths are silently skipped so a projection never throws.
 */
function projectRow(
  row: unknown,
  fields: string[],
  counts: string[],
): unknown {
  if (!row || typeof row !== "object" || Array.isArray(row)) return row;
  const source = row as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const path of fields) {
    const value = readPath(source, path);
    if (value !== undefined) writePath(out, path, value);
  }

  for (const path of counts) {
    const size = sizeOf(readPath(source, path));
    if (size !== null) writePath(out, path, size);
  }

  return out;
}

export async function GET(request: NextRequest) {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  const filePath = request.nextUrl.searchParams.get("path");

  if (!filePath) {
    return NextResponse.json(
      { error: 'Missing "path" query parameter' },
      { status: 400 },
    );
  }

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return NextResponse.json(
      { error: "Missing GitHub configuration variables" },
      { status: 500 },
    );
  }

  try {
    // 1. Clean and normalize target path
    let cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

    if (cleanPath.startsWith(`${GITHUB_REPO}/`)) {
      cleanPath = cleanPath.slice(GITHUB_REPO.length + 1);
    }

    // 2. Fetch repo tree to locate target file's SHA pointer
    const treeUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/main?recursive=1`;

    const treeResponse = await fetch(treeUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 3600 },
    });

    if (!treeResponse.ok) {
      const errorText = await treeResponse.text();
      return NextResponse.json(
        {
          error: "Failed to fetch repository tree from GitHub",
          status: treeResponse.status,
          details: errorText,
        },
        { status: treeResponse.status },
      );
    }

    const treeData = await treeResponse.json();

    // Match path against tree entries
    const fileNode = treeData.tree?.find(
      (item: { path: string; type: string }) =>
        item.path === cleanPath && item.type === "blob",
    );

    if (!fileNode || !fileNode.sha) {
      return NextResponse.json(
        { error: `File not found in GitHub repository: ${cleanPath}` },
        { status: 404 },
      );
    }

    // 3. Retrieve raw file contents via Git Blobs API (supports files up to 100 MB)
    const blobUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/blobs/${fileNode.sha}`;

    const blobResponse = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.raw+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 3600 },
    });

    if (!blobResponse.ok) {
      const errorText = await blobResponse.text();
      return NextResponse.json(
        {
          error: "Failed to fetch raw blob content from GitHub",
          status: blobResponse.status,
          details: errorText,
        },
        { status: blobResponse.status },
      );
    }

    const rawContent = await blobResponse.text();
    const data = JSON.parse(rawContent);

    /* Optional projection — `?fields=a,b.c&counts=x,y.z`.
       Used by the report cards: they only need a handful of scalars plus the
       *size* of the heavy collections, so the arrays never reach the browser. */
    const fields = splitParam(request.nextUrl.searchParams.get("fields"));
    const counts = splitParam(request.nextUrl.searchParams.get("counts"));

    if (!fields.length && !counts.length) {
      return NextResponse.json(data);
    }

    const rows: unknown[] = Array.isArray(data)
      ? data
      : data &&
          typeof data === "object" &&
          Array.isArray((data as { data?: unknown }).data)
        ? (data as { data: unknown[] }).data
        : [data];

    const projected = rows.map((row) => projectRow(row, fields, counts));

    // Keep the original envelope shape so every existing consumer still works.
    return NextResponse.json(
      Array.isArray(data)
        ? projected
        : { ...(data as Record<string, unknown>), data: projected },
    );
  } catch (error) {
    console.error("Failed to fetch GitHub file:", error);

    return NextResponse.json(
      { error: "Failed to fetch or parse GitHub JSON file" },
      { status: 500 },
    );
  }
}
