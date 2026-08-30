/* Clear the browser session and enter a call through a guest link. */
import { DOM, safeClick } from './lib.mjs';
export default async ({ page, ctx }) => {
  const out={};
  await ctx.clearCookies();
  await page.goto(process.env.QA_LINK, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.evaluate(DOM);
  out.screen1 = await page.evaluate(()=>{
    const q=window.__qa;
    return {url:location.href, text:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,700),
      btns:[...document.querySelectorAll('button,a')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,45),t:n.getAttribute('data-testid')})),
      inputs:[...document.querySelectorAll('input')].filter(q.vis).map(n=>({ph:n.placeholder,type:n.type}))};
  });
  const name = process.env.QA_GUESTNAME;
  if (name) {
    const inp = await page.$('input[type=text]:not([readonly])');
    if (inp) { await inp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await inp.type(name); out.typed=name; }
    await page.waitForTimeout(600);
    await page.evaluate(DOM);
    out.go = await page.evaluate(()=>window.__qa.clickDeepest(/^(Join|Continue|Next)/i));
    await page.waitForTimeout(9000);
    await page.evaluate(DOM);
    out.screen2 = await page.evaluate(()=>{
      const q=window.__qa;
      return {url:location.href, text:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,600),
        btns:[...document.querySelectorAll('button')].filter(q.vis).map(n=>q.nameOf(n).slice(0,40))};
    });
  }
  return out;
};
