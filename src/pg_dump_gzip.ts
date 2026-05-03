import { gunzipSync, gzipSync } from "node:zlib";

function isGzip(buffer: Uint8Array): boolean {
  return buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
}

export function gunzipIfNeeded(input: Uint8Array): Uint8Array {
  return isGzip(input) ? gunzipSync(input) : input;
}

export function gzipUtf8(text: string): Uint8Array {
  return gzipSync(Buffer.from(text, "utf8"));
}

