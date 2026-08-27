const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const cases = [ ['empty',''], ['one char','A'], ['two spaces','  '],
                  ['leading/trailing spaces','   ok   '], ['two chars','Ab'],
                  ['129 chars','X'.repeat(129)], ['duplicate of existing','QA Workspace D'] ];
  const out=[];
  for (const [label, val] of cases) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/workspaces`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2300);
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Create workspace$/.test((x.innerText||'').trim()));
      if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(1500);
    const dlgInput = await page.evaluate(`(() => { const vis=(${VIS});
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0]; if(!d) return false;
      const i=[...d.querySelectorAll('input')].filter(vis)[0]; return !!i; })()`);
    if (!dlgInput) { out.push({label, err:'no dialog input'}); continue; }
    await page.evaluate(`(() => { const vis=(${VIS});
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
      const i=[...d.querySelectorAll('input')].filter(vis)[0];
      const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(i, VAL);
      i.dispatchEvent(new Event('input',{bubbles:true}));
      i.dispatchEvent(new Event('change',{bubbles:true})); })()`.replace('VAL', JSON.stringify(val)));
    await page.waitForTimeout(1100);
    const st = await page.evaluate(`(() => { const vis=(${VIS});
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
      const i=[...d.querySelectorAll('input')].filter(vis)[0];
      const btn=[...d.querySelectorAll('button')].filter(vis).filter(b=>/^Create$/.test((b.innerText||'').trim()))[0];
      const msgs=[...d.querySelectorAll('p,span,div')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim())
        .filter(x=>x&&x.length<110&&/character|valid|required|exist|already|Use \\d/i.test(x));
      return { valueLen:i.value.length, valueShown:i.value.slice(0,20),
               createDisabled: btn ? (btn.disabled===true||btn.getAttribute('aria-disabled')==='true') : null,
               msgs:[...new Set(msgs)].slice(0,3) }; })()`);
    out.push({ label, sent:val.length>30?`(${val.length} chars)`:JSON.stringify(val), ...st });
  }
  return out;
};
