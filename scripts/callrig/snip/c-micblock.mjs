export default async ({page}) => {
  const out={};
  // settings panel should be open from the previous read; ensure it is
  let has = await page.evaluate(()=>[...document.querySelectorAll('[role="dialog"]')].some(d=>d.getClientRects().length && /MEMBER PERMISSIONS/i.test(d.innerText||'')));
  if (!has) { await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Meeting settings"]')].find(x=>x.getClientRects().length); if(b)b.click();});
    await page.waitForTimeout(2500); }
  out.deviceButtons = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    const txt=(d.innerText||''); const idx=txt.indexOf('MICROPHONE');
    return {section: txt.slice(idx, idx+180).replace(/\n+/g,' | '),
      btns:[...d.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(l=>/allowed|blocked|on request/i.test(l))};
  });
  const net=[];
  page.on('response', async r=>{ if(/\/meeting\//.test(r.url()) && r.request().method()!=='GET'){ net.push({m:r.request().method(), s:r.status(), req:(r.request().postData()||'').slice(0,100)}); }});
  // click "Blocked" in MICROPHONE section (first Blocked button after MICROPHONE heading)
  out.clicked = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    const all=[...d.querySelectorAll('*')];
    const head=all.find(e=>e.children.length===0 && /^MICROPHONE$/i.test((e.textContent||'').trim()));
    if(!head) return 'no MICROPHONE heading';
    // walk forward in document order to the first "Blocked" button
    const walker=document.createTreeWalker(d, NodeFilter.SHOW_ELEMENT);
    let seen=false, target=null;
    while(walker.nextNode()){ const n=walker.currentNode;
      if(n===head) seen=true;
      if(seen && n.tagName==='BUTTON' && /^Blocked$/i.test((n.textContent||'').trim())){ target=n; break; } }
    if(!target) return 'no Blocked button after MICROPHONE';
    target.click(); return 'clicked';
  });
  await page.waitForTimeout(3000);
  out.net = net;
  return out;
};
