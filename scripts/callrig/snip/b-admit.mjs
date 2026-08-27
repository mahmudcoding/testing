export default async ({page}) => {
  const out={};
  // open participants panel
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Participants'); if(b) b.click(); });
  await page.waitForTimeout(2000);
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/^Admit/i.test(x.getAttribute('aria-label')||''));
    if(b){ b.click(); return b.getAttribute('aria-label'); } return null;
  });
  await page.waitForTimeout(5000);
  out.after = await page.evaluate(()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    return { inCall:(t.match(/\d+ in call/i)||[])[0]||null, waiting:(t.match(/WAITING.{0,60}/i)||[])[0]||null };
  });
  return out;
};
