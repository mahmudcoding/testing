const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(9000);
  const out={};
  await page.locator('button[aria-label="Channel details"]').last().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2800);
  // tag the panel: smallest element containing ALL role=tab nodes and the Close button
  out.tagged = await page.evaluate(()=>{
    const tabs=[...document.querySelectorAll('[role="tab"]')];
    const close=[...document.querySelectorAll('button')].find(b=>/Close channel details/.test(b.getAttribute('aria-label')||''));
    if(!tabs.length||!close) return {ok:false, tabs:tabs.length, close:!!close};
    let node=tabs[0];
    while (node && !(tabs.every(t=>node.contains(t)) && node.contains(close))) node=node.parentElement;
    if(!node) return {ok:false};
    node.setAttribute('data-qa-panel','1');
    const r=node.getBoundingClientRect();
    return {ok:true, rect:{x:Math.round(r.x), w:Math.round(r.width)},
      focusables: node.querySelectorAll('button,a,input,textarea,[tabindex]:not([tabindex="-1"])').length};
  });
  if(!out.tagged.ok) return out;
  out.focusStart = await page.evaluate(()=>{
    const a=document.activeElement, p=document.querySelector('[data-qa-panel="1"]');
    return {label:(a.getAttribute('aria-label')||a.textContent||'').trim().slice(0,30), inPanel: p.contains(a)};
  });
  let steps=0, landed=false; const path=[];
  for (let i=0;i<120;i++){
    await page.keyboard.press('Tab'); await page.waitForTimeout(70); steps++;
    const st=await page.evaluate(()=>{
      const a=document.activeElement, p=document.querySelector('[data-qa-panel="1"]');
      return {l:(a.getAttribute('aria-label')||a.textContent||'').trim().slice(0,26), inPanel: p? p.contains(a):false};
    });
    path.push(st.l);
    if (st.inPanel){ landed=true; break; }
  }
  out.tabsToPanel = landed? steps : `not reached in ${steps}`;
  out.landedOn = landed? path[path.length-1] : null;
  out.pathHead = path.slice(0,12);
  return out;
};
