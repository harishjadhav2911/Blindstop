export interface AnalysisItem {
  title: string;
  description: string;
  why_it_matters: string;
}

export interface AlternativePerspective {
  perspective: string;
  description: string;
}

export interface AnalysisSummary {
  decision: string;
  core_reasoning: string;
}

export interface AnalysisResult {
  summary: AnalysisSummary;
  hidden_assumptions: AnalysisItem[];
  overlooked_factors: AnalysisItem[];
  potential_conflicts: AnalysisItem[];
  questions_to_consider: string[];
  alternative_perspectives: AlternativePerspective[];
  information_gaps: string[];
  reflection_note: string;
  isDemoFallback?: boolean;
}

export interface AnalyzeRequest {
  decision: string;
  context?: string;
  priorities?: string[];
}

export interface AnalyzeSuccessResponse {
  success: true;
  data: AnalysisResult;
  isDemoFallback?: boolean;
}

export interface AnalyzeErrorResponse {
  error: string;
  isDemoFallback?: boolean;
}

export type AnalyzeApiResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;
