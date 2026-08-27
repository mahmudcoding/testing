export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', parent='M4OWSWLE61Y8WAA';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  return page.evaluate((parent)=>{
    const el=document.querySelector(`[data-message-id="${parent}"]`);
    if(!el) return 'not rendered';
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const ind=[...el.querySelectorAll('*')].filter(e=>/repl/i.test((e.textContent||''))&&vis(e))
      .sort((a,b)=>a.getBoundingClientRect().width-b.getBoundingClientRect().width)[0];
    const cs=ind? getComputedStyle(ind):null;
    return {indicatorText: ind? (ind.textContent||'').trim().slice(0,30):null,
      weight:cs&&cs.fontWeight, color:cs&&cs.color, bg:cs&&cs.backgroundColor,
      siblings: ind&&ind.parentElement? [...ind.parentElement.children].map(c=>(c.textContent||'').trim().slice(0,18)):null,
      dots:[...el.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();
        return r.width>3&&r.width<14&&r.height>3&&r.height<14&&!(e.textContent||'').trim();}).length,
      rowText:(el.innerText||'').replace(/\s+/g,' ').slice(-60)};
  }, parent);
};
