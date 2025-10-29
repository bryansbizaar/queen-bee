# Database Migration Architecture

## Current Architecture (Before Migration)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Mac (localhost)                      │
│                                                                  │
│  ┌──────────────────┐                                           │
│  │  Node.js Server  │                                           │
│  │  (Port 8080)     │                                           │
│  │                  │                                           │
│  │  DATABASE_HOST=  │                                           │
│  │    localhost     │                                           │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           │ connects to                                         │
│           ↓                                                      │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │ Local PostgreSQL │         │ Docker PostgreSQL│            │
│  │  (Port 5432)     │         │   (Container)    │            │
│  │                  │         │                  │            │
│  │ ✅ ACTIVE        │         │ ❌ IDLE          │            │
│  │ ✅ Real Data     │         │ ⚠️  Stale Data   │            │
│  │ ✅ 7 stock (P5)  │         │ ⚠️  10 stock (P5)│            │
│  │ ✅ 8 stock (P6)  │         │ ⚠️  10 stock (P6)│            │
│  └──────────────────┘         └──────────────────┘            │
│         ↑                              ↑                        │
│         │                              │                        │
│    brew services              docker-compose                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Problems:
❌ Two separate databases
❌ Docker database unused
❌ Not portable/consistent
❌ Confusion about which database is active
```

## Target Architecture (After Migration)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Mac (localhost)                      │
│                                                                  │
│  ┌──────────────────┐                                           │
│  │  Node.js Server  │                                           │
│  │  (Port 8080)     │                                           │
│  │                  │                                           │
│  │  DATABASE_HOST=  │                                           │
│  │    localhost     │────────────────┐                          │
│  └──────────────────┘                │                          │
│                                       │                          │
│                                       │ connects to              │
│  ┌──────────────────┐                ↓                          │
│  │ Local PostgreSQL │       ┌──────────────────┐               │
│  │                  │       │ Docker PostgreSQL│               │
│  │ ⚠️  STOPPED      │       │   (Container)    │               │
│  │ (optional)       │       │  ecommerce-      │               │
│  │                  │       │  postgres        │               │
│  └──────────────────┘       │                  │               │
│                              │ ✅ ACTIVE        │               │
│                              │ ✅ Migrated Data │               │
│  ┌──────────────────┐       │ ✅ 7 stock (P5)  │               │
│  │   pgAdmin Web    │───────│ ✅ 8 stock (P6)  │               │
│  │  (Port 8081)     │       │                  │               │
│  │  Container       │       │  Exposed Port:   │               │
│  └──────────────────┘       │   5432→localhost │               │
│                              └──────────────────┘               │
│                                       ↑                          │
│                              docker-compose up -d               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Benefits:
✅ Single source of truth
✅ Docker manages database
✅ Portable across machines
✅ Consistent environment
✅ Easy to share/deploy
```

## Migration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Migration Process                           │
└─────────────────────────────────────────────────────────────────┘

Step 1: BACKUP
┌──────────────────┐
│ Local PostgreSQL │ ─────pg_dump────> backup_TIMESTAMP.sql
│  queen_bee_db    │                   └─> queen_bee_latest.sql
└──────────────────┘                       (Stored in ./backups/)

Step 2: PREPARE DOCKER
┌──────────────────┐
│ docker-compose   │ ─────down -v────> Remove old containers
│                  │                    Remove old volumes
│                  │ ─────up -d──────> Start fresh PostgreSQL
└──────────────────┘

Step 3: RESTORE
┌──────────────────┐
│ backup_latest.sql│ ──docker exec──> Docker PostgreSQL
│                  │                   └─> All tables created
│                  │                   └─> All data loaded
└──────────────────┘                  └─> Indexes created

