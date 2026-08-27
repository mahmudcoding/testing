const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const i=[...document.querySelectorAll('input')].filter(vis).map(i=>i.value).find(v=>/\/join\//.test(v||''));
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop();
    return { link:i||null, panelTxt:(d?.innerText||'').replace(/\s+/g,' ').slice(0,260) };},VS);
};
