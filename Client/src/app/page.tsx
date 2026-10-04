'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Eye,
  AlertTriangle,
  HelpCircle,
  Compass,
  FileQuestion,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';

type UIState = 'IDLE' | 'ANALYZING' | 'RESULTS' | 'ERROR';

interface PresetOption {
  label: string;
  emoji: string;
  decision: string;
  context: string;
  priorities: string[];
}

const PRESETS: PresetOption[] = [
  {
    label: '6-Month Internship',
    emoji: '🎓',
    decision: 'Should I accept a 6-month internship?',
    context: 'The stipend is good, the company is close to home, and I want industry experience.',
    priorities: ['Career', 'Learning', 'Academics']
  },
  {
    label: 'Early-Stage Startup',
    emoji: '🚀',
    decision: 'Should I leave my stable job to join a 4-person seed startup?',
    context: 'The base salary is 25% lower, but equity upside is 1.5% and the founding team has previous successful exits. I am feeling stagnant in corporate.',
    priorities: ['Growth & Autonomy', 'Financial Upside', 'Risk Management']
  },
  {
    label: 'Graduate School vs Industry',
    emoji: '📚',
    decision: 'Should I pursue a Master’s degree in AI or stay in my current software role?',
    context: 'Tuition will cost $45k and take 2 years. My current employer is offering a modest promotion, but AI specialization feels critical long term.',
    priorities: ['Deep Mastery', 'Opportunity Cost', 'Long-term Credibility']
  },
  {
    label: 'Relocation for Promotion',
    emoji: '🏙️',
    decision: 'Should I relocate to another city for a regional lead role?',
    context: 'The position comes with a 30% raise and higher visibility, but my partner would have to job hunt in the new city and our support system is here.',
    priorities: ['Career Acceleration', 'Family & Relationships', 'Cost of Living']
  }
];

const SUGGESTED_PRIORITIES = [
  'Career',
  'Learning',
  'Time',
  'Compensation',
  'Work-Life Balance',
  'Mentorship',
  'Risk Tolerance',
  'Academics'
];

const LOADING_STEPS = [
  'Analyzing your reasoning...',
  'Looking for hidden assumptions...',
  'Checking overlooked factors...',
  'Generating reflection questions...'
];

