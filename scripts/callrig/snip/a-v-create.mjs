// Verify pass: host creates a Side Room, ticking exactly one invitee.
// QA_ROOM = name, QA_INVITEE = display-name regex, QA_PRIVATE = 1 for private.
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const NAME = process.env.QA_ROOM||'VROOM';
  const INV  = new RegExp(process.env.QA_INVITEE||'QA Bob');
  const PRIV = process.env.QA_PRIVATE === '1';
  const out = {name:NAME, private:PRIV}; const net=[];
  page.on('request', r=>{ const u=r.url(); if(/\/api\/v1\//.test(u) && r.method()!=='GET' && /breakout|room|invite|meeting/i.test(u))
    net.push({m:r.method(), u:u.split('/api/v1/')[1].slice(0,70), body:(r.postData()||'').slice(0,300)}); });
  page.on('response', async r=>{ const u=r.url(); if(/\/api\/v1\//.test(u) && r.request().method()!=='GET' && /breakout|room|invite|meeting/i.test(u)){
    let b=null; try{ b=(await r.text()).slice(0,300);}catch(e){}
    net.push({resFor:u.split('/api/v1/')[1].slice(0,70), s:r.status(), res:b}); }});

  // open the Side Rooms panel if it is not already open
  const panelOpen = await page.evaluate((vs)=>{const vis=eval(vs);
    return !!document.querySelector('[data-testid="side-rooms-new"]') && vis(document.querySelector('[data-testid="side-rooms-new"]'));},VS);
  if(!panelOpen){
    await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-controls-breakout-rooms"]'); if(b)b.click();});
    await page.waitForTimeout(2500);
  }
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="side-rooms-new"]'); if(b)b.click();});
  await page.waitForTimeout(2200);
  await page.fill('[role="dialog"] input[type="text"]', NAME);
  await page.waitForTimeout(400);

  // visibility choice — enumerate what the dialog actually offers
  out.visibilityControls = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    return [...d.querySelectorAll('button,[role="radio"],[role="switch"]')].filter(vis)
      .map(b=>((b.getAttribute('data-testid')||'')+'|'+(b.textContent||'').replace(/\s+/g,' ').trim().slice(0,40)+'|checked='+(b.getAttribute('aria-checked')??b.getAttribute('aria-pressed')??'-')));},VS);
  if(PRIV){
    await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
      const b=[...d.querySelectorAll('button,[role="radio"]')].filter(vis).find(x=>/private/i.test(x.textContent||''));
      if(b)b.click();},VS);
    await page.waitForTimeout(800);
  }

  // tick exactly the one invitee
  await page.evaluate((src)=>{const re=new RegExp(src);
    [...document.querySelectorAll('[data-testid="side-room-create-invitee"]')].forEach(x=>{
      const on = x.getAttribute('aria-checked')==='true';
      const want = re.test(x.textContent||'');
      if(on!==want) x.click();
    });}, INV.source);
  await page.waitForTimeout(700);
  out.invitees = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="side-room-create-invitee"]')]
    .map(b=>(b.textContent||'').replace(/\s+/g,' ').trim().slice(0,18)+' checked='+b.getAttribute('aria-checked')));
  out.dialogText = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    return d?(d.innerText||'').replace(/\n+/g,' | ').slice(0,400):null;},VS);

  await page.evaluate(()=>{const b=document.querySelector('[data-testid="side-room-create-submit"]'); if(b)b.click();});
  await page.waitForTimeout(6000);
  out.net = net;
  return out;
};
