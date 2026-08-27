export default async ({page}) => {
  const n = await page.evaluate(async () => {
    const j = await (await fetch('/api/v1/notifications?limit=12',{credentials:'include'})).json();
    const items=(j.notifications||j.items||[]);
    const inv = items.find(x=>/Meeting invitation/i.test(x.title||'') && /SCHED3/.test(x.body||''));
    return inv? {body: inv.body} : {none:true, titles: items.map(x=>x.title).slice(0,5)};
  });
  if (n.none) return n;
  const m = (n.body||'').match(/https:\/\/\S+\/calendar\/join\/[a-f0-9]+/);
  if (!m) return {noLink: true, body:(n.body||'').slice(0,120)};
  await page.goto(m[0], {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const b=document.body;
    return {url: location.href, text: b.innerText.replace(/\n+/g,' | ').slice(0,320),
      btns:[...b.querySelectorAll('button,a')].filter(e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;})
        .map(e=>((e.getAttribute('aria-label')||e.textContent||'').trim()).slice(0,26)).filter(Boolean).slice(-12)};
  });
};
