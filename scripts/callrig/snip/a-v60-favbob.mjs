const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/files/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,120);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,48),s:r.status(),res:b});}});
  const rowBox = await page.evaluate((vs)=>{const vis=eval(vs);
    const el=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/v60-upload\.txt/.test(e.innerText||''))[0];
    if(!el) return null; const r=el.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.rowBox=rowBox;
  if(rowBox){ await page.mouse.move(rowBox.x,rowBox.y); await page.waitForTimeout(1300); }
  const fav = await page.evaluate((vs)=>{const vis=eval(vs);
    const b=[...document.querySelectorAll('button')].filter(vis).find(b=>/^Favorite$/i.test(b.getAttribute('aria-label')||''));
    if(!b) return null; const r=b.getBoundingClientRect();
    return {pressed:b.getAttribute('aria-pressed'),x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.favBtn=fav;
  if(fav){ await page.mouse.click(fav.x,fav.y); await page.waitForTimeout(3500); }
  out.requests=net;
  out.mine = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/files?workspace_id=W4QAF1XTURESO01&scope=accessible',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    return (j?.files||[]).map(f=>({id:(f.id||'').slice(-6),fav:f.is_favorite,owner:(f.user_id||'').slice(-6)}));});
  return out;
};
