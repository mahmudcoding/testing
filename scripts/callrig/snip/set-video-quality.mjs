export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const sl = await page.$('[data-testid="meeting-settings-video-quality-slider"]');
  if (!sl) return {err:'no slider'};
  const info = await page.evaluate(()=>{const s=document.querySelector('[data-testid="meeting-settings-video-quality-slider"]');return {tag:s.tagName,type:s.type,min:s.min,max:s.max,step:s.step,value:s.value,role:s.getAttribute('role')};});
  // move slider to lowest
  await sl.focus();
  for (let i=0;i<8;i++) { await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(120); }
  await page.waitForTimeout(1500);
  const after = await page.evaluate(()=>{const s=document.querySelector('[data-testid="meeting-settings-video-quality-slider"]');
    const sec=document.querySelector('[data-testid="meeting-settings-video-quality-section"]');
    return {value:s.value, sectionText: sec?sec.innerText.replace(/\n+/g,' | ').slice(0,220):''};});
  await page.waitForTimeout(3000);
  return {info, after, net: netlog};
};
