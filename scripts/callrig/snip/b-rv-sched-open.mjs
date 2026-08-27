export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>(x.innerText||'').trim()==='Schedule meeting');
    if(b){ b.click(); return true;} return false;
  });
  await page.waitForTimeout(3500);
  out.dialog = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop();
    if(!d) return null;
    return {
      text: d.innerText.replace(/\n{2,}/g,'\n').slice(0,900),
      buttons: [...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim(), al:b.getAttribute('aria-label'), tid:b.getAttribute('data-testid')})).slice(0,25),
      inputs: [...d.querySelectorAll('input,textarea,select')].filter(i=>i.getBoundingClientRect().width>0).map(i=>({t:i.type||i.tagName, ph:i.placeholder, v:String(i.value).slice(0,25), lab:i.getAttribute('aria-label'), tid:i.getAttribute('data-testid')})).slice(0,15)
    };
  });
  return out;
};
