const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const state = async (tag) => await page.evaluate((t) => {
    const c = [...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    const send = [...document.querySelectorAll('button[aria-label="Send"]')].pop();
    return {tag:t, url:location.href, composerText: c? c.innerText.replace(/\n/g,'\\n').slice(0,120):null,
      composerHTML: c? c.innerHTML.slice(0,220):null,
      focused: document.activeElement === c ? 'composer' : (document.activeElement.getAttribute?.('aria-label')||document.activeElement.tagName),
      sendDisabled: send? send.disabled : null,
      msgCount: document.querySelectorAll('[data-message-id]').length,
      dialogs: [...document.querySelectorAll('[role="dialog"]')].map(d=>d.innerText.replace(/\n+/g,' | ').slice(0,100))};
  }, tag);
  const r = [];
  r.push(await state('initial'));
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  r.push(await state('after-clear'));
  await comp.type('QA-S2-PLAIN-1');
  r.push(await state('after-type'));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  r.push(await state('after-enter'));
  return r;
};
