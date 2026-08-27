const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
const readSw = (page, needle) => page.evaluate(([vs,needle])=>{const vis=eval(vs);
  const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
  const s=[...m.querySelectorAll('[role="switch"]')].filter(vis).find(x=>new RegExp(needle,'i').test(x.closest('div')?.parentElement?.innerText||''));
  return s?String(s.getAttribute('aria-checked')):null;},[VS,needle]);
export default async ({ page }) => {
  const reqs=[]; page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,80);}catch(e){}
    reqs.push({u:u.split('/api/v1/')[1].slice(0,40),s:r.status(),req:(r.request().postData()||'').slice(0,110),res:b});}});
  const go=async(p)=>{await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/'+p,{waitUntil:'domcontentloaded'});await page.waitForTimeout(2900);};
  const out={};
  await go('profile'); out.step1_profile_ActiveStatus = await readSw(page,'Active status');
  await go('privacy');  out.step1_privacy_ShowOnline  = await readSw(page,'Show online status');

  // toggle the PRIVACY one off (it may auto-save or use a save bar)
  await page.evaluate((vs)=>{const vis=eval(vs);const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    [...m.querySelectorAll('[role="switch"]')].filter(vis).find(x=>/Show online status/i.test(x.closest('div')?.parentElement?.innerText||''))?.click();},VS);
  await page.waitForTimeout(900);
  for(const b of await page.$$('button')){const t=(await b.innerText().catch(()=>''))||'';if(/^save/i.test(t.trim())){await b.click().catch(()=>{});break;}}
  await page.waitForTimeout(2600);
  out.step2_privacy_afterToggle = await readSw(page,'Show online status');
  out.step2_requests = reqs.slice();

  // now read the PROFILE control — does it agree?
  await go('profile'); out.step3_profile_ActiveStatus = await readSw(page,'Active status');
  // and re-read privacy after a full reload
  await go('privacy');  out.step4_privacy_afterReload = await readSw(page,'Show online status');
  return out;
};
