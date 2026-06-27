const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && serviceRoleKey);

type QueryParams = Record<string, string | number | boolean | undefined>;

function buildUrl(path: string, params?: QueryParams) {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL nao foi configurada.");
  }

  const url = new URL(`/rest/v1/${path}`, supabaseUrl);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

async function supabaseFetch<T>(
  path: string,
  init: RequestInit & { params?: QueryParams } = {},
) {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY nao foi configurada.");
  }

  const { params, headers, ...requestInit } = init;
  const response = await fetch(buildUrl(path, params), {
    ...requestInit,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Erro no Supabase (${response.status}): ${detail}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function selectRows<T>(path: string, params?: QueryParams) {
  return supabaseFetch<T[]>(path, {
    method: "GET",
    params,
  });
}

export async function insertRows<T>(path: string, body: unknown) {
  return supabaseFetch<T[]>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
