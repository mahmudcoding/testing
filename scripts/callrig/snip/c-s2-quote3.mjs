export default async ({page}) => {
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  const replyA = page.locator('[data-message-id]').filter({hasText:'QA-S2-QT-REPLY-A'}).last();
  await replyA.hover(); await page.waitForTimeout(700);
  await page.locator('button[aria-label="Reply here"]').last().click({timeout:8000});
  await page.waitForTimeout(1800);
  out.chip = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    let box=c; for(let i=0;i<6&&box;i++) box=box.parentElement;
    return {text: box? box.innerText.replace(/\n+/g,' | ').slice(0,180):null,
      buttons: box? [...box.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(t=>/quote|clear|reply/i.test(t)):[]};
  });
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.type('QA-S2-QT-QUOTING');
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.sent = await page.evaluate(async ()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-QT-QUOTING/.test(m.innerText||'')).pop();
    return el? {id:el.getAttribute('data-message-id'), text:el.innerText.replace(/\n+/g,' | ').slice(0,160),
      buttons:[...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean)}:null;
  });
  return out;
};
