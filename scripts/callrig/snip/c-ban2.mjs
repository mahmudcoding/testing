export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/ban|invite|participant/i.test(u)&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,140);}catch(e){} net.push({m:r.request().method(),u:u.replace('https://airion-cargo.store',''),s:r.status(),b});}});
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  const opened = await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Participants"]')].find(x=>x.getClientRects().length); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(3000);
  out.opened=opened;
  out.aria = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>b.getAttribute('aria-label')).filter(l=>l&&/participant|action/i.test(l)));
  const rows = await page.$$('button[aria-label="Participant actions"]');
  out.rows=rows.length;
  if (!rows.length) { out.panelText = await page.evaluate(()=>{const d=[...document.querySelectorAll('aside,section,[role="dialog"]')].filter(e=>e.getClientRects().length&&/participants/i.test(e.innerText||'')).pop(); return d?(d.innerText||'').replace(/\n+/g,' | ').slice(0,250):null;}); return out; }
  await rows[rows.length-1].click(); await page.waitForTimeout(1800);
  out.menu = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).map(x=>(x.textContent||'').trim()).filter(t=>/ban|remove|co-host/i.test(t)));
  out.banClicked = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^Ban$/i.test((x.textContent||'').trim())); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(1800);
  out.dialog = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop();
    return d? {t:(d.innerText||'').replace(/\n+/g,' | ').slice(0,260), b:[...d.querySelectorAll('button')].map(x=>(x.textContent||'').trim()).filter(Boolean)}:null;});
  await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop();
    if(d){const b=[...d.querySelectorAll('button')].find(x=>/^ban$/i.test((x.textContent||'').trim())); if(b)b.click();}});
  await page.waitForTimeout(4000);
  out.net=net;
  return out;
};