Step 4: VERIFY
┌──────────────────┐
│ verify-migration │ ────Test 1─────> Container running?
│     .sh          │ ────Test 2─────> Tables exist?
│                  │ ────Test 3─────> Products data?
│                  │ ────Test 4─────> Orders data?
│                  │ ────Test 5─────> Inventory correct?
│                  │ ────Test 6─────> Server connects?
└──────────────────┘

Step 5: CONNECT
┌──────────────────┐
│ Node.js Server   │ ────connects───> Docker PostgreSQL
│  (unchanged)     │      to port        (localhost:5432)
│  .env config     │      5432
└──────────────────┘
        │
        ↓
   ✅ SUCCESS!
```

## Data Flow Comparison

### Before Migration
```
Browser Request
       ↓
  Node.js API
       ↓
  database.js (pool.query)
       ↓
  DATABASE_HOST=localhost:5432
       ↓
  Local PostgreSQL
       ↓
  Data Response
```

### After Migration
```
Browser Request
       ↓
  Node.js API
       ↓
  database.js (pool.query)
       ↓
  DATABASE_HOST=localhost:5432  ← Still localhost!
       ↓
  [Docker Port Mapping]
       ↓
  Docker PostgreSQL Container
       ↓
  Data Response
```

**Key Point:** From Node.js perspective, nothing changes! It still connects to `localhost:5432`. Docker handles the routing.

## Network Architecture

### Docker Network Setup
```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network: app-network              │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   PostgreSQL     │         │     pgAdmin      │         │
│  │   Container      │ ←───────│    Container     │         │
│  │                  │ internal│                  │         │
│  │  Service Name:   │  name:  │  Service Name:   │         │
│  │  'postgres'      │ postgres│  'pgadmin'       │         │
│  │                  │         │                  │         │
│  │  Internal: 5432  │         │  Internal: 80    │         │
│  │  External: 5432  │         │  External: 8081  │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
│           │                            │                    │
└───────────┼────────────────────────────┼────────────────────┘
            │                            │
            │ Port                       │ Port
            │ Mapping                    │ Mapping
            ↓                            ↓
      localhost:5432              localhost:8081
            ↑                            ↑
            │                            │
    ┌───────┴────────┐          ┌────────┴────────┐
    │  Node.js       │          │   Your Browser  │
    │  Server        │          │   pgAdmin UI    │
    └────────────────┘          └─────────────────┘
```

## File System Layout

```
queen-bee/
│
├── docker-compose.yml          ← Defines PostgreSQL & pgAdmin
├── .env                        ← Docker Compose variables
│
├── server/
│   ├── .env                    ← Server config (DATABASE_HOST=localhost)
│   ├── config/
│   │   └── database.js         ← Connection pool setup
│   └── ...
│
├── database/
│   ├── init.sql                ← Schema (used by new containers)
│   ├── backup-local-db.sh      ← Creates backup
│   ├── restore-to-docker.sh    ← Restores to Docker
│   ├── verify-migration.sh     ← Tests migration
│   ├── migrate-to-docker.sh    ← Automated migration
│   ├── MIGRATION_GUIDE.md      ← Detailed guide
│   ├── QUICK_MIGRATION.md      ← Quick checklist
│   ├── README.md               ← Overview
│   └── backups/                ← Created during backup
│       ├── queen_bee_backup_TIMESTAMP.sql
│       └── queen_bee_latest.sql
│
└── volumes/ (Docker internal)
    └── postgres_data/          ← Persisted database files
```

## Connection String Evolution

### Local PostgreSQL
```javascript
// server/.env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123

// Connects to:
postgresql://queenbee:development123@localhost:5432/queen_bee_candles
              ↓
        Local PostgreSQL
        (Homebrew installed)
```

### Docker PostgreSQL (Node.js outside Docker)
```javascript
// server/.env (SAME AS BEFORE!)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123

// Connects to:
postgresql://queenbee:development123@localhost:5432/queen_bee_candles
              ↓
        Docker Port Mapping (5432:5432)
              ↓
        Docker PostgreSQL Container
        (Running in ecommerce-postgres)
