const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/pin/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,120);}catch(e){}
    net.push({m:r.request().method(),s:r.status(),req:(r.request().postData()||'').slice(0,120),res:b});}});
  const pinState = () => page.evaluate(async()=>{
    const id=location.pathname.split('/call/')[1];
    const r=await fetch('/api/v1/meeting/'+id,{credentials:'include'});
    const j=await r.json().catch(()=>null); const m=j?.meeting||j;
    return Object.fromEntries(Object.entries(m||{}).filter(([k])=>/pin/i.test(k)));});
  // open participants and pin the other person for everyone
  const has = await page.evaluate((vs)=>{const vis=eval(vs);const l=document.querySelector('[data-testid="participants-list"]');return !!l&&vis(l);},VS);
  if(!has){ await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2600); }
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const rows=[...document.querySelectorAll('[data-testid="participant-row"]')];
    const other=rows.find(r=>!/\(you\)/.test(r.innerText||''));
    const b=other?[...other.querySelectorAll('button')].find(b=>/Participant actions/i.test(b.getAttribute('aria-label')||'')):null;
    if(!b) return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  if(!pos) return {noMenu:true};
  await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(1800);
  const item = await page.evaluate((vs)=>{const vis=eval(vs);
    const c=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/^Pin .* for everyone$/.test((e.innerText||'').trim()))[0];
    if(!c) return null; const r=c.getBoundingClientRect(); return {t:c.innerText.trim(),x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.pinItem=item;
  if(item){ await page.mouse.click(item.x,item.y); await page.waitForTimeout(4500); }
  out.pinRequests=net;
  out.serverPinAfterSet = await pinState();
  // force a call refetch: toggle panels repeatedly, then reload
  for(let i=0;i<6;i++){ await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(400); }
  await page.waitForTimeout(2500);
  out.serverPinAfterChurn = await pinState();
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(12000);
  out.serverPinAfterReload = await pinState();
  return out;
};
