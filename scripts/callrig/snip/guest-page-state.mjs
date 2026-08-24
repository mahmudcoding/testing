export default async ({ctx}) => {
  const tok = process.env.QA_TOKEN;
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/join/'+tok,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(()=>({url:location.href, body: document.body.innerText.replace(/\n+/g,' | ').slice(0,400),
    inputs:[...document.querySelectorAll('input')].map(i=>`${i.type}|${i.placeholder||''}`),
    buttons:[...document.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)}${b.disabled?' DIS':''}`)}));
  await p.close();
  return r;
};
