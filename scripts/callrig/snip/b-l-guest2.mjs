/* sector L: join as an anonymous guest and enumerate the guest client's media surface */
import { DOM, HOOK, RTC_STATS } from './lib.mjs';
const TOKEN='c1e0f7ee6f14fde843da4aa63b2dbb97fa3f07ae4559eab0dfea5059687c7d75';
const guestCtx = async (browser) => {
  const extra = browser.contexts().slice(1);
  if(extra.length){ const c=extra[extra.length-1];
    const p=c.pages().find(x=>x.url().includes('airion-cargo.store'))||c.pages()[0]||await c.newPage();
    return {ctx:c, page:p, reused:true}; }
  const c=await browser.newContext(); await c.addInitScript(HOOK);
  const p=await c.newPage();
  return {ctx:c, page:p, reused:false};
};
export default async ({ browser }) => {
  const out={};
  const g = await guestCtx(browser);
  out.reused = g.reused;
  const page = g.page;
  if(!/\/(join|guest|call)\//.test(page.url())){
    await page.goto(`https://airion-cargo.store/guest/c/${TOKEN}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7000);
  }
  await page.evaluate(DOM);
  out.urlBefore = page.url();
  // fill the name and join, if we are still on the landing
  const needsJoin = await page.evaluate(()=>!!document.querySelector('input[type=text]'));
  if(needsJoin){
    await page.evaluate(()=>{const i=document.querySelector('input[type=text]'); i&&i.focus();});
    await page.keyboard.type('Guest Lane B');
    await page.waitForTimeout(500);
    out.joinClick = await page.evaluate(()=>window.__qa.clickDeepest(/^Join call$/i));
    await page.waitForTimeout(9000);
    await page.evaluate(DOM);
  }
  out.urlAfter = page.url();
  out.surface = await page.evaluate(()=>{
    const q=window.__qa;
    return {text:(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').trim().slice(0,400),
      buttons:[...document.querySelectorAll('button')].filter(q.vis).map(b=>({n:q.nameOf(b).replace(/\s+/g,' ').trim().slice(0,42),
        t:b.getAttribute('data-testid')||null, p:b.getAttribute('aria-pressed'), d:b.disabled})),
      tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].map(n=>{const r=n.getBoundingClientRect();
        return {who:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,26), w:Math.round(r.width), h:Math.round(r.height),
          video:!!n.querySelector('video')};}),
      testids:[...new Set([...document.querySelectorAll('[data-testid]')].filter(q.boxVis).map(n=>n.getAttribute('data-testid')))].slice(0,45),
      videos:[...document.querySelectorAll('video')].map(v=>({vw:v.videoWidth,vh:v.videoHeight,paused:v.paused})),
      audios:[...document.querySelectorAll('audio')].length};
  });
  const r = await page.evaluate(`(${RTC_STATS})()`);
  out.rtc = {pcs:r.pcs, gum:r.gum, out:r.stats.flatMap(s=>s.out).map(o=>({k:o.kind,b:o.bytes})),
    in:r.stats.flatMap(s=>s.in).map(o=>({k:o.kind,b:o.bytes,fd:o.framesDec}))};
  return out;
};
