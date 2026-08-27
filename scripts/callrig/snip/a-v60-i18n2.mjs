const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  out.combos = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return [...m.querySelectorAll('button,[role="combobox"],select')].filter(vis)
      .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22), role:b.getAttribute('role')||b.tagName,
        x:Math.round(b.getBoundingClientRect().x), y:Math.round(b.getBoundingClientRect().y)}))
      .filter(b=>b.t).slice(0,14);},VS);
  const lang = (out.combos||[]).find(c=>/English|Русск|zbek|Ўзбек/i.test(c.t));
  out.langBtn=lang;
  if(!lang) return out;
  await page.mouse.click(lang.x+20, lang.y+10);
  await page.waitForTimeout(2200);
  out.options = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...new Set([...document.querySelectorAll('[role="option"],[role="menuitem"],[role="listbox"] *')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<26))].slice(0,10);},VS);
  return out;
};