```

### Future: Node.js in Docker
```javascript
// server/.env (ONLY CHANGE NEEDED)
DATABASE_HOST=postgres  ← Changed from localhost
DATABASE_PORT=5432
DATABASE_NAME=queen_bee_candles
DATABASE_USER=queenbee
DATABASE_PASSWORD=development123

// Connects to:
postgresql://queenbee:development123@postgres:5432/queen_bee_candles
              ↓
        Docker Internal Network (app-network)
              ↓
        Docker PostgreSQL Container
        (Using service name 'postgres')
```

## Rollback Strategy

```
┌─────────────────────────────────────────────────────────┐
│                   Rollback Scenarios                     │
└─────────────────────────────────────────────────────────┘

Scenario 1: Migration Failed During Backup
┌──────────────────┐
│ backup-local-db  │ ──X Failed
│    .sh           │
└──────────────────┘
Action: Nothing changed yet, fix issue and retry

Scenario 2: Migration Failed During Restore
┌──────────────────┐
│ Local PostgreSQL │ ✅ Still intact with all data
└──────────────────┘
Action: 
1. docker-compose down
2. Fix issue
3. Retry migration

Scenario 3: Migration Succeeded but Server Won't Connect
┌──────────────────┐         ┌──────────────────┐
│ Local PostgreSQL │ ✅      │ Docker PostgreSQL│ ✅
│ (Backup safe)    │         │ (Data migrated)  │
└──────────────────┘         └──────────────────┘
Action: 
1. Check server .env config
2. Check Docker container running
3. Check server logs

Scenario 4: Need to Revert to Local Database
┌──────────────────┐
│ Local PostgreSQL │ ✅ Data never deleted
└──────────────────┘
Action:
1. docker-compose down
2. brew services start postgresql@15
3. Server auto-reconnects to localhost
```

## Security Considerations

### Current Setup (Development)
```
Credentials (Both Databases):
├── Username: queenbee
├── Password: development123  ← Simple for dev
└── Port: 5432               ← Standard port

⚠️  For Production:
├── Change password to strong value
├── Use environment variables only
├── Don't commit .env to git
├── Consider certificate authentication
└── Use connection pooling limits
```

### Docker Security
```
Docker Container:
├── Isolated from host system
├── Data in named volume (postgres_data)
├── Network isolated (app-network)
├── Port mapping controlled
└── Can easily backup/restore

Benefits:
✅ Development isolation
✅ Easy to reset/start fresh
✅ Version-controlled configuration
✅ Consistent across team
```

## Maintenance Operations

### Regular Backups
```bash
# Create backup
./database/backup-local-db.sh

# Backup is saved to:
./database/backups/queen_bee_backup_TIMESTAMP.sql
```

### Restore from Backup
```bash
# From timestamped backup
docker exec -i ecommerce-postgres psql -U queenbee -d queen_bee_candles \
  < ./database/backups/queen_bee_backup_20241030_143000.sql

# Or from latest
./database/restore-to-docker.sh
```

### Reset Database
```bash
# Complete reset (loses all data)
docker-compose down -v
docker-compose up -d postgres

# Database starts with init.sql seed data
```

### View Logs
```bash
# PostgreSQL logs
docker logs ecommerce-postgres

# Follow logs in real-time
docker logs -f ecommerce-postgres

# pgAdmin logs
docker logs queen-bee-pgadmin
```

## Summary

### What Changes
- ✅ Database runs in Docker container
- ✅ Managed via docker-compose
- ✅ Portable and consistent

### What Stays the Same
- ✅ Server code unchanged
- ✅ Connection settings unchanged (localhost)
- ✅ Database schema unchanged
- ✅ All data preserved

### Benefits Gained
- ✅ Consistent development environment
- ✅ Easy team collaboration
- ✅ Simple backup/restore
- ✅ Isolated from local system
- ✅ Easy deployment preparation
