const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3600);
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    const aside=document.querySelector('a[href*="/settings/"]')?.closest('aside');
    if(!aside) return {noAside:true};
    return { n:[...aside.querySelectorAll('a')].filter(vis).length,
             links:[...aside.querySelectorAll('a')].filter(vis).map(a=>(a.innerText||'').trim().slice(0,18)),
             emptyMsg:(aside.innerText.match(/No settings match[^\n]*/)||[null])[0] };},VS);
  const out={}; out.before = await read();
  const inp = await page.$('aside input[type="search"]');
  if(!inp) return {err:'no filter input', before: out.before};
  for (const [k,q] of [['role','role'],['sess','sess'],['nomatch','zzzznomatch']]) {
    await inp.click({clickCount:3}); await page.keyboard.press('Backspace');
    await page.keyboard.type(q,{delay:55}); await page.waitForTimeout(1000);
    out['q_'+k] = await read();
  }
  await inp.click({clickCount:3}); await page.keyboard.press('Backspace'); await page.waitForTimeout(1000);
  out.cleared = await read();
  return out;
};
