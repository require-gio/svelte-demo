# Conversational BI – Chat-to-Data

A SvelteKit app that combines a **Schema Explorer** and a **conversational chat interface** powered by the Databricks Genie API. Users can browse Unity Catalog table schemas and ask natural-language questions against their data — no SQL required.

## Architecture

```
Browser (SvelteKit + shadcn-svelte + TanStack Query/Table)
    │
    ├── Tab 1: Schema Explorer  →  /api/tables  →  Unity Catalog Tables API
    └── Tab 2: Chat             →  /api/chat    →  Databricks Genie Conversation API
```

- **Frontend**: SvelteKit, shadcn-svelte, Tailwind CSS, TanStack Query & Table
- **Backend**: SvelteKit API routes (`+server.ts`) — no separate server needed
- **Databricks**: Genie Space handles Text-to-SQL; Unity Catalog provides schema metadata without requiring a SQL Warehouse
- **Deployment**: Databricks Apps via Databricks Asset Bundles (`databricks.yml`)

## Local Development

### 1. Install dependencies

```sh
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```sh
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABRICKS_HOST` | Workspace URL, e.g. `https://<workspace>.cloud.databricks.com` |
| `DATABRICKS_TOKEN` | Personal access token (`dapi...`) |
| `DATABRICKS_TABLES` | Comma-separated fully-qualified table names, e.g. `catalog.schema.table1,catalog.schema.table2` |
| `DATABRICKS_WAREHOUSE_ID` | SQL Warehouse ID (used for query execution) |
| `GENIE_SPACE_ID` | Genie Space ID from the Genie room URL |

### 3. Start the dev server

```sh
npm run dev
```

App runs at `http://localhost:5173`.

## Deploying as a Databricks App

### Prerequisites

- [Databricks CLI](https://docs.databricks.com/dev-tools/cli/index.html) installed and authenticated
- A Databricks SQL Warehouse, a configured Genie Space, and a secret scope with the `databricks-tables` key

### 1. Build the app

```sh
npm run build
```

This produces a Node.js server in `build/`.

### 2. Deploy via Databricks Asset Bundle

```sh
databricks bundle deploy
```

The bundle (`databricks.yml`) configures the app with three resources:

| Resource | Bundle variable | Description |
|---|---|---|
| `sql-warehouse` | `warehouse_id` | SQL Warehouse the app is granted `CAN_USE` on |
| `genie-space` | `genie_space_id` | Genie Space the app is granted `CAN_VIEW` on |
| `databricks-tables` | `secret_scope` | Secret scope key holding the comma-separated table list |

Pass variables at deploy time if they are not set in your target:

```sh
databricks bundle deploy \
  --var="warehouse_id=<id>" \
  --var="genie_space_id=<id>" \
  --var="secret_scope=svelte-demo"
```

### 3. Start the app

```sh
databricks bundle run svelte-demo
```

Or navigate to **Apps** in the Databricks UI and launch `svelte-demo` from there. The platform auto-injects `DATABRICKS_HOST`, `DATABRICKS_CLIENT_ID`, `DATABRICKS_CLIENT_SECRET`, and `DATABRICKS_APP_PORT`; no manual credential configuration is needed.

## Other Scripts

| Command | Description |
|---|---|
| `npm run preview` | Preview the production build locally |
| `npm run check` | Run `svelte-check` for type errors |
| `npm run storybook` | Start Storybook component explorer on port 6006 |
