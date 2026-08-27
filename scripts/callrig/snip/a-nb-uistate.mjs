import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,400); await page.waitForTimeout(400);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const btn = re => [...document.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(x=>re.test(x));
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {
      mic: btn(/^(Mute|Unmute)$/)[0]||null,
      cam: btn(/^Turn camera (on|off)$/)[0]||null,
      view: btn(/view$|pinned/i)[0]||null,
      recBadge: !!document.querySelector('[data-testid="call-recording-badge"]'),
      rec: btn(/^(Record|Stop recording)$/)[0]||null,
      reactBtn: btn(/^Send reaction$/).length>0,
      chatBtn: btn(/^Call chat$/).length>0,
      sideRooms: btn(/^Side Rooms$/).length>0,
      big: (()=>{const t=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis)
              .map(x=>({n:(x.querySelector('[data-testid="participant-name"]')?.textContent||'').trim(),
                        a:x.getBoundingClientRect().width*x.getBoundingClientRect().height,
                        p:!!x.querySelector('[data-testid*="pinned"]')})).sort((a,b)=>b.a-a.a);
            return t[0]?t[0].n+(t[0].p?' [PINNED]':''):null;})(),
      path: location.pathname,
      notice: [...document.querySelectorAll('*')].filter(e=>!e.childElementCount)
        .map(e=>(e.textContent||'').trim())
        .filter(t=>t && t.length<60 && /recording|muted|pinned|room|host|removed|ended/i.test(t))
        .filter((t,i,a)=>a.indexOf(t)===i).slice(0,8)
    };}, VIS);
};
