const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/pin/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,100);}catch(e){}
    net.push({u:u.split('/api/v1/')[1]?.slice(0,40),s:r.status(),req:(r.request().postData()||'').slice(0,130)});}});
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const rows=[...document.querySelectorAll('[data-testid="participant-row"]')];
    const a=rows.find(r=>/QA Alice/.test(r.innerText||''));
    const b=a?[...a.querySelectorAll('button')].find(b=>/Participant actions/i.test(b.getAttribute('aria-label')||'')):null;
    if(!b) return null; const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  if(!pos) return {err:'no alice row menu'};
  await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(1800);
  const t = await page.evaluate((vs)=>{const vis=eval(vs);
    const c=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/for everyone$/.test((e.innerText||'').trim()))[0];
    if(!c) return null; const r=c.getBoundingClientRect();
    return {txt:c.innerText.trim(),x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.item=t;
  if(t){ await page.mouse.click(t.x,t.y); await page.waitForTimeout(4000); }
  out.requests=net;
  return out;
};
