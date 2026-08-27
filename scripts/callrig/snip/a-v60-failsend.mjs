const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const type = async (txt) => {
    const c=await page.$('div[contenteditable="true"][aria-label="Compose message"]');
    await c.click();
    await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta'); await page.keyboard.press('Backspace');
    await page.keyboard.type(txt,{delay:14}); await page.keyboard.press('Enter');
  };
  const state = () => page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis);
    const main=document.querySelector('[data-testid="app-shell-main-column"]');
    return { n:m.length, tail:m.slice(-3).map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(-50)),
      failedMarkers:[...(main?.querySelectorAll('*')||[])].filter(e=>vis(e)&&e.children.length===0&&/failed|not sent|retry|try again|couldn.t send/i.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,44)),
      composer:(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')?.innerText||'').slice(0,40) };},VS);

  // 1) block sends, try to send FAIL-1
  await page.route('**/api/v1/messaging/messages', r => r.abort('failed'));
  const t1='V60-FAIL-'+Math.floor(Date.now()/1000%100000);
  await type(t1+' should-fail');
  const p1=[]; for(let i=0;i<10;i++){ p1.push({t:i*450,...(await state())}); await page.waitForTimeout(450); }
  out.duringOutage = p1[p1.length-1];
  out.failMarkerSeen = p1.find(p=>p.failedMarkers.length)?.failedMarkers ?? null;

  // 2) restore the network, send a NEW message — is the queue wedged?
  await page.unroute('**/api/v1/messaging/messages');
  const t2='V60-OK-'+Math.floor(Date.now()/1000%100000);
  await type(t2+' should-send');
  const p2=[]; for(let i=0;i<14;i++){ p2.push({t:i*500,...(await state())}); await page.waitForTimeout(500); }
  out.afterRestore = p2[p2.length-1];
  out.secondArrived = p2.some(p=>p.tail.some(x=>x.includes(t2)));
  out.tags={t1,t2};
  // 3) server truth
  out.serverHas = await page.evaluate(async([t1,t2])=>{
    const r=await fetch('/api/v1/messaging/channels/C4QAGENERAL0001/messages?limit=30',{credentials:'include'});
    const j=await r.json().catch(()=>null); const a=Array.isArray(j)?j:(j?.messages??j?.data??[]);
    const bodies=(a||[]).map(x=>x.body||'');
    return { t1: bodies.some(b=>b.includes(t1.split('-')[2])), t2: bodies.some(b=>b.includes(t2.split('-')[2])) };},[t1,t2]);
  return out;
};
