const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  for (const [k,url] of [['company','/w/W4QAF1XTURESO01/settings/roles?scope=company'],['workspace','/w/W4QAF1XTURESO01/settings/roles?scope=workspace']]) {
    await page.goto('https://airion-cargo.store'+url,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4200);
    out[k] = await page.evaluate((vs)=>{const vis=eval(vs);
      const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
      return { txt:(m.innerText||'').replace(/\s+/g,' ').slice(-320),
        tabs:[...m.querySelectorAll('[role="tab"],button')].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,24)).filter(Boolean).slice(0,14) };},VS);
  }
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/roles.png'});
  return out;
};
