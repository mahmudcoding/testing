/* Sampling must not stop while the action runs. joinRoom/leaveRoom wait several
 * seconds internally, and awaiting them inside the loop blanks the samples for
 * exactly the window the measurement is about — the state then appears to change
 * "0.5 s after the action" when the action's own click was 8 s earlier.
 * Fire the action without awaiting, and stamp the click itself. */
import { attach, openPeople, install, inSideRoom } from './a-callkit.mjs';
export default async ({ page }) => {
  const out = {};
  const guest = await attach('guest');
  const dir = process.env.QA_DIR || 'leave';
  const room = process.env.QA_ROOM || 'Room A';
  await openPeople(page);
  await install(page); await install(guest.page);
  out.guestInRoomBefore = await inSideRoom(guest.page);
  const mark = {};
  const read = () => page.evaluate(() => {
    const l=document.querySelector('[data-testid="participants-list"]'); const h=l?(l.closest('aside')||l.parentElement):null;
    const t=h?h.innerText.replace(/\s+/g,' '):'(no panel)';
    return { vis: document.visibilityState, t: t.replace(/^.*let them in again\./,'').trim().slice(0,220) };
  });
  const act = async () => {
    const sel = dir === 'leave'
      ? `[...document.querySelectorAll('button')].filter(window.__qa.vis).find(x=>/^Leave Side Room$/i.test(window.__qa.nameOf(x).trim()))`
      : null;
    let pos;
    if (dir === 'leave') {
      pos = await guest.page.evaluate(`(() => { const b = ${sel}; if(!b) return null; b.scrollIntoView({block:'center'});
        const r=b.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}; })()`);
    } else {
      pos = await guest.page.evaluate((w) => {
        const a=[...document.querySelectorAll('aside')].filter(window.__qa.boxVis).find(x=>/Side Rooms/.test(x.innerText||''));
        if(!a) return null;
        const cards=[...a.querySelectorAll('*')].filter(window.__qa.boxVis)
          .filter(n=>(n.innerText||'').includes(w) && [...n.querySelectorAll('button')].some(b=>/^(Join|Switch|Joined)$/.test(window.__qa.nameOf(b).trim())));
        cards.sort((x,y)=>(x.innerText||'').length-(y.innerText||'').length);
        const c=cards[0]; if(!c) return null;
        const btns=[...c.querySelectorAll('button')].map(b=>({b,n:window.__qa.nameOf(b).trim()})).filter(x=>/^(Join|Switch|Joined)$/.test(x.n));
        if (btns.length!==1 || btns[0].n==='Joined') return null;
        btns[0].b.scrollIntoView({block:'center'}); const r=btns[0].b.getBoundingClientRect();
        return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};
      }, room);
    }
    if (!pos) { mark.err = 'control not found on the guest window'; return; }
    await guest.page.mouse.click(pos.x, pos.y);
    mark.clickAt = Date.now();
    await guest.page.waitForTimeout(1800);
    const c = guest.page.locator('[data-testid="side-room-confirm-submit"]').first();
    if (await c.count()) {
      const p=await c.evaluate(el=>{const r=el.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};});
      await guest.page.mouse.click(p.x,p.y); mark.confirmAt = Date.now();
    }
  };
  const ms = Number(process.env.QA_MS || 60000);
  const t0=Date.now(); const states=[]; let last=null, n=0, fired=false;
  while (Date.now()-t0 < ms) {
    let s; try { s = await read(); } catch { s={vis:'?',t:'(eval failed)'}; }
    n++;
    if (s.t !== last) { states.push({ at: Date.now(), ms: Date.now()-t0, vis: s.vis, text: s.t }); last=s.t; }
    if (!fired && Date.now()-t0 > 4000) { fired = true; act().catch(e => { mark.err = String(e).slice(0,120); }); }
    await page.waitForTimeout(400);
  }
  const ref = mark.confirmAt || mark.clickAt || null;
  out.mark = mark;
  out.samples = n;
  out.states = states.map(s => ({ ...s, sinceAction: ref ? +(((s.at-ref)/1000).toFixed(2)) : null }));
  out.guestInRoomAfter = await inSideRoom(guest.page);
  return out;
};
