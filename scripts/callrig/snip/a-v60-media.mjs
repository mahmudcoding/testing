import { RTC_STATS } from './lib.mjs';
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const s1 = await page.evaluate(`(${RTC_STATS})()`);
  await page.waitForTimeout(4000);
  const s2 = await page.evaluate(`(${RTC_STATS})()`);
  const ui = await page.evaluate((vs)=>{const vis=eval(vs);
    return { tiles:document.querySelectorAll('video').length,
      audios:[...document.querySelectorAll('audio')].map(a=>({paused:a.paused,hasSrc:!!a.srcObject})),
      sideRoomsBtn:[...document.querySelectorAll('button')].filter(vis).some(b=>/Side Rooms/i.test(b.getAttribute('aria-label')||b.innerText||'')) };},VS);
  return { s1:JSON.stringify(s1).slice(0,400), s2:JSON.stringify(s2).slice(0,400), ui };
};
