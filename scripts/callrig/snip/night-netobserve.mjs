export default async ({page}) => {
  const ms = Number(process.env.QA_MS||60000);
  const pat = process.env.QA_PAT || 'settings';
  return await page.evaluate(async ({ms,pat}) => {
    const t0 = performance.now();
    const before = performance.getEntriesByType('resource').filter(e=>e.name.includes(pat)).map(e=>({t:Math.round(e.startTime/1000)+'s', u:e.name.split('/api/v1')[1]||e.name.slice(-60)}));
    await new Promise(r=>setTimeout(r,ms));
    const after = performance.getEntriesByType('resource').filter(e=>e.name.includes(pat) && e.startTime > t0).map(e=>({t:Math.round((e.startTime-t0)/1000)+'s', u:e.name.split('/api/v1')[1]||e.name.slice(-60)}));
    return {matchingBeforeWindow: before.length, sampleBefore: before.slice(-5), duringWindow: after};
  }, {ms,pat});
};
