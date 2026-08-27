// Bob's side: notifications + Mentions page, for MANUAL vs PICKED.
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(async()=>(await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email);
  out.notifs = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=25',{credentials:'include'})).json();
    const arr=j.notifications||j.data||j||[];
    return arr.slice(0,12).map(n=>({type:n.type,title:n.title,
      body:(n.body||n.message||'').replace(/\s+/g,' ').slice(0,55), at:n.created_at}));
  });
  const ws=page.url().split('/w/')[1].split('/')[0];
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`);
  await page.waitForTimeout(3500);
  out.mentionsPage = await page.evaluate(()=>{
    const n=[...document.querySelectorAll('main [data-message-id]')];
    return {count:n.length, texts:n.map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,70)).slice(-8)};
  });
  return out;
};
