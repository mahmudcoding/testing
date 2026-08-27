export default async ({ ctx }) => {
  const p = ctx.pages().find(x => x.url().includes('/guest/meeting/')) || ctx.pages()[0];
  const v = await p.evaluate(() => {
    const vis = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    return { url: location.pathname,
      text: (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,220),
      buttons: [...document.querySelectorAll('button')].filter(vis)
        .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26), tid:b.getAttribute('data-testid')}))
        .filter(b=>b.t||b.tid).slice(-12) };
  });
  return v;
};
