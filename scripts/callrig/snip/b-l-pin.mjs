/* sector L: pin for me / pin for everyone / global pin badge */
import { DOM, RTC_STATS } from './lib.mjs';
const layout = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')];
  const view=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/view$/i.test(q.nameOf(x).trim()));
  return {
    view: view?q.nameOf(view).trim():null,
    tiles: tiles.map(n=>{const r=n.getBoundingClientRect();
      return {who:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,28),
        w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.left),y:Math.round(r.top),
        vis:q.boxVis(n), video:!!n.querySelector('video'),
        badges:[...n.querySelectorAll('[data-testid]')].map(b=>b.getAttribute('data-testid')).filter(t=>/pin|badge/i.test(t))}}),
    globalPinBadges:[...document.querySelectorAll('[data-testid*="pin" i]')].filter(q.boxVis)
      .map(n=>({t:n.getAttribute('data-testid'), text:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)})),
    filmstrip: !!document.querySelector('[data-testid*="filmstrip" i]'),
    notices: q.notices().map(n=>n.text).slice(0,4)
  };
});
const menuPick = async (page, who, item) => page.evaluate(([w,i])=>{
  const q=window.__qa;
  const hit=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(w));
  if(!hit) return {ok:false,why:'no tile'};
  const t=[...hit.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='participant-tile-card-trigger');
  if(!t) return {ok:false,why:'no trigger'};
  t.click();
  return {ok:true};
}, [who,item]);
export default async ({ page }) => {
  await page.evaluate(DOM);
  const who = process.env.QA_TARGET || 'QA Bob';
  const item = process.env.QA_ITEM || 'Pin for me';
  const out={who,item};
  out.a_before = await layout(page);
  const b = out.a_before.tiles.find(t=>t.who.includes(who.split(' ')[1]));
  if(b) { await page.mouse.move(b.x+b.w/2, b.y+b.h/2); await page.waitForTimeout(900); }
  out.trigger = await menuPick(page, who, item);
  await page.waitForTimeout(1300);
  out.menuText = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    return w?(w.innerText||'').replace(/\s+/g,' ').trim().slice(0,300):null;
  });
  out.pick = await page.evaluate((i)=>window.__qa.popperPick(new RegExp(i.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i')), item);
  await page.waitForTimeout(2500);
  out.b_after = await layout(page);
  await page.waitForTimeout(3000);
  out.c_after2 = await layout(page);
  return out;
};
