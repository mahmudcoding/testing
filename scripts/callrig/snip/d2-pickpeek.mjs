export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto('https://airion-cargo.store/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1500);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const out={};
  const sel = 'main [role="combobox"], main [aria-haspopup], main button[aria-expanded]';
  out.triggers = await page.evaluate((sel)=>[...document.querySelectorAll(sel)]
    .filter(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0;})
    .map((x,i)=>({i, text:(x.innerText||'').trim().slice(0,25), role:x.getAttribute('role'), exp:x.getAttribute('aria-expanded')})), sel);
  const idx = out.triggers.findIndex(t=>/Select a member/i.test(t.text));
  out.idx = idx;
  const el = page.locator(sel).nth(idx);
  const state = async tag => ({[tag]: await page.evaluate((sel)=>{
      const t=[...document.querySelectorAll(sel)].find(x=>/Select a member/i.test(x.innerText||''));
      const n=document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox],[role=option]').length;
      return {exp: t?t.getAttribute('aria-expanded'):'gone', popupNodes:n};
    }, sel)});
  await el.click(); await page.waitForTimeout(2500); Object.assign(out, await state('afterClick'));
  if (out.afterClick.exp !== 'true') { await el.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(2000); Object.assign(out, await state('afterEnter')); }
  if ((out.afterEnter||out.afterClick).exp !== 'true') { await el.focus(); await page.keyboard.press(' '); await page.waitForTimeout(2000); Object.assign(out, await state('afterSpace')); }
  out.options = await page.evaluate(()=>[...document.querySelectorAll('[role=option]')].map(e=>(e.innerText||'').trim().slice(0,30)));
  return out;
};
