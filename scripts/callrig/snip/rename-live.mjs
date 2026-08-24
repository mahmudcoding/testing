export default async ({page}) => {
  const M=process.env.QA_MEET;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting/'+M)&&r.request().method()==='PATCH'){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${r.status()} :: ${b}`);}});
  const panel = await page.$('[data-testid="meeting-settings-name-input"]');
  if (!panel) { await page.click('[data-testid="call-controls-settings-toggle"]'); await page.waitForTimeout(2200); }
  await page.fill('[data-testid="meeting-settings-name-input"]', 'QA RENAMED LIVE');
  await page.waitForTimeout(700);
  await page.click('[data-testid="meeting-settings-save"]');
  await page.waitForTimeout(4000);
  const own = await page.evaluate(()=>({top:(document.querySelector('[data-testid="call-top-bar"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,80),
    toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,90)).filter(Boolean)}));
  return {net, own};
};
