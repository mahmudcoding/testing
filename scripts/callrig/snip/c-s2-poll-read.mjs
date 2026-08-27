export default async ({page}) => {
  const r=await page.evaluate(()=>{ clearInterval(window.__npId);
    const s=window.__np?window.__np.s:[];
    const changes=[s[0]]; for(let i=1;i<s.length;i++) if(JSON.stringify(s[i].top)!==JSON.stringify(s[i-1].top)||s[i].total!==s[i-1].total) changes.push(s[i]);
    return {n:s.length, first:s[0], last:s.at(-1), changes:changes.slice(0,6)}; });
  return r;
};
