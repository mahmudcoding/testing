export default async ({page}) => {
  const M = process.env.QA_MEET;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/admit|reject|waiting/.test(u)){net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','').slice(0,80)}`);}});
  const b = page.locator('button[aria-label^="Admit all"]').first();
  if (!(await b.count())) return {err:'no admit all'};
  const t0=Date.now();
  await b.click();
  await page.waitForTimeout(7000);
  const after = await page.evaluate(async (M)=>{
    const w = await (await fetch('/api/v1/meeting/'+M+'/waiting',{credentials:'include'})).json();
    const p = await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json();
    return {waiting:(w.participants||[]).map(x=>x.name), participants:(p.participants||[]).map(x=>x.name),
      panel: (document.querySelector('[data-testid="participants-list-panel"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,300)};
  }, M);
  return {ms: Date.now()-t0, net, after};
};
