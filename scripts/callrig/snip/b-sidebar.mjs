export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>{
    const nav=[...document.querySelectorAll('a,button')].filter(e=>{
      const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&r.x<380;});
    return {
      count: nav.length,
      items: nav.map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,32),
                          l:(e.getAttribute('aria-label')||'').slice(0,32),
                          h:(e.getAttribute('href')||'').slice(0,46)})).filter(x=>x.t||x.l),
      dmSectionText: (()=>{
        const h=[...document.querySelectorAll('*')].find(e=>/^Direct messages$/i.test((e.innerText||'').trim()));
        if(!h) return null; let box=h; for(let i=0;i<5&&box.parentElement;i++) box=box.parentElement;
        return (box.innerText||'').replace(/\s+/g,' ').slice(0,200);
      })()
    };
  });
};
