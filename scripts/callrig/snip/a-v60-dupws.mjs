const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/workspace/i.test(u)&&r.request().method()==='POST'){
    let b=null;try{b=(await r.text()).slice(0,180);}catch(e){}
    net.push({req:(r.request().postData()||'').slice(0,90),s:r.status(),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/workspaces',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  // try a case-variant of an existing name
  for (const name of ['qa second','QA  Second','QA Second ']) {
    await page.locator('button',{hasText:/^Create workspace$/}).first().click();
    await page.waitForTimeout(2000);
    const i=await page.$('[role="dialog"] input');
    await i.click({clickCount:3}); await page.keyboard.type(name,{delay:20});
    await page.waitForTimeout(600);
    await page.locator('[role="dialog"] button',{hasText:/^Create$/}).first().click();
    await page.waitForTimeout(4000);
    out['try_'+name.replace(/\s/g,'_')] = await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
      return { dialogOpen:!!d, err:d?[...d.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/exists|already|invalid|error/i.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,60))[0]||null:null };},VS);
    await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(1200);
  }
  out.requests=net;
  out.wsList = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return [...m.querySelectorAll('tr')].filter(vis).map(r=>[...r.querySelectorAll('td,th')].map(c=>(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,26))).slice(0,6);},VS);
  return out;
};
