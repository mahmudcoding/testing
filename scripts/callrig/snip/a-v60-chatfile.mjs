const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
const F='/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/v60-upload.txt';
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\/(files|messaging)/.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,140);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,44),s:r.status(),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const inp = (await page.$$('input[type=file]'))[0];
  out.hasInput=!!inp;
  if(!inp) return out;
  await inp.setInputFiles(F);
  await page.waitForTimeout(4000);
  // send
  const comp = await page.$('div[contenteditable="true"][aria-label="Compose message"]');
  if(comp){ await comp.click(); await page.keyboard.type('V60-SHAREDFILE',{delay:14}); }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  out.requests=net;
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis).slice(-2).map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(-60));
    return { tail:m };},VS);
  out.sharedFileId = (net.find(n=>/files\/upload/.test(n.u))?.res||'').match(/"id":"([^"]+)"/)?.[1] ?? null;
  return out;
};
