const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('request', r=>{ if(/\/api\/v1\/messaging\/messages$/.test(r.url())) net.push('req'); });
  page.on('response', r=>{ if(/\/api\/v1\/messaging\/messages$/.test(r.url())) net.push('resp'+r.status()); });
  const truth = () => page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QAGENERAL0001/messages?limit=100',{credentials:'include'});
    const j=await r.json().catch(()=>null); const a=j?.messages||[];
    return { total:a.length, hasA:a.some(x=>(x.body||'').includes('44613')), hasB:a.some(x=>(x.body||'').includes('44619')) };});
  out.t0 = await truth();
  await page.waitForTimeout(60000);              // 60s idle — does the outbox flush?
  out.after60s = await truth();
  out.netDuringWait = net.slice();
  // does a reload recover it?
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000);
  out.afterReload_truth = await truth();
  out.afterReload_dom = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis);
    return { n:m.length, hasA:/44613/.test(document.body.innerText), hasB:/44619/.test(document.body.innerText),
             tail:m.slice(-3).map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(-40)) };},VS);
  // and does the composer work again after a reload?
  const C='V60-C-'+Math.floor(Date.now()/1000%100000);
  net.length=0;
  const c=await page.$('div[contenteditable="true"][aria-label="Compose message"]');
  await c.click(); await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta'); await page.keyboard.press('Backspace');
  await page.keyboard.type(C+' post-reload',{delay:12}); await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);
  out.postReloadNet = net.slice();
  out.postReloadOnServer = await page.evaluate(async([C])=>{
    const r=await fetch('/api/v1/messaging/channels/C4QAGENERAL0001/messages?limit=100',{credentials:'include'});
    const j=await r.json().catch(()=>null); return (j?.messages||[]).some(x=>(x.body||'').includes(C.split('-')[2]));},[C]);
  out.tagC=C;
  return out;
};
