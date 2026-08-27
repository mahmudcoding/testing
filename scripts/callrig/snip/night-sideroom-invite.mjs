export default async ({page}) => {
  const idx=Number(process.env.QA_IDX||0);
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('breakout')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const boxes = await page.$$('[data-testid="side-room-invite-invitee"]');
  if(!boxes[idx]) return {err:'no invitee at '+idx, count:boxes.length};
  const label = await boxes[idx].evaluate(e=>{const l=e.closest('label'); return l?l.innerText.replace(/\n+/g,' ').trim():'?';});
  await boxes[idx].check();
  await page.waitForTimeout(600);
  await page.locator('[data-testid="side-room-invite-submit"]').click();
  await page.waitForTimeout(4000);
  const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,150)).filter(Boolean));
  return {invited: label, net, toasts};
};
