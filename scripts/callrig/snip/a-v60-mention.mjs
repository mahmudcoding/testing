const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/messaging\/messages$/.test(u)&&r.request().method()==='POST'){
    let b=null;try{b=(await r.text()).slice(0,220);}catch(e){}
    net.push({req:(r.request().postData()||'').slice(0,220),s:r.status(),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const c = await page.$('div[contenteditable="true"][aria-label="Compose message"]');
  await c.click();
  await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta'); await page.keyboard.press('Backspace');
  await page.keyboard.type('V60-MENTION ', {delay:16});
  await page.keyboard.type('@qa_b', {delay:110});
  await page.waitForTimeout(2500);
  out.suggestions = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('[role="option"],[role="listbox"] *,li')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)).filter(t=>/qa/i.test(t)).slice(0,5);},VS);
  await page.keyboard.press('Enter');           // accept the mention
  await page.waitForTimeout(1200);
  out.composerAfterPick = await page.evaluate(()=>document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')?.innerText?.slice(0,50));
  await page.keyboard.type(' hello', {delay:16});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3500);
  out.sent = net;
  out.rendered = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis).slice(-1)[0];
    if(!m) return null;
    const links=[...m.querySelectorAll('a,[data-mention],[class*="mention"]')].map(a=>({t:(a.innerText||'').trim().slice(0,20),href:a.getAttribute('href')||'',dm:a.getAttribute('data-mention')||''}));
    return { txt:(m.innerText||'').replace(/\s+/g,' ').slice(-60), links };},VS);
  return out;
};
