import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Clock,
  ShieldCheck,
  BarChart3,
  Users,
  Layers,
  GraduationCap,
  Briefcase,
  Award,
  Zap,
  Check,
  ChevronRight,
  TrendingUp,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';
import { Button, Input, Modal, Badge } from '../../components/ui';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setCodeError('Please enter an assessment access code');
      return;
    }
    navigate(`/test/${accessCode.trim().toUpperCase()}`);
  };

  return (
    <div className="space-y-20 lg:space-y-32 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs sm:text-sm font-semibold animate-fade-in shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Next-Gen Assessment & Certification Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Create, deliver, and evaluate assessments with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500">
              zero friction
            </span>
            .
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            AssessPulse provides high-stakes online examinations, mobile-first test taking, automated grading, and real-time candidate analytics for universities, bootcamps, and modern enterprises.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="w-full sm:w-auto shadow-md shadow-indigo-200"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Create an Assessment'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              leftIcon={<KeyRound className="w-5 h-5 text-indigo-600" />}
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto"
            >
              Take a Test (Enter Code)
            </Button>
          </div>

          {/* Quick Demo Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mobile & Desktop ready
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Anti-cheat tab tracking
            </span>
          </div>
        </div>

        {/* Hero Preview Card */}
        <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto">
          <div className="rounded-2xl lg:rounded-3xl border border-slate-200/80 bg-white p-2 sm:p-4 shadow-2xl shadow-slate-200/50">
            <div className="rounded-xl lg:rounded-2xl bg-slate-900 text-white p-4 sm:p-8 overflow-hidden">
              {/* Mock Dashboard / Test Engine preview UI */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">
                    assesspulse.io/test/REACT99
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Assessment Session
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left question mock */}
                <div className="lg:col-span-2 bg-slate-800/80 rounded-xl p-5 border border-slate-700/60 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Question 2 of 5</span>
                    <span className="text-amber-400 font-mono font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 12:45 remaining
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">
                    Which of the following React Hooks cause component re-renders when their internal state updates?
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="p-3 rounded-lg bg-indigo-600/30 border border-indigo-500/60 text-white flex items-center justify-between">
                      <span>✓ useState</span>
                      <span className="text-xs font-mono text-indigo-300">Selected</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300">
                      <span>useRef</span>
                    </div>
                    <div className="p-3 rounded-lg bg-indigo-600/30 border border-indigo-500/60 text-white flex items-center justify-between">
                      <span>✓ useReducer</span>
                      <span className="text-xs font-mono text-indigo-300">Selected</span>
                    </div>
                  </div>
                </div>

                {/* Right quick stats mock */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/60 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Live Performance
                    </div>
                    <div className="text-3xl font-extrabold text-white">92%</div>
                    <p className="text-xs text-slate-400 mt-1">Average cohort passing rate</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Completed Attempts:</span>
                      <span className="font-semibold text-white">1,480</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Anti-cheat Violations:</span>
                      <span className="font-semibold text-emerald-400">0 detected</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/test/REACT99')}
                    className="w-full"
                  >
                    Try This Test Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="primary" size="sm">
            Simple 3-Step Flow
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            How AssessPulse works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From authoring complex multi-choice questions to grading hundreds of candidates automatically in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col space-y-4 hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900">Build Your Assessment</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Create tests with 5 rich question types (Single/Multi-choice, True/False, Short & Long answer), configure passing scores, time limits, and explanation keys.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col space-y-4 hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900">Share Unique Code</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Distribute a clean 6-character access code or direct test link. Participants can access exams immediately on any mobile or desktop browser without app installs.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col space-y-4 hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900">Get Instant Insights</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Instant automatic scoring, pass/fail certificates, cohort distributions, question difficulty analytics, and CSV exports for grading records.
            </p>
          </div>
        </div>
      </section>

      {/* Assessment Platform Features */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="primary" size="sm">
            Core Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Engineered for high-stakes accuracy
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Everything you need to deliver reliable assessments at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileQuestion className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">5 Question Formats</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Support Single Choice, Multiple Selection, True/False, Short Answer keyword matching, and qualitative Long Answer prompts.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Anti-Cheat Integrity</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Automatic tab switch detection, blur warning alerts, randomized question ordering, and answer option shuffling.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Precision Countdown Timers</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Sticky mobile timers with automated auto-submission upon expiry, ensuring zero overtime advantages.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Deep Item Analytics</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Measure question difficulty indices, cohort score curves, average completion times, and discriminating answer options.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Instant Automated Scoring</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Instant feedback for participants upon submission with full answer review breakdown and answer rationale.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Candidate Directory</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Maintain longitudinal participant history, aggregate performance averages, and export compliance records.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions / Use Cases */}
      <section id="solutions" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="primary" size="sm">
            Target Solutions
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Built for any assessment challenge
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Education & Bootcamps</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Conduct weekly quizzes, midterms, and coding concept evaluations with instant student gradebooks and item analysis.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Hiring & Tech Recruitment</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Screen developer candidates on algorithms, React, Docker, and system design before moving them to technical rounds.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Corporate Certifications</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Deliver accredited internal training evaluations with strict anti-cheat tracking, certificates, and compliance logs.
            </p>
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section id="analytics" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <Badge variant="primary" size="sm" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                Actionable Intelligence
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Understand cohort performance at a granular level
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Spot knowledge gaps instantly. Our statistical breakdown shows pass percentages, score distribution histograms, and which questions were missed most often.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time score distribution charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Question-level difficulty and discriminatory power</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Export full CSV reports for LMS or HR systems</span>
                </li>
              </ul>
              <Button
                variant="primary"
                onClick={() => navigate('/dashboard')}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Explore Analytics Demo
              </Button>
            </div>

            {/* Visual metric mockup */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-300">Cohort Score Curve</div>
                <div className="text-xs text-indigo-400 font-mono">REACT99</div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>81% - 100% (High Mastery)</span>
                    <span className="font-semibold text-white">58% of candidates</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '58%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>61% - 80% (Competent)</span>
                    <span className="font-semibold text-white">28% of candidates</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Below 60% (Needs Review)</span>
                    <span className="font-semibold text-white">14% of candidates</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '14%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-tr from-indigo-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-indigo-200/50 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to streamline your online assessments?
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Create an assessment in under 3 minutes or test our candidate exam interface directly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-slate-100"
            >
              Get Started for Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-indigo-700/50 text-white border-indigo-400/50 hover:bg-indigo-700"
            >
              Enter Test Code
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Access Code Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enter Assessment Code"
        description="Type the access code provided by your instructor or company."
        maxWidth="md"
      >
        <form onSubmit={handleQuickJoin} className="space-y-4 pt-1">
          <Input
            label="Access Code"
            placeholder="e.g. REACT99"
            value={accessCode}
            onChange={(e) => {
              setAccessCode(e.target.value.toUpperCase());
              setCodeError('');
            }}
            error={codeError}
            autoFocus
            className="text-center font-mono text-lg tracking-widest uppercase font-bold"
            leftIcon={<KeyRound className="w-5 h-5 text-slate-400" />}
          />
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 border border-slate-100 flex items-center gap-2">
            <span className="font-semibold text-slate-700">Sample Test:</span>
            <button
              type="button"
              onClick={() => setAccessCode('REACT99')}
              className="text-indigo-600 hover:underline font-mono font-bold"
            >
              REACT99
            </button>
            <span>or</span>
            <button
              type="button"
              onClick={() => setAccessCode('CLOUD44')}
              className="text-indigo-600 hover:underline font-mono font-bold"
            >
              CLOUD44
            </button>
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Test
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
