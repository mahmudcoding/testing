export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Close meeting settings'); if(b) b.click(); });
  await page.waitForTimeout(1200);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Meeting settings'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  out.before = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Require approval to join'); return b? b.getAttribute('aria-checked'):'not-found'; });
  out.toggled = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Require approval to join'); if(b){ b.click(); return true;} return false; });
  await page.waitForTimeout(1200);
  out.saved = await page.evaluate(()=>{ const b=[...document.querySelectorAll('[role=dialog] button')].find(x=>(x.innerText||'').trim()==='Save'); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(4500);
  out.after = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); const m=j&&j.meeting; return {appr:m&&m.requires_approval, pw:m&&m.password_protected}; });
  return out;
};
