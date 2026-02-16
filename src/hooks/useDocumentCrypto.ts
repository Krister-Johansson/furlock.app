import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createKeyShares,
  decrypt,
  encrypt,
  generateMasterKey,
  isValidMasterKey,
  parseMasterKey,
  serializeMasterKey,
} from '@/lib/crypto'

export function useDocumentCrypto() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const rawKeyRef = useRef<Uint8Array | null>(null)
  const masterKeyStringRef = useRef<string | null>(null)

  const lock = useCallback(() => {
    rawKeyRef.current = null
    masterKeyStringRef.current = null
    setIsUnlocked(false)
  }, [])

  useEffect(() => {
    const clearOnClose = () => {
      rawKeyRef.current = null
      masterKeyStringRef.current = null
    }
    window.addEventListener('beforeunload', clearOnClose)
    return () => window.removeEventListener('beforeunload', clearOnClose)
  }, [])

  const unlockWithMasterKey = useCallback((masterKeyString: string) => {
    if (!isValidMasterKey(masterKeyString)) {
      throw new Error('Invalid master key format')
    }
    rawKeyRef.current = parseMasterKey(masterKeyString)
    masterKeyStringRef.current = masterKeyString
    setIsUnlocked(true)
  }, [])

  const generateAndUnlock = useCallback(() => {
    const rawKey = generateMasterKey()
    const encoded = serializeMasterKey(rawKey)
    rawKeyRef.current = rawKey
    masterKeyStringRef.current = encoded
    setIsUnlocked(true)
    return encoded
  }, [])

  const ensureKey = useCallback((): Uint8Array => {
    const key = rawKeyRef.current
    if (!key) throw new Error('Master key is not unlocked')
    return key
  }, [])

  const encryptForCreate = useCallback(
    async (plaintext: string) => {
      const rawKey = ensureKey()
      return encrypt(plaintext, rawKey)
    },
    [ensureKey],
  )

  const generateReadShares = useCallback(
    (totalShares: number, threshold: number): Array<string> => {
      const rawKey = ensureKey()
      return createKeyShares(rawKey, totalShares, threshold)
    },
    [ensureKey],
  )

  const decryptDocument = useCallback(
    async (encryptedContent: string, iv: string): Promise<string> => {
      const rawKey = ensureKey()
      return decrypt(encryptedContent, iv, rawKey)
    },
    [ensureKey],
  )

  return {
    isUnlocked,
    masterKeyString: masterKeyStringRef.current,
    unlockWithMasterKey,
    generateAndUnlock,
    lock,
    encryptForCreate,
    generateReadShares,
    decryptDocument,
  }
}
