export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const reqs=[];
  const h=r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET')
    reqs.push(r.request().method()+' '+r.status()+' '+u.split('/api/v1/')[1].split('?')[0].slice(0,40));};
  page.on('response',h);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const inp = await page.$('main input[type="text"]:not([type=search])');
  out.found = !!inp;
  if (!inp) { page.off('response',h); return out; }
  out.attrs = await inp.evaluate(e=>({readOnly:e.readOnly, disabled:e.disabled, value:e.value}));
  await inp.click({clickCount:3});
  await page.keyboard.type('QA Workspace D EDIT');
  await page.waitForTimeout(1600);
  out.afterType = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    return { value: main.querySelector('input[type="text"]')?.value,
      saveBar: [...main.querySelectorAll('button')].filter(vis)
        .map(b=>(b.innerText||'').trim()).filter(x=>/Save|Discard/i.test(x)) };
  });
  const save = await page.$('main button:has-text("Save changes")');
  if (save) { await save.click().catch(()=>{}); await page.waitForTimeout(3500); }
  page.off('response',h);
  out.writes=[...new Set(reqs)];
  out.serverName = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/workspaces/W4QDF1XTURESO01',{credentials:'include'});
    return (await r.json()).name;});
  out.screen = await page.evaluate(()=>{
    const t=(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ');
    return /permission|not allowed|denied|Could not|error/i.test(t)? t.slice(0,150):'(no error text)';});
  return out;
};
