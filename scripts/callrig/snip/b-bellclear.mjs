export default async ({page}) => {
  const out={};
  out.clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Mark all as read/i.test(x.innerText||'')); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(3000);
  out.after = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=6',{credentials:'include'})).json().catch(()=>null);
    const a=(j&&(j.notifications||j.items||j.data))||[];
    return a.slice(0,4).map(n=>({title:n.title, read:n.read_at||n.is_read||n.read||null}));
  });
  return out;
};
