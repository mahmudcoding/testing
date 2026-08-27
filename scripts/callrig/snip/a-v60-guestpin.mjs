const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.waitForTimeout(3000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/guest-pinned.png'});
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const tiles=[...document.querySelectorAll('video')].map(v=>({w:Math.round(v.getBoundingClientRect().width),h:Math.round(v.getBoundingClientRect().height)}));
    return { url:location.pathname.slice(0,44),
      pinMarkers:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/pin/i.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,40)).slice(0,6),
      pinAria:[...document.querySelectorAll('[aria-label],[title]')].filter(vis).map(e=>e.getAttribute('aria-label')||e.getAttribute('title')).filter(a=>/pin/i.test(a||'')).slice(0,6),
      tiles, tileCount:tiles.length,
      mainTxt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,260) };},VS);
};
