export default async ({ page }) => {
  const probe = async (len) => page.evaluate(n => {
    const e = document.querySelector('[data-testid="meeting-settings-name-input"]');
    if (!e || e.getBoundingClientRect().width===0) return null;
    const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
    s.call(e, ''); e.dispatchEvent(new Event('input',{bubbles:true}));
    s.call(e, 'N'.repeat(n)); e.dispatchEvent(new Event('input',{bubbles:true}));
    const b = document.querySelector('[data-testid="meeting-settings-save"]');
    return { len: e.value.length, saveDisabled: b ? b.disabled : null }; }, len);
  const out = [];
  for (const n of [40, 60, 64, 65, 80, 100, 120, 128, 129, 150]) {
    const r = await probe(n); await page.waitForTimeout(350);
    out.push({ n, saveDisabled: r && r.saveDisabled });
  }
  // with a too-long value in place, look for any explanation
  await probe(200); await page.waitForTimeout(900);
  const explain = await page.evaluate(() => {
    const e = document.querySelector('[data-testid="meeting-settings-name-input"]');
    let n = e, ctx = null, h = 0;
    while (n && h < 5) { n = n.parentElement; h++;
      if (n && /too long|maximum|max |characters|символ|длин/i.test(n.innerText||'')) {
        ctx = n.innerText.replace(/\n+/g,' | ').slice(0,140); break; } }
    return { nearby: ctx,
             ariaInvalid: e.getAttribute('aria-invalid'),
             describedBy: e.getAttribute('aria-describedby'),
             anyErrorRole: [...document.querySelectorAll('[role="alert"]')]
               .filter(x=>x.getBoundingClientRect().height>0).map(x=>x.innerText.slice(0,60)),
             bodyMentions: /too long|maximum length|characters? (left|max)/i.test(document.body.innerText) };
  });
  return { boundary: out, whenTooLong: explain };
};
