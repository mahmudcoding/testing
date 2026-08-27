export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button',{hasText:/^Start now$/}).first().click();
  await page.waitForTimeout(2500);
  const ti=await page.$('[role="dialog"] input'); if(ti){ await ti.click(); await page.keyboard.type('QA-C-SOLO',{delay:15}); }
  await page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first().click();
  await page.waitForTimeout(9000);
  out.callId=(await page.evaluate(()=>location.pathname)).split('/call/')[1];
  out.participants = await page.evaluate(async (id)=>{
    const r=await (await fetch(`/api/v1/meeting/${id}/participants`,{credentials:'include'})).text().catch(()=>null);
    const c=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
    return {cur: c.meeting?{id:c.meeting.id,status:c.meeting.status}:null, p:(r||'').slice(0,200)};
  }, out.callId);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Leave call"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(1800);
  out.dialog = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop();
    return d? {t:(d.innerText||'').replace(/\n+/g,' | ').slice(0,300), b:[...d.querySelectorAll('button')].map(x=>(x.textContent||'').trim()).filter(Boolean)}:null;});
  await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop();
    if(d){const b=[...d.querySelectorAll('button')].find(x=>/^leave$/i.test((x.textContent||'').trim())); if(b)b.click();}});
  await page.waitForTimeout(5000);
  out.after = await page.evaluate(async (id)=>{
    const m=await (await fetch(`/api/v1/meeting/${id}`,{credentials:'include'})).text();
    const a=await (await fetch(`/api/v1/workspace/W4QCF1XTURESO01/meetings/active`,{credentials:'include'})).text();
    return {meeting: (m.match(/"status":"[a-z]+"/)||[''])[0] + ' ' + ((m.match(/"ended_at":"[^"]*"/)||[''])[0]), active: a.slice(0,120)};
  }, out.callId);
  return out;
};
