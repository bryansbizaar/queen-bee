# Queen Bee Candles - Development Setup

## Quick Start

### Install Dependencies
```bash
npm run install:all
```

### Run Development Environment
```bash
npm run dev
```

This will start:
- **Server** on http://localhost:8080 (Express API)
- **Client** on http://localhost:3000 (React dev server)

## Available Scripts

### Root Level Scripts (run from project root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both client and server in development mode |
| `npm run dev:test` | Start client, server, and test watcher |
| `npm run start` | Start production-ready client and server |
| `npm run client` | Start only the React client (port 3000) |
| `npm run server` | Start only the Express server (port 8080) |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Run tests with UI interface |
| `npm run lint` | Lint the client code |
| `npm run build` | Build the client for production |
| `npm run install:all` | Install dependencies for root, client, and server |
| `npm run clean` | Remove all node_modules and build files |

### Client Scripts (run from /client directory)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:ui` | Run tests with UI |
| `npm run lint` | Lint code |

### Server Scripts (run from /server directory)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server with nodemon (port 8080) |
| `npm start` | Start server in production mode |
| `npm run debug` | Start server with debugging enabled |

## Development Workflow

1. **First time setup:**
   ```bash
   npm run install:all
   ```

2. **Daily development:**
   ```bash
   npm run dev
   ```

3. **Running tests during development:**
   ```bash
   npm run dev:test
   ```

4. **Testing only:**
   ```bash
   npm run test:watch
   ```

## Ports

- **Client (React):** http://localhost:3000
- **Server (Express API):** http://localhost:8080
- **API Endpoints:** http://localhost:8080/api/

## Project Structure

```
queen-bee/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── package.json     # Root package.json with concurrently scripts
└── README.md        # Project documentation
```

## Troubleshooting

### Port Already in Use
If you get port errors, kill processes on those ports:
```bash
# Kill process on port 3000 (client)
lsof -ti :3000 | xargs kill -9

# Kill process on port 8080 (server)
lsof -ti :8080 | xargs kill -9
```

### Dependencies Issues
Clean and reinstall all dependencies:
```bash
npm run clean
npm run install:all
```

### Tests Not Running
Make sure you're in the client directory or use the root scripts:
```bash
# From root
npm run test

# From client directory
cd client && npm run test
```