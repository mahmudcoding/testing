export default async ({page}) => {
  const r={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const btns = await page.$$('main button');
  const labs = await Promise.all(btns.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  const i = labs.findIndex(t=>/Fake .*Audio Input/i.test(t));
  if (i<0) return {err:'no mic combobox', labs: labs.slice(0,10)};
  r.was = labs[i];
  await btns[i].click(); await page.waitForTimeout(2000);
  const m=[...(await page.$$('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]'))].pop();
  if (!m) return {err:'no dropdown', ...r};
  r.options = await page.evaluate(()=>{const x=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')].pop();
    return [...x.querySelectorAll('[role="option"],[role="menuitem"],[role="menuitemradio"],button')].map(b=>({t:(b.textContent||'').trim().slice(0,30), checked:b.getAttribute('aria-checked'), sel:b.getAttribute('aria-selected'), state:b.getAttribute('data-state')}));});
  for (const it of await m.$$('[role="option"],[role="menuitem"],[role="menuitemradio"],button')) {
    const t=(await it.innerText()).trim(); if (/Fake Audio Input 2/i.test(t)) { await it.click(); r.picked=t.replace(/\n/g,' '); break; } }
  await page.waitForTimeout(2500);
  r.nowShows = await page.evaluate(()=>{const b=[...document.querySelectorAll('main button')].find(x=>/Fake .*Audio Input/i.test(x.textContent||'')); return b?b.textContent.trim().slice(0,40):null;});
  return r;
};
