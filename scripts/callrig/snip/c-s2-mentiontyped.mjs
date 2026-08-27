// Send two messages: (1) @handle typed by hand, picker dismissed; (2) @ picked from the list.
export default async ({page}) => {
  const out={steps:[]};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const clear=async()=>{await comp.click();await page.keyboard.press('Control+A');await page.keyboard.press('Backspace');await page.waitForTimeout(200);};

  // --- 1. typed by hand, picker dismissed with a space
  await clear();
  await comp.type('@qa_c_bob', {delay:55});
  await page.waitForTimeout(900);
  out.steps.push({at:'typed handle', picker: await page.evaluate(()=>
    [...document.querySelectorAll('[role="option"]')].filter(e=>e.getBoundingClientRect().height>0).length)});
  await comp.type(' QA-S2-MANUAL-1', {delay:40});
  await page.waitForTimeout(700);
  out.steps.push({at:'after space+text', picker: await page.evaluate(()=>
    [...document.querySelectorAll('[role="option"]')].filter(e=>e.getBoundingClientRect().height>0).length),
    text: await comp.evaluate(e=>e.innerText.slice(0,60))});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1400);

  // --- 2. picked from the list (control)
  await clear();
  await comp.type('@qa_c_bob', {delay:55});
  await page.waitForTimeout(1100);
  const opt=page.locator('[role="option"]').filter({hasText:'qa_c_bob'});
  out.steps.push({at:'control picker rows', n: await opt.count()});
  if (await opt.count()) { await opt.first().click(); await page.waitForTimeout(600); }
  out.steps.push({at:'after pick', text: await comp.evaluate(e=>e.innerText.slice(0,60))});
  await comp.type('QA-S2-PICKED-1', {delay:40});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);

  // --- measure both from the API
  const ch=page.url().split('/c/')[1];
  out.stored = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=6`,{credentials:'include'});
    const j=await r.json();
    const arr=(j.messages||j.data||j||[]);
    return arr.filter(m=>/QA-S2-(MANUAL|PICKED)-1/.test(m.body||''))
      .map(m=>({id:m.id, body:m.body, mention_ids:m.mention_ids, mentions:m.mentions}));
  }, ch);
  // how each renders
  out.rendered = await page.evaluate(()=>{
    const res=[];
    for (const el of document.querySelectorAll('main [data-message-id]')) {
      const t=el.innerText||'';
      if (!/QA-S2-(MANUAL|PICKED)-1/.test(t)) continue;
      const chips=[...el.querySelectorAll('[data-mention],[class*="mention"],a[href*="/u/"],span[data-lexical-mention]')]
        .map(c=>c.textContent.trim().slice(0,24));
      res.push({tag: /MANUAL/.test(t)?'MANUAL':'PICKED', chips, snippet:t.replace(/\s+/g,' ').slice(0,90)});
    }
    return res;
  });
  return out;
};
