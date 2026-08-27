export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  await page.locator('button').filter({hasText:/members/i}).first().click();
  await page.waitForTimeout(2500);
  const read=()=>page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>40);
    if(!d) return null;
    const t=(d.innerText||'').replace(/\s+/g,' ');
    const rows=[...d.querySelectorAll('*')].filter(e=>e.children.length===0
      && /^QA (Admin|Alice|Bob|Carol|Guest|Owner)$/.test((e.textContent||'').trim()))
      .map(e=>e.textContent.trim());
    const seen=new Set(), order=[];
    for(const r of rows){ if(!seen.has(r)){seen.add(r); order.push(r);} }
    return {order, label:(t.match(/Sort ([A-Za-z ]+?) Q/)||[])[1]||null,
      online:(t.match(/Status: (Online|Offline|Away)/g)||[]).slice(0,8)};});
  const pick=async(name)=>{
    const btn=page.locator('[role="dialog"] button').filter({hasText:/Recently joined|By name|Online first/}).first();
    await btn.click(); await page.waitForTimeout(1400);
    const it=page.getByText(name,{exact:true}).last();
    await it.click(); await page.waitForTimeout(2200);
    return read();
  };
  out.initial=await read();
  out.byName=await pick('By name');
  out.onlineFirst=await pick('Online first');
  out.backToRecent=await pick('Recently joined');
  const sorted=(a)=>JSON.stringify(a)===JSON.stringify([...a].sort());
  out.byNameSorted=out.byName&&sorted(out.byName.order);
  // persistence across a reopen
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  await page.locator('button').filter({hasText:/members/i}).first().click();
  await page.waitForTimeout(2200);
  out.afterReopen=await read();
  await page.keyboard.press('Escape');
  return out;
};
