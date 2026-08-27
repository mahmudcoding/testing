const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  // --- ALK-3495: scroll-to-bottom button visible while already at the bottom
  out.alk3495=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const sc=[...document.querySelectorAll('main *')].filter(e=>e.scrollHeight>e.clientHeight+40)[0];
    const btns=[...document.querySelectorAll('button')].filter(vis)
      .filter(b=>/scroll|bottom|latest|newest/i.test((b.getAttribute('aria-label')||'')+' '+(b.textContent||'')));
    return {atBottom: sc? (sc.scrollHeight - sc.scrollTop - sc.clientHeight):null,
      scrollerFound:!!sc,
      buttons:btns.map(b=>({l:b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,20),
        y:Math.round(b.getBoundingClientRect().y)}))};});
  // --- ALK-3103: long link in a thread reply
  const parent=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-T3103 parent', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(7000);
  const tc=page.locator('div[contenteditable="true"]').last();
  await empty(page, tc);
  const longUrl='https://example.com/'+'segment/'.repeat(22)+'end';
  await tc.type('QA-S2-T3103 '+longUrl, {delay:12}); await page.waitForTimeout(600);
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  out.alk3103=await page.evaluate(()=>{
    const inner=window.innerWidth;
    const e=[...document.querySelectorAll('[data-message-id]')].reverse()
      .find(x=>/QA-S2-T3103/.test(x.innerText||'') && x.getBoundingClientRect().x>900);
    if(!e) return 'reply not found in panel';
    const r=e.getBoundingClientRect();
    const leaves=[...e.querySelectorAll('*')].filter(x=>x.children.length===0)
      .filter(x=>{const rr=x.getBoundingClientRect();return rr.width>20;})
      .map(x=>{const cs=getComputedStyle(x); const rr=x.getBoundingClientRect();
        return {t:(x.textContent||'').trim().slice(0,20), w:Math.round(rr.width), right:Math.round(rr.right),
          sw:x.scrollWidth, cw:x.clientWidth, ws:cs.whiteSpace, ov:cs.textOverflow};});
    return {innerWidth:inner, rowRight:Math.round(r.right), rowOverflows:r.right>inner,
      docScrollW:document.documentElement.scrollWidth, docOverflows:document.documentElement.scrollWidth>inner,
      offscreenLeaves:leaves.filter(l=>l.right>inner).length, leaves:leaves.slice(0,6)};});
  return out;
};
