export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{ if(/\/meeting\//.test(r.url()) && r.request().method()!=='GET'){ net.push({s:r.status(), req:(r.request().postData()||'').slice(0,80)}); }});
  let has = await page.evaluate(()=>[...document.querySelectorAll('[role="dialog"]')].some(d=>d.getClientRects().length && /MEMBER PERMISSIONS/i.test(d.innerText||'')));
  if (!has) { await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Meeting settings"]')].find(x=>x.getClientRects().length); if(b)b.click();});
    await page.waitForTimeout(2500); }
  const r = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    const all=[...d.querySelectorAll('*')];
    const head=all.find(e=>e.children.length===0 && /^MICROPHONE$/i.test((e.textContent||'').trim()));
    if(!head) return 'no head';
    const w=document.createTreeWalker(d, NodeFilter.SHOW_ELEMENT); let seen=false,t=null;
    while(w.nextNode()){const n=w.currentNode; if(n===head) seen=true;
      if(seen&&n.tagName==='BUTTON'&&/^Allowed$/i.test((n.textContent||'').trim())){t=n;break;}}
    if(!t) return 'no allowed'; t.click(); return 'ok';
  });
  await page.waitForTimeout(2500);
  await page.keyboard.press('Escape');
  return {r, net};
};
