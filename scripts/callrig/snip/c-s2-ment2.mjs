const clear = async (page, comp) => {
  await comp.click();
  await page.keyboard.press('End');
  for (let i=0;i<3;i++){ await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace'); await page.waitForTimeout(150); }
  const t=await comp.evaluate(e=>e.innerText.trim());
  if (t) { for(let i=0;i<t.length+5;i++) await page.keyboard.press('Backspace'); }
  return await comp.evaluate(e=>e.innerText.trim());
};
export default async ({page}) => {
  const out={cleared:[]};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');

  // 1. typed by hand
  out.cleared.push(await clear(page, comp));
  await comp.type('@qa_c_carol', {delay:55}); await page.waitForTimeout(900);
  await comp.type(' QA-S2-MANUAL-2', {delay:35}); await page.waitForTimeout(600);
  out.typedText = await comp.evaluate(e=>e.innerText.slice(0,50));
  await page.keyboard.press('Enter'); await page.waitForTimeout(1500);

  // 2. picked from the list
  out.cleared.push(await clear(page, comp));
  await comp.type('@qa_c_carol', {delay:55}); await page.waitForTimeout(1100);
  const opt=page.locator('[role="option"]').filter({hasText:'qa_c_carol'});
  out.pickRows=await opt.count();
  if (out.pickRows) await opt.first().click();
  await page.waitForTimeout(600);
  await comp.type('QA-S2-PICKED-2', {delay:35}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1500);

  // 3. non-member of this channel, typed by hand
  out.cleared.push(await clear(page, comp));
  await comp.type('@qa_c_dave', {delay:55}); await page.waitForTimeout(900);
  out.davePicker = await page.evaluate(()=>[...document.querySelectorAll('[role="option"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>e.textContent.trim().slice(0,30)));
  await comp.type(' QA-S2-NONMEMBER-1', {delay:35}); await page.waitForTimeout(600);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1800);

  const ch=page.url().split('/c/')[1];
  out.stored = await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=8`,{credentials:'include'})).json();
    return (j.messages||j.data||j||[]).map(m=>({body:(m.body||'').slice(0,60), mention_ids:m.mention_ids}))
      .filter(m=>/MANUAL-2|PICKED-2|NONMEMBER-1/.test(m.body));
  }, ch);
  out.rendered = await page.evaluate(()=>{
    const res=[];
    for (const el of document.querySelectorAll('main [data-message-id]')) {
      const t=el.innerText||''; const m=t.match(/QA-S2-(MANUAL-2|PICKED-2|NONMEMBER-1)/); if(!m) continue;
      const b=el.querySelector('button[data-mention-user-id]');
      const d=b?getComputedStyle(b):null;
      res.push({tag:m[1], isButton:!!b, label:b&&b.textContent.trim(),
        userId:b&&b.dataset.mentionUserId, color:d&&d.color, bg:d&&d.backgroundColor});
    }
    return res;
  });
  return out;
};
