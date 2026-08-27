export default async ({ ctx }) => {
  const p = ctx.pages().find(x => x.url().includes('/guest/meeting/'));
  if (!p) return { error: 'no guest page' };
  const realClick = async (sel) => {
    const box = await p.evaluate(s => { const e=document.querySelector(s);
      if (!e) return null; const r=e.getBoundingClientRect();
      if (r.width===0||r.height===0) return null;
      return { x:r.x+r.width/2, y:r.y+r.height/2 }; }, sel);
    if (!box) return false;
    await p.mouse.move(box.x, box.y); await p.waitForTimeout(220);
    await p.mouse.click(box.x, box.y); await p.waitForTimeout(3000); return true;
  };
  await realClick('[data-testid="call-controls-breakout-rooms"]');
  const seen = await p.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const t = (document.body.innerText||'').replace(/\n+/g,' | ');
    const i = t.indexOf('Side Rooms');
    return { panel: i>=0 ? t.slice(i, i+200) : '(no panel text)',
             joinBtns: [...document.querySelectorAll('button')].filter(v)
               .map(b=>({t:(b.innerText||'').trim().slice(0,20), tid:b.getAttribute('data-testid')}))
               .filter(b=>/^Join$/i.test(b.t) || /side-room-action/.test(b.tid||'')) };
  });
  let joined = null;
  if (seen.joinBtns.length) { joined = await realClick('[data-testid="side-room-action"]'); await p.waitForTimeout(5000); }
  return { seen, joinClicked: joined,
    inRoom: await p.evaluate(() => /Leave Side Room|Leave room/i.test(document.body.innerText||'')) };
};
