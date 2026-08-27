export default async ({page}) => {
  const N = process.env.QA_STARS || '4';
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/rating|meeting\//.test(u) && r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: body=${(r.request().postData()||'').slice(0,120)} :: resp=${b}`);} });
  const sect = () => {
    const s = document.querySelector('[data-testid="ended-rate-section"]');
    if (!s) return null;
    return {text: s.innerText.replace(/\n+/g,' | ').slice(0,300),
            stars: [...s.querySelectorAll('button')].map(b=>({al:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed'), dis:b.disabled, cls:(b.className||'').slice(0,60), svgFill: (b.querySelector('svg')?.getAttribute('fill')||b.querySelector('svg')?.className?.baseVal||'').slice(0,40)}))};
  };
  const before = await page.evaluate(sect);
  const btn = page.locator(`[data-testid="ended-rate-section"] button[aria-label="${N} stars"]`);
  const found = await btn.count();
  if (found) await btn.click();
  const frames = [];
  for (let i=0;i<10;i++) { await page.waitForTimeout(300); frames.push(await page.evaluate(sect)); }
  const meeting = await page.evaluate(async (id) => {
    const r = await fetch('/api/v1/meeting/'+id, {credentials:'include'});
    const j = await r.json();
    return {rating: (j.meeting||j).rating, status:(j.meeting||j).status};
  }, process.env.QA_MEET);
  return {found, url: page.url(), before, afterFirst: frames[1], afterLast: frames[9], textTrail: [...new Set(frames.map(f=>f&&f.text))], meeting, net};
};
