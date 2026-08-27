const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.langOptions = await page.evaluate((vs)=>{const vis=eval(vs);
    const b=[...document.querySelectorAll('button')].filter(vis).find(b=>/English|Русский|O'zbek|Ўзбек/i.test(b.innerText||''));
    if(!b) return null; b.click(); return true;},VS);
  await page.waitForTimeout(2000);
  out.options = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...new Set([...document.querySelectorAll('[role="option"],[role="menuitem"]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean))].slice(0,8);},VS);
  // pick the Uzbek Cyrillic entry
  const picked = await page.evaluate((vs)=>{const vis=eval(vs);
    const o=[...document.querySelectorAll('[role="option"],[role="menuitem"]')].filter(vis)
      .find(o=>/Ўзбек|Узбек|Cyril/i.test(o.innerText||''));
    if(!o) return null; const t=o.innerText.trim(); o.click(); return t;},VS);
  out.picked=picked;
  await page.waitForTimeout(6000);
  out.brand = await page.evaluate(()=>{
    const t=document.body.innerText;
    // the brand suffix with its apostrophe, e.g. Aloqa'да / Aloqa’да
    const m=[...t.matchAll(/Aloqa\s*([’'ʼ‘`])?\s*([Ѐ-ӿ]{1,12})/g)].slice(0,5)
      .map(x=>({apostrophe:x[1]||'(none)', code:x[1]?x[1].codePointAt(0).toString(16):null, suffix:x[2]}));
    return { matches:m, lang:document.documentElement.lang,
      sample:(t.match(/.{0,50}Aloqa.{0,40}/)||[''])[0].replace(/\s+/g,' ') };});
  return out;
};
