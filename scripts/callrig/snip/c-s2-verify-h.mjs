export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const target=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    return els[els.length-2].getAttribute('data-message-id');});
  const el=page.locator(`main [data-message-id="${target}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  await el.locator('button[aria-label="Reply"]').first().click();
  await page.waitForTimeout(4500);
  const state=()=>page.evaluate(()=>{
    const vis=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const hints=[...document.querySelectorAll('*')].filter(e=>e.children.length===0)
      .filter(e=>/to send/i.test(e.textContent||''))
      .map(e=>({t:(e.textContent||'').trim().slice(0,44), x:Math.round(e.getBoundingClientRect().left),
        visible:vis(e), ariaHidden:e.getAttribute('aria-hidden')}));
    const md=[...document.querySelectorAll('button[aria-label="Markdown formatting"]')]
      .map(b=>({pressed:b.getAttribute('aria-pressed'), x:Math.round(b.getBoundingClientRect().left)}));
    return {hints, md};});
  out.onOpen=await state();
  // click Bold in the THREAD composer (the right-hand one)
  const bolds=page.locator('button[aria-label="Bold"]');
  out.boldCount=await bolds.count();
  if(out.boldCount){ await bolds.last().click(); await page.waitForTimeout(1600); }
  out.afterBold=await state();
  // now send with Enter and see whether it sends
  const comps=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const n=await comps.count();
  const tc=comps.nth(n-1);
  await tc.click(); await tc.type('QA-V2-THR check',{delay:35}); await page.waitForTimeout(500);
  const before=await page.evaluate(()=>document.querySelectorAll('[data-message-id]').length);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.afterEnter={nodesBefore:before,
    nodesAfter:await page.evaluate(()=>document.querySelectorAll('[data-message-id]').length),
    composer:await tc.evaluate(e=>e.innerText.replace(/\s+/g,' ').slice(0,30))};
  await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(4000);
  out.afterCmdEnter={nodes:await page.evaluate(()=>document.querySelectorAll('[data-message-id]').length),
    composer:await tc.evaluate(e=>e.innerText.replace(/\s+/g,' ').slice(0,30))};
  return out;
};
