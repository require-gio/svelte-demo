# Conversational BI – Chat-to-Data im Versicherungsumfeld

## Implementierungsplan

---

## 1. Architektur-Übersicht

```
┌──────────────────────────────────────────────────────────────┐
│                       FRONTEND                               │
│  SvelteKit + shadcn-svelte + Tailwind CSS                    │
│  + TanStack Query (Daten-Fetching) + TanStack Table          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Header: Tabellen-Auswahl (Select Dropdown)           │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ Tab 1: 📋 Schema-Explorer                            │    │
│  │  • TanStack Table mit Sortierung & globalem Filter   │    │
│  │  • Spalten: Name, Datentyp, Nullable, Beschreibung   │    │
│  │  • Tabellenbeschreibung + Tabellentyp                │    │
│  │  • Daten via TanStack Query (cached, staleTime 5min) │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ Tab 2: 💬 Chat (Genie Conversation API)              │    │
│  │  • Stateful Conversation mit Genie Space             │    │
│  │  • Tabellen-Ergebnisse via TanStack Table im Chat    │    │
│  │  • SQL-Toggle pro Antwort                            │    │
│  │  • Follow-up Fragen im Konversations-Thread          │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  API Calls:                                                  │
│    GET  /api/tables               → Tabellenliste + Schemas  │
│    GET  /api/tables/[table]       → Einzelne Tabellen-Schema │
│    POST /api/chat  { question, conversationId? }             │
│         → Genie Conversation API → Ergebnis                  │
└──────────┬───────────────────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────────────────┐
│                   SVELTEKIT BACKEND                           │
│                                                              │
│  /api/tables/+server.ts                                      │
│    → Unity Catalog Tables API: Schemas aller Tabellen        │
│                                                              │
│  /api/tables/[table]/+server.ts                              │
│    → Unity Catalog Tables API: Schema einer Tabelle          │
│                                                              │
│  /api/chat/+server.ts                                        │
│    → Genie API: start-conversation / send message            │
│    → Poll bis COMPLETED → Query-Result abrufen               │
│                                                              │
│  lib/server/databricks.ts  (Unity Catalog REST API Client)   │
│  lib/server/genie.ts       (Genie Conversation API Client)   │
└──────────┬───────────────────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────────────────┐
│                     DATABRICKS                                │
│  ┌───────────────────────┐  ┌──────────────────────────┐     │
│  │ AI/BI Genie Space     │  │ Unity Catalog            │     │
│  │ (Text-to-SQL,         │  │ (Metadaten-Service:      │     │
│  │  Konversationskontext, │  │  Tabellen, Schemas,      │     │
│  │  Data Insights)       │  │  Spalten, Typen)         │     │
│  ├───────────────────────┤  │                          │     │
│  │ Delta Tables          │  │ Kein SQL Warehouse       │     │
│  │ (konfiguriert im      │  │ für Schema-Abfragen      │     │
│  │  Genie Space)         │  │ erforderlich.            │     │
│  └───────────────────────┘  └──────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Technologie-Entscheidungen & Begründungen

| Entscheidung | Begründung (Interview-ready) |
|---|---|
| **SvelteKit API Routes** statt separatem Backend | Ein einziger Deployment-Artefakt. `+server.ts` gibt uns typsichere Endpoints mit Zero-Config. Keine CORS-Probleme. |
| **shadcn-svelte** für UI-Komponenten | Production-ready, accessible Komponenten (Table, Select, Tabs, Card, etc.). Kein Lock-in: Komponenten leben im eigenen Code (`$lib/components/ui`). |
| **TanStack Query** für Daten-Fetching | Deklaratives Fetching mit eingebautem Caching (staleTime 5min), Loading/Error-States und automatischem Refetch. Eliminiert manuellen `$effect`/`$state`-Boilerplate für API-Calls. |
| **TanStack Table** für Tabellen-Rendering | Headless Table-Library: Sortierung, Filterung, flexible Spalten-Definitionen. Funktioniert mit shadcn-svelte `Table`-Primitives als Render-Layer. Wiederverwendbar in Schema-Explorer und Chat-Ergebnissen. |
| **Unity Catalog Tables API** für Schema-Extraktion | `GET /api/2.0/unity-catalog/tables/{full_name}` gibt Spalten, Typen, Kommentare und Metadaten zurück – ohne SQL Warehouse. Rein REST-basiert, kein Compute nötig. |
| **Databricks Genie Conversation API** statt eigener Text-to-SQL | Genie übernimmt das komplette Text-to-SQL inkl. Self-Correction, Schema-Verständnis und Konversationskontext. Kein eigenes LLM-Hosting oder Prompt-Engineering nötig. |
| **Kein SQL Warehouse für den Schema-Explorer** | Unity Catalog ist ein Metadaten-Service – Schema-Abfragen brauchen keinen SQL Warehouse. Das spart Compute-Kosten und eliminiert Cold-Start-Wartezeiten. |
| **Genie Space als zentrale Konfiguration** | Tabellen, Berechtigungen und Kontext werden im Genie Space konfiguriert – nicht im Code. Ein Genie Space kann mehrere Tabellen enthalten und versteht JOINs. |
| **Stateful Conversations** | Die Genie API ist stateful: Follow-up-Fragen beziehen sich automatisch auf den vorherigen Kontext. Der User kann natürlich nachfragen, ohne Kontext wiederholen zu müssen. |
| **Multi-Table über DATABRICKS_TABLES** | Kommaseparierte Liste (als Secret), injiziert über Databricks App Resource Config. |
| **Reusable DataTable-Komponente** | Generische `data-table.svelte` Wrapper-Komponente über TanStack Table. Wird im Schema-Explorer (sortierbar, filterbar) und in Chat-Ergebnissen (read-only) wiederverwendet. |
| **Kein eigenes LLM, kein Prompt-Engineering** | Bewusste Entscheidung: Databricks Genie übernimmt die gesamte NLQ-to-SQL-Pipeline. Das eliminiert Complexity um LLM-Provider, Prompt-Iteration und Self-Correction. |

---

## 3. Projekt-Struktur

```
svelte-demo/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── data-table.svelte  # Reusable TanStack Table Wrapper
│   │   │   └── ui/               # shadcn-svelte Komponenten
│   │   │       ├── badge/
│   │   │       ├── button/
│   │   │       ├── card/
│   │   │       ├── input/
│   │   │       ├── select/
│   │   │       ├── separator/
│   │   │       ├── table/
│   │   │       └── tabs/
│   │   ├── server/
│   │   │   ├── databricks.ts    # Unity Catalog Tables API Client
│   │   │   └── genie.ts         # Genie Conversation API Client
│   │   ├── types.ts             # Shared TypeScript Types (inkl. UC API Types)
│   │   ├── utils.ts             # shadcn-svelte Utility (cn)
│   │   └── hooks/               # shadcn-svelte Hooks
│   ├── routes/
│   │   ├── +layout.svelte       # Root Layout + QueryClientProvider
│   │   ├── +page.svelte         # Hauptseite (Tabs: Schema-Explorer + Chat)
│   │   └── api/
│   │       ├── chat/
│   │       │   └── +server.ts   # Chat-Endpoint (Genie Conversation API)
│   │       └── tables/
│   │           ├── +server.ts   # GET: Tabellenliste + Schemas (UC API)
│   │           └── [table]/
│   │               └── +server.ts  # GET: Einzelne Tabellen-Metadaten (UC API)
│   ├── app.css                  # Tailwind + shadcn-svelte Theme
│   ├── app.html
│   └── app.d.ts
├── static/
├── .env                         # Secrets für lokale Entwicklung (NICHT in Git!)
├── components.json              # shadcn-svelte Config
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
└── IMPLEMENTATION_PLAN.md       # ← Diese Datei
```

---

## 4. Implementierungs-Schritte

### Schritt 1: Schema-Extraktion (Unity Catalog Tables API) – Für den Schema-Explorer

**Datei:** `src/lib/server/databricks.ts`

**Was passiert:**
- Wir nutzen die **Unity Catalog Tables API** (`GET /api/2.0/unity-catalog/tables/{full_name}`).
- Funktion `getTableMetadata(tableName)` ruft die vollständigen UC-Metadaten ab.
- Funktion `getTableSchema(tableName)` extrahiert daraus `ColumnInfo[]`.
- Sicherheitscheck: Nur Tabellen aus `DATABRICKS_TABLES` werden akzeptiert.
- **Kein SQL Warehouse erforderlich** – Unity Catalog ist ein reiner Metadaten-Service.

**Warum so:**
- Die UC Tables API gibt Spaltenname, Typ, Kommentar, Nullable und Position zurück.
- Kein Compute-Overhead, kein Cold-Start, keine Warehouse-Kosten.
- Konsistent mit dem Unity Catalog als Single Source of Truth für Metadaten.

---

### Schritt 2: Genie Conversation API Integration

**Datei:** `src/lib/server/genie.ts`

**Was passiert:**
- Neuer Client für die **Genie Conversation API** (`/api/2.0/genie/spaces/`).
- Zwei Haupt-Flows:
  1. **Neue Konversation starten**: `POST /api/2.0/genie/spaces/{space_id}/start-conversation`
  2. **Follow-up senden**: `POST /api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}/messages`
- Nach dem Senden wird gepollt bis `status === "COMPLETED"`.
- Dann werden die Query-Ergebnisse über den Attachment-Endpoint abgerufen.

**API-Endpunkte:**
```
# Neue Konversation starten
POST https://<workspace>/api/2.0/genie/spaces/{space_id}/start-conversation
Body: { "content": "Wie viele Kunden haben wir?" }
→ Returns: { conversation_id, message_id }

