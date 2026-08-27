const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const ui = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return [...m.querySelectorAll('tr')].filter(vis).map(r=>[...r.querySelectorAll('td,th')]
      .map(c=>(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,24))).filter(r=>r.length>2).slice(0,6);},VS);
  const api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/workspaces/W4QAF1XTURESO01/invites',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const a=j?.invites||j?.data||(Array.isArray(j)?j:[]);
    return { status:r.status, rows:(a||[]).map(x=>({id:(x.id||'').slice(-5),roles:x.role_ids,status:x.status})) };});
  return { afterReload: ui, api };
};
