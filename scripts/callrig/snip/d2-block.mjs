import { safeClick, watchNotices } from './lib.mjs';
export default async ({page}) => {
  const WS='W4QDF1XTURESO01', who=process.env.QA_WHO||'QA Bob';
  const out={};
  const load = async () => { await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6500); };
  const blocked = () => page.evaluate(async()=>{const r=await fetch('/api/v1/messaging/users/blocked?limit=50',{credentials:'include'});
    return JSON.stringify(await r.json().catch(()=>({}))).slice(0,260);});
  const section = () => page.evaluate(()=>{const t=(document.querySelector('main').innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Blocked users'); return t.slice(i,i+240);});
  await load();
  out.beforeApi = await blocked(); out.beforeUi = await section();

  // enumerate comboboxes with their accessible names, then click the participant one
  out.combos = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    return [...document.querySelectorAll('main [role=combobox]')].filter(vis)
      .map((e,i)=>({i, name:(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)}));
  });
  const idx = out.combos.findIndex(c=>/participant|block/i.test(c.name));
  out.idx = idx;
  if (idx<0) return out;
  out.click = await safeClick(page,'main [role=combobox]',{index:idx});
  await page.waitForTimeout(800);
  // it is a typeahead INPUT, not a menu button — type to get suggestions
  await page.locator('main [role=combobox]').nth(idx).fill(process.env.QA_TYPE || 'Bob');
  await page.waitForTimeout(2200);
  out.options = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const pop=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox],[role=menu]')].filter(vis).pop();
    return pop?[...new Set([...pop.querySelectorAll('*')].filter(e=>e.children.length===0).map(e=>(e.textContent||'').trim()).filter(Boolean))].slice(0,10):null;
  });
  if (!out.options || !out.options.length) return out;
  await page.evaluate(w=>{ const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const pop=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox],[role=menu]')].filter(vis).pop();
    const hit=[...pop.querySelectorAll('*')].filter(e=>e.children.length===0).find(e=>(e.textContent||'').trim().includes(w));
    if(hit){let c=hit;for(let i=0;i<4&&c;i++,c=c.parentElement){if(c.getAttribute&&(c.getAttribute('role')||/^(BUTTON|LI|A)$/.test(c.tagName)))break;}(c||hit).click();}}, who);
  await page.waitForTimeout(1400);
  out.blockBtn = await page.evaluate(()=>{const b=[...document.querySelectorAll('main button')].find(x=>/^Block$/.test(x.innerText.trim()));
    return b?{disabled:b.disabled}:null;});
  out.notices = await watchNotices(page,{ms:8000, trigger: async()=>{
    await page.evaluate(()=>{const b=[...document.querySelectorAll('main button')].find(x=>/^Block$/.test(x.innerText.trim())); if(b&&!b.disabled)b.click();});
  }});
  await page.waitForTimeout(2000);
  out.afterApi = await blocked();
  await load();
  out.afterUi = await section();
  return out;
};
