---
description: Package manager rules for this project
---

# Package Manager : Toujours utiliser `bun`

Ce projet utilise **bun** comme gestionnaire de paquets et runtime. Il ne faut **jamais** utiliser `npm` ou `npx`.

## Règles

- ✅ Toujours utiliser `bun` à la place de `npm`
- ✅ Toujours utiliser `bunx` à la place de `npx`
- ❌ Ne jamais lancer `npm install`, `npm run`, `npm test`, etc.
- ❌ Ne jamais lancer `npx <command>`

## Correspondances

| npm / npx              | bun / bunx              |
|------------------------|-------------------------|
| `npm install`          | `bun install`           |
| `npm run dev`          | `bun run dev`           |
| `npm run build`        | `bun run build`         |
| `npm test`             | `bun test`              |
| `npx tsc --noEmit`     | `bunx tsc --noEmit`     |
| `npx prisma migrate`   | `bunx prisma migrate`   |
