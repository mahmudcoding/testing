const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/storage|quota|workspace/i.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,200);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,48)} -> ${r.status()} ${b.slice(0,130)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/workspaces', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const before = await page.evaluate(`(() => { const m=document.querySelector('main'); const t=(m.innerText||'');
    const i=t.lastIndexOf('\\u203a'); return (i>=0?t.slice(i+1):t).replace(/\\s+/g,' ').trim().slice(0,220); })()`);
  net.length=0;
  const btn = page.locator('button:has-text("Show storage")').first();
  const found = await btn.count();
  if (found) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(4500); }
  const after = await page.evaluate(`(() => { const m=document.querySelector('main'); const t=(m.innerText||'');
    const i=t.lastIndexOf('\\u203a'); return (i>=0?t.slice(i+1):t).replace(/\\s+/g,' ').trim().slice(0,320); })()`);
  return { buttonFound: found, requests: net,
           newText: after.split(' ').filter(w=>!before.includes(w)).join(' ').slice(0,200), after: after.slice(0,300) };
};
