export default async ({page}) => {
  const btns = await page.$$('button[aria-label="Participant actions"]');
  if (!btns.length) return {err:'none'};
  const idx = Number(process.env.QA_IDX||1);
  await btns[idx].click();
  await page.waitForTimeout(2500);
  const menu = await page.evaluate(()=>{
    const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].pop();
    return m? {text:m.innerText.replace(/\n+/g,' | ').slice(0,450), items:[...m.querySelectorAll('button,[role="menuitem"]')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40)).filter(Boolean)} : 'no menu';
  });
  return {count: btns.length, menu};
};
