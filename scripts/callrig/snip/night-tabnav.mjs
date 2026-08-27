export default async ({page}) => {
  // start from the top of the document
  await page.evaluate(()=>{ const b=document.body; b.setAttribute('tabindex','-1'); b.focus(); });
  const seen=[]; const maxTabs=Number(process.env.QA_TABS||45);
  for (let i=0;i<maxTabs;i++){
    await page.keyboard.press('Tab');
    const f=await page.evaluate(()=>{
      const e=document.activeElement;
      if(!e) return null;
      const r=e.getBoundingClientRect();
      const st=getComputedStyle(e);
      return {tag:e.tagName.toLowerCase(),
        label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,34),
        testid:e.getAttribute('data-testid'),
        visible: r.width>0 && r.height>0,
        outline: st.outlineStyle+' '+st.outlineWidth,
        inToolbar: !!e.closest('[data-testid="call-toolbar"]')};
    });
    seen.push(f);
  }
  const toolbarBtns = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="call-toolbar"] button')].map(b=>(b.getAttribute('aria-label')||'').trim()).filter(Boolean));
  return {tabOrder: seen, toolbarButtons: toolbarBtns};
};
