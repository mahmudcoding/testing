export default async ({ctx}) => {
  const tok = process.env.QA_TOKEN;
  const runs=[];
  for (const [label, wait] of [['t=0s (right after previous joiner)',0], ['t=+75s quiet',75], ['t=+150s quiet',75]]) {
    if (wait) { const p0=await ctx.newPage(); await p0.waitForTimeout(wait*1000); await p0.close(); }
    const p = await ctx.newPage();
    const tag='qaW'+Date.now();
    const toasts=[];
    await p.exposeFunction(tag, t=>toasts.push({t, at:Date.now()}));
    await p.addInitScript((tag)=>{ const seen=new Set();
      setInterval(()=>{document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]').forEach(e=>{
        const t=e.innerText.replace(/\n+/g,' ').trim(); if(t&&!seen.has(t)){seen.add(t); window[tag]&&window[tag](t.slice(0,140));}});},150);}, tag);
    await p.goto('https://airion-cargo.store/join/'+tok,{waitUntil:'domcontentloaded'});
    await p.waitForTimeout(2500);
    await p.fill('input[type=text]', 'W '+label.slice(0,10));
    toasts.length=0;
    const t0=Date.now();
    await p.locator('button',{hasText:/Join call|Ask to join/}).first().click();
    await p.waitForTimeout(9000);
    await p.close();
    runs.push({label, at:new Date(t0).toISOString(), toasts: toasts.map(x=>({ms:x.at-t0, t:x.t}))});
  }
  return runs;
};
