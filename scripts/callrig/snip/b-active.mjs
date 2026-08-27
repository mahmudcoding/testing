export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/workspace/${ws}/meetings/active`,{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const a=(j&&(j.meetings||j.items))||(Array.isArray(j)?j:[]);
    const t=document.body.innerText.replace(/\s+/g,' ');
    return { status:r.status, active: Array.isArray(a)? a.map(m=>({id:m.id,name:m.name})) : String(JSON.stringify(j)).slice(0,150),
             live:(t.match(/Live now.{0,60}/)||[])[0]||null,
             recent:(t.match(/Recent calls.{0,60}/)||[])[0]||null };
  }, WS);
};
