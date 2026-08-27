export default async ({page}) => await page.evaluate(()=>{
  const out={};
  for (const k of Object.keys(localStorage)){ const v=localStorage.getItem(k)||''; if(/consent|record/i.test(k+v)) out[k]=v.slice(0,220); }
  return {matches: out, keys: Object.keys(localStorage).length};
});
