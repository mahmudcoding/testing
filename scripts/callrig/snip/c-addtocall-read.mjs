export default async ({page}) => {
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Add to call"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(2500);
  const dump = () => page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    if(!d) return null;
    const rows=[...d.querySelectorAll('li,[role="option"],label')].filter(e=>/QA (Bob|Carol|Dave|Owner|Admin|Guest|Outsider)/.test(e.textContent||''));
    const seen=new Set(); const uniq=[];
    for(const r of rows){ const k=(r.textContent||'').replace(/\s+/g,' ').trim(); if(seen.has(k))continue; seen.add(k);
      const cb=r.querySelector('input[type=checkbox],[role="checkbox"]');
      uniq.push({txt:k.slice(0,70), cbDisabled: cb? cb.disabled : 'nocb', cbChecked: cb? cb.checked : null}); }
    return {rows:uniq.slice(0,10), inviteBtn:[...d.querySelectorAll('button')].filter(b=>/^Invite/i.test((b.textContent||'').trim())).map(b=>({l:b.textContent.trim(), d:b.disabled}))};
  });
  const s=[];
  for (const t of [0, 20000, 45000]) {
    if (t) await page.waitForTimeout(t===20000?20000:25000);
    s.push({tSec: t/1000, ...(await dump())});
  }
  out.samples=s;
  return out;
};
