const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out = {};
  // discard any leftover dirty state
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/profile',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3200);
  out.profile = await page.evaluate((vs)=>{const vis=eval(vs);return{
    h: [...document.querySelectorAll('h1,h2,h3')].filter(vis).map(h=>h.innerText.trim().slice(0,40)).slice(0,12),
    inputs: [...document.querySelectorAll('input,textarea')].filter(vis).map(i=>({tag:i.tagName,ph:(i.placeholder||'').slice(0,32),val:(i.value||'').slice(0,32),type:i.type||''})),
    selects: [...document.querySelectorAll('select')].filter(vis).map(s=>({name:s.name,val:s.value,opts:s.options.length})),
    combos: [...document.querySelectorAll('[role="combobox"],button[aria-haspopup]')].filter(vis).map(b=>({t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,40),al:(b.getAttribute('aria-label')||'').slice(0,30)})),
    bodyHasTZ: /time ?zone/i.test(document.body.innerText),
  };},VS);
  // where does timezone live? scan every settings section
  const secs=['account','profile','notifications','appearance','calls','privacy','sessions','security','about'];
  out.tzScan={};
  for (const s of secs){
    await page.goto(`https://airion-cargo.store/w/W4QAF1XTURESO01/settings/${s}`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(2200);
    out.tzScan[s]=await page.evaluate(()=>{
      const m=document.body.innerText.match(/.{0,40}[Tt]ime ?zone.{0,60}/);
      return m?m[0].replace(/\s+/g,' '):null;
    });
  }
  return out;
};
