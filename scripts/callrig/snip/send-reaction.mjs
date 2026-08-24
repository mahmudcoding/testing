export default async ({page}) => {
  const netlog=[];
  page.on('request', r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET') netlog.push(`${r.method()} ${u.replace('https://airion-cargo.store','')} :: ${(r.postData()||'').slice(0,120)}`);});
  let pop=(await page.$$('[role="menu"],[data-radix-popper-content-wrapper]')).pop();
  if(!pop){ const t=await page.$('[data-testid="call-controls-live-reaction"]'); if(t){await t.click(); await page.waitForTimeout(1500);} pop=(await page.$$('[role="menu"],[data-radix-popper-content-wrapper]')).pop(); }
  if(!pop) return {err:'no picker'};
  const items = await pop.$$('button');
  for (const it of items) { const t=(await it.innerText()).trim(); if (t==='🎉') { await it.click(); break; } }
  const seen=[];
  for (let i=0;i<8;i++){
    await page.waitForTimeout(500);
    const s = await page.evaluate(()=>{
      const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      const hits=[...ov.querySelectorAll('*')].filter(e=>e.children.length===0 && /🎉|👏|👍|❤️|😂|😮/.test(e.textContent||'')).map(e=>e.textContent.trim().slice(0,12));
      return hits.slice(0,5);
    });
    if (s.length) seen.push(`t+${(i+1)*500}ms: ${JSON.stringify(s)}`);
  }
  return {net: netlog, seenOnSender: seen};
};