export default function BlindSpotApp() {
  const [decision, setDecision] = useState('');
  const [context, setContext] = useState('');
  const [priorities, setPriorities] = useState<string[]>(['Career', 'Learning', 'Time']);
  const [customPriority, setCustomPriority] = useState('');

  const [uiState, setUiState] = useState<UIState>('IDLE');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Cycling loading step messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (uiState === 'ANALYZING') {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 1500);
    } else {
      setCurrentStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [uiState]);

  // Handle preset selection
  const handleSelectPreset = (preset: PresetOption) => {
    setDecision(preset.decision);
    setContext(preset.context);
    setPriorities(preset.priorities);
    setValidationError('');
    setErrorMessage('');
  };

  // Toggle priority tag
  const togglePriority = (item: string) => {
    if (priorities.includes(item)) {
      setPriorities(priorities.filter((p) => p !== item));
    } else {
      if (priorities.length >= 10) return;
      setPriorities([...priorities, item]);
    }
  };

  // Add custom priority
  const handleAddCustomPriority = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customPriority.trim();
    if (trimmed && !priorities.includes(trimmed) && priorities.length < 10) {
      setPriorities([...priorities, trimmed]);
      setCustomPriority('');
    }
  };

  // Remove priority tag
  const removePriority = (item: string) => {
    setPriorities(priorities.filter((p) => p !== item));
  };

  // Execute Analysis
  const handleAnalyze = async () => {
    setValidationError('');
    setErrorMessage('');

    if (!decision.trim()) {
      setValidationError('Please describe the decision you are considering.');
      return;
    }

    if (decision.trim().length < 10) {
      setValidationError('Decision description must be at least 10 characters.');
      return;
    }

    if (decision.trim().length > 2000) {
      setValidationError('Decision description cannot exceed 2000 characters.');
      return;
    }

    setUiState('ANALYZING');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          decision: decision.trim(),
          context: context.trim() ? context.trim() : undefined,
          priorities: priorities.length > 0 ? priorities : undefined
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'AI analysis is temporarily unavailable. Please try again.');
        setUiState('ERROR');
        return;
      }

      setAnalysisResult(data.data);
      setUiState('RESULTS');

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMessage('AI analysis is temporarily unavailable. Please check your connection and try again.');
      setUiState('ERROR');
    }
  };

  // Reset form
  const handleReset = () => {
    setDecision('');
    setContext('');
    setPriorities(['Career', 'Learning', 'Time']);
    setAnalysisResult(null);
    setUiState('IDLE');
    setValidationError('');
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(11, 15, 25, 0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Eye size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', color: '#ffffff' }}>
                  BlindSpot AI
                </span>
                <span className="badge badge-indigo" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  Reflection Engine
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Decision critical-thinking assistant
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.05)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <ShieldCheck size={14} color="#10b981" />
              <span>Independent Reflection Mode</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1150px', width: '100%', margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span className="badge badge-violet" style={{ padding: '6px 12px', fontSize: '13px' }}>
              <Zap size={13} />
              Support Your Critical Thinking
            </span>
          </div>
          <h1
            className="serif"
            style={{
              fontSize: 'clamp(32px, 5.5vw, 56px)',
              fontWeight: 500,
              lineHeight: 1.15,
              maxWidth: '850px',
              margin: '0 auto',
              color: '#ffffff'
            }}
          >
            Discover what you’re missing{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              before you decide.
            </span>
          </h1>
          <p
            style={{
              fontSize: '17px',
              color: 'var(--text-muted)',
              maxWidth: '680px',
              margin: '18px auto 0',
              lineHeight: 1.6
            }}
          >
            BlindSpot AI analyzes your reasoning to uncover hidden assumptions, overlooked risks, and crucial questions.
            <strong style={{ color: '#e5e7eb', display: 'block', marginTop: '6px' }}>
              It never tells you what choice to make — it empowers you to make your own.
            </strong>
          </p>
        </section>

        {/* Input Form Card */}
        <div ref={formRef} className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
          {/* Preset Inspirations */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={16} color="#818cf8" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Preset Scenarios
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="btn-secondary"
                  style={{
                    fontSize: '13px',
                    padding: '8px 14px',
                    borderColor: decision === p.decision ? '#6366f1' : undefined,
                    background: decision === p.decision ? 'rgba(99, 102, 241, 0.15)' : undefined
                  }}
                >
                  <span>{p.emoji}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze();
            }}
          >
            {/* Decision Field */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: 600, fontSize: '15px', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>The Decision You’re Evaluating</span>
                  <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <span style={{ fontSize: '12px', color: decision.length > 2000 ? '#f43f5e' : 'var(--text-dim)' }}>
                  {decision.length} / 2000 chars
                </span>
              </div>
              <textarea
                value={decision}
                onChange={(e) => {
                  setDecision(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="e.g. Should I accept a 6-month internship offer?"
                rows={2}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: validationError ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                onBlur={(e) => (e.target.style.borderColor = validationError ? '#f43f5e' : 'var(--border-subtle)')}
              />
              {validationError && (
                <p style={{ color: '#fb7185', fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} />
                  {validationError}
                </p>
              )}
            </div>

            {/* Context & Reasoning Field */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: 600, fontSize: '15px', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Your Current Reasoning & Context</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <span style={{ fontSize: '12px', color: context.length > 5000 ? '#f43f5e' : 'var(--text-dim)' }}>
                  {context.length} / 5000 chars
                </span>
              </div>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Explain what is driving your thinking: What are the pros? What makes you hesitate? e.g. The stipend is good, the company is close to my home, and I want industry experience."
                rows={4}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: 1.6
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
              />
            </div>

            {/* Priorities */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '15px', color: '#f3f4f6', marginBottom: '8px' }}>
                Your Stated Priorities <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 400 }}>(Select or type custom)</span>
              </label>

              {/* Active selected priorities */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {priorities.map((item, idx) => (
                  <span
                    key={idx}
                    className="badge badge-indigo"
                    style={{ fontSize: '13px', padding: '6px 12px', cursor: 'pointer' }}
                    onClick={() => removePriority(item)}
                    title="Click to remove"
                  >
                    {item}
                    <span style={{ marginLeft: '4px', opacity: 0.6, fontSize: '14px' }}>×</span>
                  </span>
                ))}
                {priorities.length === 0 && (
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    No priorities selected yet.
                  </span>
                )}
              </div>

              {/* Suggested Pills & Custom Add Input */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {SUGGESTED_PRIORITIES.map((sug, idx) => {
                  const isSelected = priorities.includes(sug);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => togglePriority(sug)}
                      style={{
                        background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        border: isSelected ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                        color: isSelected ? '#a5b4fc' : 'var(--text-muted)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {sug}
                    </button>
                  );
                })}

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="text"
                    value={customPriority}
                    onChange={(e) => setCustomPriority(e.target.value)}
                    onKeyDown={handleAddCustomPriority}
                    placeholder="Add custom..."
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      color: '#ffffff',
                      outline: 'none',
                      width: '110px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPriority}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px' }}>
                <Info size={15} />
                <span>AI will evaluate logic, uncover gaps, and test assumptions.</span>
              </div>

              <button
                type="submit"
                disabled={uiState === 'ANALYZING'}
                className="btn-primary"
                style={{ minWidth: '220px' }}
              >
                <Sparkles size={18} />
                <span>Reveal My Blind Spots</span>
              </button>
            </div>
          </form>
        </div>

        {/* Loading State Animation */}
        {uiState === 'ANALYZING' && (
          <div
            className="glass-panel"
            style={{
              padding: '48px 32px',
              textAlign: 'center',
              marginBottom: '32px',
              border: '1px solid rgba(99, 102, 241, 0.4)'
            }}
          >
            <div
              className="radar-spinner"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Search size={28} color="#ffffff" className="animate-spin-slow" />
            </div>

            <h3 className="serif" style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              {LOADING_STEPS[currentStepIndex]}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>
              Examining framing biases, unstating premises, and potential conflicts in trade-offs...
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {LOADING_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    height: '4px',
                    width: idx === currentStepIndex ? '36px' : '12px',
                    borderRadius: '2px',
                    background: idx === currentStepIndex ? '#6366f1' : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error State Banner */}
        {uiState === 'ERROR' && (
          <div
            className="glass-panel"
            style={{
              padding: '24px 32px',
              marginBottom: '32px',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              background: 'rgba(244, 63, 94, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={22} color="#fb7185" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#fb7185', marginBottom: '4px' }}>
                  Analysis Encountered An Issue
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {errorMessage}
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={handleAnalyze} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                    <RotateCcw size={14} />
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Load demo scenario
                      handleSelectPreset(PRESETS[0]);
                      setTimeout(handleAnalyze, 100);
                    }}
                    className="btn-secondary"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                  >
                    Load Demo Example
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {uiState === 'RESULTS' && analysisResult && (
          <div ref={resultsRef} style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Results Header Bar */}
            <div
              className="glass-panel"
              style={{
                padding: '24px 32px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span className="badge badge-indigo">
                    <CheckCircle2 size={13} />
                    AI Reflection Complete
                  </span>
                  {analysisResult.isDemoFallback && (
                    <span className="badge badge-amber" title="Operating with pre-computed structural analysis">
                      Demo Fallback Mode
                    </span>
                  )}
                </div>
                <h2 className="serif" style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff' }}>
                  Critical Reflection Map
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Based on the reasoning you provided • Designed to empower your independent judgment
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary"
                  style={{ fontSize: '13px' }}
                >
                  <RotateCcw size={14} />
                  Analyze Another Decision
                </button>
              </div>
            </div>

            {/* Summary Banner */}
            <div
              className="glass-panel"
              style={{
                padding: '24px 32px',
                marginBottom: '24px',
                borderLeft: '4px solid #6366f1'
              }}
            >
              <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8', marginBottom: '8px' }}>
                Decision Evaluated
              </h3>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>
                “{analysisResult.summary.decision}”
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong style={{ color: '#d1d5db' }}>Core Premise: </strong>
                {analysisResult.summary.core_reasoning}
              </p>
            </div>

            {/* Grid of Structured Insight Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '24px',
                marginBottom: '24px'
              }}
            >
              {/* 1. Hidden Assumptions Card */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Search size={16} color="#818cf8" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Hidden Assumptions</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Premises taken for granted</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {analysisResult.hidden_assumptions.map((item, idx) => (
                    <div key={idx} className="card-item">
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#f3f4f6', marginBottom: '6px' }}>
                        {item.title}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#a5b4fc',
                          background: 'rgba(99, 102, 241, 0.1)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          borderLeft: '2px solid #6366f1'
                        }}
                      >
                        <strong>Why it matters:</strong> {item.why_it_matters}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Overlooked Factors Card */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Eye size={16} color="#fbbf24" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Overlooked Factors</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Variables not mentioned in reasoning</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {analysisResult.overlooked_factors.map((item, idx) => (
                    <div key={idx} className="card-item">
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#f3f4f6', marginBottom: '6px' }}>
                        {item.title}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#fcd34d',
                          background: 'rgba(245, 158, 11, 0.1)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          borderLeft: '2px solid #f59e0b'
                        }}
                      >
                        <strong>Impact:</strong> {item.why_it_matters}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Potential Conflicts Card */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(244, 63, 94, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <AlertTriangle size={16} color="#fb7185" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Potential Conflicts</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Friction between stated priorities</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {analysisResult.potential_conflicts.map((item, idx) => (
                    <div key={idx} className="card-item">
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#f3f4f6', marginBottom: '6px' }}>
                        {item.title}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#fda4af',
                          background: 'rgba(244, 63, 94, 0.1)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          borderLeft: '2px solid #f43f5e'
                        }}
                      >
                        <strong>Tension:</strong> {item.why_it_matters}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Questions Worth Asking Card */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <HelpCircle size={16} color="#22d3ee" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Questions Worth Asking</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Inquiries to clarify before deciding</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysisResult.questions_to_consider.map((q, idx) => (
                    <div
                      key={idx}
                      className="card-item"
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                    >
                      <span
                        style={{
                          background: 'rgba(6, 182, 212, 0.15)',
                          color: '#22d3ee',
                          fontSize: '12px',
                          fontWeight: 700,
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {idx + 1}
                      </span>
                      <p style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: 1.5 }}>{q}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Alternative Perspectives Card */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Compass size={16} color="#a78bfa" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Alternative Perspectives</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Different lenses & mental models</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analysisResult.alternative_perspectives.map((alt, idx) => (
                    <div key={idx} className="card-item">
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '13px',
                          color: '#c4b5fd',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <ChevronRight size={14} color="#a78bfa" />
                        {alt.perspective}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {alt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Additional Information Gaps Card */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FileQuestion size={16} color="#34d399" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Information Gaps</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Missing data that would reduce uncertainty</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysisResult.information_gaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="card-item"
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                    >
                      <ArrowRight size={14} color="#34d399" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reflection Note Callout */}
            {analysisResult.reflection_note && (
              <div
                className="glass-panel"
                style={{
                  padding: '20px 28px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                  <ShieldCheck size={20} color="#818cf8" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {analysisResult.reflection_note}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '13px' }}
                >
                  <RotateCcw size={14} />
                  Analyze Another Decision
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(11, 15, 25, 0.9)',
          padding: '24px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-dim)'
        }}
      >
        <p>
          <strong>BlindSpot AI</strong> · Built to support human agency & critical thinking.
        </p>
        <p style={{ marginTop: '4px', fontSize: '12px' }}>
          Does not provide financial, legal, or definitive life advice. Use as a sounding board for reflection.
        </p>
      </footer>
    </div>
  );
}
