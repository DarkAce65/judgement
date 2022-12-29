const isObjectWithKeys = <K extends string>(obj: unknown, keys: K[]): obj is Record<K, unknown> =>
  typeof obj === 'object' &&
  obj !== null &&
  !Array.isArray(obj) &&
  keys.every((key) => Object.prototype.hasOwnProperty.call(obj, key));

export default isObjectWithKeys;
