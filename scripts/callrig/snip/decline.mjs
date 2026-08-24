export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const info = await page.evaluate(()=>[...document.querySelectorAll('button')].map((b,i)=>({i,t:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,16),r:b.getBoundingClientRect().toJSON()})).filter(x=>/Decline|Accept/i.test(x.t)));
  if (!info.length) return {err:'no incoming banner'};
  const d = info.find(x=>/Decline/i.test(x.t));
  await page.mouse.click(d.r.x+d.r.width/2, d.r.y+d.r.height/2);
  await page.waitForTimeout(6000);
  return {net: netlog, body: await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,220))};
};
