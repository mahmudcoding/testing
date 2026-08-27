export default async ({page}) => {
  const accepted = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return null;
    const b=[...d.querySelectorAll('button')].find(x=>/^accept$/i.test((x.innerText||'').trim()));
    if(!b) return null; b.click(); return 'Accept';
  });
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    return {dialogText: d?(d.innerText||'').replace(/\s+/g,' ').slice(0,160):null};
  });
  await page.keyboard.press('Escape').catch(()=>{});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const sidebar = await page.evaluate(()=>{
    const h=[...document.querySelectorAll('*')].find(e=>/^Direct messages$/i.test((e.innerText||'').trim()));
    let box=h; if(h){ for(let i=0;i<5&&box.parentElement;i++) box=box.parentElement; }
    return {dmSection: box?(box.innerText||'').replace(/\s+/g,' ').slice(0,200):null,
      reqBtn: [...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>(b.getAttribute('aria-label')||'')).filter(l=>/message requests/i.test(l))};
  });
  return {accepted, after, sidebar};
};
