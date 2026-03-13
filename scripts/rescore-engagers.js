const { createClient } = require('@supabase/supabase-js');

const TIERS = [
  {
    tier: 3,
    patterns: ['chief marketing officer','chief revenue officer','chief operating officer','chief executive officer','chief commercial officer','chief growth officer','chief sales officer','ceo','cro','cmo','coo','cgo','cso','vp marketing','vp of marketing','vp sales','vp of sales','vp revops','vp of revops','vp revenue operations','vp of revenue operations','vp revenue','vp of revenue','vp growth','vp of growth','vp demand gen','vp of demand gen','vp business development','vp of business development','head of growth','head of sales','head of marketing','head of revenue','head of business development','head of demand gen','head of partnerships'],
    prefixPatterns: ['founder','co-founder','cofounder','owner'],
  },
  {
    tier: 2,
    patterns: ['director of revenue operations','director revenue operations','head of revenue operations','director of demand gen','director demand gen','director of demand generation','director of marketing','director marketing','director of sales','director sales','director of sales ops','director sales ops','director of revops','director revops','director of growth','director growth','director of business development','director business development','director of partnerships','sales leader','sales director'],
  },
  {
    tier: 1,
    patterns: ['marketing manager','revops manager','revenue operations manager','sales ops manager','sales operations manager','demand gen manager','demand generation manager','growth manager','gtm manager','sales manager','business development manager','partnerships manager','marketing operations','senior revops','senior revenue operations'],
  },
];

function matchesPrefixPattern(normalized, pattern) {
  const segments = normalized.split(/\s*[|,&\-–—]\s*/);
  for (const seg of segments) {
    if (seg.trim().startsWith(pattern)) return true;
  }
  return false;
}

function classify(title) {
  if (!title || typeof title !== 'string' || title.trim() === '') return 0;
  const norm = title.toLowerCase();
  for (const t of TIERS) {
    for (const p of t.patterns) {
      if (norm.includes(p)) return t.tier;
    }
    if (t.prefixPatterns) {
      for (const p of t.prefixPatterns) {
        if (matchesPrefixPattern(norm, p)) return t.tier;
      }
    }
  }
  return 0;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) { console.log('Missing Supabase env vars'); return; }

  const c = createClient(url, key);
  const { data, error } = await c.from('post_engagers').select('id, title, icp_tier');
  if (error) { console.log('ERROR:', error.message); return; }

  let updated = 0;
  for (const eng of data) {
    const newTier = classify(eng.title);
    if (newTier !== (eng.icp_tier || 0)) {
      await c.from('post_engagers').update({ icp_tier: newTier }).eq('id', eng.id);
      console.log(`${newTier > (eng.icp_tier || 0) ? '⬆' : '⬇'} "${eng.title}" -> Tier ${newTier} (was ${eng.icp_tier || 0})`);
      updated++;
    }
  }
  console.log(`\nRe-scored ${updated} of ${data.length} engagers`);
}

main();
