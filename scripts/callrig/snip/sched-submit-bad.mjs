export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('calendar')||u.includes('meeting')){let b='';try{b=(await r.text()).slice(0,400);}catch(e){} if(r.request().method()!=='GET'||r.status()>=400) net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.fill('[role="dialog"] input[aria-label="Add title"]', 'QA Sched BadRange');
  await page.fill('[role="dialog"] input[aria-label="Ends time"]', '13:00');
  await page.waitForTimeout(900);
  const before = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop(); const s=[...d.querySelectorAll('button')].find(b=>/^Schedule meeting$/.test(b.textContent.trim())); return {disabled:s.disabled, text:d.innerText.replace(/\n+/g,' | ').slice(-260)};});
  await page.locator('[role="dialog"] button', {hasText:/^Schedule meeting$/}).first().click();
  await page.waitForTimeout(4500);
  const after = await page.evaluate(()=>({
    dialogOpen: !!document.querySelector('[role="dialog"]'),
    dialogText: (()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop(); return d? d.innerText.replace(/\n+/g,' | ').slice(-320):null;})(),
    toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,160)).filter(Boolean)
  }));
  return {before, net, after};
};
