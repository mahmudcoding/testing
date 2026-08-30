/* sector L: open the guest link in a fresh (anonymous) browser context and report the landing */
import { DOM, HOOK } from './lib.mjs';
const TOKEN='c1e0f7ee6f14fde843da4aa63b2dbb97fa3f07ae4559eab0dfea5059687c7d75';
export default async ({ browser }) => {
  const out={};
  let ctx;
  try { ctx = await browser.newContext(); out.newContext='ok'; }
  catch(e){ return {newContext:'FAILED: '+String(e.message).slice(0,160)}; }
  const page = await ctx.newPage();
  await ctx.addInitScript(HOOK);
  await page.goto(`https://airion-cargo.store/guest/c/${TOKEN}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);
  out.url = page.url();
  out.landing = await page.evaluate(()=>{
    const q=window.__qa;
    return {title:document.title,
      text:(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').trim().slice(0,600),
      buttons:[...document.querySelectorAll('button')].filter(q.vis).map(b=>({n:q.nameOf(b).replace(/\s+/g,' ').trim().slice(0,40), t:b.getAttribute('data-testid')||null})),
      inputs:[...document.querySelectorAll('input,textarea')].filter(q.vis).map(i=>({ph:i.placeholder, name:q.nameOf(i).slice(0,40), t:i.getAttribute('data-testid')||null, type:i.type})),
      testids:[...new Set([...document.querySelectorAll('[data-testid]')].filter(q.boxVis).map(n=>n.getAttribute('data-testid')))].slice(0,40)};
  });
  out.keepOpen = true;
  return out;
};
