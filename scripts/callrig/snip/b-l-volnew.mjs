/* sector L: does the Call volume setting apply to a participant who joins AFTER it is set? */
import { DOM } from './lib.mjs';
import { second } from './b-second.mjs';
const audio = async (page) => page.evaluate(()=>{
  const els=[...document.querySelectorAll('audio')];
  const s=document.querySelector('[data-testid="audio-mix-slider-main"]');
  return {count:els.length, vols:els.map(a=>a.volume), slider:s?s.value:null,
    tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].map(n=>(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,22))};
});
const setVol = async (page, v) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(()=>{const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim())); b&&b.click();});
  await page.waitForTimeout(1500);
  const r = await page.evaluate((val)=>{
    const s=document.querySelector('[data-testid="audio-mix-slider-main"]');
    if(!s) return {ok:false};
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(s,String(val)); s.dispatchEvent(new Event('input',{bubbles:true})); s.dispatchEvent(new Event('change',{bubbles:true}));
    return {ok:true, v:s.value};
  }, v);
  await page.waitForTimeout(1500);
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  return r;
};
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.set = await setVol(page, 30);
  out.a_after_set = await audio(page);
  // dave leaves and rejoins -> carol resubscribes to a new remote audio track
  const dave = await second('B','dave');
  await dave.page.evaluate(DOM);
  out.daveLeave = await dave.page.evaluate(async ()=>{
    const q=window.__qa;
    const b=document.querySelector('[data-testid="call-controls-leave"]');
    if(!b) return {ok:false}; b.click(); return {ok:true};
  });
  await dave.page.waitForTimeout(1800);
  out.daveConfirm = await dave.page.evaluate(()=>{
    const c=document.querySelector('[data-testid="call-leave-confirm-submit"]');
    if(!c) return {ok:false, dialog:(document.querySelector('[role=dialog]')||{}).innerText||null};
    c.click(); return {ok:true};
  });
  await dave.page.waitForTimeout(6000);
  out.daveUrl = dave.page.url();
  out.b_daveGone = await audio(page);
  // dave rejoins
  await dave.page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/call/V4P254XBZ5W3KPN',{waitUntil:'domcontentloaded'});
  await dave.page.waitForTimeout(7000);
  await dave.page.evaluate(DOM);
  const lj = await dave.page.evaluate(()=>{const b=document.querySelector('[data-testid="lobby-join"]'); if(!b) return false; b.click(); return true;});
  out.daveRejoinedVia = lj?'lobby-join':'direct';
  await dave.page.waitForTimeout(9000);
  out.c_daveBack = await audio(page);
  await page.waitForTimeout(4000);
  out.d_settled = await audio(page);
  await dave.browser.close();
  return out;
};
