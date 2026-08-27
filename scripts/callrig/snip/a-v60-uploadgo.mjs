const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,150);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,48),s:r.status(),res:b});}});
  out.dialogBtns = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return d?[...d.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,24),dis:b.disabled})):[];},VS);
  const go = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    const b=[...d.querySelectorAll('button')].filter(vis).find(b=>/^(Upload|Start upload|Start|Confirm)/i.test((b.innerText||'').trim())&&!b.disabled);
    if(!b) return null; const r=b.getBoundingClientRect(); return {t:b.innerText.trim().slice(0,20),x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.go=go;
  if(go){ await page.mouse.click(go.x,go.y); await page.waitForTimeout(9000); }
  out.requests=net;
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/files',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.filesPage = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { hasFile:/v60-upload/i.test(m.innerText||''), txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,280) };},VS);
  return out;
};
