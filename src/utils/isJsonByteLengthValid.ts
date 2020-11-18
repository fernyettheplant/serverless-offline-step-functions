import { Buffer } from 'buffer';

export function isJsonByteLengthValid(json: string): boolean {
  const byteLength = Buffer.byteLength(json);
  const stepFunctionByteSizeLimit = 262144; // 256 Kb according to AWS

  return byteLength <= stepFunctionByteSizeLimit;
}