# Message-Status pollen
GET https://<workspace>/api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}/messages/{message_id}
→ Returns: { status, attachments: [{ query: { query, statement_id }, attachment_id }] }

# Query-Ergebnis abrufen
GET https://<workspace>/api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}/messages/{message_id}/attachments/{attachment_id}/query-result
→ Returns: { columns, data_array }

# Follow-up Nachricht senden
POST https://<workspace>/api/2.0/genie/spaces/{space_id}/conversations/{conversation_id}/messages
Body: { "content": "Und wie viele davon sind aus München?" }
→ Returns: { message_id }
```

**Warum so:**
- **Genie übernimmt Text-to-SQL**: Kein eigenes LLM nötig, kein Prompt-Engineering, keine Self-Correction.
- **Stateful Conversations**: Follow-up-Fragen werden automatisch im Kontext der vorherigen Fragen beantwortet.
- **Polling mit Timeout**: Best Practice laut Databricks: alle 5-10s pollen, max. 10 Min.
- **Ein Genie Space = Ein Daten-Domäne**: Der Space wird im Databricks UI konfiguriert mit den relevanten Tabellen.

---

### Schritt 3: Chat API Endpoint

**Datei:** `src/routes/api/chat/+server.ts`

**Was passiert:**
- Empfängt User-Frage + optionale `conversationId` vom Frontend.
- Ohne `conversationId` → Neue Genie-Konversation starten.
- Mit `conversationId` → Follow-up-Nachricht an bestehende Konversation senden.
- Pollt die Genie API bis das Ergebnis bereit ist.
- Gibt Ergebnis (Tabelle/Text) + SQL + `conversationId` zurück.

**Ablauf:**
```typescript
// 1. Frage an Genie senden
const { conversationId, messageId } = conversationId
  ? await sendFollowUp(conversationId, question)
  : await startConversation(question);

