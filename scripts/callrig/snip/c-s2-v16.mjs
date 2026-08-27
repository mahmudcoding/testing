export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7500);
  out.rendered=await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length);
  const btn=page.locator('button[aria-label="Channel details"]');
  out.btn=await btn.count();
  if(!out.btn) return out;
  await btn.first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  const inPanel=()=>page.evaluate(()=>{
    const tabs=[...document.querySelectorAll('[role="tab"]')].filter(t=>t.getBoundingClientRect().height>0);
    const close=document.querySelector('button[aria-label="Close channel details"]');
    if(!tabs.length||!close) return {noPanel:true};
    let panel=close; 
    while(panel.parentElement && !tabs.every(t=>panel.contains(t))) panel=panel.parentElement;
    const a=document.activeElement;
    return {contains: panel.contains(a),
      active: a? (a.getAttribute('aria-label')||(a.textContent||'').trim().slice(0,26)):null};
  });
  out.rightAfterEnter=await inPanel();
  let steps=0, reached=null;
  for(let i=0;i<200;i++){ await page.keyboard.press('Tab'); steps++;
    const st=await inPanel();
    if(st.contains){ reached={steps, first:st.active}; break; } }
  out.tabForward=reached||{steps, reached:false};
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  out.escapeClosed=await page.evaluate(()=>!document.querySelector('button[aria-label="Close channel details"]'));
  return out;
};
