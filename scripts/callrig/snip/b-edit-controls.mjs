export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID;
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  const composerBtns = () => page.evaluate((s)=>{
    const c=document.querySelector(s); if(!c) return null;
    // walk up to the composer container
    let box=c; for(let i=0;i<6&&box.parentElement;i++) box=box.parentElement;
    const r0=box.getBoundingClientRect();
    return {containerRect:{y:Math.round(r0.y),h:Math.round(r0.height)},
      btns:[...box.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0;})
        .map(b=>({label:(b.getAttribute('aria-label')||'').trim(), text:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24),
                  type:b.getAttribute('type')||'', x:Math.round(b.getBoundingClientRect().x)}))};
  }, sel);
  const base = await composerBtns();
  // enter edit mode
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1600);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(b=>/more/i.test(b.getAttribute('aria-label')||''))?.click();}, mid);
  await page.waitForTimeout(900);
  await page.evaluate(()=>{[...document.querySelectorAll('[role=menuitem]')].find(b=>/^edit/i.test((b.innerText||'').trim()))?.click();});
  await page.waitForTimeout(1800);
  const editing = await composerBtns();
  const banner = await page.evaluate(()=>{
    const els=[...document.querySelectorAll('*')].filter(e=>{
      const r=e.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      const t=(e.innerText||''); return /edit(ing)?\s*message|editing/i.test(t) && t.length<80 && e.children.length<4;
    });
    return els.slice(0,3).map(e=>({tag:e.tagName, text:(e.innerText||'').replace(/\s+/g,' ').slice(0,60)}));
  });
  return {mid, baseBtns: base?.btns, editingBtns: editing?.btns, banner};
};