// 2. Auf Ergebnis warten (Polling)
const message = await pollForCompletion(conversationId, messageId);

// 3. Query-Ergebnis abrufen (wenn Attachment vorhanden)
const result = await getQueryResult(conversationId, messageId, attachmentId);

// 4. An Frontend zurückgeben
return { conversationId, type, content, columns, rows, sql };
```

---

### Schritt 4: Schema-Explorer (TanStack Query + TanStack Table)

**Dateien:** `src/routes/+page.svelte` (Tab "Schema-Explorer"), `src/lib/components/data-table.svelte`

**Features:**
- **TanStack Query** für Daten-Fetching: `createQuery(['tables'])` mit staleTime 5min.
- **Tabellen-Auswahl**: Globaler Select-Dropdown im Header.
- **TanStack Table** für Schema-Darstellung: Sortierbare Spalten (#, Name, Typ, Nullable, Beschreibung).
- **Globaler Filter**: Input-Feld filtert Spalten instant über TanStack Table's `getFilteredRowModel`.
- **Tabellenbeschreibung & Tabellentyp** als Badges aus UC-Metadaten.
- **Keine Pagination nötig**: Schema-Daten (Spaltenliste) sind immer klein genug für Client-Side-Rendering.

**Warum TanStack statt manueller Fetch + shadcn Table:**
- TanStack Query bietet eingebautes Caching, Loading/Error-States und staleTime.
- TanStack Table bietet Sortierung und Filterung deklarativ (keine eigene Logik).
- Die `DataTable`-Komponente ist wiederverwendbar für Chat-Ergebnisse.

---

### Schritt 5: Frontend Chat-UI (Genie-fähig)

**Datei:** `src/routes/+page.svelte` (Tab "Chat")

**Features:**
- Chatverlauf als scrollbare Liste mit shadcn-svelte Card-Komponenten.
- User-Nachrichten rechts (primary), Genie-Antworten links (card).
- **Stateful Conversation**: Das Frontend speichert die `conversationId` und sendet sie bei Follow-ups mit.
- **Datentyp-Erkennung:**
  - Tabellarische Ergebnisse → TanStack Table (via DataTable-Komponente) im Chat
  - Text-Antworten → Formatierter Text in Card
- **SQL-Toggle**: Jede Antwort zeigt optional den von Genie generierten SQL.
- **Neue Konversation**: Button zum Starten einer frischen Konversation.
- Loading-Animation (Bouncing Dots).
- Error-State mit Destructive-Colors.
- Vorschläge: Klickbare Beispiel-Fragen im Willkommens-Bildschirm.
- **Dynamische Spalten**: Chat-Tabellen erstellen `ColumnDef[]` dynamisch aus der Genie-Antwort.

---

## 5. Sicherheitskonzept (Interview-relevant!)

| Risiko | Maßnahme |
|---|---|
| **Unerlaubter Tabellenzugriff (Explorer)** | Whitelist: Nur Tabellen aus `DATABRICKS_TABLES` werden im Schema-Explorer akzeptiert. Die UC Tables API zeigt nur Metadaten, keine Zeilendaten. |
| **Unerlaubter Datenzugriff (Chat)** | Der Genie Space hat eigene Berechtigungen. Nur Tabellen im Space sind abfragbar. Unity Catalog Governance greift. |
| **Token/Secret Exposure** | Alle Secrets in `.env`, nur server-seitig via `$env/static/private`. |
| **XSS im Chat** | HTML-Output wird escaped (`&`, `<`, `>`). Nur `**bold**` wird zu `<strong>`. |
| **Kosten-Explosion** | Schema-Explorer nutzt Unity Catalog (kein Compute). Chat nutzt Genie mit konfiguriertem SQL Warehouse + Auto-Stop. |

---

## 6. Environment Variables

### Lokale Entwicklung (.env)

```env
# .env (nur für lokale Entwicklung)
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com
DATABRICKS_TOKEN=dapi...

