import fs from 'fs/promises';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { WebSocket } from 'ws';
import { initDatabase } from './src/database/sqlite.js';
import { loadEvents } from './src/handlers/eventHandler.js';
import { loadCommands } from './src/handlers/commandHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
const startupRecords = [];

const log = (...args) => {
  const prefix = new Date().toISOString();
  console.log(prefix, ...args);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => Date.now();

async function measure(name, fn) {
  const start = now();
  const result = await fn();
  const duration = now() - start;
  startupRecords.push({ name, duration });
  log(`${name}: ${duration}ms`);
  return result;
}

async function lookupHost(host) {
  try {
    const records = await dns.promises.lookup(host, { all: true });
    return { host, records };
  } catch (error) {
    return { host, error: error.message };
  }
}

async function checkGatewayApi() {
  try {
    const response = await fetch('https://discord.com/api/v10/gateway', {
      method: 'GET',
      headers: {
        'User-Agent': 'SupremeOctoTelegram/1.0 (startup-diagnostics)',
      },
      cache: 'no-store',
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      body: response.ok ? null : text.slice(0, 256),
    };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function testWebSocketConnection() {
  return new Promise((resolve) => {
    const url = 'wss://gateway.discord.gg/?v=10&encoding=json';
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => {
      ws.terminate();
      resolve({ ok: false, error: 'WebSocket connection timed out' });
    }, 8000);

    ws.once('open', () => {
      clearTimeout(timeout);
      ws.terminate();
      resolve({ ok: true });
    });

    ws.once('error', (error) => {
      clearTimeout(timeout);
      resolve({ ok: false, error: error.message });
    });
  });
}

async function runLoginDiagnostics() {
  log('Running login diagnostics...');
  const [discordDns, gatewayDns, gatewayApi, websocket] = await Promise.all([
    lookupHost('discord.com'),
    lookupHost('gateway.discord.gg'),
    checkGatewayApi(),
    testWebSocketConnection(),
  ]);

  log('DNS lookup discord.com:', discordDns);
  log('DNS lookup gateway.discord.gg:', gatewayDns);
  log('HTTPS gateway check:', gatewayApi);
  log('WebSocket gateway check:', websocket);

  if (gatewayApi.ok && !websocket.ok) {
    log('Your hosting provider is blocking outbound WebSocket connections.');
  }
}

function attachDiagnostics(client) {
  client.on('debug', (message) => {
    console.log(message);
    const normalized = String(message).toLowerCase();
    if (normalized.includes('hello')) log('HELLO received');
    if (normalized.includes('identify')) log('IDENTIFY sent');
    if (normalized.includes('ready')) log('READY received');
    if (normalized.includes('heartbeat ack') || normalized.includes('heartbeatack')) log('Heartbeat ACK');
  });

  client.on('warn', (warning) => log('WARN', warning));
  client.on('error', (error) => log('ERROR', error));
}

function createClient() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    makeCache: () => new Collection(),
    sweepers: {
      messages: { interval: 3600, lifetime: 1800 },
    },
  });

  client.commands = new Collection();
  attachDiagnostics(client);
  return client;
}


async function attemptLogin(client) {
  log('Starting Discord login...');
  const loginPromise = client.login(config.token);
  const loginTimeout = new Promise((resolve) => setTimeout(resolve, 10000));
  const timedOut = await Promise.race([loginPromise.then(() => false), loginTimeout.then(() => true)]);

  if (timedOut) {
    log('Discord login timeout.');
    await runLoginDiagnostics();
  }

  await loginPromise;
}

async function start() {
  log('Startup initiated');
  const db = await measure('Database', async () => initDatabase(log));

  while (true) {
    const client = createClient();
    client.db = db;

    const [commandsLoaded, eventsLoaded] = await Promise.all([
      measure('Commands', async () => loadCommands(client)),
      measure('Events', async () => loadEvents(client, log)),
    ]);

    log(`Commands loaded: ${commandsLoaded}`);
    log(`Events registered: ${eventsLoaded}`);

    try {
      await measure('Discord Login', async () => attemptLogin(client));
      break;
    } catch (error) {
      log('Discord login failed:', error?.message || error);
      if (client && typeof client.destroy === 'function') {
        await client.destroy();
      }
      log('Retrying Discord login in 30 seconds...');
      await delay(30000);
    }
  }

  log('Startup complete');
  startupRecords.forEach((record) => log(`${record.name}: ${record.duration}ms`));
}

start().catch((error) => {
  log('Fatal startup error:', error?.message || error);
  process.exitCode = 1;
});
