import { NextRequest, NextResponse } from "next/server";

// paramminhas.com/paramos shows the private ParamOS dashboard (a separate Vercel project behind Vercel login).
// Visitors need the PARAMOS_PASSWORD. With no password set the route returns 404, so it fails closed.
const TARGET = "https://paramos-three.vercel.app";

function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export function middleware(req: NextRequest) {
  const pw = process.env.PARAMOS_PASSWORD;
  const bypass = process.env.PARAMOS_BYPASS;
  if (!pw || !bypass) return new NextResponse("Not found", { status: 404 });

  const [scheme, token] = (req.headers.get("authorization") || "").split(" ");
  let ok = false;
  if (scheme === "Basic" && token) {
    const dec = atob(token);
    ok = same(dec.slice(dec.indexOf(":") + 1), pw);
  }
  if (!ok) {
    return new NextResponse("Password needed", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="ParamOS"', "X-Robots-Tag": "noindex" },
    });
  }

  const p = req.nextUrl.pathname;
  const path = p.startsWith("/mermanos") ? (p.replace(/^\/mermanos/, "") === "" ? "/mermanos/" : p) : (p.replace(/^\/paramos/, "") || "/");
  const headers = new Headers(req.headers);
  headers.set("x-vercel-protection-bypass", bypass);
  headers.delete("authorization");
  return NextResponse.rewrite(new URL(TARGET + path), { request: { headers } });
}

export const config = { matcher: ["/paramos", "/paramos/:path*", "/mermanos", "/mermanos/:path*"] };
