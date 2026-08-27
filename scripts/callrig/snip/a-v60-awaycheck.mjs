const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return (j?.email??'').split('@')[0];});
  const btn = await page.evaluate((vs)=>{const vis=eval(vs);
    const b=[...document.querySelectorAll('button')].filter(vis).find(b=>/Will be right back|I'm back/i.test(b.getAttribute('aria-label')||''));
    return b?{label:b.getAttribute('aria-label'),pressed:b.getAttribute('aria-pressed')}:null;},VS);
  // ensure participants panel open
  const hasPanel = await page.evaluate((vs)=>{const vis=eval(vs);
    return !!document.querySelector('[data-testid="participants-list"]') &&
      vis(document.querySelector('[data-testid="participants-list"]'));},VS);
  if(!hasPanel){ await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); }
  const rows = await page.evaluate((vs)=>{const vis=eval(vs);
    const list=document.querySelector('[data-testid="participants-list"]');
    if(!list) return {noList:true};
    return { header:(list.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,60),
      rows:[...list.querySelectorAll('[data-testid="participant-row"]')].map(r=>({
        txt:(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,44),
        svgCount:r.querySelectorAll('svg').length,
        ariaLabels:[...r.querySelectorAll('[aria-label],[title]')].map(e=>e.getAttribute('aria-label')||e.getAttribute('title')).slice(0,6),
        dim: getComputedStyle(r).opacity })) };},VS);
  return { who, ownButton:btn, participants:rows };
};
