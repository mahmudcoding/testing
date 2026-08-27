// Verify pass: host steps back to the main call tab.
export default async ({ page }) => {
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="header-tab-main-activate"]'); if(b)b.click();});
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>({
    header:(document.querySelector('[data-testid="call-overlay-expanded"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,200)
  }));
};
