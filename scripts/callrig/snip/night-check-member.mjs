export default async ({page}) => {
  const who=process.env.QA_WHO||'QA Carol';
  await page.check(`[role="dialog"] input[aria-label="${who}"]`);
  await page.waitForTimeout(1200);
  return {checked: await page.evaluate((w)=>{
    const i=document.querySelector(`[role="dialog"] input[aria-label="${w}"]`); return i?i.checked:null;}, who),
    text: await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop();
      const t=d.innerText.replace(/\n+/g,' | '); const i=t.indexOf('Selected'); return t.slice(i, i+40);})};
};
