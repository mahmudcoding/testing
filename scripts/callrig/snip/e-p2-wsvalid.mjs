import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const dump = `(() => { ${VISFN}
  const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };
  const boxes=[...document.querySelectorAll('[role=dialog],[role=menu],[role=listbox],[data-radix-popper-content-wrapper]')].filter(boxVis);
  const p=boxes[boxes.length-1];
  const dlg=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  const create=dlg? [...dlg.querySelectorAll('button')].find(b=>/^create$/i.test((b.textContent||'').trim())):null;
  return { top: p?(p.innerText||'').replace(/\\n+/g,' | ').slice(0,400):'(none)',
    topCtrls: p?interactives(p).map(d=>d.label.slice(0,26)).join(' | ').slice(0,400):'',
    dlgText: dlg?(dlg.innerText||'').replace(/\\n+/g,' | ').slice(0,400):'(none)',
    createDisabled: create? create.disabled : null,
    inputVal: dlg? (dlg.querySelector('input')?.value||'').length : null };
})()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(1200);
  await page.getByRole('menuitem', {name:/Create workspace/i}).first().click();
  await page.waitForTimeout(2200);
  // open the "Create in" selector
  try { await page.getByRole('button',{name:/Create in|Personal workspace/i}).first().click({timeout:6000}); } catch(e){ out.selErr=String(e).slice(0,90); }
  await page.waitForTimeout(1500);
  out.createInOptions = await page.evaluate(dump);
  await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  const inp = page.locator('[role=dialog] input').first();
  for (const [tag, val] of [['len1','A'], ['len2','Ab'], ['len128','X'.repeat(128)], ['len129','Y'.repeat(129)], ['spaces','   ']]) {
    await inp.fill(''); await page.waitForTimeout(300);
    await inp.fill(val); await page.waitForTimeout(1100);
    const s = await page.evaluate(dump);
    out[tag] = {chars: s.inputVal, createDisabled: s.createDisabled, hint: (s.dlgText.match(/Use 2 to 128[^|]*|[^|]*character[^|]*/i)||[''])[0].trim().slice(0,80)};
  }
  return out;
};
