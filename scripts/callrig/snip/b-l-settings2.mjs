/* sector L: enumerate /settings/calls with boxVis (not the hit test) and after scrolling */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={url:page.url()};
  const enumerate = async (tag) => page.evaluate((t)=>{
    const q=window.__qa;
    const m=document.querySelector('main')||document.body;
    const sel='button,input,select,textarea,[role=switch],[role=slider],[role=radio],[role=checkbox],[role=combobox],video';
    const all=[...m.querySelectorAll(sel)];
    return {tag:t, total:all.length,
      rows: all.map(n=>{const r=n.getBoundingClientRect();
        return {tag:n.tagName, role:n.getAttribute('role')||n.type||null,
          name:q.nameOf(n).replace(/\s+/g,' ').trim().slice(0,70),
          boxVis:q.boxVis(n), hitVis:q.vis(n), checked:n.getAttribute('aria-checked'),
          y:Math.round(r.top), h:Math.round(r.height), testid:n.getAttribute('data-testid')||null};
      }).filter(x=>!/^(Account|Profile|Notifications|Appearance|Calls and audio|Privacy|Sessions|Security|About|Company|Workspace|Roles|Members|Company dashboard)$/.test(x.name))
    };
  }, tag);
  out.before = await enumerate('before-scroll');
  out.scrollInfo = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const sc=[...m.querySelectorAll('*')].filter(n=>n.scrollHeight>n.clientHeight+20 && getComputedStyle(n).overflowY!=='visible');
    return {docH:document.documentElement.scrollHeight, winH:window.innerHeight,
      scrollers: sc.slice(0,4).map(n=>({t:n.tagName, cls:(n.className||'').toString().slice(0,40), sh:n.scrollHeight, ch:n.clientHeight}))};
  });
  await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const sc=[...m.querySelectorAll('*')].find(n=>n.scrollHeight>n.clientHeight+20 && getComputedStyle(n).overflowY!=='visible');
    if(sc) sc.scrollTop = sc.scrollHeight; else window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1200);
  out.afterScroll = await enumerate('after-scroll');
  out.videoEls = await page.evaluate(()=>{
    const q=window.__qa;
    return [...document.querySelectorAll('video')].map(v=>({vw:v.videoWidth, vh:v.videoHeight, paused:v.paused,
      boxVis:q.boxVis(v), rect:(r=>({w:Math.round(r.width),h:Math.round(r.height)}))(v.getBoundingClientRect()),
      hasSrc:!!v.srcObject}));
  });
  return out;
};
