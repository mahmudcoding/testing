export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', parent='M4OWSWLE61Y8WAA';
  const read=async()=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(6500);
    return page.evaluate((parent)=>{
      const el=document.querySelector(`[data-message-id="${parent}"]`);
      if(!el) return 'not rendered';
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const ind=[...el.querySelectorAll('*')].filter(e=>/repl/i.test((e.textContent||''))&&vis(e))
        .sort((a,b)=>a.getBoundingClientRect().width-b.getBoundingClientRect().width)[0];
      const cs=ind?getComputedStyle(ind):null;
      const r=ind?ind.getBoundingClientRect():null;
      return {t:ind?(ind.textContent||'').trim():null, weight:cs&&cs.fontWeight,
        color:cs&&cs.color, bg:cs&&cs.backgroundColor,
        rect:r?[Math.round(r.width),Math.round(r.height)]:null,
        cls:ind?String(ind.className||'').slice(0,50):null};
    }, parent);
  };
  const out={};
  out.beforeReading=await read();
  // open the thread so it is read
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(8000);
  await page.evaluate(()=>{const p=[...document.querySelectorAll('*')]
    .find(e=>/Replies \(/.test(e.textContent||'')); if(p) p.scrollIntoView&&p.scrollIntoView();});
  await page.waitForTimeout(3000);
  out.afterReading=await read();
  out.identical = JSON.stringify(out.beforeReading)===JSON.stringify(out.afterReading);
  return out;
};
