const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('request', r=>{ if(/\/api\/v1\/messaging\/messages$/.test(r.url())) net.push({ph:'req',m:r.method(),body:(r.postData()||'').slice(0,60)}); });
  page.on('requestfailed', r=>{ if(/\/api\/v1\/messaging\/messages$/.test(r.url())) net.push({ph:'FAILED',err:r.failure()?.errorText}); });
  page.on('response', r=>{ if(/\/api\/v1\/messaging\/messages$/.test(r.url())) net.push({ph:'resp',s:r.status()}); });

  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const type = async (txt) => { const c=await page.$('div[contenteditable="true"][aria-label="Compose message"]');
    await c.click(); await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta'); await page.keyboard.press('Backspace');
    await page.keyboard.type(txt,{delay:12}); await page.keyboard.press('Enter'); };
  const st = () => page.evaluate((vs)=>{const vis=eval(vs);const main=document.querySelector('[data-testid="app-shell-main-column"]');
    return { tail:[...document.querySelectorAll('[data-message-id]')].filter(vis).slice(-2).map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(-42)),
      errs:[...(main?.querySelectorAll('*')||[])].filter(e=>vis(e)&&e.children.length===0&&/failed|not sent|retry|try again|couldn.t send/i.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,40)) };},VS);

  const A='V60-A-'+Math.floor(Date.now()/1000%100000);
  await page.route('**/api/v1/messaging/messages', r=>r.abort('failed'));
  await type(A+' blocked'); await page.waitForTimeout(4000);
  out.A_duringOutage = await st();
  out.netAfterA = net.slice();

  await page.unroute('**/api/v1/messaging/messages');
  await page.waitForTimeout(1500);
  net.length=0;
  const B='V60-B-'+Math.floor(Date.now()/1000%100000);
  await type(B+' after-restore');
  const poll=[]; for(let i=0;i<16;i++){ poll.push({t:i*500,...(await st())}); await page.waitForTimeout(500); }
  out.B_last = poll[poll.length-1];
  out.B_anyError = poll.find(p=>p.errs.length)?.errs ?? null;
  out.netAfterB = net.slice();
  out.tags={A,B};
  out.apiTruth = await page.evaluate(async([A,B])=>{
    const r=await fetch('/api/v1/messaging/channels/C4QAGENERAL0001/messages?limit=100',{credentials:'include'});
    const j=await r.json().catch(()=>null); const a=j?.messages||[];
    const nA=A.split('-')[2], nB=B.split('-')[2];
    return { total:a.length, hasA:a.some(x=>(x.body||'').includes(nA)), hasB:a.some(x=>(x.body||'').includes(nB)) };},[A,B]);
  return out;
};
