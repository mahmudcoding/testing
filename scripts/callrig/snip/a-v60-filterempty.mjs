const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3600);
  const inp = await page.$('aside input[type="search"]');
  await inp.click(); await page.keyboard.type('zzzznomatch',{delay:45}); await page.waitForTimeout(1200);
  const r = await page.evaluate((vs)=>{const vis=eval(vs);
    const aside=document.querySelector('aside input[type="search"]')?.closest('aside');
    if(!aside) return {noAside:true};
    return { asideText:(aside.innerText||'').replace(/\s+/g,' ').slice(0,150),
             visibleLinks:[...aside.querySelectorAll('a')].filter(vis).length,
             emptyVisible: (()=>{const el=[...aside.querySelectorAll('*')].find(e=>/No settings match/i.test(e.innerText||'')&&e.children.length===0); return el?vis(el):false;})() };},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/filter-empty.png'});
  return r;
};
