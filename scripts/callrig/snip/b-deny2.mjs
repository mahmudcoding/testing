export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Close meeting settings'); if(b) b.click(); });
  await page.waitForTimeout(1200);
  const isOpen = ()=>page.evaluate(()=>!!document.querySelector('button[aria-label="Close participants"]'));
  if(!await isOpen()){ await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Participants'); if(b) b.click(); }); await page.waitForTimeout(2500); }
  out.panelOpen = await isOpen();
  out.waiting = await page.evaluate(()=>(document.body.innerText.replace(/\s+/g,' ').match(/WAITING.{0,90}/i)||[])[0]||null);
  out.clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Deny/i.test(x.getAttribute('aria-label')||'')); if(b){b.click(); return b.getAttribute('aria-label');} return null; });
  await page.waitForTimeout(4000);
  out.after = await page.evaluate(()=>(document.body.innerText.replace(/\s+/g,' ').match(/WAITING.{0,60}/i)||[])[0]||'no-waiting-section');
  return out;
};
