const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/breakout/.test(u)&&r.request().method()!=='GET'){
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,52),s:r.status(),req:(r.request().postData()||'').slice(0,110)});}});
  await page.keyboard.press('Escape').catch(()=>{});
  const nb = page.locator('button',{hasText:/^New Side Room$/}).first();
  if(!(await nb.count())){ await page.locator('button[aria-label="Side Rooms"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); }
  await page.locator('button',{hasText:/^New Side Room$/}).first().click();
  await page.waitForTimeout(2600);
  // ALK-3330: who does the invite list offer right now?
  out.inviteListBefore = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return [...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26))
      .filter(t=>/QA |Visitor/.test(t));},VS);
  const ti=await page.$('input[placeholder="e.g. Design sync"]');
  if(ti){ await ti.click(); await page.keyboard.type('Batch Room',{delay:20}); }
  await page.waitForTimeout(500);
  await page.locator('button',{hasText:/^Create room$/}).first().click();
  await page.waitForTimeout(7000);
  out.createRequests=net.slice();
  // ALK-3349: inside the room, can the occupant read its own permissions / room settings?
  out.insideRoom = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { panel:(d.innerText||'').replace(/\s+/g,' ').slice(0,220),
      tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/Batch Room|Quarterly/.test(t)).slice(0,3),
      toolbar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,24)).filter(Boolean).slice(-12),
      // ALK-3210/3212: is there a self preview tile inside the room?
      videos:[...document.querySelectorAll('video')].map(v=>({w:Math.round(v.getBoundingClientRect().width),vw:v.videoWidth})),
      selfLabel:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length<=2&&/\(you\)/.test(e.innerText||''))
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)).slice(0,3) };},VS);
  return out;
};
