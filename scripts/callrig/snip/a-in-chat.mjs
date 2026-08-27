export default async ({page}) => {
  const TXT = process.env.QA_TEXT || 'incall-check-1';
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-chat-toggle'); if(b)b.click();});
  await page.waitForTimeout(2500);
  const panel = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    return p?{text:(p.innerText||'').replace(/\n+/g,' | ').slice(0,300),
      inputs:[...p.querySelectorAll('[contenteditable="true"],input,textarea')].map(i=>i.getAttribute('aria-label')||i.getAttribute('placeholder')||i.tagName),
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,22))).slice(0,12)}:{err:'no panel'};
  });
  if (process.env.QA_SEND) {
    const ed = await page.$('[data-testid="call-side-panel-slot"] [contenteditable="true"]');
    if (ed) { await ed.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
      await page.keyboard.type(TXT,{delay:20}); await page.waitForTimeout(400); await page.keyboard.press('Enter');
      await page.waitForTimeout(3000); }
    panel.afterSend = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
      return p?(p.innerText||'').replace(/\n+/g,' | ').slice(-260):null;});
  }
  return panel;
};
