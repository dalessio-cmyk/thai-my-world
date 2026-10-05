// Dependency-free bundle for Cloudflare's single-file dashboard editor.
import {readFile, writeFile} from 'node:fs/promises';
const root = new URL('../backend/', import.meta.url);
const live = (await readFile(new URL('gemini-live.js', root), 'utf8')).replace('export async function geminiLive', 'async function geminiLive');
const worker = (await readFile(new URL('cloudflare-worker.js', root), 'utf8')).replace("import { geminiLive } from './gemini-live.js';", '');
const output = process.argv[2];
if (!output) throw new Error('Usage: node scripts/bundle-worker.mjs /path/to/worker.js');
await writeFile(output, live + '\n' + worker);
