import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const dump = `(() => { ${VISFN} ${boxVisFn}
  const boxes=[...document.querySelectorAll('[role=dialog],[role=menu],[role=listbox],[data-radix-popper-content-wrapper]')].filter(boxVis);
  const p=boxes[boxes.length-1];
  const dlg=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  const create=dlg? [...dlg.querySelectorAll('button')].find(b=>/^create$/i.test((b.textContent||'').trim())):null;
  return { nBoxes: boxes.length, top: p?(p.innerText||'').replace(/\\n+/g,' | ').slice(0,350):'(none)',
    topCtrls: p?interactives(p).map(d=>d.label.slice(0,26)).join(' | ').slice(0,350):'',
    dlgText: dlg?(dlg.innerText||'').replace(/\\n+/g,' | ').slice(0,350):'(none)',
    createDisabled: create? create.disabled : null,
    inputVal: dlg? (dlg.querySelector('input')?.value||'').length : null };
})()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2200);
  out.menu = await page.evaluate(dump);
  // click "Create workspace" by visible text, whatever its role
  const ok = await page.evaluate(`(() => { ${VISFN}
    const el = interactives(document).find(d=>/create workspace/i.test(d.label));
    if(!el) return false;
    const node=[...document.querySelectorAll('button,[role=menuitem],a')].find(n=>vis(n)&&/create workspace/i.test((n.getAttribute('aria-label')||n.textContent||'')));
    if(!node) return false; node.click(); return true; })()`);
  out.clickedCreate = ok;
  await page.waitForTimeout(2800);
  out.dialog = await page.evaluate(dump);
  if (!out.dialog.dlgText || out.dialog.dlgText==='(none)') return out;
  const inp = page.locator('[role=dialog] input').first();
  for (const [tag, val] of [['len1','A'], ['len2','Ab'], ['len128','X'.repeat(128)], ['len129','Y'.repeat(129)], ['spacesOnly','   ']]) {
    await inp.fill(''); await page.waitForTimeout(400);
    await inp.fill(val); await page.waitForTimeout(1200);
    const s = await page.evaluate(dump);
    out[tag] = {chars:s.inputVal, createDisabled:s.createDisabled, dlg:s.dlgText.slice(0,190)};
  }
  return out;
};
