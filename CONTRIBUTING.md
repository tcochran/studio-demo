# Contributing

## Running the app locally

**Prerequisites:** Node 22, pnpm (via corepack)

```bash
corepack enable && corepack prepare pnpm@latest --activate
cd app
pnpm install
pnpm run dev
```

Open `http://localhost:5173`.

### Other useful commands

| Command | Description |
|---|---|
| `pnpm run check` | Type-check with `svelte-check` |
| `pnpm run build` | Build the static site (output in `build/`) |
| `pnpm test -- --run` | Run the Vitest test suite once |
