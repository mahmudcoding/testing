export default async ({page, ctx}) => {
  const tok = process.env.QA_TOKEN, name = process.env.QA_GNAME||'Clean Guest';
  const tag='qaC'+Date.now();
  const toasts=[];
  await page.exposeFunction(tag, t=>toasts.push({t, at:Date.now()}));
  await ctx.addInitScript((tag)=>{ const seen=new Set();
    setInterval(()=>{document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]').forEach(e=>{
      const t=e.innerText.replace(/\n+/g,' ').trim(); if(t&&!seen.has(t)){seen.add(t); window[tag]&&window[tag](t.slice(0,140));}});},150);}, tag);
  await page.goto('https://airion-cargo.store/join/'+tok,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.fill('input[type=text]', name);
  toasts.length=0;
  const t0=Date.now();
  await page.locator('button',{hasText:/Join call|Ask to join/}).first().click();
  await page.waitForTimeout(11000);
  const st = await page.evaluate(()=>({inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,90)}));
  return {profile: process.env.QA_GNAME, tabsInBrowser: ctx.pages().length,
          inCall: st.inCall, body: st.body, joinedAt: new Date(t0).toISOString(),
          toasts: toasts.map(x=>({ms:x.at-t0, t:x.t}))};
};
