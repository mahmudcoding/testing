export default async ({page}) => {
  const steps=[];
  await page.locator('[data-testid="call-controls-add-to-call"]').first().click({timeout:8000}).catch(e=>steps.push('click err'));
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const dlgs=[...document.querySelectorAll('[role="dialog"]')].map(d=>({
      text:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),
      inputs:[...d.querySelectorAll('input')].map(i=>i.value||i.placeholder),
      buttons:[...d.querySelectorAll('button')].map(b=>(b.textContent||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,12)
    }));
    const links = (document.body.innerText.match(/https?:\/\/\S*\/join\/\S+/g)||[]);
    return { dlgs, links };
  });
  steps.push(JSON.stringify(info).slice(0,900));
  return steps;
};
