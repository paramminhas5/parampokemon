import { NextResponse } from "next/server";

/**
 * IndexNow API route — notifies search engines of URL changes.
 * 
 * Usage: POST /api/indexnow with body { urls: string[] }
 * Or GET /api/indexnow to submit all site pages.
 * 
 * IndexNow is supported by Bing, Yandex, Seznam, and Naver.
 * Bing feeds Microsoft Copilot and ChatGPT (via Bing search).
 */

const INDEXNOW_KEY = "b4d7e2f1a9c84e5d8f3b6a0e7c1d9f2a";
const SITE_HOST = "paramminhas.com";
const KEY_LOCATION = `https://${SITE_HOST}/indexnow-key.txt`;

const ALL_URLS = [
  `https://${SITE_HOST}/`,
  `https://${SITE_HOST}/about`,
  `https://${SITE_HOST}/resume`,
  `https://${SITE_HOST}/press`,
  `https://${SITE_HOST}/play`,
  `https://${SITE_HOST}/llms.txt`,
  `https://${SITE_HOST}/llms-full.txt`,
];

async function submitToIndexNow(urls: string[]) {
  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const results = [];

  // Submit to Bing (primary — feeds Copilot/ChatGPT)
  try {
    const res = await fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    results.push({ engine: "bing", status: res.status, ok: res.ok });
  } catch (e) {
    results.push({ engine: "bing", status: 0, ok: false, error: String(e) });
  }

  // Submit to Yandex
  try {
    const res = await fetch("https://yandex.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    results.push({ engine: "yandex", status: res.status, ok: res.ok });
  } catch (e) {
    results.push({ engine: "yandex", status: 0, ok: false, error: String(e) });
  }

  return results;
}

export async function GET() {
  const results = await submitToIndexNow(ALL_URLS);
  return NextResponse.json({
    submitted: ALL_URLS,
    results,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const urls = body.urls || ALL_URLS;
    const results = await submitToIndexNow(urls);
    return NextResponse.json({ submitted: urls, results, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
