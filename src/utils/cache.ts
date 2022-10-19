import * as utils from './index';

class Cache {
  private readonly _cache: { [key: string]: string } = {};
  set(key: string, value: string) {
    if (!this.has(key)) {
      this._cache[key] = value
    }
  }
  get(key: string) {
    return this._cache[key];
  }

  has(key: string): boolean {
    return this._cache[key] !== undefined;
  }

  keys(): Promise<string[]> {
    return Promise.resolve(Object.keys(this._cache));
  }
}

export default Cache;