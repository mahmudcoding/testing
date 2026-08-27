export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6000);
  const grab=(re)=>page.evaluate((src)=>{
    const re=new RegExp(src);
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
      let op=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const hits=[];
    for(const el of document.querySelectorAll('body *')){
      if(el.children.length) continue;
      const t=(el.textContent||'').trim();
      if(!re.test(t)) continue;
      if(!vis(el)) continue;
      hits.push(t.slice(0,30));
    }
    return [...new Set(hits)].slice(0,10);
  }, re);
  out.messageTimes = await grab('^\\\\d{1,2}:\\\\d{2}(\\\\s?[AP]M)?$');
  out.anyAmPm      = await grab('\\\\d{1,2}:\\\\d{2}\\\\s?[AP]M');
  // mute popover
  await page.locator('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]').first().click();
  await page.waitForTimeout(900);
  out.muteMenu = await page.evaluate(()=>{const w=document.querySelector('[data-radix-popper-content-wrapper]');
    return w?(w.innerText||'').replace(/\s+/g,' ').slice(0,80):'none';});
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  // settings: is there a time-format option?
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/account`);
  await page.waitForTimeout(5000);
  out.settingsAccount = await page.evaluate(()=>(document.querySelector('main')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,300));
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/appearance`);
  await page.waitForTimeout(4500);
  out.settingsAppearance = await page.evaluate(()=>(document.querySelector('main')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,300));
  return out;
};
