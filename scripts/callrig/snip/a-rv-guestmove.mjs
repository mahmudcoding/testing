/* One process, correct ordering: start sampling the host's panel, THEN make the
 * guest move. Two separate ./d calls cannot guarantee the watcher is up first. */
import { attach, openPeople, install, joinRoom, inSideRoom } from './a-callkit.mjs';
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  const guest = await attach('guest');
  const dir = process.env.QA_DIR || 'leave';     // 'leave' | 'join'
  await openPeople(page);
  await install(page); await install(guest.page);
  out.guestInRoomBefore = await inSideRoom(guest.page);
  const read = () => page.evaluate(() => {
    const l=document.querySelector('[data-testid="participants-list"]'); const h=l?(l.closest('aside')||l.parentElement):null;
    const t=h?h.innerText.replace(/\s+/g,' '):'(no panel)';
    return { vis: document.visibilityState, t: t.replace(/^.*let them in again\./,'').trim().slice(0,220) };
  });
  const t0=Date.now(); const states=[]; let last=null, n=0; let acted=null;
  const act = async () => {
    if (dir === 'leave') {
      const pos = await guest.page.evaluate(() => {
        const b=[...document.querySelectorAll('button')].filter(window.__qa.vis).find(x=>/^Leave Side Room$/i.test(window.__qa.nameOf(x).trim()));
        if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
        return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};
      });
      if(!pos) return { err:'no Leave Side Room on the guest window' };
      await guest.page.mouse.click(pos.x,pos.y); await guest.page.waitForTimeout(1800);
      const c = guest.page.locator('[data-testid="side-room-confirm-submit"]').first();
      if (await c.count()) { const p=await c.evaluate(el=>{const r=el.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};});
        await guest.page.mouse.click(p.x,p.y); return { at: Date.now(), what:'confirmed Leave room' }; }
      return { at: Date.now(), what:'clicked Leave Side Room, no confirm dialog' };
    }
    const r = await joinRoom(guest.page, process.env.QA_ROOM || 'Room A');
    return { at: Date.now(), what: 'joinRoom '+JSON.stringify(r) };
  };
  const ms = Number(process.env.QA_MS || 60000);
  while (Date.now()-t0 < ms) {
    let s; try { s = await read(); } catch { s={vis:'?',t:'(eval failed)'}; }
    n++;
    if (s.t !== last) { states.push({ at: Date.now(), ms: Date.now()-t0, vis: s.vis, text: s.t }); last=s.t; }
    if (!acted && Date.now()-t0 > 4000) { acted = await act(); }
    await page.waitForTimeout(500);
  }
  out.acted = acted;
  out.samples = n;
  out.states = states.map(s => ({ ...s, sinceAction: acted && acted.at ? +(((s.at-acted.at)/1000).toFixed(2)) : null }));
  out.guestInRoomAfter = await inSideRoom(guest.page);
  return out;
};
