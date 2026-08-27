const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const PAGE = `() => { const vis=(${VIS});
  const main=document.querySelector('main')||document.body;
  const rows=[...main.querySelectorAll('tr')].filter(vis).slice(1);
  const sig=rows.map(r=>[...r.querySelectorAll('td')].slice(0,4).map(c=>(c.innerText||'').trim()).join('|'));
  const btns=[...main.querySelectorAll('button')].filter(vis)
    .map(b=>({ t:(b.innerText||'').trim(), dis:b.disabled===true })).filter(x=>/Previous|Next/.test(x.t));
  return { rowCount: rows.length, first: sig[0]||'', last: sig[sig.length-1]||'', all: sig, buttons: btns }; }`;
export default async ({ page }) => {
  const net=[];
  page.on('request', r => { const u=r.url(); if(/admin\/audit-log/.test(u) && u.includes('/api/'))
    net.push(u.replace(/^https?:\/\/[^/]+/,'').slice(0,110)); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  const p1 = await page.evaluate(`(${PAGE})()`);
  const next = page.locator('button:has-text("Next")').first();
  await next.scrollIntoViewIfNeeded(); await next.click(); await page.waitForTimeout(4000);
  const p2 = await page.evaluate(`(${PAGE})()`);
  const prev = page.locator('button:has-text("Previous")').first();
  await prev.scrollIntoViewIfNeeded(); await prev.click(); await page.waitForTimeout(4000);
  const p1b = await page.evaluate(`(${PAGE})()`);
  const overlap = p1.all.filter(x=>p2.all.includes(x));
  return {
    page1: { rows:p1.rowCount, first:p1.first.slice(0,60), buttons:p1.buttons },
    page2: { rows:p2.rowCount, first:p2.first.slice(0,60), buttons:p2.buttons },
    backToPage1: { rows:p1b.rowCount, first:p1b.first.slice(0,60) },
    page1MatchesAfterPrevious: JSON.stringify(p1.all)===JSON.stringify(p1b.all),
    rowsAppearingOnBothPages: overlap.length,
    requests: net
  };
};
