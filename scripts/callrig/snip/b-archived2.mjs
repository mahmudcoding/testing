export default async ({page}) => {
  const ws='W4QBF1XTURESO01';
  const chans = () => page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
    const j=await r.json(); const arr=(j?.data?.channels||j?.channels||j?.data||[]);
    return Array.isArray(arr)? arr.map(c=>({n:c.name, arch:c.archived??c.is_archived??c.archived_at??null})) : {raw:JSON.stringify(j).slice(0,200)};
  }, ws);
  const sidebar = () => page.evaluate(()=>[...document.querySelectorAll('a')]
    .filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.x<380&&/\/c\//.test(e.getAttribute('href')||'');})
    .map(e=>(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)));
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QBGENERAL0001`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const c0=await chans(), s0=await sidebar();
  await page.evaluate(()=>{[...document.querySelectorAll('button')]
    .find(e=>/archived/i.test(e.getAttribute('aria-label')||''))?.click();});
  await page.waitForTimeout(2500);
  const clicked = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return null;
    const b=[...d.querySelectorAll('button')].find(x=>/^open$/i.test((x.innerText||'').trim()));
    if(!b) return null; b.click(); return 'Open';
  });
  await page.waitForTimeout(4000);
  const mid = await page.evaluate(()=>({url:location.href.replace(/^https:\/\/[^/]+/,''),
    dialogOpen:[...document.querySelectorAll('[role=dialog]')].some(x=>x.getBoundingClientRect().width>0),
    composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
    main:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,200)}));
  const c1=await chans();
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(5500);
  const s1=await sidebar(); const c2=await chans();
  return {c0, s0, clicked, mid, c1, s1, c2};
};
