export default async ({ ctx }) => {
  const out = [];
  for (const p of ctx.pages()) {
    try {
      out.push(await p.evaluate(() => ({
        url: location.pathname,
        text: (document.body.innerText||'').replace(/\n+/g,' | ').slice(0, 230),
        surface: !!document.querySelector('[data-testid="call-surface"]'),
        buttons: [...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
          .map(b=>(b.innerText||'').trim()).filter(Boolean).slice(-6) })));
    } catch (e) { out.push({ err: String(e).slice(0,50) }); }
  }
  return { tabCount: out.length, tabs: out };
};
