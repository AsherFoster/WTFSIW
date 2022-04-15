import type {Storage} from './storage';

interface Env {
  storage: KVNamespace;
}

interface Data {
  storage: Storage;
}

export type WTFSIWContext<Params extends string = any> = EventContext<
  Env,
  Params,
  Data & Record<string, unknown>
>;

export type WTFSIWFunction<Params extends string = any> = PagesFunction<
  Env,
  Params,
  Data & Record<string, unknown>
>;
