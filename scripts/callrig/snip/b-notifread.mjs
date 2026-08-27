export default async ({page}) => {
  const out={};
  out.before = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/notifications?limit=10',{credentials:'include'})).json().catch(()=>null); const a=(j&&(j.notifications||j.items||j.data))||[]; return a.map(n=>({title:n.title, read:n.read_at||n.is_read||null})); });
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Notifications/.test(x.getAttribute('aria-label')||'')); if(b) b.click(); });
  await page.waitForTimeout(2500);
  out.marked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Mark all as read/i.test(x.innerText||'')); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(3500);
  out.after = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/notifications?limit=10',{credentials:'include'})).json().catch(()=>null); const a=(j&&(j.notifications||j.items||j.data))||[]; return a.map(n=>({title:n.title, read:n.read_at||n.is_read||null})); });
  out.panelText = await page.evaluate(()=>{ const p=[...document.querySelectorAll('[role=dialog],aside')].filter(x=>x.getBoundingClientRect().width>0).pop(); return p? p.innerText.replace(/\s+/g,' ').slice(0,160):null; });
  return out;
};
