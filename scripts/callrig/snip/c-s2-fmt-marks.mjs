const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  if (!page.url().includes(CH)) { await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(4000); }
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const out = [];
  const marks = [['Bold','QA-S2-BOLD'],['Italic','QA-S2-ITAL'],['Strikethrough','QA-S2-STRIKE'],['Insert code','QA-S2-CODE']];
  for (const [label, txt] of marks) {
    await comp.click();
    await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await comp.type('pre ');
    const btn = page.locator(`button[aria-label="${label}"]`).last();
    const before = await btn.getAttribute('aria-pressed');
    await btn.click();
    await page.waitForTimeout(300);
    const after = await btn.getAttribute('aria-pressed');
    await comp.type(txt);
    const html = await comp.evaluate(e => e.innerHTML.slice(0,300));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1800);
    out.push({label, pressedBefore:before, pressedAfter:after, composerHTML:html});
  }
  const api = await page.evaluate(async (ch) => {
    const r = await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=6`,{credentials:'include'});
    const j = await r.json();
    return (j.messages||j.data||[]).map(m=>({body:m.body, id:m.id})).slice(0,6);
  }, CH);
  const dom = await page.evaluate(() => [...document.querySelectorAll('[data-message-id]')].slice(-5).map(m=>({
    text: m.innerText.replace(/\n+/g,' | ').slice(0,120),
    html: m.innerHTML.match(/<(strong|em|s|del|code|b|i)[^>]*>[^<]*<\/\1>/g) || []
  })));
  return {out, api, dom};
};
