export default async ({page}) => {
  const snap = await page.locator('[data-testid="in-call-chat-panel"]').ariaSnapshot().catch(e=>'err: '+e);
  const dom = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    const ta=p.querySelector('textarea');
    const lbl=document.querySelector(`label[for="${ta.id}"]`);
    return {textareaId: ta.id, placeholder: ta.placeholder,
            labelText: lbl?lbl.textContent.trim():null,
            recipient: [...p.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).filter(t=>/QA |Everyone/.test(t))};
  });
  return {dom, ariaSnapshot: String(snap).split('\n').filter(l=>/textbox|Message|Private/i.test(l))};
};
