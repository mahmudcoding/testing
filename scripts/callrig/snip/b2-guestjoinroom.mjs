export default async ({ ctx }) => {
  const p = ctx.pages().find(x => x.url().includes('/guest/meeting/'));
  if (!p) return { error: 'no guest page' };
  const real = async (finder) => {
    const box = await p.evaluate(f => {
      const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
      const b = [...document.querySelectorAll('button')].filter(v).find(x => eval(f)(x));
      if (!b) return null; const r = b.getBoundingClientRect();
      return { x:r.x+r.width/2, y:r.y+r.height/2, t:(b.innerText||b.getAttribute('data-testid')||'').trim().slice(0,26) };
    }, finder);
    if (!box) return null;
    await p.mouse.move(box.x, box.y); await p.waitForTimeout(200);
    await p.mouse.click(box.x, box.y); await p.waitForTimeout(3000);
    return box.t;
  };
  const opened = await real("(x)=>x.getAttribute('data-testid')==='call-controls-breakout-rooms'");
  const joined = await real("(x)=>(x.getAttribute('data-testid')||'')==='side-room-action'");
  await p.waitForTimeout(6000);
  return { openedPanel: opened, joinedRoom: joined,
    inRoom: await p.evaluate(() => /Leave Side Room|Leave room/i.test(document.body.innerText||'')),
    state: await p.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(-150)) };
};
