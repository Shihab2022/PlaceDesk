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
    // Remove leading slash if provided
    let cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

    // Remove repository name if it was included in the path
    if (cleanPath.startsWith(`${GITHUB_REPO}/`)) {
      cleanPath = cleanPath.slice(GITHUB_REPO.length + 1);
    }

    const url =
      `https://api.github.com/repos/` +
      `${GITHUB_OWNER}/${GITHUB_REPO}/contents/` +
      `${cleanPath}?ref=main`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: "GitHub API error",
          status: response.status,
          details: errorText,
        },
        { status: response.status },
      );
    }

    const githubData = await response.json();

    // Make sure GitHub returned a file
    if (githubData.type !== "file") {
      return NextResponse.json(
        {
          error: "The GitHub path does not point to a file",
          type: githubData.type,
        },
        { status: 400 },
      );
    }

    if (!githubData.content) {
      return NextResponse.json(
        {
          error: "GitHub response does not contain file content",
        },
        { status: 500 },
      );
    }

    // GitHub returns the file content as Base64
    const base64Content = githubData.content.replace(/\n/g, "");

    // Decode Base64
    const decodedContent = Buffer.from(base64Content, "base64").toString(
      "utf-8",
    );

    // Convert JSON string into actual JavaScript object/array
    const data = JSON.parse(decodedContent);

    // Return ONLY the actual Malls.json data
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch GitHub file:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch or parse GitHub JSON file",
      },
      { status: 500 },
    );
  }
}
