export default async ({page}) => {
  const M = process.env.QA_MEET;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('recording')){let b='';try{b=(await r.text()).slice(0,400);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.click('[data-testid="recording-start-access-trigger"]');
  await page.waitForTimeout(1800);
  const dlg = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].pop();
    return {text: d? d.innerText.replace(/\n+/g,' | ').slice(0,600):null,
            controls: d? [...d.querySelectorAll('button,input,[role=radio],[role=switch]')].map(c=>`${(c.getAttribute('aria-label')||c.textContent||'').trim().slice(0,40)}#${c.getAttribute('data-testid')||'-'}${c.getAttribute('aria-checked')!=null?' ac='+c.getAttribute('aria-checked'):''}${c.checked!=null?' chk='+c.checked:''}`):[]};
  });
  return {dlg, net};
};
