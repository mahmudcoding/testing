// Verify pass: host creates a PRIVATE Side Room, ticking exactly one invitee.
export default async ({ page }) => {
  const NAME = process.env.QA_ROOM||'VROOM DELTA';
  const INV  = process.env.QA_INVITEE||'QA Carol';
  const out={name:NAME}; const net=[];
  page.on('request', r=>{ const u=r.url(); if(/\/api\/v1\//.test(u) && r.method()==='POST' && /breakout-rooms$/.test(u.split('?')[0]))
    net.push({m:r.method(), u:u.split('/api/v1/')[1].slice(0,60), body:(r.postData()||'').slice(0,240)}); });
  page.on('response', async r=>{ const u=r.url(); if(/\/api\/v1\//.test(u) && r.request().method()==='POST' && /breakout-rooms$/.test(u.split('?')[0])){
    let b=null; try{ b=(await r.text()).slice(0,260);}catch(e){}
    net.push({s:r.status(), res:b}); }});

  const newBtn = page.locator('[data-testid="side-rooms-new"]');
  if(!(await newBtn.count())){ await page.locator('button[aria-label="Side Rooms"]').first().click(); await page.waitForTimeout(2600); }
  await page.locator('[data-testid="side-rooms-new"]').first().click();
  await page.waitForTimeout(2200);
  await page.fill('[role="dialog"] input[type="text"]', NAME);
  await page.waitForTimeout(400);
  await page.locator('[data-testid="side-room-create-private"]').first().click();
  await page.waitForTimeout(900);
  out.visibility = await page.evaluate(()=>['public','private'].map(k=>{
    const b=document.querySelector('[data-testid="side-room-create-'+k+'"]'); return k+'='+(b?b.getAttribute('aria-checked'):'?');}));
  const inv = page.locator('[data-testid="side-room-create-invitee"]').filter({hasText:INV}).first();
  if(await inv.getAttribute('aria-checked') !== 'true') await inv.click();
  await page.waitForTimeout(700);
  out.invitees = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="side-room-create-invitee"]')]
    .map(b=>(b.textContent||'').replace(/\s+/g,' ').trim().slice(0,18)+' checked='+b.getAttribute('aria-checked')));
  await page.locator('[data-testid="side-room-create-submit"]').first().click();
  await page.waitForTimeout(6000);
  out.net=net;
  return out;
};
