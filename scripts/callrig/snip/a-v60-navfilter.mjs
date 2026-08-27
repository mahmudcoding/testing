const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/privacy',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2900);
  const restored = await page.evaluate((vs)=>{const vis=eval(vs);const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const s=[...m.querySelectorAll('[role="switch"]')].filter(vis).find(x=>/Show online status/i.test(x.closest('div')?.parentElement?.innerText||''));
    if(s && s.getAttribute('aria-checked')==='false'){ s.click(); return 'clicked-to-restore'; } return 'already:'+s?.getAttribute('aria-checked');},VS);
  await page.waitForTimeout(2200);
  const nav = await page.evaluate((vs)=>{const vis=eval(vs);
    const navEl=document.querySelector('a[href*="/settings/"]')?.closest('nav');
    if(!navEl) return {noNav:true};
    return {
      inputsAny: [...navEl.querySelectorAll('input,textarea,[contenteditable]')].map(i=>({tag:i.tagName,ph:i.placeholder||'',al:i.getAttribute('aria-label')||'',visible:vis(i)})),
      buttonsAny: [...navEl.querySelectorAll('button')].map(b=>({t:(b.innerText||'').trim().slice(0,24),al:(b.getAttribute('aria-label')||'').slice(0,24),visible:vis(b)})),
      groupLabels: [...navEl.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText?.trim()&&!e.closest('a')).map(e=>e.innerText.trim().slice(0,20)),
      linkCount: navEl.querySelectorAll('a').length,
    };},VS);
  const pageWide = await page.evaluate(()=>({
    filterSettingsInHTML: /Filter settings/i.test(document.body.innerHTML),
    noMatchInHTML: /No settings match/i.test(document.body.innerHTML),
    standingInHTML: /personal workspace/i.test(document.body.innerHTML),
    platformGroupVisible: /Platform/i.test(document.body.innerText),
  }));
  return { restoredShowOnline: restored, nav, pageWide };
};
