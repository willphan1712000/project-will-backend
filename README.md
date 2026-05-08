# project-will-backend

Minimal TypeScript package scaffold for local development and npm publishing.

## Setup

```bash
npm install
```

## Scripts

```bash
npm run build
npm run dev
npm run typecheck
npm test
```

## Publish to npm

1. Create an npm access token.
2. Add it to this GitHub repository as the `NPM_TOKEN` secret.
3. Update the `name`, `description`, and `author` fields in `package.json` if needed.
4. Push a tag like `v1.0.0`.

The publish workflow will build the package and run `npm publish`.