# Kommaseparierte Liste aller Tabellen für den Schema-Explorer (vollqualifiziert)
DATABRICKS_TABLES=catalog.schema.versicherungen,catalog.schema.schaeden

# Genie Space ID (aus der Genie Space URL)
GENIE_SPACE_ID=12ab345cd6789000ef6a2fb844ba2d31
```

### Databricks Apps (automatisch injiziert)

| Variable | Quelle | Beschreibung |
|---|---|---|
| `DATABRICKS_HOST` | Auto-injiziert | Workspace URL |
| `DATABRICKS_CLIENT_ID` | Auto-injiziert | Service Principal Client ID |
| `DATABRICKS_CLIENT_SECRET` | Auto-injiziert | Service Principal Secret |
| `DATABRICKS_APP_PORT` | Auto-injiziert | Port für den HTTP-Server |
| `GENIE_SPACE_ID` | `valueFrom: genie-space` | Genie Space Resource |
| `DATABRICKS_TABLES` | `valueFrom: databricks-tables` | Secret mit Tabellenliste |

---

## 7. Deployment als Databricks App

### Architektur

Die App wird als **Databricks App** deployed – ein containerisierter Service auf der Databricks Serverless-Plattform. Der Build erzeugt einen Node.js-Server via `adapter-node`.

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABRICKS APP                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SvelteKit (adapter-node)                             │  │
│  │  • npm run build  → build/                            │  │
│  │  • npm run start  → node build/index.js               │  │
│  │  • HOST=0.0.0.0 PORT=$DATABRICKS_APP_PORT             │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  Auth: OAuth2 Client Credentials Flow                 │  │
│  │  • DATABRICKS_CLIENT_ID  (auto-injiziert)             │  │
│  │  • DATABRICKS_CLIENT_SECRET (auto-injiziert)          │  │
│  │  → Token-Caching mit Auto-Refresh                     │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  Resources (konfiguriert in app.yaml / databricks.yml)│  │
│  │  • genie-space   → GENIE_SPACE_ID                     │  │
│  │  • secret        → DATABRICKS_TABLES                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  URL: https://svelte-demo-<wid>.<region>.databricksapps.com │
└─────────────────────────────────────────────────────────────┘
```

