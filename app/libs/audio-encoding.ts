const BINARY_CHUNK_SIZE = 8192;

export function encodeBytesToBase64(bytes: Uint8Array): string {
  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += BINARY_CHUNK_SIZE) {
    const slice = bytes.subarray(offset, offset + BINARY_CHUNK_SIZE);
    binary += String.fromCharCode(...slice);
  }

  return btoa(binary);
}

export function decodeBase64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function splitIntoChunks(value: string, chunkSize: number): string[] {
  const chunks: string[] = [];

  for (let offset = 0; offset < value.length; offset += chunkSize) {
    chunks.push(value.slice(offset, offset + chunkSize));
  }

  return chunks;
}
