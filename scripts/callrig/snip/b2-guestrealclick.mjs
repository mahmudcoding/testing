export default async ({ ctx }) => {
  const p = ctx.pages().find(x => x.url().includes('/guest/meeting/'));
  if (!p) return { error: 'no guest page' };
  const label = process.env.QA_LABEL || 'Accept';
  const box = await p.evaluate(l => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x => (x.innerText||'').trim() === l || (x.getAttribute('data-testid')||'').includes('breakout-invite-accept'));
    if (!b) return null; const r = b.getBoundingClientRect();
    return { x: r.x + r.width/2, y: r.y + r.height/2, t:(b.innerText||b.getAttribute('data-testid')).trim() };
  }, label);
  if (!box) return { error: 'not found' };
  await p.mouse.move(box.x, box.y); await p.waitForTimeout(200);
  await p.mouse.click(box.x, box.y);
  await p.waitForTimeout(8000);
  return { clicked: box.t, state: await p.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,150)) };
};
