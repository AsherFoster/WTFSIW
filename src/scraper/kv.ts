import fetch from 'node-fetch';
import {
  CF_ACCOUNT_ID,
  CLOUDFLARE_API_KEY,
  CF_KV_NAMESPACE,
} from '../shared/config';

const CF_KV_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE}`;

if (!CLOUDFLARE_API_KEY) throw new Error('CLOUDFLARE_API_KEY is required');
const CF_HEADERS = {Authorization: 'Bearer ' + CLOUDFLARE_API_KEY};

export async function get<T>(key: string): Promise<T | null> {
  const resp = await fetch(`${CF_KV_API_BASE}/values/${key}`, {
    headers: CF_HEADERS,
  });
  if (resp.status !== 200) return null;
  return resp.json() as Promise<T>;
}

export async function bulkWrite(values: [string, any][]): Promise<void> {
  const pageSize = 10_000;
  let page = 0;
  while (values.length > page * pageSize) {
    const resp = await fetch(`${CF_KV_API_BASE}/bulk`, {
      method: 'PUT',
      headers: {
        ...CF_HEADERS,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        values
          .slice(page * pageSize, (page + 1) * pageSize)
          .map(([key, value]) => ({key, value: JSON.stringify(value)}))
      ),
    });

    const body = (await resp.json()) as any;
    if (!body.success) throw new Error('Failed to save values to KV');

    page++;
  }
}

export async function listKeys(prefix?: string): Promise<string[]> {
  let keys: string[] = [];
  let cursor: string | null = null;

  while (cursor !== '') {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (prefix) params.append('prefix', prefix);

    const resp = await fetch(`${CF_KV_API_BASE}/keys?` + params, {
      headers: CF_HEADERS,
    });
    const body = (await resp.json()) as any;
    if (!body.success) throw new Error('Failed to list keys');
    keys = keys.concat(body.result.map((k: {name: string}) => k.name));
    cursor = body.result_info.cursor;
  }

  return keys;
}

export async function deleteKeys(keys: string[]): Promise<void> {
  const pageSize = 10_000;
  let page = 0;
  while (keys.length > page * pageSize) {
    const resp = await fetch(`${CF_KV_API_BASE}/bulk`, {
      method: 'DELETE',
      headers: {
        ...CF_HEADERS,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(keys.slice(page * pageSize, (page + 1) * pageSize)),
    });

    const {success} = (await resp.json()) as any;
    if (!success) throw new Error('Failed to delete keys from KV');

    page++;
  }
}
