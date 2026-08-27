export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  // dump every attribute of the accent buttons so we can see how "selected" is encoded
  const probe = await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('main button').forEach(b=>{
      const t=(b.innerText||'').trim();
      if(!/^(Indigo|Violet|Teal|Amber|Rose|Sky|Light|Dark|System)$/.test(t)) return;
      const attrs={}; for(const a of b.attributes) attrs[a.name]=a.value.slice(0,60);
      out.push({t, attrs});
    });
    return out;
  });
  return {probe, storageKeys: await page.evaluate(()=>Object.keys(localStorage).slice(0,25))};
};
