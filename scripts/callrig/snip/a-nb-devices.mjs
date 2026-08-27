export default async ({page}) => {
  return await page.evaluate(async () => {
    const ds = await navigator.mediaDevices.enumerateDevices();
    const by = {};
    for (const d of ds) { (by[d.kind] = by[d.kind] || []).push(d.label || '(no label)'); }
    return by;
  });
}
