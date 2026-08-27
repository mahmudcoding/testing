export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/workspaces/W4QEF1XTURESO01/members',{credentials:'include'});
    const j=await r.json();
    return (j.members||[]).map(m=>({n:m.name, u:m.username, online:m.presence&&m.presence.online, st:m.presence&&m.presence.status}));
  });
  const pres = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/workspaces/W4QEF1XTURESO01/presence',{credentials:'include'});
    let j=null; try{j=await r.json();}catch(e){}
    return {status:r.status, body:JSON.stringify(j).slice(0,350)};
  });
  const ui = await page.evaluate(()=>{
    const m=document.querySelector('main');
    return m.innerText.replace(/\n{2,}/g,' | ').slice(0,600);
  });
  return {api, pres, ui};
};
