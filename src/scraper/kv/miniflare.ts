import {Miniflare} from 'miniflare';
import type {KV} from './index';
import {CF_KV_BINDING} from '../../shared/config';

export class MiniflareKV implements KV {
  private miniflare = new Miniflare({
    // We don't actually want to run anything in Miniflare. All we care about is its KV access
    script: '',
    // Ambiguous arg matches `wrangler pages dev`. Defaults to ./.mf/kv
    // https://miniflare.dev/storage/kv#persistence
    kvPersist: true,
    kvNamespaces: [CF_KV_BINDING],
  });

  private kv = this.miniflare.getKVNamespace(CF_KV_BINDING);

  constructor() {
    console.log('Initialised Miniflare KV driver');
  }

  async get<T>(key: string): Promise<T | null> {
    const kv = await this.kv;
    return kv.get<T>(key, {type: 'json'});
  }

  async bulkWrite(values: [string, any][]): Promise<void> {
    const kv = await this.kv;

    await Promise.all(values.map(([k, v]) => kv.put(k, JSON.stringify(v))));
  }

  async listKeys(prefix?: string): Promise<string[]> {
    const kv = await this.kv;
    const keys = await kv.list({prefix});
    return keys.keys.map((k) => k.name);
  }

  async deleteKeys(keys: string[]): Promise<void> {
    const kv = await this.kv;
    await Promise.all(keys.map((k) => kv.delete(k)));
  }
}
