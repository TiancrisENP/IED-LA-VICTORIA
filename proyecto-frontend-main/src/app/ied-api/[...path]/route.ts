import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND =
  process.env.IED_API_REWRITE ??
  (process.env.NODE_ENV === "production"
    ? "https://ied-backend.onrender.com/api"
    : "http://localhost:3001/api");

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = `${BACKEND}/${path.join("/")}${req.nextUrl.search}`;
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const name = key.toLowerCase();
    if (["host", "connection", "content-length"].includes(name)) return;
    headers.set(key, value);
  });

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const upstream = await fetch(target, init);
  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const name = key.toLowerCase();
    if (name === "set-cookie") return;
    // fetch() already decoded the body; forwarding these would truncate JSON.
    if (
      ["content-encoding", "transfer-encoding", "connection", "content-length", "keep-alive"].includes(
        name,
      )
    ) {
      return;
    }
    outHeaders.set(key, value);
  });

  const body = await upstream.arrayBuffer();
  const response = new NextResponse(body, {
    status: upstream.status,
    headers: outHeaders,
  });
  const cookies = upstream.headers.getSetCookie?.() ?? [];
  for (const cookie of cookies) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
