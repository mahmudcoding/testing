export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/ban|invite|participant/i.test(u)&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,140);}catch(e){} net.push({m:r.request().method(),u:u.replace('https://airion-cargo.store',''),s:r.status(),b});}});
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Participants"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(2200);
  const btns = await page.$$('button[aria-label="Participant actions"]');
  out.rows = btns.length;
  if (btns.length<2) return out;
  await btns[1].click(); await page.waitForTimeout(1600);
  out.banClicked = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^Ban$/i.test((x.textContent||'').trim())); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(1800);
  out.dialog = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop();
    return d? {t:(d.innerText||'').replace(/\n+/g,' | ').slice(0,260), b:[...d.querySelectorAll('button')].map(x=>(x.textContent||'').trim()).filter(Boolean)}:null;});
  await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop();
    if(d){const b=[...d.querySelectorAll('button')].find(x=>/^ban$/i.test((x.textContent||'').trim())); if(b)b.click();}});
  await page.waitForTimeout(4000);
  out.net=net;
  out.unbanSearch = await page.evaluate(()=>{
    const txt=(document.body.innerText||'');
    return {wordsBan:(txt.match(/[^\n]*\bban[^\n]*/gi)||[]).slice(0,5),
      buttonsWithBan:[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length&&/ban/i.test((b.getAttribute('aria-label')||b.textContent||''))).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim())};
  });
  return out;
};
