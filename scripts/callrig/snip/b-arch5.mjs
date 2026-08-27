export default async ({page}) => {
  const ws='W4QBF1XTURESO01';
  const sidebar = () => page.evaluate(()=>[...document.querySelectorAll('a')]
    .filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.x<380&&/\/c\//.test(e.getAttribute('href')||'');})
    .map(e=>(e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,24)));
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QBGENERAL0001`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const s0 = await sidebar();
  await page.evaluate(()=>{[...document.querySelectorAll('button')]
    .find(e=>/archived/i.test(e.getAttribute('aria-label')||''))?.click();});
  await page.waitForTimeout(2800);
  const copy = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,140):null;});
  const clicked = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return null;
    const b=[...d.querySelectorAll('button')].find(x=>/^open$/i.test((x.getAttribute('aria-label')||'').trim()));
    if(!b) return null; b.click(); return 'Open';
  });
  await page.waitForTimeout(4500);
  const mid = await page.evaluate(()=>({url:location.href.replace(/^https:\/\/[^/]+/,''),
    dialogOpen:[...document.querySelectorAll('[role=dialog]')].some(x=>x.getBoundingClientRect().width>0),
    composer:!!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
    banner:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,150)}));
  const s1 = await sidebar();
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000);
  const s2 = await sidebar();
  return {copy, clicked, s0, mid, s1, s2};
};
