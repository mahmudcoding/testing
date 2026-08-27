// Verify pass: poll the invitee's whole screen at ~300ms, uncapped, for QA_MS.
// Records visible dialogs, visible Accept/Deny-ish controls, and any visible node
// mentioning the room name. Visibility = rect + ancestor opacity + elementFromPoint.
export default async ({ page }) => {
  const MS = parseInt(process.env.QA_MS||'30000',10);
  const ROOM = process.env.QA_ROOM||'VROOM';
  const out = await page.evaluate(async ({MS, ROOM}) => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      let n = el, op = 1;
      while (n && n !== document.documentElement) { op *= parseFloat(getComputedStyle(n).opacity||'1'); n = n.parentElement; }
      if (op <= 0.05) return false;
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return false;
      const hit = document.elementFromPoint(cx, cy);
      return !!hit && (el.contains(hit) || hit.contains(el));
    };
    const snap = () => {
      const dialogs = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
        .map(d => (d.getAttribute('data-testid')||'?') + ':' + (d.innerText||'').replace(/\s+/g,' ').trim().slice(0,150));
      const accept = [...document.querySelectorAll('button')].filter(vis)
        .map(b => (b.getAttribute('aria-label')||(b.textContent||'').trim()))
        .filter(t => /accept|deny|decline|join room|invite/i.test(t));
      const roomMentions = [...document.querySelectorAll('body *')]
        .filter(e => e.children.length === 0 && (e.textContent||'').includes(ROOM))
        .filter(vis).map(e => (e.textContent||'').trim().slice(0,80));
      const sideRoomText = [...document.querySelectorAll('body *')]
        .filter(e => e.children.length === 0 && /side room/i.test(e.textContent||''))
        .filter(vis).map(e => (e.textContent||'').trim().slice(0,80));
      return JSON.stringify({dialogs, accept, roomMentions, sideRoomText});
    };
    const seq = []; const ticks = [];
    const t0 = performance.now();
    let last = null;
    while (performance.now() - t0 < MS) {
      const t = Math.round(performance.now() - t0);
      ticks.push(t);
      const s = snap();
      if (s !== last) { seq.push({t, s: JSON.parse(s)}); last = s; }
      await new Promise(r => setTimeout(r, 300));
    }
    const gaps = []; for (let i=1;i<ticks.length;i++) gaps.push(ticks[i]-ticks[i-1]);
    gaps.sort((a,b)=>a-b);
    return {
      visibilityState: document.visibilityState,
      hasFocus: document.hasFocus(),
      tickCount: ticks.length,
      gapMedian: gaps[Math.floor(gaps.length/2)],
      gapMax: gaps[gaps.length-1],
      distinctStates: seq.length,
      seq: seq.slice(0, 40),
    };
  }, {MS, ROOM});
  return out;
};
