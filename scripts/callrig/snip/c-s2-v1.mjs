export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6500);
  const parent=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-V1PARENT', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(7000);
  const readHints=()=>page.evaluate(()=>{
    const all=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0)
      .map(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
        let op=1,n=e; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;}
        return {t:(e.textContent||'').trim(), x:Math.round(r.x), y:Math.round(r.y),
          w:Math.round(r.width), h:Math.round(r.height), vis:cs.visibility, disp:cs.display,
          ariaHidden: !!e.closest('[aria-hidden="true"]'),
          invisibleCls: /(^|\s)invisible(\s|$)/.test(e.className||''),
          op:+op.toFixed(2)};})
      .filter(x=>/Enter/.test(x.t)&&x.t.length<64);
    return all;
  });
  out.hintsWithThreadOpen = await readHints();
  // now click a formatting button in the THREAD composer and re-read
  const tc=page.locator('div[contenteditable="true"]').last();
  await tc.click(); await page.waitForTimeout(400);
  const boldInThread=await page.evaluate(()=>{
    const btns=[...document.querySelectorAll('button[aria-label="Bold"]')]
      .filter(b=>b.getBoundingClientRect().x>900);
    if(!btns.length) return null;
    btns[0].setAttribute('data-qa-bold','1'); return true;});
  out.boldInThread=boldInThread;
  if(boldInThread){ await page.locator('[data-qa-bold="1"]').click(); await page.waitForTimeout(1200); }
  out.hintsAfterBold = await readHints();
  return out;
};
