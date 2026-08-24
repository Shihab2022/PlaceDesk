// app/api/pois/route.ts
import { NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch GitHub file:", error);

    return NextResponse.json(
      { error: "Failed to fetch or parse GitHub JSON file" },
      { status: 500 },
    );
  }
}
