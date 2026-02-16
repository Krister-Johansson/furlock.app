// @ts-expect-error -- no type declarations for shamirs-secret-sharing
import { combine, split } from 'shamirs-secret-sharing'

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const KEY_BYTES = 32
const GCM_IV_BYTES = 12

// ---------------------------------------------------------------------------
// Master key — the raw AES-256 encryption key
// ---------------------------------------------------------------------------

export function generateMasterKey(): Uint8Array {
  return globalThis.crypto.getRandomValues(new Uint8Array(KEY_BYTES))
}

export function serializeMasterKey(key: Uint8Array): string {
  if (key.length !== KEY_BYTES) {
    throw new Error('Master key must be 32 bytes')
  }
  return `mk_${bytesToBase64(key)}`
}

export function parseMasterKey(masterKey: string): Uint8Array {
  if (!masterKey.startsWith('mk_')) {
    throw new Error('Invalid master key format')
  }
  const decoded = base64ToBytes(masterKey.slice(3))
  if (decoded.length !== KEY_BYTES) {
    throw new Error('Invalid master key length')
  }
  return decoded
}

export function isValidMasterKey(value: string): boolean {
  try {
    parseMasterKey(value)
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// AES-256-GCM encryption / decryption
// ---------------------------------------------------------------------------

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer
}

async function importKey(rawKey: Uint8Array): Promise<CryptoKey> {
  if (rawKey.length !== KEY_BYTES) {
    throw new Error('AES-256 key must be 32 bytes')
  }
  return globalThis.crypto.subtle.importKey(
    'raw',
    toArrayBuffer(rawKey),
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encrypt(
  plaintext: string,
  rawKey: Uint8Array,
): Promise<{ encryptedContent: string; iv: string }> {
  const key = await importKey(rawKey)
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(GCM_IV_BYTES))
  const ciphertext = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext),
  )
  return {
    encryptedContent: bytesToBase64(new Uint8Array(ciphertext)),
    iv: bytesToBase64(iv),
  }
}

export async function decrypt(
  encryptedContent: string,
  iv: string,
  rawKey: Uint8Array,
): Promise<string> {
  const key = await importKey(rawKey)
  const plaintext = await globalThis.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(base64ToBytes(iv)) },
    key,
    toArrayBuffer(base64ToBytes(encryptedContent)),
  )
  return decoder.decode(plaintext)
}

// ---------------------------------------------------------------------------
// Shamir's Secret Sharing (shamirs-secret-sharing)
// ---------------------------------------------------------------------------

export function createKeyShares(
  rawKey: Uint8Array,
  totalShares: number,
  threshold: number,
): Array<string> {
  if (threshold < 2 || totalShares < threshold) {
    throw new Error('Invalid share configuration')
  }
  const shares = split(rawKey, { shares: totalShares, threshold })
  return (shares as Array<Uint8Array>).map(
    (s) => `sk_${bytesToBase64(new Uint8Array(s))}`,
  )
}

export function parseShare(shareStr: string): Uint8Array {
  if (!shareStr.startsWith('sk_')) {
    throw new Error('Invalid share format')
  }
  return base64ToBytes(shareStr.slice(3))
}

export function isValidShare(value: string): boolean {
  if (!value.startsWith('sk_')) return false
  try {
    return parseShare(value).length > 0
  } catch {
    return false
  }
}

export async function decryptWithShares(
  encryptedContent: string,
  iv: string,
  shareStrs: Array<string>,
): Promise<string> {
  const shares = shareStrs.map(parseShare)
  const rawKey = new Uint8Array(combine(shares) as Uint8Array)
  return decrypt(encryptedContent, iv, rawKey)
}

// ---------------------------------------------------------------------------
// Base64 helpers
// ---------------------------------------------------------------------------

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}
