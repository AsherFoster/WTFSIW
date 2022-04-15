import {ENVIRONMENT} from '../../shared/config';
import {CloudflareKV} from './cloudflare';
import {MiniflareKV} from './miniflare';

export interface KV {
  get<T>(key: string): Promise<T | null>;

  bulkWrite(values: [string, any][]): Promise<void>;

  listKeys(prefix?: string): Promise<string[]>;

  deleteKeys(keys: string[]): Promise<void>;
}

const kv: KV =
  ENVIRONMENT === 'development' ? new MiniflareKV() : new CloudflareKV();

export default kv;
