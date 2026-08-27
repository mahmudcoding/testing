const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(9500);
  const out={};
  out.renderedMessages = await page.evaluate(()=>document.querySelectorAll('[data-message-id]').length);
  await page.locator('button[aria-label="Channel details"]').last().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2800);
  const tag = await page.evaluate(()=>{
    const tabs=[...document.querySelectorAll('[role="tab"]')];
    const close=[...document.querySelectorAll('button')].find(b=>/Close channel details/.test(b.getAttribute('aria-label')||''));
    if(!tabs.length||!close) return {ok:false};
    let node=tabs[0];
    while (node && !(tabs.every(t=>node.contains(t)) && node.contains(close))) node=node.parentElement;
    node.setAttribute('data-qa-panel','1');
    return {ok:true, focusables:node.querySelectorAll('button,a,input,textarea,[tabindex]:not([tabindex="-1"])').length};
  });
  out.tagged = tag;
  if(!tag.ok) return out;
  const walk = async (key, max) => {
    let steps=0;
    for (let i=0;i<max;i++){
      await page.keyboard.press(key); await page.waitForTimeout(60); steps++;
      const inP=await page.evaluate(()=>{
        const a=document.activeElement, p=document.querySelector('[data-qa-panel="1"]');
        return p? p.contains(a) : false;
      });
      if (inP) return {steps, landed:true, on: await page.evaluate(()=>(document.activeElement.getAttribute('aria-label')||document.activeElement.textContent||'').trim().slice(0,28))};
    }
    return {steps, landed:false};
  };
  out.forward = await walk('Tab', 200);
  // reset: refocus the trigger and walk backwards
  await page.locator('button[aria-label="Channel details"]').last().focus();
  await page.waitForTimeout(400);
  out.backward = await walk('Shift+Tab', 60);
  return out;
};
