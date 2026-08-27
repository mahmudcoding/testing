const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  // send a message through the real composer
  const comp = await page.$('div[contenteditable="true"][aria-label="Compose message"]');
  if(!comp) return {err:'no composer'};
  await comp.click();
  await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta');
  await page.keyboard.press('Backspace');
  const tag = 'V60-SAVED-'+Math.floor(Date.now()/1000%100000);
  await page.keyboard.type(tag+' saved-message probe', {delay:18});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  // find it and open its hover actions
  const info = await page.evaluate((vs)=>{const vis=eval(vs);
    const msgs=[...document.querySelectorAll('[data-message-id]')].filter(vis);
    const last=msgs[msgs.length-1];
    return { count:msgs.length, lastId:last?.getAttribute('data-message-id'), lastText:(last?.innerText||'').replace(/\s+/g,' ').slice(0,70) };},VS);
  // hover last message, enumerate the action buttons
  const el = await page.$(`[data-message-id="${info.lastId}"]`);
  await el.hover(); await page.waitForTimeout(900);
  const actions = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis)
      .map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,32),t:(b.innerText||'').trim().slice(0,20),tid:b.getAttribute('data-testid')||''}))
      .filter(b=>b.al||b.tid).slice(-14);},VS);
  return { tag, info, hoverActions: actions };
};
