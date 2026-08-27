export default async ({ page }) => {
  await page.screenshot({ path: '/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/settings-invalid.png' });
  return await page.evaluate(() => {
    const vis=(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;};
    const out=[];
    for (const inp of document.querySelectorAll('input')) {
      const ai = inp.getAttribute('aria-invalid');
      if (ai !== 'true') continue;
      const db = inp.getAttribute('aria-describedby')||'';
      const descTexts = db.split(/\s+/).filter(Boolean).map(id=>{const e=document.getElementById(id);return e?{id,txt:(e.innerText||e.textContent||'').replace(/\s+/g,' ').slice(0,90),visible:vis(e)}:{id,missing:true};});
      // any text near the row
      const row = inp.closest('div')?.parentElement;
      const rowTxt = row ? (row.innerText||'').replace(/\s+/g,' ').slice(0,120) : '';
      out.push({ ph: inp.placeholder.slice(0,32), val: inp.value.slice(0,24), describedby: db, descTexts, rowTxt, validationMessage: inp.validationMessage||'' });
    }
    const saveRow = [...document.querySelectorAll('button')].filter(vis).find(b=>/save changes/i.test(b.innerText||''))?.closest('div');
    return { invalidInputs: out, saveBarText: saveRow ? (saveRow.innerText||'').replace(/\s+/g,' ').slice(0,140) : null };
  });
};
