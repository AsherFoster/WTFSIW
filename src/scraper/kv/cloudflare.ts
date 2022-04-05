import fetch from 'node-fetch';
import {
  CF_ACCOUNT_ID,
  CLOUDFLARE_API_KEY,
  CF_KV_NAMESPACE,
} from '../../shared/config';
import type {KV} from './index';

if (!CLOUDFLARE_API_KEY) throw new Error('CLOUDFLARE_API_KEY is required');
const CF_HEADERS = {Authorization: 'Bearer ' + CLOUDFLARE_API_KEY};

export class CloudflareKV implements KV {
  private readonly apiBase = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE}`;

  constructor() {
    console.log('Initialised Cloudflare KV driver');
  }

  async get<T>(key: string): Promise<T | null> {
    const resp = await fetch(`${this.apiBase}/values/${key}`, {
      headers: CF_HEADERS,
    });
    if (resp.status !== 200) return null;
    return resp.json() as Promise<T>;
  }

  async bulkWrite(values: [string, any][]): Promise<void> {
    const pageSize = 10_000;
    let page = 0;
    while (values.length > page * pageSize) {
      const resp = await fetch(`${this.apiBase}/bulk`, {
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

  async listKeys(prefix?: string): Promise<string[]> {
    let keys: string[] = [];
    let cursor: string | null = null;

    while (cursor !== '') {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (prefix) params.append('prefix', prefix);

      const resp = await fetch(`${this.apiBase}/keys?` + params, {
        headers: CF_HEADERS,
      });
      const body = (await resp.json()) as any;
      if (!body.success) throw new Error('Failed to list keys');
      keys = keys.concat(body.result.map((k: {name: string}) => k.name));
      cursor = body.result_info.cursor;
    }

    return keys;
  }

  async deleteKeys(keys: string[]): Promise<void> {
    const pageSize = 10_000;
    let page = 0;
    while (keys.length > page * pageSize) {
      const resp = await fetch(`${this.apiBase}/bulk`, {
        method: 'DELETE',
        headers: {
          ...CF_HEADERS,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          keys.slice(page * pageSize, (page + 1) * pageSize)
        ),
      });

      const {success} = (await resp.json()) as any;
      if (!success) throw new Error('Failed to delete keys from KV');

      page++;
    }
  }
}
