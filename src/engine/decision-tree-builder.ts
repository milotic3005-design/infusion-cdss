import type { CTCAEGradeNumber, GradingResult } from '@/types/grading.types';
import type { ReactionProfile } from '@/types/reaction.types';
import type { DecisionNodeData, DecisionEdgeData, ActionStep, DecisionResult } from '@/types/decision.types';

export function buildDecisionResult(
  gradingResult: GradingResult,
  reactionProfile: ReactionProfile | null
): DecisionResult {
  const grade = gradingResult.finalGrade.grade;
  const protocol = reactionProfile?.protocol ?? null;

  const actions = buildActions(grade, protocol);
  const { nodes, edges } = buildFlowchart(grade, protocol);

  return {
    gradingResult,
    actions,
    decisionNodes: nodes,
    decisionEdges: edges,
    drugProtocol: protocol,
    fallbackToPharmacist: reactionProfile === null || (
      !reactionProfile.sources.rxnorm &&
      !reactionProfile.sources.openfda &&
      !reactionProfile.sources.dailymed
    ),
    generatedAt: Date.now(),
  };
}

function buildActions(grade: CTCAEGradeNumber, protocol: ReactionProfile['protocol']): ActionStep[] {
  switch (grade) {
    case 1: {
      const rateInfo = protocol?.infusionRates?.[0];
      const continueDetail = rateInfo
        ? `Maintain current rate (standard: ${rateInfo.initialRate}–${rateInfo.maxRate})`
        : 'Maintain current infusion rate';
      return [
        { id: 'a1-1', order: 1, action: 'Monitor Vitals q15min', detail: 'Continue monitoring vital signs every 15 minutes', icon: 'activity', urgency: 'monitor', grade: 1 },
        { id: 'a1-2', order: 2, action: 'Continue Infusion', detail: continueDetail, icon: 'play', urgency: 'monitor', grade: 1 },
        { id: 'a1-3', order: 3, action: 'Document Reaction', detail: 'Record symptoms, time of onset, and vital signs', icon: 'file-text', urgency: 'soon', grade: 1 },
      ];
    }

    case 2: {
      const restartRateInfo = protocol?.infusionRates?.[0];
      const restartDetail = protocol?.rateAdjustment.grade2
        || (restartRateInfo
          ? `Resume at 50% rate (~${restartRateInfo.initialRate} reduced) when symptoms resolve`
          : 'Resume at 50% of previous rate when symptoms resolve');
      return [
        { id: 'a2-1', order: 1, action: 'Stop Infusion', detail: 'Immediately pause the infusion', icon: 'pause-circle', urgency: 'immediate', grade: 2 },
        { id: 'a2-2', order: 2, action: 'Administer Treatment', detail: protocol?.premeds.length
            ? `Give: ${protocol.premeds.map(p => `${p.medication} ${p.dose}`).join(', ')}`
            : 'Diphenhydramine 50mg IV, NS bolus, Acetaminophen PRN', icon: 'syringe', urgency: 'immediate', grade: 2 },
        { id: 'a2-3', order: 3, action: 'Monitor Response', detail: 'Reassess symptoms every 5-10 minutes', icon: 'clock', urgency: 'soon', grade: 2 },
        { id: 'a2-4', order: 4, action: 'Restart at 50% Rate', detail: restartDetail, icon: 'play', urgency: 'soon', grade: 2 },
      ];
    }

    case 3:
      return [
        { id: 'a3-1', order: 1, action: 'Stop Infusion Now', detail: 'Immediately discontinue the infusion', icon: 'octagon', urgency: 'immediate', grade: 3 },
        { id: 'a3-2', order: 2, action: 'Notify Physician', detail: 'Contact attending physician immediately', icon: 'phone', urgency: 'immediate', grade: 3 },
        { id: 'a3-3', order: 3, action: 'Emergency Treatment', detail: 'O2 high-flow, NS IV bolus, bronchodilators PRN. Epinephrine 0.3mg IM if bronchospasm, angioedema, or hypotension unresponsive to initial measures — do not delay for Grade 3 severity', icon: 'syringe', urgency: 'immediate', grade: 3 },
        { id: 'a3-4', order: 4, action: 'Do Not Restart', detail: protocol?.rateAdjustment.grade3Plus || 'Do not restart infusion. Assess for hospitalization.', icon: 'x-circle', urgency: 'immediate', grade: 3 },
      ];

    case 4:
      return [
        { id: 'a4-1', order: 1, action: 'STOP Infusion NOW', detail: 'Immediately discontinue infusion and clamp line', icon: 'alert-triangle', urgency: 'immediate', grade: 4 },
        { id: 'a4-2', order: 2, action: 'Epinephrine 0.3mg IM', detail: 'Administer epinephrine 0.3–0.5mg IM into anterolateral thigh IMMEDIATELY — first-line treatment, do not delay', icon: 'syringe', urgency: 'immediate', grade: 4 },
        { id: 'a4-3', order: 3, action: 'Call Code / 911', detail: 'Activate rapid response team or call 911 while epinephrine is being prepared/administered', icon: 'phone-call', urgency: 'immediate', grade: 4 },
        { id: 'a4-4', order: 4, action: 'Assess ABCs', detail: 'Airway, Breathing, Circulation — position supine, elevate legs. O2 high-flow, IV access, NS bolus', icon: 'heart-pulse', urgency: 'immediate', grade: 4 },
        { id: 'a4-5', order: 5, action: 'Transfer to ED', detail: 'Prepare for emergency department transfer. Repeat epinephrine q5–15 min PRN if no response', icon: 'ambulance', urgency: 'immediate', grade: 4 },
      ];

    case 5:
      return [
        { id: 'a5-1', order: 1, action: 'Emergency Protocol', detail: 'Full emergency resuscitation protocol', icon: 'alert-triangle', urgency: 'immediate', grade: 5 },
        { id: 'a5-2', order: 2, action: 'Document Event', detail: 'Complete documentation of fatal outcome', icon: 'file-text', urgency: 'immediate', grade: 5 },
      ];
  }
}

