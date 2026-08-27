const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  // raw API read, unfiltered
  out.api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QAGENERAL0001/messages?limit=40',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const a=Array.isArray(j)?j:(j?.messages??j?.data??[]);
    return { status:r.status, shape:Array.isArray(j)?'array':Object.keys(j||{}).slice(0,6),
             n:Array.isArray(a)?a.length:null,
             bodies:(a||[]).slice(-8).map(x=>(x.body||'').slice(0,46)) };});
  // reload = server truth in the UI
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4200);
  out.afterReload = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis);
    return { n:m.length, tail:m.slice(-6).map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(-46)) };},VS);
  out.failStillShown = /V60-FAIL/.test(JSON.stringify(out.afterReload));
  out.okStillShown   = /V60-OK/.test(JSON.stringify(out.afterReload));
  return out;
};
