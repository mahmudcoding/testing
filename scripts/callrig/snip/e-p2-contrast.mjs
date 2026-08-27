import {WS, BASE} from './e-p2-helpers.mjs';
const CALC = `(() => {
  const cs=getComputedStyle(document.documentElement);
  const get=n=>cs.getPropertyValue(n).trim();
  const toRGB=(v)=>{
    if(!v) return null;
    const d=document.createElement('div'); d.style.color=v; document.body.appendChild(d);
    const c=getComputedStyle(d).color; d.remove();
    const m=c.match(/rgba?\\(([^)]+)\\)/); if(!m) return null;
    const p=m[1].split(',').map(x=>parseFloat(x));
    return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};
  };
  const lum=c=>{const f=x=>{x/=255; return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);};
    return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b);};
  const ratio=(a,b)=>{const l1=lum(a), l2=lum(b); const hi=Math.max(l1,l2), lo=Math.min(l1,l2);
    return Math.round(((hi+0.05)/(lo+0.05))*1000)/1000;};
  const hex=c=>c?('#'+[c.r,c.g,c.b].map(x=>Math.round(x).toString(16).padStart(2,'0')).join('')):null;
  const pairs=[
    ['--c-success','--c-success-bg','ALK-3498 success tint'],
    ['--c-fg-muted','--c-bg-subtle','ALK-3316 neutral badge'],
    ['--c-fg-subtle','--c-bg-subtle','ALK-3242 fg-subtle']
  ];
  const theme=document.documentElement.getAttribute('data-theme')
    || (matchMedia('(prefers-color-scheme: dark)').matches?'dark(system)':'light(system)');
  return {theme, pairs:pairs.map(([f,b,label])=>{
    const fv=get(f), bv=get(b); const fc=toRGB(fv), bc=toRGB(bv);
    return {label, fgVar:f, bgVar:b, fg:fv||'(unset)', bg:bv||'(unset)',
            fgHex:hex(fc), bgHex:hex(bc), ratio:(fc&&bc)?ratio(fc,bc):null};
  })}; })()`;
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const out={};
  out.asLoaded = await page.evaluate(CALC);
  for(const t of ['light','dark']){
    await page.evaluate(`document.documentElement.setAttribute('data-theme','${t}')`);
    await page.waitForTimeout(1200);
    out[t] = await page.evaluate(CALC);
  }
  await page.evaluate(`document.documentElement.setAttribute('data-theme','${out.asLoaded.theme.replace(/\(system\)/,'')}')`);
  return out;
};
