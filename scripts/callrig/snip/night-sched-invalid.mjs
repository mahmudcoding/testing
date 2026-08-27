export default async ({page}) => {
  const d=await page.$$('[role="dialog"]'); const dlg=d[d.length-1];
  const title=await dlg.$('input[aria-label="Add title"]');
  if(title) await title.fill(process.env.QA_TITLE||'QA NEG DURATION');
  const ends=await dlg.$('input[aria-label="Ends time"]');
  if(ends){ await ends.click({clickCount:3}); await ends.fill(process.env.QA_ENDS||'02:00'); }
  await page.waitForTimeout(2500);
  const state = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    const inp=[...d.querySelectorAll('input')];
    const g=(n)=>{const e=inp.find(x=>(x.getAttribute('aria-label')||'')===n); return e?e.value:null;};
    const submit=[...d.querySelectorAll('button')].find(b=>/^(Schedule|Create|Save)/.test((b.textContent||'').trim()));
    const t=d.innerText;
    const err=(t.match(/[^\n]*(invalid|Invalid|must be|cannot|error|Error|before|after)[^\n]*/)||[''])[0].trim().slice(0,80);
    return {startsT:g('Starts time'), endsT:g('Ends time'),
      pressed:[...d.querySelectorAll('button')]
        .filter(b=>/^(15 min|30 min|45 min|1 hr|1\.5 hr|2 hr)$/.test((b.textContent||'').trim()))
        .filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>(b.textContent||'').trim()),
      submit: submit?{label:(submit.textContent||'').trim(), disabled:submit.disabled}:null,
      errText: err||null};
  });
  return state;
};
