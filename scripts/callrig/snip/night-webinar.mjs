export default async ({page}) => {
  const m=await page.$('main');
  const btns=await m.$$('button');
  for(const b of btns){ const t=((await b.innerText())||'').replace(/\s+/g,' ').trim();
    if(/^Webinar/.test(t)){
      const dis=await b.isDisabled();
      const before=await page.url();
      let clickErr=null;
      try{ await b.click({timeout:5000}); }catch(e){ clickErr=String(e).slice(0,60); }
      await page.waitForTimeout(3000);
      return {label:t.slice(0,50), disabled:dis, clickErr,
        urlChanged: (await page.url())!==before,
        dialog: await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop();
          return d?d.innerText.replace(/\n+/g,' | ').slice(0,110):null;})};
    } }
  return {err:'no webinar button'};
};