### Konfigurationsdateien

**`app.yaml`** – Runtime-Konfiguration:
```yaml
command: [npm, run, start]
env:
  - name: GENIE_SPACE_ID
    valueFrom: genie-space
  - name: DATABRICKS_TABLES
    valueFrom: databricks-tables
```

**`databricks.yml`** – Bundle/Deployment-Konfiguration:
- Deklariert App-Ressourcen (SQL Warehouse, Genie Space, Secrets)
- Definiert Variablen für umgebungsspezifische Werte
- Konfiguriert Service Principal Permissions

### Deployment-Optionen

#### Option A: Git Repository (empfohlen)
1. Code in Git-Repository pushen
2. Databricks App erstellen → Git-Repository konfigurieren
3. Git-Credential für den Service Principal einrichten
4. Deploy: Branch/Tag/Commit auswählen → Databricks baut und startet die App

#### Option B: Databricks CLI
```bash
# Validieren
databricks apps validate --profile <PROFILE>

# Deployen und starten
databricks apps deploy -t dev --profile <PROFILE>
```

#### Option C: DABs (Databricks Asset Bundles)
```bash
databricks bundle deploy -t dev --profile <PROFILE> -var="warehouse_id=a1b2c3d4e5f6789a"
databricks bundle run svelte-demo -t dev --profile <PROFILE>
```

### Build-Prozess (automatisch bei Deployment)

1. `npm install` – Dependencies installieren
2. `npm run build` – SvelteKit Build (erzeugt `build/`)
3. `npm run start` – Node.js-Server starten auf `$DATABRICKS_APP_PORT`

---

## 8. Erweiterungsmöglichkeiten (für Interview-Diskussion)

1. **Caching**: TanStack Query staleTime bereits auf 5min gesetzt. Kann weiter optimiert werden.
2. **Multi-Space**: Mehrere Genie Spaces für verschiedene Domänen (z.B. Schäden, Verträge, Kunden).
3. **Visualisierung**: Chart.js Integration für automatische Diagramme bei Aggregationen.
4. **Genie + Agent Framework**: Multi-Agent-System mit Genie für strukturierte Daten und RAG für Dokumente.
5. **Audit-Log**: Jede Frage + Genie-Antwort in einer Audit-Tabelle speichern.
6. **Export**: CSV/Excel-Export der Chat-Ergebnisse.
7. **Dark Mode**: Bereits vorbereitet durch shadcn-svelte Theme-System.
8. **SSE Streaming**: Genie-Polling-Updates per Server-Sent Events an das Frontend streamen.
9. **Conversation History**: Vergangene Genie-Konversationen persistent speichern und wieder aufrufen.
10. **Column Pinning & Resizing**: TanStack Table unterstützt Column-Pinning und Resizing out-of-the-box.

---

## 9. Zeitplan (Implementierung)

| Schritt | Dateien | Status |
|---|---|---|
| Projekt-Setup (SvelteKit + Tailwind + shadcn-svelte) | `package.json`, configs, `components.json` | ✅ |
| Schema-Extraktion (Unity Catalog Tables API) | `src/lib/server/databricks.ts` | ✅ |
| Genie Conversation API Client | `src/lib/server/genie.ts` | ✅ |
| Tabellenliste API (UC Metadaten) | `src/routes/api/tables/+server.ts` | ✅ |
| Tabellen-Detail API (UC Metadaten) | `src/routes/api/tables/[table]/+server.ts` | ✅ |
| Chat API Endpoint (Genie Integration) | `src/routes/api/chat/+server.ts` | ✅ |
| TanStack Query + Table Integration | `+layout.svelte`, `data-table.svelte` | ✅ |
| Schema-Explorer (TanStack Table + Filter) | `src/routes/+page.svelte` (Tab 1) | ✅ |
| Chat Frontend (TanStack Table für Ergebnisse) | `src/routes/+page.svelte` (Tab 2) | ✅ |
| Shared Types (inkl. UC API Types) | `src/lib/types.ts` | ✅ |
