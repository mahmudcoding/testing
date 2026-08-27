import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  out.ru = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const leaves=[...m.querySelectorAll('*')].filter(el=>el.children.length===0 && vis(el));
     const targets=leaves.filter(el=>/^(Все файлы|Изображения|Документы|Видео|Аудио|Архивы)$/.test((el.textContent||'').trim()));
     return targets.map(el=>{ const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
       return { text:(el.textContent||'').trim(), clientW:el.clientWidth, scrollW:el.scrollWidth,
                overflow:cs.overflow, textOverflow:cs.textOverflow, whiteSpace:cs.whiteSpace,
                cls:String(el.className||'').slice(0,44), w:Math.round(r.width) }; }); })()`);
  // how much of the label is actually painted? measure the visible glyph run
  out.visibleTextWidth = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const el=[...m.querySelectorAll('*')].filter(x=>x.children.length===0 && vis(x))
       .find(x=>(x.textContent||'').trim()==='Изображения');
     if(!el) return null;
     const cs=getComputedStyle(el);
     const c=document.createElement('canvas').getContext('2d');
     c.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
     const full=c.measureText('Изображения').width;
     let fits=''; for(const ch of 'Изображения'){ if(c.measureText(fits+ch+'…').width<=el.clientWidth) fits+=ch; else break; }
     return {fullTextPx:Math.round(full), boxPx:el.clientWidth, wouldShow:fits+'…'}; })()`);
  return out;
};
