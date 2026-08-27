const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.locator('button',{hasText:/^English$/}).first().click();
  await page.waitForTimeout(2500);
  out.options = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...new Set([...document.querySelectorAll('[role="option"],[role="menuitem"],li')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<24))].slice(0,10);},VS);
  const picked = await page.evaluate((vs)=>{const vis=eval(vs);
    const o=[...document.querySelectorAll('[role="option"],[role="menuitem"],li')].filter(vis)
      .find(o=>/Ўзбек|Узбек|Cyril/i.test(o.innerText||''));
    if(!o) return null; const t=o.innerText.trim(); o.click(); return t;},VS);
  out.picked=picked;
  if(!picked) return out;
  await page.waitForTimeout(7000);
  out.result = await page.evaluate(()=>{
    const t=document.body.innerText;
    const m=[...t.matchAll(/Aloqa\s*([’'ʼ‘`ʼ’])?\s*([Ѐ-ӿ]{1,14})/g)].slice(0,6)
      .map(x=>({apos:x[1]||'(none)', hex:x[1]?('U+'+x[1].codePointAt(0).toString(16).toUpperCase()):null, suffix:x[2]}));
    return { lang:document.documentElement.lang, brandMatches:m,
      sample:(t.match(/.{0,40}Aloqa.{0,40}/)||[''])[0].replace(/\s+/g,' ') };});
  return out;
};
