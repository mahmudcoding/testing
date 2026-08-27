export default async ({page}) => {
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const act = (tag) => page.evaluate((t) => {
    const a = document.activeElement;
    const c = [...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    const sel = window.getSelection();
    return {tag:t,
      active: a === c ? 'COMPOSER' : (a.getAttribute?.('aria-label') || a.tagName + (a.className||'').slice(0,20)),
      activeTag: a.tagName,
      selInComposer: sel.rangeCount ? c.contains(sel.anchorNode) : null,
      txt: c.innerText.replace(/\n/g,'\\n').slice(0,60),
      paras: c.querySelectorAll('p').length,
      n: document.querySelectorAll('[data-message-id]').length};
  }, tag);
  const r = [];
  // clean slate
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(200);
  r.push(await act('1-after-click-composer'));
  await page.keyboard.type('pre ');           // no re-focus
  r.push(await act('2-after-type-nofocus'));
  await page.locator('button[aria-label="Bold"]').last().click();
  await page.waitForTimeout(400);
  r.push(await act('3-after-click-Bold'));
  await page.keyboard.type('BOLDTEXT');        // no re-focus — where does it go?
  await page.waitForTimeout(400);
  r.push(await act('4-after-type-nofocus'));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  r.push(await act('5-after-Enter'));
  return r;
};
