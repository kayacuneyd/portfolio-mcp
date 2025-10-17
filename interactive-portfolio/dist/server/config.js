import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
function createCache() {
    let cache = {};
    return {
        get(key) {
            const item = cache[key];
            if (!item)
                return null;
            if (Date.now() - item.ts > CACHE_TTL_MS)
                return null;
            return item.data;
        },
        set(key, data) {
            cache[key] = { data, ts: Date.now() };
        },
        clear() {
            cache = {};
        },
    };
}
const cache = createCache();
const here = path.dirname(new URL(import.meta.url).pathname);
let root = path.resolve(here, '..');
if (root.endsWith('/dist') || root.endsWith('\\dist')) {
    root = path.resolve(root, '..');
}
async function readJSON(filePath) {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
}
async function readYAML(filePath) {
    const raw = await fs.readFile(filePath, 'utf8');
    return yaml.load(raw);
}
async function readText(filePath) {
    return fs.readFile(filePath, 'utf8');
}
export async function loadProfile() {
    const key = 'profile';
    const hit = cache.get(key);
    if (hit)
        return hit;
    const p = path.join(root, 'data', 'profile.yaml');
    const data = await readYAML(p);
    cache.set(key, data);
    return data;
}
export async function loadFaq() {
    const key = 'faq';
    const hit = cache.get(key);
    if (hit)
        return hit;
    const p = path.join(root, 'data', 'faq.md');
    const data = await readText(p);
    cache.set(key, data);
    return data;
}
export async function loadPrompts() {
    const key = 'prompts';
    const hit = cache.get(key);
    if (hit)
        return hit;
    const p = path.join(root, 'config', 'prompts.json');
    const data = await readJSON(p);
    cache.set(key, data);
    return data;
}
export async function loadTheme() {
    const key = 'theme';
    const hit = cache.get(key);
    if (hit)
        return hit;
    const p = path.join(root, 'config', 'theme.json');
    const data = await readJSON(p);
    cache.set(key, data);
    return data;
}
