import type { ApiResult } from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" };

async function parseJson<T>(res: Response): Promise<ApiResult<T>> {
  try {
    const body = (await res.json()) as ApiResult<T>;
    return body;
  } catch {
    return { success: false, error: "Invalid response" };
  }
}

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<T>(res);
}

export async function apiPost<T, B = unknown>(
  path: string,
  body?: B
): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: JSON_HEADERS,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseJson<T>(res);
}

export async function apiPatch<T, B = unknown>(
  path: string,
  body: B
): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    method: "PATCH",
    credentials: "include",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return parseJson<T>(res);
}

export async function apiDelete<T>(path: string): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    method: "DELETE",
    credentials: "include",
  });
  return parseJson<T>(res);
}

export function buildQuery(
  params: Record<string, string | number | undefined | null>
) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const q = sp.toString();
  return q ? `?${q}` : "";
}
