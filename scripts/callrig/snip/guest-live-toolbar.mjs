export default async ({ctx}) => {
  const out=[];
  for (const p of ctx.pages()) {
    const u=p.url();
    if (!/guest|join/.test(u)) continue;
    try {
      const s = await p.evaluate(()=>{
        const t=document.querySelector('[data-testid="call-toolbar"]');
        return {inCall: !!t, me: (document.body.innerText.match(/([A-Za-z0-9 ]+) \(you\)/)||[])[1]||null,
          toolbar: t? [...t.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)}${b.disabled?' DIS':''}`):null,
          snippet: document.body.innerText.replace(/\n+/g,' | ').slice(0,120)};
      });
      out.push({url:u.slice(-26), ...s});
    } catch(e) { out.push({url:u.slice(-26), err:String(e).slice(0,60)}); }
  }
  return out;
};
