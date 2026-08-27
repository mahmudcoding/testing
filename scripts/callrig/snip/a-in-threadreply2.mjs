export default async ({page}) => {
  const r = await page.evaluate((txt)=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .find(x=>/Message thread/.test(x.innerText||''));
    if(!d) return {err:'no thread dialog'};
    const i=[...d.querySelectorAll('textarea,input')].filter(vis)[0];
    if(!i) return {err:'no input in thread dialog'};
    const proto = i.tagName==='TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto,'value').set;
    i.focus(); setter.call(i, txt);
    i.dispatchEvent(new Event('input',{bubbles:true}));
    i.dispatchEvent(new Event('change',{bubbles:true}));
    return {typed:i.value, placeholder:i.placeholder||i.getAttribute('aria-label')};
  }, process.env.QA_REPLY||'thread-reply-B1');
  if(r.err) return r;
  await page.waitForTimeout(700);
  const sent = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).find(x=>/Message thread/.test(x.innerText||''));
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/Send reply/i.test((x.getAttribute('aria-label')||x.textContent||'')));
    if(!b) return {err:'no send btn'}; if(b.disabled) return {err:'send disabled'};
    b.click(); return {ok:true};
  });
  await page.waitForTimeout(4500);
  const after = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).find(x=>/Message thread/.test(x.innerText||''));
    return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,240):null;});
  return {r, sent, after};
};
