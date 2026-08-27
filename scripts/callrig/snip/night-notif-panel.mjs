export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const badge = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')]
    .find(x=>/^Notifications/.test(x.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;});
  const btns=await page.$$('button');
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||'').trim();
    if(/^Notifications/.test(l)){ await b.click(); break; } }
  await page.waitForTimeout(5000);
  const panel = await page.evaluate(()=>{
    const anchor=[...document.querySelectorAll('*')].find(e=>
      (e.textContent||'').includes('Mark all as read') && e.children.length<6 && e.tagName!=='BODY');
    if(!anchor) return {noAnchor:true};
    let box=anchor; for(let i=0;i<5&&box.parentElement;i++){ box=box.parentElement;
      if((box.innerText||'').length>60) break; }
    const r=box.getBoundingClientRect();
    return {boxText:(box.innerText||'').replace(/\n+/g,' | ').slice(0,400),
      rect:[Math.round(r.width),Math.round(r.height)],
      itemish: box.querySelectorAll('li,[role="listitem"],a,button').length};
  });
  return {badge, panel};
};
