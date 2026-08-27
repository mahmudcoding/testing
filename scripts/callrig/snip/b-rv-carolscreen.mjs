export default async ({page}) => {
  await page.waitForTimeout(8000);
  return await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const t=document.body.innerText.replace(/\s+/g,' ');
    return {url:location.href, ready:/READY TO JOIN/i.test(t), waiting:/Waiting for host approval/i.test(t),
      inCall:/\/call\//.test(location.href) && /Leave call/i.test(t),
      tail:t.slice(-260),
      notices:[...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,4),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(-8)};
  });
};
