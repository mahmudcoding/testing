export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('device-request')){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} :: ${b}`);}});
  const d = await page.$('[data-testid="device-request-prompt"]');
  if (!d) return {err:'no prompt'};
  for (const b of await d.$$('button')) { const t=(await b.innerText()).trim(); if (/^Turn on$/i.test(t)) { await b.click(); break; } }
  await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>({
    prompt: !!document.querySelector('[data-testid="device-request-prompt"]'),
    mic: (()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;})()
  }));
  return {net: netlog, after};
};
