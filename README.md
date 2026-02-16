<p align="center">
  <img src="public/logo.svg" alt="Furlock" width="120" />
</p>

<h1 align="center">Furlock</h1>

<p align="center">
  <strong>Zero-knowledge document encryption with threshold access control.</strong><br/>
  Encrypt documents client-side and split the decryption key using Shamir's Secret Sharing — no single person can decrypt alone.
</p>

<p align="center">
  <a href="https://furlock.app">furlock.app</a>
</p>

---

## How it works

Furlock encrypts your document in the browser before anything touches a server. The encryption key is then split into multiple **key shares** using [Shamir's Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing), so that a configurable threshold of share holders must come together to decrypt.

1. **Write** your document (Markdown supported)
2. **Configure** how many key shares to create and how many are needed to decrypt (e.g. 3-of-5)
3. **Distribute** the shares to your trusted key holders
4. **Decrypt** later by combining the required number of shares — or use the master key for full access

The server **never** sees your plaintext or encryption keys. It only stores the encrypted ciphertext, the IV, and metadata (title, share config, timestamps).

## Security

- **AES-256-GCM** encryption via the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- **Shamir's Secret Sharing** for threshold key splitting
- **Client-side only** — encryption and decryption happen entirely in your browser
- **Zero-knowledge server** — the backend (Convex) stores only ciphertext and metadata
- **Keys are ephemeral** — master keys and shares are shown once and never stored

### Honest disclaimer

> The cryptographic implementation in Furlock has **not been audited by a third party** (yet). I've done my best to follow established best practices — using standard Web Crypto primitives, a well-known secret sharing library, and keeping plaintext off the server entirely — but this is currently a "trust me bro" situation. If you need guarantees, wait for an independent audit or review the [source code](src/lib/crypto.ts) yourself.

## Use cases

- **Emergency recovery instructions** — distribute access to critical information among trusted people
- **Shared secrets** — API keys, credentials, or sensitive notes that require multi-party authorization
- **Dead man's switch** — documents that can only be accessed when enough key holders agree
- **Distributed trust** — any scenario where no single person should have full access

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) (React, TypeScript) |
| Backend | [Convex](https://convex.dev) |
| Styling | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Crypto | [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (AES-256-GCM) |
| Secret Sharing | [shamirs-secret-sharing](https://www.npmjs.com/package/shamirs-secret-sharing) |
| Editor | [@uiw/react-md-editor](https://www.npmjs.com/package/@uiw/react-md-editor) |
| Animations | [Motion](https://motion.dev) |

## Getting started

```bash
# Install dependencies
npm install

# Start Convex dev server
npm run dev:convex

# Start frontend dev server (in a separate terminal)
npm run dev:frontend
```

The app will be available at `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:frontend` | Start the Vite dev server on port 3000 |
| `npm run dev:convex` | Start the Convex dev server |
| `npm run build` | Build for production |
| `npm run test` | Run tests with Vitest |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run check` | Format + lint fix |

## License

[AGPL-3.0](LICENSE)
