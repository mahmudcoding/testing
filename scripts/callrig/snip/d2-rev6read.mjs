export default async ({ page }) => {
  const W='W4QDF1XTURESO01', ALICE='U4QDALICE000001';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/members`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const g=async u=>{const r=await fetch(u,{credentials:'include'});
      const t=await r.text(); return {s:r.status, t};};
    const probes={
      workspaceMembers:`/api/v1/workspaces/${W}/members?limit=50`,
      companyMembers:`/api/v1/companies/${CO}/members?limit=50`,
      userById:`/api/v1/users/${ALICE}`,
      userProfile:`/api/v1/users/${ALICE}/profile`,
      userStatus:`/api/v1/users/${ALICE}/status`,
    };
    const out={};
    for (const [k,u] of Object.entries(probes)) {
      const r=await g(u);
      const hasJob=/D2 QA Engineer/.test(r.t), hasPhone=/998901234567/.test(r.t),
            hasDept=/D2 Quality/.test(r.t), hasGithub=/d2probe/.test(r.t);
      out[k]={ status:r.s, carriesAnyProfileField: hasJob||hasPhone||hasDept||hasGithub,
               which:[hasJob&&'jobTitle',hasDept&&'department',hasPhone&&'phone',hasGithub&&'github'].filter(Boolean) };
    }
    return out;
  });
};
