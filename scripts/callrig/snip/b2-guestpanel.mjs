export default async ({ ctx }) => {
  const p = ctx.pages().find(x => x.url().includes('/guest/meeting/'));
  if (!p) return { error: 'no guest page' };
  return await p.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const txt = (document.body.innerText||'').replace(/\n+/g,' | ');
    const idx = txt.indexOf('Side Rooms');
    return { sideRoomsSection: idx >= 0 ? txt.slice(idx, idx+180) : '(no Side Rooms text)',
             buttons: [...document.querySelectorAll('button')].filter(v)
               .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24), tid:b.getAttribute('data-testid')}))
               .filter(b=>/room|join/i.test(b.t + ' ' + (b.tid||''))) };
  });
};
