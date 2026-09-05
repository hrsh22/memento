import type { BudgetInput, DecisionPlan, Memory, MemoryDecision, Policy } from './types';
const bytes = (s: string) => new TextEncoder().encode(s).length;
const TIB = 1024 ** 4;
export function utility(memory: Memory): number {
  if (memory.pinned) return 100;
  return Math.round(Math.max(0, Math.min(100, memory.importance * .72 + Math.min(memory.accesses, 20) * 1.4 - memory.ageDays * .7)));
}
/** Verbatim, ordered sentence extraction. No model-generated facts. */
export function compact(content: string): string {
  const sentences = content.match(/[^.!?\n]+[.!?]?/g)?.map(s => s.trim()).filter(Boolean) ?? [content];
  const ranked = sentences.map((text, index) => ({ text, index, score: /finding|result|critical|important|conclusion|evidence|recovery|mission/i.test(text) ? 3 : /error|fail|verify|hash/i.test(text) ? 2 : 0 }));
  const picked = ranked.sort((a,b) => b.score-a.score || a.index-b.index).slice(0, 4).sort((a,b)=>a.index-b.index);
  const extract = picked.map(s=>s.text).join(' ');
  return bytes(extract) < bytes(content) ? extract : content;
}
function finiteNonnegative(n:number) {return Number.isFinite(n) && n >= 0;}
function runway(available:number, fee:number, monthly:number): number|null { return monthly === 0 ? null : Math.max(0, (available-fee)/monthly*30); }
export function planMemories(memories: Memory[], budget: BudgetInput, policy: Policy): DecisionPlan {
  if (!Object.values(budget).filter(v=>typeof v==='number').every(v=>finiteNonnegative(v as number)) || budget.copies < 1 || !Number.isInteger(budget.copies)) throw new Error('Invalid budget');
  if (!finiteNonnegative(policy.reserveDays) || !finiteNonnegative(policy.maxMonthlyUsdfc) || !finiteNonnegative(policy.minUtility)) throw new Error('Invalid policy');
  if (new Set(memories.map(m=>m.id)).size!==memories.length) throw new Error('Memory IDs must be unique');
  const currentRunway = runway(budget.availableUsdfc,0,budget.existingMonthlyUsdfc);
  const mode = currentRunway !== null && currentRunway < policy.reserveDays ? 'survival' : currentRunway !== null && currentRunway < policy.reserveDays*3 ? 'selective' : 'abundant';
  const decisions:MemoryDecision[] = memories.map(m=>{
    const score=utility(m); let action:MemoryDecision['action']='keep'; let content=m.content;
    let reason = m.pinned ? 'Protected by policy. Preserve every source byte.' : `Utility ${score}/100 justifies keeping the original.`;
    if (!m.pinned && score<policy.minUtility) {action='defer'; content=''; reason=`Utility ${score}/100 is below the ${policy.minUtility} threshold. Keep the source local; spend no storage on it.`;}
    else if (!m.pinned && policy.allowCompaction && mode!=='abundant' && bytes(m.content)>600) {content=compact(m.content); action=content===m.content?'keep':'compact';reason=action==='compact'?`Preserve the highest-signal verbatim excerpts; omit repeated context under ${mode} policy.`:reason;}
    return {id:m.id,title:m.title,kind:m.kind,action,utility:score,originalBytes:bytes(m.content),retainedBytes:bytes(content),reason,content};
  });
  const inputBytes=decisions.reduce((s,d)=>s+d.originalBytes,0);
  // A single archive amortizes piece fees. These are planning estimates; live execution
  // obtains a fresh SDK quote for actual serialized bytes and current dataset state.
  const incremental = (n:number) => n===0?0:(n/TIB*budget.storagePerTibMonth+(budget.newDataset?budget.datasetFeeMonth:0))*budget.copies;
  const retainedBytes=decisions.reduce((s,d)=>s+d.retainedBytes,0);
  const baselineFees=memories.length*(budget.addBaseFee+budget.addPieceFee)*budget.copies;
  const plannedFees=retainedBytes?(budget.addBaseFee+budget.addPieceFee)*budget.copies:0;
  const baselineMonthly=budget.existingMonthlyUsdfc+incremental(inputBytes);
  const plannedMonthly=budget.existingMonthlyUsdfc+incremental(retainedBytes);
  const totalUtility=decisions.reduce((s,d)=>s+d.utility,0);
  const retainedUtility=decisions.reduce((s,d)=>s+(d.action==='defer'?0:d.utility),0);
  return {decisions,mode,inputBytes,retainedBytes,baselineMonthly,plannedMonthly,baselineFees,plannedFees,baselineRunwayDays:runway(budget.availableUsdfc,baselineFees,baselineMonthly),plannedRunwayDays:runway(budget.availableUsdfc,plannedFees,plannedMonthly),protectedCount:memories.filter(m=>m.pinned).length,deferredCount:decisions.filter(d=>d.action==='defer').length,compactedCount:decisions.filter(d=>d.action==='compact').length,retainedUtilityPercent:totalUtility?Math.round(retainedUtility/totalUtility*100):100,explanation:mode==='survival'?'Runway is inside the reserve window. Protect core memory, compact useful context, and pause any write the live quote cannot safely fund.':mode==='selective'?'Runway is tightening. Preserve useful knowledge and bundle it into one piece to avoid repeated transaction fees.':'The reserve is healthy. Retain useful originals, while declining low-value noise.',policy,budget};
}
