export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M='V4OWAZJ5MTHSO98';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  // Is the public call discoverable on the hub?
  out.hubText = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,400));
  out.active = await page.evaluate(async(ws)=>{ const r=await fetch(`/api/v1/workspace/${ws}/meetings/active`,{credentials:'include'}); const j=await r.json().catch(()=>null); const a=(j&&(j.meetings||j.items||j))||[]; return Array.isArray(a)? a.map(m=>({id:m.id,name:m.name,n:m.participant_count??m.participants_count})) : String(JSON.stringify(j)).slice(0,200); }, WS);
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.url = page.url();
  out.screen = await page.evaluate(()=>({
    text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,700),
    buttons: [...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,25)
  }));
  // click a join button if present
  const jb = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.offsetParent).find(x=>/^(Join|Join call|Ask to join|Request to join|Join now)$/i.test((x.innerText||'').trim()));
    if(b){ b.click(); return (b.innerText||'').trim(); } return null;
  });
  out.joinClicked = jb;
  await page.waitForTimeout(6000);
  out.after = await page.evaluate(()=>({
    url: location.href,
    text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,700),
    buttons: [...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,25)
  }));
  return out;
};
