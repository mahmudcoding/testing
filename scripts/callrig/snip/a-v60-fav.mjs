const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/favorite|favourite|files/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,120);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,48),s:r.status(),res:b});}});
  // hover the file row to reveal actions
  const row = page.locator('*', { hasText: /^v60-upload\.txt/ }).last();
  const box = await row.boundingBox().catch(()=>null);
  out.rowBox = box;
  if(box){ await page.mouse.move(box.x+box.width/2, box.y+box.height/2); await page.waitForTimeout(1200); }
  out.actions = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,30))
      .filter(a=>/favor|star|more|download|share|delete|rename/i.test(a)).slice(0,10);},VS);
  const favBtn = await page.evaluate((vs)=>{const vis=eval(vs);
    const b=[...document.querySelectorAll('button')].filter(vis).find(b=>/favor|star/i.test(b.getAttribute('aria-label')||''));
    if(!b) return null; const r=b.getBoundingClientRect();
    return {al:b.getAttribute('aria-label'),pressed:b.getAttribute('aria-pressed'),x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.favBtn=favBtn;
  if(favBtn){ await page.mouse.click(favBtn.x,favBtn.y); await page.waitForTimeout(3500); }
  out.requests=net;
  // check Favorites filter
  await page.locator('button', { hasText: /^Favorites$/ }).first().click().catch(()=>{});
  await page.waitForTimeout(3000);
  out.favView = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { hasFile:/v60-upload/i.test(m.innerText||''), txt:(m.innerText||'').replace(/\s+/g,' ').slice(-180) };},VS);
  out.apiFav = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/files?workspace_id=W4QAF1XTURESO01&scope=own',{credentials:'include'});
    const j=await r.json().catch(()=>null); const a=j?.files||j?.data||(Array.isArray(j)?j:[]);
    const f=(a||[]).find(x=>/v60-upload/.test(x.filename||''));
    return f? Object.fromEntries(Object.entries(f).filter(([k])=>/fav|star|id|filename/i.test(k))) : {none:true, keys:Object.keys(j||{})};});
  return out;
};
