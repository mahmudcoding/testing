export default async ({ page }) => {
  const msg = process.env.QA_MSG || 'hello from the call';
  await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-chat-toggle"]'); if(b) b.click(); });
  await page.waitForTimeout(2200);
  const typed = await page.evaluate((m) => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const box = [...document.querySelectorAll('textarea,[contenteditable="true"],input[type=text]')].filter(v).pop();
    if (!box) return 'no-input';
    if (box.tagName === 'TEXTAREA' || box.tagName === 'INPUT') {
      const proto = box.tagName==='TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto,'value').set.call(box, '');
      box.dispatchEvent(new Event('input',{bubbles:true}));
      Object.getOwnPropertyDescriptor(proto,'value').set.call(box, m);
      box.dispatchEvent(new Event('input',{bubbles:true}));
    } else { box.textContent = ''; box.focus();
      document.execCommand && document.execCommand('insertText', false, m); }
    return box.tagName; }, msg);
  await page.waitForTimeout(600);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const sent = await page.evaluate(m => (document.body.innerText||'').includes(m), msg);
  return { typedInto: typed, appears: sent };
};
