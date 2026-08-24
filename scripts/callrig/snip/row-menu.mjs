export default async ({page}) => {
  const rows = await page.$$('[data-testid="participants-list-panel"] button[aria-label="Participant actions"], [data-testid="participants-list"] button');
  const info = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="participant-row"]')].map(r=>r.innerText.replace(/\n+/g,' | ').slice(0,60)));
  const btns = await page.$$('button[aria-label="Participant actions"]');
  if (!btns.length) return {err:'no row action btns', info};
  await btns[btns.length-1].click();
  await page.waitForTimeout(2500);
  const menu = await page.evaluate(()=>{
    const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].pop();
    return m? {text:m.innerText.replace(/\n+/g,' | ').slice(0,400), items:[...m.querySelectorAll('button,[role="menuitem"]')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,35)).filter(Boolean)} : 'no menu';
  });
  return {rows: info, menu};
};
