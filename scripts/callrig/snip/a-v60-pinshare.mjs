const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/pin/i.test(u)&&r.request().method()!=='GET'){
    net.push({u:u.split('/api/v1/')[1]?.slice(0,44),s:r.status(),req:(r.request().postData()||'').slice(0,140)});}});
  const b = page.locator('button[aria-label="Pin QA Alice\'s screen"]').first();
  out.found = await b.count()>0;
  if(!out.found){
    const pos = await page.evaluate((vs)=>{const vis=eval(vs);
      const lbl=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/screen$/i.test((e.innerText||'').trim()))[0];
      if(!lbl) return null; const r=lbl.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
    if(pos){ await page.mouse.move(pos.x,pos.y); await page.waitForTimeout(1400); }
  }
  const b2 = page.locator('button[aria-label^="Pin "]').first();
  out.label = await b2.getAttribute('aria-label').catch(()=>null);
  if(await b2.count()){ await b2.click(); await page.waitForTimeout(3500); }
  out.requests=net;
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { pinBtns:[...document.querySelectorAll('button[aria-label]')].filter(vis).map(b=>b.getAttribute('aria-label')).filter(a=>/pin/i.test(a||'')).slice(0,4),
      videos:[...document.querySelectorAll('video')].map(v=>Math.round(v.getBoundingClientRect().width)),
      mainTxt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,140) };},VS);
  return out;
};
