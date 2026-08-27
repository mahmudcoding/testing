export default async ({page}) => {
  const read = async () => await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    const inp=[...d.querySelectorAll('input')];
    const g=(n)=>{const e=inp.find(x=>(x.getAttribute('aria-label')||'')===n); return e?e.value:null;};
    return {startsT:g('Starts time'), endsT:g('Ends time'), endsD:g('Ends date'),
      pressed:[...d.querySelectorAll('button')]
        .filter(b=>/^(15 min|30 min|45 min|1 hr|1\.5 hr|2 hr)$/.test((b.textContent||'').trim()))
        .filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>(b.textContent||'').trim())};
  });
  const out={before: await read()};
  // click a preset
  const d=await page.$$('[role="dialog"]'); const dlg=d[d.length-1];
  const btns=await dlg.$$('button');
  for(const b of btns){ if(((await b.textContent())||'').trim()===(process.env.QA_DUR||'1 hr')){ await b.click(); break; } }
  await page.waitForTimeout(2000);
  out.afterPreset = await read();
  // now type an Ends time directly
  const ends=await dlg.$('input[aria-label="Ends time"]');
  if(ends){ await ends.click({clickCount:3}); await ends.fill(process.env.QA_ENDS||'05:00'); await page.waitForTimeout(2000); }
  out.afterManualEnds = await read();
  return out;
};
