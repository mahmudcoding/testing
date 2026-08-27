export default async ({page}) => {
  const name = process.env.QA_BTN;
  const tb = await page.$('[data-testid="call-toolbar"]');
  const btns = await tb.$$('button');
  for (const b of btns) {
    const l = (await b.getAttribute('aria-label'))||'';
    if (l === name) {
      const before = {label:l, pressed: await b.getAttribute('aria-pressed'), disabled: await b.isDisabled()};
      await b.click();
      await page.waitForTimeout(Number(process.env.QA_WAIT||3000));
      const after = await page.evaluate((n)=>{
        const t=document.querySelector('[data-testid="call-toolbar"]');
        const m=[...t.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'').startsWith(n.split(' ')[0]));
        return m?{label:m.getAttribute('aria-label'), pressed:m.getAttribute('aria-pressed')}:null;
      }, name);
      const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,150)).filter(Boolean));
      return {before, after, toasts};
    }
  }
  return {err:'button not found: '+name, available: await page.evaluate(()=>[...document.querySelectorAll('[data-testid="call-toolbar"] button')].map(b=>b.getAttribute('aria-label')))};
};
