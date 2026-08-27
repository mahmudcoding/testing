export default async ({page}) => {
  const id='C4QBPRIVATE0001';
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const banner = () => page.evaluate(()=>{
    const els=[...document.querySelectorAll('*')].filter(e=>{
      const r=e.getBoundingClientRect(); if(r.width<50||r.height<10) return false;
      const t=(e.innerText||''); return /Pinned message|View all \(/i.test(t) && t.length<160 && e.children.length<8;
    });
    const e=els[els.length-1];
    return e?{text:(e.innerText||'').replace(/\s+/g,' ').slice(0,120), h:Math.round(e.getBoundingClientRect().height)}:null;
  });
  const pinnedApi = () => page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/messaging/channels/${id}/messages/pinned`,{credentials:'include'});
    const j=await r.json(); return {s:r.status, total:j?.total??j?.data?.total??null,
      n:(j?.messages||j?.data?.messages||[]).length};
  }, id);
  const b0 = await banner(), p0 = await pinnedApi();
  // ensure a message exists
  let ids = await page.evaluate(()=>[...document.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id')));
  if(!ids.length){
    await page.click(sel); await page.keyboard.type('QA-B-P1 pin target',{delay:15});
    await page.waitForTimeout(300); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
    ids = await page.evaluate(()=>[...document.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id')));
  }
  const mid = ids[ids.length-1];
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1800);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(x=>/more/i.test(x.getAttribute('aria-label')||''))?.click();}, mid);
  await page.waitForTimeout(1200);
  const menu = await page.evaluate(()=>[...document.querySelectorAll('[role=menuitem]')]
    .filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()));
  const didPin = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[role=menuitem]')].find(b=>/^pin/i.test((b.innerText||'').trim()));
    if(!el) return false; el.click(); return true;
  });
  await page.waitForTimeout(3500);
  // a confirm dialog may appear
  const confirm = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0);
    if(!d.length) return null;
    const btns=[...d[0].querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim());
    const yes=[...d[0].querySelectorAll('button')].find(b=>/^(pin|confirm|yes|ok)/i.test((b.innerText||'').trim()));
    if(yes) yes.click();
    return {text:(d[0].innerText||'').replace(/\s+/g,' ').slice(0,120), btns, clickedYes:!!yes};
  });
  await page.waitForTimeout(3500);
  const b1 = await banner(), p1 = await pinnedApi();
  return {mid, menu, b0, p0, didPin, confirm, b1, p1};
};
