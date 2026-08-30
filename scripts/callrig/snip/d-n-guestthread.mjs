export default async ({page}) => {
  const out={};
  const th = page.locator('button', {hasText:/^Thread$/});
  out.n = await th.count();
  if(!out.n) return out;
  const box = await th.nth(0).boundingBox();
  out.parent = await page.evaluate(()=>{const r=[...document.querySelectorAll('[data-testid="ic-user-message"]')][0];
    return r?(r.innerText||'').replace(/\s+/g,' ').slice(0,80):null;});
  await page.mouse.click(box.x+box.width/2, box.y+box.height/2);
  await page.waitForTimeout(3000);
  out.dlg = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const d=[...document.querySelectorAll('[role=dialog]')].find(x=>/Message thread/.test(x.innerText||''));
    if(!d) return null;
    const ta=d.querySelector('textarea');
    return {full:(d.innerText||'').replace(/\s+/g,' '), fullLen:(d.innerText||'').replace(/\s+/g,' ').length,
      leaves:[...d.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.innerText||'').trim()&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim()),
      ta:ta?{ph:ta.placeholder,dis:ta.disabled,desc:ta.getAttribute('aria-describedby'),title:ta.title||null}:null,
      btns:[...d.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim(),dis:b.disabled}))};
  });
  return out;
};