function buildFlowchart(
  grade: CTCAEGradeNumber,
  protocol: ReactionProfile['protocol']
): { nodes: DecisionNodeData[]; edges: DecisionEdgeData[] } {
  const nodes: DecisionNodeData[] = [];
  const edges: DecisionEdgeData[] = [];

  // Root assessment node
  nodes.push({
    id: 'root',
    type: 'assessment',
    label: grade >= 4 ? 'LIFE-THREATENING' : grade === 3 ? 'Severe Reaction' : grade === 2 ? 'Moderate Reaction' : 'Mild Reaction',
    description: `CTCAE Grade ${grade}`,
    icon: grade >= 3 ? 'alert-triangle' : 'info',
    grade,
    isHighlighted: true,
  });

  if (grade === 1) {
    nodes.push(
      { id: 'monitor', type: 'action', label: 'Monitor q15min', icon: 'activity', grade: 1, isHighlighted: true },
      { id: 'continue', type: 'terminal', label: 'Continue Infusion', icon: 'play', grade: 1, isHighlighted: true }
    );
    edges.push(
      { id: 'e-root-monitor', source: 'root', target: 'monitor', animated: true },
      { id: 'e-monitor-continue', source: 'monitor', target: 'continue', animated: false }
    );
  } else if (grade === 2) {
    nodes.push(
      { id: 'stop', type: 'action', label: 'Stop Infusion', icon: 'pause-circle', grade: 2, isHighlighted: true },
      { id: 'treat', type: 'action', label: 'Treat Symptoms', icon: 'syringe', grade: 2, isHighlighted: true },
      { id: 'branch-resolved', type: 'branch', label: 'Symptoms Resolved?', icon: 'help-circle', grade: 2, isHighlighted: true },
      { id: 'restart', type: 'terminal', label: 'Restart at 50%', description: protocol?.rateAdjustment.grade2, icon: 'play', grade: 2, isHighlighted: false },
      { id: 'escalate', type: 'terminal', label: 'Escalate to Grade 3', icon: 'arrow-up', grade: 3, isHighlighted: false }
    );
    edges.push(
      { id: 'e-root-stop', source: 'root', target: 'stop', animated: true },
      { id: 'e-stop-treat', source: 'stop', target: 'treat', animated: true },
      { id: 'e-treat-branch', source: 'treat', target: 'branch-resolved', animated: true },
      { id: 'e-branch-yes', source: 'branch-resolved', target: 'restart', label: 'Yes', animated: false },
      { id: 'e-branch-no', source: 'branch-resolved', target: 'escalate', label: 'No', animated: false }
    );
  } else if (grade === 3) {
    nodes.push(
      { id: 'stop', type: 'action', label: 'STOP Infusion', icon: 'octagon', grade: 3, isHighlighted: true },
      { id: 'notify', type: 'action', label: 'Notify Physician', icon: 'phone', grade: 3, isHighlighted: true },
      { id: 'treat', type: 'action', label: 'Emergency Treatment', description: 'O2, IV fluids, bronchodilators', icon: 'syringe', grade: 3, isHighlighted: true },
      { id: 'no-restart', type: 'terminal', label: 'Do NOT Restart', icon: 'x-circle', grade: 3, isHighlighted: true },
      { id: 'hospitalize', type: 'terminal', label: 'Assess Hospitalization', icon: 'building', grade: 3, isHighlighted: false }
    );
    edges.push(
      { id: 'e-root-stop', source: 'root', target: 'stop', animated: true },
      { id: 'e-stop-notify', source: 'stop', target: 'notify', animated: true },
      { id: 'e-notify-treat', source: 'notify', target: 'treat', animated: true },
      { id: 'e-treat-norestart', source: 'treat', target: 'no-restart', animated: true },
      { id: 'e-treat-hospital', source: 'treat', target: 'hospitalize', animated: false }
    );
  } else {
    // Grade 4-5
    nodes.push(
      { id: 'stop', type: 'action', label: 'STOP NOW', icon: 'alert-triangle', grade: 4, isHighlighted: true },
      { id: 'call', type: 'action', label: 'Call Code/911', icon: 'phone-call', grade: 4, isHighlighted: true },
      { id: 'epi', type: 'action', label: 'Epinephrine IM', description: '0.3-0.5mg anterolateral thigh', icon: 'syringe', grade: 4, isHighlighted: true },
      { id: 'abcs', type: 'action', label: 'Assess ABCs', description: 'Airway, Breathing, Circulation', icon: 'heart-pulse', grade: 4, isHighlighted: true },
      { id: 'transfer', type: 'terminal', label: 'Transfer to ED', icon: 'ambulance', grade: 4, isHighlighted: true }
    );
    edges.push(
      { id: 'e-root-stop', source: 'root', target: 'stop', animated: true },
      { id: 'e-stop-epi', source: 'stop', target: 'epi', animated: true },
      { id: 'e-epi-call', source: 'epi', target: 'call', animated: true },
      { id: 'e-call-abcs', source: 'call', target: 'abcs', animated: true },
      { id: 'e-abcs-transfer', source: 'abcs', target: 'transfer', animated: true }
    );
  }

  return { nodes, edges };
}
