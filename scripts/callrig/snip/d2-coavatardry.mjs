const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const PATH = process.env.D2_PATH, FILE = process.env.D2_FILE;
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,46)} -> ${r.status()}`); });
  await page.goto('https://airion-cargo.store'+PATH, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const out={};
  net.length=0;
  const inp = page.locator('input[type=file]').first();
  out.inputFound = await inp.count();
  if (out.inputFound) { await inp.setInputFiles(FILE); await page.waitForTimeout(3500); }
  out.dialog = await page.evaluate(`(() => { const vis=(${VIS});
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return d ? (d.innerText||'').replace(/\\n+/g,' | ').slice(0,140) : '(no dialog)'; })()`);
  // CANCEL — do not apply, do not save
  const cancel = page.locator('[role=dialog] button:has-text("Cancel")').first();
  out.cancelFound = await cancel.count();
  if (out.cancelFound) { await cancel.click().catch(()=>{}); await page.waitForTimeout(2500); }
  out.requestsMade = net;
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2500);
  out.afterReload = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return { images:[...main.querySelectorAll('img')].filter(vis).map(i=>(i.getAttribute('src')||'').slice(0,50)),
             saveBar:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)) }; })()`);
  return out;
};
