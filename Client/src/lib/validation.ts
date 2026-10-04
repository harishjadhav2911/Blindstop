import { AnalyzeRequest } from '../types/analysis';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: AnalyzeRequest;
}

export function validateAnalyzeRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      error: 'Invalid request body. JSON payload expected.'
    };
  }

  const { decision, context, priorities } = body as Record<string, unknown>;

  // Validate decision
  if (decision === undefined || decision === null) {
    return {
      isValid: false,
      error: 'Please describe the decision you are considering.'
    };
  }

  if (typeof decision !== 'string') {
    return {
      isValid: false,
      error: 'The decision field must be a valid text string.'
    };
  }

  const trimmedDecision = decision.trim();

  if (trimmedDecision.length === 0) {
    return {
      isValid: false,
      error: 'Please describe the decision you are considering.'
    };
  }

  if (trimmedDecision.length < 10) {
    return {
      isValid: false,
      error: 'Decision description is too short. Please provide at least 10 characters so we can evaluate your reasoning.'
    };
  }

  if (trimmedDecision.length > 2000) {
    return {
      isValid: false,
      error: 'Decision description is too long (maximum 2000 characters).'
    };
  }

  // Validate context (optional)
  let sanitizedContext: string | undefined = undefined;
  if (context !== undefined && context !== null) {
    if (typeof context !== 'string') {
      return {
        isValid: false,
        error: 'The context field must be a valid text string.'
      };
    }
    const trimmedContext = context.trim();
    if (trimmedContext.length > 5000) {
      return {
        isValid: false,
        error: 'Context text is too long (maximum 5000 characters).'
      };
    }
    sanitizedContext = trimmedContext.length > 0 ? trimmedContext : undefined;
  }

  // Validate priorities (optional)
  let sanitizedPriorities: string[] | undefined = undefined;
  if (priorities !== undefined && priorities !== null) {
    if (!Array.isArray(priorities)) {
      return {
        isValid: false,
        error: 'Priorities must be an array of text labels.'
      };
    }
    if (priorities.length > 10) {
      return {
        isValid: false,
        error: 'Too many priorities specified (maximum 10 items).'
      };
    }

    const cleanedPriorities: string[] = [];
    for (const item of priorities) {
      if (typeof item !== 'string') {
        return {
          isValid: false,
          error: 'Each priority must be a valid text string.'
        };
      }
      const trimmedItem = item.trim();
      if (trimmedItem.length > 0) {
        if (trimmedItem.length > 100) {
          return {
            isValid: false,
            error: 'Each priority must be under 100 characters.'
          };
        }
        cleanedPriorities.push(trimmedItem);
      }
    }

    sanitizedPriorities = cleanedPriorities.length > 0 ? cleanedPriorities : undefined;
  }

  return {
    isValid: true,
    sanitized: {
      decision: trimmedDecision,
      context: sanitizedContext,
      priorities: sanitizedPriorities
    }
  };
}
