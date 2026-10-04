import { AnalysisResult, AnalyzeRequest } from '../types/analysis';

export const INTERNSHIP_DEMO_RESULT: AnalysisResult = {
  summary: {
    decision: "Should I accept a 6-month internship?",
    core_reasoning: "Evaluating the offer primarily based on competitive compensation (stipend), geographical proximity to home, and a desire to gain hands-on industry exposure."
  },
  hidden_assumptions: [
    {
      title: "Automatic Quality of Industry Experience",
      description: "Assuming that any 6-month corporate role inherently yields meaningful engineering practices and accelerated career growth.",
      why_it_matters: "Internship value depends heavily on day-to-day project assignments, tooling exposure, and engineering rigor rather than just company presence."
    },
    {
      title: "Linear Workload & Predictable Hours",
      description: "Assuming that daily operational demands will remain strictly within scheduled hours without spillover into personal or academic study time.",
      why_it_matters: "Unplanned overtime or intense sprint deliverables could jeopardize coursework or academic milestones if boundaries are not formalized."
    },
    {
      title: "Proximity Equaling Work-Life Balance",
      description: "Equating a short physical commute directly with reduced fatigue and greater discretionary time.",
      why_it_matters: "Cognitive load and workplace culture impact energy levels significantly more than transit minutes alone."
    }
  ],
  overlooked_factors: [
    {
      title: "Dedicated Mentorship & Senior Guidance",
      description: "Whether you will be assigned a designated technical mentor with allocated bandwidth to review your code and guide your development.",
      why_it_matters: "Without structured guidance, junior engineers often get stuck on unfulfilling maintenance tasks without learning best practices."
    },
    {
      title: "Concrete Technology Stack & Deliverables",
      description: "The exact codebase, architecture, and tools you will touch during the 6-month tenure.",
      why_it_matters: "Gaining proficiency in outdated or proprietary legacy tooling may not align with your future career goals."
    },
    {
      title: "Conversion Pipeline & Return Offers",
      description: "Historical precedent of the organization converting interns into full-time roles or providing verified references.",
      why_it_matters: "A 6-month commitment should ideally bridge directly into subsequent career milestones or post-grad placement."
    }
  ],
  potential_conflicts: [
    {
      title: "Academic Commitments vs. Full-Time Expectations",
      description: "Balancing university attendance, exams, and project submissions against an employer's deliverables during peak sprints.",
      why_it_matters: "Trying to perform at 100% in both domains simultaneously often results in chronic burnout or compromised GPA."
    },
    {
      title: "Short-Term Financial Reward vs. High-Leverage Skill Acquisition",
      description: "Prioritizing immediate stipend over an environment with steeper technical learning curves.",
      why_it_matters: "Compounding technical capability acquired early in your career often yields tenfold financial return later."
    }
  ],
  questions_to_consider: [
    "How many hours per week will the internship require, and is there flexibility around exam periods?",
    "Who will directly mentor you, and what cadence of one-on-one feedback is established?",
    "What specific technical project or feature will you own end-to-end by the end of the 6 months?",
    "How will this 6-month commitment affect your academic schedule and graduation timeline?",
    "What measurable skills or portfolio artifacts will you be able to showcase upon completion?"
  ],
  alternative_perspectives: [
    {
      perspective: "The Long-Term Curriculum Strategist",
      description: "Instead of evaluating the opportunity primarily by stipend and short distance, evaluate the depth of technical difficulty and whether it accelerates your 3-year specialization trajectory."
    },
    {
      perspective: "The Opportunity Cost Lens",
      description: "Consider what alternative projects, research opportunities, or specialized interview preparation you would forego during this 6-month window."
    }
  ],
  information_gaps: [
    "Specific team structure and ratio of senior developers to interns.",
    "Company expectations regarding in-office presence during university exam weeks.",
    "Clear scope of the projects slated for the internship cohort."
  ],
  reflection_note: "This reflection is designed to help you verify critical variables before finalizing your commitment, ensuring your decision aligns with both your immediate circumstances and broader professional trajectory.",
  isDemoFallback: true
};

export function getDemoFallbackResponse(request: AnalyzeRequest): AnalysisResult {
  const isInternship = request.decision.toLowerCase().includes('intern') || 
                       request.decision.toLowerCase().includes('job') ||
                       request.decision.toLowerCase().includes('offer');

  if (isInternship) {
    return {
      ...INTERNSHIP_DEMO_RESULT,
      summary: {
        decision: request.decision,
        core_reasoning: request.context || INTERNSHIP_DEMO_RESULT.summary.core_reasoning
      },
      isDemoFallback: true
    };
  }

  // Generic intelligent demo template
  return {
    summary: {
      decision: request.decision,
      core_reasoning: request.context || "Decision evaluated against stated priorities and primary concerns."
    },
    hidden_assumptions: [
      {
        title: "Stability of Current Conditions",
        description: "Assuming that the circumstances, constraints, and resources present today will remain unchanged over the outcome's horizon.",
        why_it_matters: "Unforeseen external shifts can alter the payoff structure of this path."
      },
      {
        title: "Completeness of Information",
        description: "Operating under the assumption that all key variables influencing the outcome have already been identified.",
        why_it_matters: "Unidentified variables frequently carry greater downside risks than known trade-offs."
      }
    ],
    overlooked_factors: [
      {
        title: "Reversibility & Exit Costs",
        description: "The ease or difficulty with which you can undo or pivot away from this decision if outcomes diverge from expectations.",
        why_it_matters: "Two-way door decisions warrant faster execution, whereas one-way door decisions demand rigorous risk mitigation."
      },
      {
        title: "Secondary & Long-Term Compounding Effects",
        description: "How this choice affects your options, relationships, or focus 6 to 18 months from now.",
        why_it_matters: "Immediate friction often conceals long-term upside, while immediate ease can accumulate hidden technical or personal debt."
      }
    ],
    potential_conflicts: [
      {
        title: "Immediate Comfort vs. Stated Core Priorities",
        description: `Potential divergence between the stated priorities (${request.priorities?.join(', ') || 'personal growth and outcomes'}) and short-term path of least resistance.`,
        why_it_matters: "Misalignment between stated values and tactical choices creates friction over time."
      }
    ],
    questions_to_consider: [
      "What is the single highest-risk assumption underpinning your confidence in this choice?",
      "If this decision turned out to be wrong 6 months from now, what would have been the most likely reason?",
      "What concrete information could you gather in the next 48 hours to validate your premise?",
      "How easily can you reverse or adapt this decision if new evidence emerges?"
    ],
    alternative_perspectives: [
      {
        perspective: "The Pre-Mortem View",
        description: "Imagine yourself in the future where this decision led to unexpected complications. What early signals did you overlook?"
      },
      {
        perspective: "The Minimalist Baseline",
        description: "What would happen if you deferred the decision or took an incremental, lower-stakes test step first?"
      }
    ],
    information_gaps: [
      "Objective feedback from third parties who have taken a similar path.",
      "Quantifiable metrics for what success looks like 90 days after deciding."
    ],
    reflection_note: "Notice: Running in demo reflection mode. Set GEMINI_API_KEY in .env.local for live real-time AI generation.",
    isDemoFallback: true
  };
}
