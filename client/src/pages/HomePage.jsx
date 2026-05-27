import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHistory } from '../services/api';
import {
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineStar,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

const features = [
  {
    icon: HiOutlineLightningBolt,
    title: 'AI-Powered Analysis',
    description: 'Get instant feedback on your resume with advanced AI that evaluates content, structure, and ATS compatibility.',
    color: 'text-accent-amber',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    icon: HiOutlineChartBar,
    title: 'ATS Score',
    description: 'See exactly how your resume scores against Applicant Tracking Systems with a detailed breakdown.',
    color: 'text-accent-emerald',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    icon: HiOutlineSearch,
    title: 'Job Match',
    description: 'Paste any job description and instantly see how well your resume matches the requirements.',
    color: 'text-accent-cyan',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Skill Gap Analysis',
    description: 'Discover missing skills and keywords that could boost your chances of landing interviews.',
    color: 'text-accent-violet',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
  },
  {
    icon: HiOutlineDocumentText,
    title: 'Smart Suggestions',
    description: 'Receive actionable improvement suggestions tailored to your experience and target roles.',
    color: 'text-primary-500',
    bg: 'bg-primary-100 dark:bg-primary-900/30',
  },
  {
    icon: HiOutlineStar,
    title: 'Role Recommendations',
    description: 'Get personalized job role recommendations based on your skills and experience.',
    color: 'text-accent-rose',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    quote: 'ResumeAI helped me optimize my resume and land interviews at top tech companies. The ATS score feature is a game-changer!',
    avatar: 'SC',
  },
  {
    name: 'Michael Park',
    role: 'Product Manager at Meta',
    quote: 'The job match feature saved me hours of manually tailoring my resume. I improved my match rate from 45% to 89%.',
    avatar: 'MP',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Data Scientist at Amazon',
    quote: 'I love the skill gap analysis. It showed me exactly which certifications to add to stand out from other candidates.',
    avatar: 'ER',
  },
];

const steps = [
  { step: '01', title: 'Upload Resume', desc: 'Drop your PDF or DOCX file' },
  { step: '02', title: 'AI Analysis', desc: 'Our AI evaluates every aspect' },
  { step: '03', title: 'Get Results', desc: 'Receive actionable insights' },
  { step: '04', title: 'Land Your Job', desc: 'Apply with a winning resume' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUploads: '50K+',
    analyzedCount: '95%',
    avgScore: '3x',
  });

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const { data } = await getHistory();
          const list = Array.isArray(data) ? data : data.data || data.resumes || data.history || [];
          const total = list.length;
          const analyzed = list.filter(
            (h) => h.ats_score != null || h.atsScore != null
          ).length;
          const scores = list
            .map((h) => (h.ats_score != null ? h.ats_score : h.atsScore))
            .filter((s) => s != null);
          const avg =
            scores.length > 0
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              : 0;

          setStats({
            totalUploads: total,
            analyzedCount: analyzed,
            avgScore: avg > 0 ? `${avg}/100` : '—',
          });
        } catch {
          // ignore, keep defaults
        }
      })();
    }
  }, [user]);

  return (
    <div className="page-transition">
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 mesh-gradient-hero" />
        <div className="absolute inset-0 bg-hero-pattern opacity-50 dark:opacity-20" />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary-500/15 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-accent-cyan/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent-violet/5 blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle text-sm font-medium text-dark-600 dark:text-dark-300 mb-8 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
            AI-Powered Resume Intelligence
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-dark-900 dark:text-white leading-tight mb-6 animate-slide-up text-balance">
            Your Resume,{' '}
            <span className="gradient-text">Supercharged</span>{' '}
            by AI
          </h1>

          <p className="text-lg sm:text-xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Get your ATS score, uncover skill gaps, match with job descriptions, and receive
            AI-powered suggestions to land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2"
            >
              {user ? 'Go to Dashboard' : 'Start Free Analysis'}
              <HiOutlineArrowRight className="h-5 w-5" />
            </Link>
            {!user && (
              <Link
                to="/login"
                className="btn-secondary text-lg !px-8 !py-4"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Stats bar */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { value: stats.totalUploads, label: user ? 'Your Uploads' : 'Resumes Analyzed' },
              { value: stats.analyzedCount, label: user ? 'Your Analyzed Resumes' : 'User Satisfaction' },
              { value: stats.avgScore, label: user ? 'Your Avg ATS Score' : 'More Interviews' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-display font-bold gradient-text">{value}</div>
                <div className="text-xs sm:text-sm text-dark-500 dark:text-dark-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <div className="h-8 w-5 rounded-full border-2 border-dark-300 dark:border-dark-600 flex items-start justify-center p-1">
            <div className="h-1.5 w-1.5 rounded-full bg-dark-400 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-dark-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-lg mx-auto">
              Four simple steps to transform your resume
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }, i) => (
              <div
                key={step}
                className="relative glass card-glow rounded-2xl p-6 text-center group hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl font-display font-bold gradient-text opacity-30 mb-3">
                  {step}
                </div>
                <h3 className="font-display font-semibold text-lg text-dark-900 dark:text-white mb-1">
                  {title}
                </h3>
                <p className="text-sm text-dark-500 dark:text-dark-400">{desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 text-dark-300 dark:text-dark-700">
                    <HiOutlineArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-dark-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-lg mx-auto">
              Everything you need to create a winning resume
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="glass card-glow rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="font-display font-semibold text-lg text-dark-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-dark-900 dark:text-white mb-4">
              Loved by Thousands
            </h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-lg mx-auto">
              See what our users have to say about ResumeAI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, quote, avatar }) => (
              <div
                key={name}
                className="glass card-glow rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <HiOutlineStar key={i} className="h-4 w-4 text-accent-amber fill-accent-amber" />
                  ))}
                </div>
                <p className="text-sm text-dark-600 dark:text-dark-300 leading-relaxed mb-5 italic">
                  "{quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center text-white font-semibold text-sm">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-900 dark:text-white">{name}</p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-violet" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            Join thousands of job seekers who have improved their resumes with AI-powered analysis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="px-8 py-4 rounded-xl font-semibold text-primary-600 bg-white hover:bg-white/90 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <HiOutlineCheckCircle className="h-5 w-5" />
              {user ? 'Analyze Now' : 'Get Started Free'}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 border-t border-dark-200/50 dark:border-dark-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">R</span>
              </div>
              <span className="font-display font-semibold text-dark-900 dark:text-white">
                ResumeAI
              </span>
            </div>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              © {new Date().getFullYear()} ResumeAI. Built with ❤️ for job seekers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
