export default async ({ page }) => {
  const msg = process.env.QA_MSG || 'hello';
  // ensure the chat panel is open
  let has = await page.evaluate(() => !!document.querySelector('textarea[placeholder="Message everyone"]'));
  if (!has) {
    await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-chat-toggle"]'); if(b) b.click(); });
    await page.waitForTimeout(2200);
    has = await page.evaluate(() => !!document.querySelector('textarea[placeholder="Message everyone"]'));
  }
  if (!has) return { error: 'composer not found' };
  const set = await page.evaluate(m => {
    const t = document.querySelector('textarea[placeholder="Message everyone"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;
    setter.call(t, ''); t.dispatchEvent(new Event('input',{bubbles:true}));
    setter.call(t, m); t.dispatchEvent(new Event('input',{bubbles:true}));
    return t.value; }, msg);
  await page.waitForTimeout(600);
  const sendState = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Send');
    return b ? { disabled: b.disabled } : 'no-send'; });
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Send');
    if (b && !b.disabled) b.click(); });
  await page.waitForTimeout(2500);
  return { typed: set, sendState,
           appears: await page.evaluate(m => (document.body.innerText||'').includes(m), msg) };
};
