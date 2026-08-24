export default async ({ctx}) => {
  const tok = process.env.QA_TOKEN, name = process.env.QA_GNAME||'Repro Guest';
  const p = await ctx.newPage();
  const tag='qaG'+Date.now();
  const toasts=[];
  await p.exposeFunction(tag, t=>toasts.push({t, at:Date.now()}));
  await p.addInitScript((tag)=>{ const seen=new Set();
    setInterval(()=>{document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]').forEach(e=>{
      const t=e.innerText.replace(/\n+/g,' ').trim(); if(t&&!seen.has(t)){seen.add(t); window[tag]&&window[tag](t.slice(0,140));}});},150);}, tag);
  await p.goto('https://airion-cargo.store/join/'+tok,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(3000);
  await p.fill('input[type=text]', name);
  toasts.length=0;
  const t0=Date.now();
  await p.locator('button',{hasText:/Join call|Ask to join/}).first().click();
  await p.waitForTimeout(11000);
  const inCall = await p.evaluate(()=>!!document.querySelector('[data-testid="call-toolbar"]'));
  await p.close();
  return {inCall, joinClickAt:new Date(t0).toISOString(), toasts: toasts.map(x=>({ms:x.at-t0, t:x.t}))};
};
