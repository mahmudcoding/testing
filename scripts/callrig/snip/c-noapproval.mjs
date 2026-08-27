export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{ if(/\/meeting\//.test(r.url()) && r.request().method()!=='GET'){ net.push({s:r.status(), req:(r.request().postData()||'').slice(0,90)}); }});
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Meeting settings"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(2500);
  const r = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    const s=[...d.querySelectorAll('[role="switch"]')].find(x=>/require approval/i.test(x.getAttribute('aria-label')||''));
    if(!s) return 'no switch'; if(s.getAttribute('aria-checked')==='false') return 'already off'; s.click(); return 'clicked';
  });
  await page.waitForTimeout(1200);
  const saved = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    const b=[...d.querySelectorAll('button')].find(x=>/^save$/i.test((x.textContent||'').trim()));
    if(!b||b.disabled) return {ok:false, dis:b?b.disabled:null}; b.click(); return {ok:true};
  });
  await page.waitForTimeout(2500);
  await page.keyboard.press('Escape');
  return {r, saved, net};
};
