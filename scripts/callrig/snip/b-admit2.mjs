export default async ({page}) => {
  const out={};
  const isOpen = ()=>page.evaluate(()=>!!document.querySelector('button[aria-label="Close participants"]'));
  if (!await isOpen()) { await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Participants'); if(b) b.click(); }); await page.waitForTimeout(2000); }
  out.panelOpen = await isOpen();
  out.clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Admit/i.test(x.getAttribute('aria-label')||'')); if(b){b.click(); return (b.getAttribute('aria-label')||'').slice(0,30);} return null; });
  await page.waitForTimeout(6000);
  const t = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' '));
  out.inCall = (t.match(/\d+ in call.{0,160}/i)||[])[0]||null;
  out.waiting = (t.match(/WAITING.{0,60}/i)||[])[0]||null;
  return out;
};
