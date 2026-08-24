export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const info = await page.evaluate(()=>[...document.querySelectorAll('button')].map((b,i)=>({i, t:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,20), r:b.getBoundingClientRect().toJSON()})).filter(x=>/Accept|Decline/i.test(x.t)));
  if (!info.length) return {err:'none'};
  const target = info.find(x=>/Accept/i.test(x.t));
  await page.mouse.click(target.r.x + target.r.width/2, target.r.y + target.r.height/2);
  await page.waitForTimeout(9000);
  const after = await page.evaluate(()=>({url:location.href, body: document.body.innerText.replace(/\n+/g,' | ').slice(0,320)}));
  return {info, net: netlog, after};
};
