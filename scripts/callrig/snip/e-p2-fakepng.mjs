import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  out.typeCounts = await page.evaluate(`(() => { const m=document.querySelector('main');
    return ((m.innerText||'').match(/FILE TYPE[\\s\\S]{0,150}/)||['?'])[0].replace(/\\n+/g,' | ').slice(0,160); })()`);
  out.tiles = await page.evaluate(`(() => { ${VISFN}
    return [...document.querySelectorAll('main button')].filter(b=>/\\.(txt|png)/.test(b.textContent||'')).map(b=>{
      const img=b.querySelector('img'); const r=b.getBoundingClientRect();
      return {label:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,34),
        img: img? {nat:img.naturalWidth+'x'+img.naturalHeight, complete:img.complete, op:getComputedStyle(img).opacity,
          box:Math.round(img.getBoundingClientRect().width)+'x'+Math.round(img.getBoundingClientRect().height),
          src:String(img.getAttribute('src')||'').slice(0,40)} : 'no img'}; }); })()`);
  out.longNameTile = await page.evaluate(`(() => { ${VISFN}
    const b=[...document.querySelectorAll('main button')].find(x=>/aaaaaaaaaa/.test(x.textContent||''));
    if(!b) return 'not found';
    const r=b.getBoundingClientRect();
    const leaf=[...b.querySelectorAll('*')].find(n=>/aaaaaaaaaa/.test(n.textContent||'')&&n.children.length===0);
    const lr=leaf?leaf.getBoundingClientRect():null;
    return {tileBox:Math.round(r.width)+'x'+Math.round(r.height),
      leafScrollW: leaf? leaf.scrollWidth:null, leafClientW: leaf? leaf.clientWidth:null,
      clipped: leaf? leaf.scrollWidth>leaf.clientWidth : null,
      textShown:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,60),
      overflow: leaf? getComputedStyle(leaf).textOverflow+'/'+getComputedStyle(leaf).overflow : null}; })()`);
  return out;
};
