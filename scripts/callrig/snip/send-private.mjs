export default async ({page}) => {
  const netlog=[];
  page.on('request', r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET') netlog.push(`${r.method()} ${u.replace('https://airion-cargo.store','')} :: ${(r.postData()||'').slice(0,200)}`);});
  const m=[...(await page.$$('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]'))].pop();
  if(!m) return {err:'no menu'};
  for (const it of await m.$$('button,[role="option"],[role="menuitem"]')) {
    if ((await it.innerText()).trim()==='QA Bob') { await it.click(); break; }
  }
  await page.waitForTimeout(1500);
  const ta = await page.$('[data-testid="in-call-chat-panel"] textarea');
  if (!ta) return {err:'no textarea'};
  await ta.fill('QA-PRIVATE-TO-BOB-ONLY');
  await page.waitForTimeout(400);
  const send = await page.$('[data-testid*="chat-send"]') || await page.$('[data-testid="in-call-chat-panel"] button:has-text("Send")');
  if (send) await send.click(); else await ta.press('Enter');
  await page.waitForTimeout(3500);
  const panel = await page.evaluate(()=>{const p=document.querySelector('[data-testid="in-call-chat-panel"]'); return p?p.innerText.replace(/\n+/g,' | ').slice(0,500):'';});
  return {net: netlog, panel};
};
