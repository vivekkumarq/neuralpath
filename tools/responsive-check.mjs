// Responsive check over real device viewports, driven straight over CDP.
// Node 24 has a global WebSocket, so this needs no dependencies.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const BASE = process.env.BASE || 'http://127.0.0.1:4321';

const VIEWPORTS = [
  { name: 'iphone-se', width: 375, height: 667, dsf: 2, mobile: true },
  { name: 'iphone-14', width: 390, height: 844, dsf: 3, mobile: true },
  { name: 'pixel-7', width: 412, height: 915, dsf: 2.6, mobile: true },
  { name: 'ipad-mini', width: 768, height: 1024, dsf: 2, mobile: true },
  { name: 'ipad-pro', width: 1024, height: 1366, dsf: 2, mobile: true },
  { name: 'laptop', width: 1440, height: 900, dsf: 1, mobile: false },
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'topic', path: '/learn/machine-learning/linear-and-logistic-regression' },
  { name: 'module', path: '/learn/machine-learning' },
  { name: 'interview', path: '/interview' },
  { name: 'roadmap', path: '/roadmap' },
];

const profile = mkdtempSync(join(tmpdir(), 'np-cdp-'));
const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--disable-extensions',
  '--no-first-run',
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + profile,
  'about:blank',
]);
chrome.stderr.on('data', () => {});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targetUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('devtools never came up');
}

const ws = new WebSocket(await targetUrl());
await new Promise((r) => (ws.onopen = r));

let seq = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++seq;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

await send('Page.enable');

const findings = [];
for (const vp of VIEWPORTS) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.dsf,
    mobile: vp.mobile,
  });

  for (const page of PAGES) {
    await send('Page.navigate', { url: BASE + page.path });
    await sleep(1400);

    const { result } = await send('Runtime.evaluate', {
      expression: `(() => {
        const d = document.documentElement;
        // The sidebar is deliberately parked off-canvas when the drawer is
        // closed, so it and its contents are not overflow.
        const drawer = document.querySelector('app-sidebar');
        const over = [...document.querySelectorAll('body *')]
          .filter((el) => {
            if (drawer && (el === drawer || drawer.contains(el))) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > d.clientWidth + 1 || r.left < -1);
          })
          .slice(0, 4)
          .map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : ''));
        const small = [...document.querySelectorAll('a,button')]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;
            // WCAG 2.5.8 exempts links sitting inside a line of prose.
            if (el.tagName === 'A' && el.closest('p, li, .body')) return false;
            return r.height < 24 || r.width < 24;
          }).length;
        return JSON.stringify({
          scrollW: d.scrollWidth,
          clientW: d.clientWidth,
          over,
          small,
        });
      })()`,
      returnByValue: true,
    });

    const data = JSON.parse(result.value);
    // The page is the thing that must not scroll sideways. A wide child inside
    // its own scroll container (a code block, a table) is by design, so only
    // document overflow fails; `over` is just the diagnostic for why.
    const overflow = data.scrollW > data.clientW + 1;
    if (overflow) {
      findings.push(`${vp.name} ${page.name}: scrollW=${data.scrollW} clientW=${data.clientW} ${data.over.join(', ')}`);
    }
    if (data.small > 0) {
      findings.push(`${vp.name} ${page.name}: ${data.small} target(s) under 24px`);
    }
    console.log(
      `${overflow || data.small ? 'FAIL' : ' ok '} ${vp.name.padEnd(10)} ${page.name.padEnd(10)} ${data.scrollW}/${data.clientW}  tiny-targets=${data.small}`,
    );
  }
}

// One phone screenshot to look at.
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 1500, deviceScaleFactor: 2, mobile: true });
await send('Page.navigate', { url: BASE + '/' });
await sleep(1600);
const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync('.phone.png', Buffer.from(shot.data, 'base64'));

console.log('\n' + (findings.length ? 'PROBLEMS:\n' + findings.join('\n') : 'no overflow at any viewport'));
ws.close();
chrome.kill();
