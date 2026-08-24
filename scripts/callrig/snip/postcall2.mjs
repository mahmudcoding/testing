export default async ({page}) => {
  const out = {};
  const sm = await page.$('button:has-text("Show messages")') || await page.$('text=(Show messages)');
  if (sm) { await sm.click().catch(()=>{}); await page.waitForTimeout(2500); }
  out.afterShow = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop(); return d?d.innerText.replace(/\n+/g,' | ').slice(0,700):'none';});
  const star = await page.$('button[aria-label="4 stars"]');
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&/rating|rate|meeting/.test(u)){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} if(r.request().method()!=='GET') netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  if (star) { await star.click(); await page.waitForTimeout(2000); }
  const done = await page.$('button:has-text("Done")');
  if (done) { await done.click().catch(()=>{}); await page.waitForTimeout(3000); }
  out.net = netlog;
  out.final = await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(-400));
  return out;
};
