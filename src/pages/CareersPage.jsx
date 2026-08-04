import React, { useState, useMemo } from 'react';
import { 
  Briefcase, Search, MapPin, Clock, Award, Users, ChevronRight, CheckCircle2, 
  Sparkles, Globe, Shield, Phone, Mail, ArrowRight, Bookmark, Filter, RotateCcw, 
  Building2, GraduationCap, HeartHandshake, Zap, Calendar, Laptop, Check, X, ExternalLink
} from 'lucide-react';
import { Button, Badge } from '../components/common/CorporateUI';
import { Modal } from '../components/common/Modal';
import { getApiUrl } from '../config/api';

export const CareersPage = ({ onNavigateCandidateLogin, onNavigateEmployeeLogin }) => {
  // Filter States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedExp, setSelectedExp] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Bookmarked Jobs
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Application Modal State
  const [applyJob, setApplyJob] = useState(null);
  const [applyForm, setApplyForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    experienceYears: '',
    resumeUrl: '',
    coverNote: ''
  });
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState('');

  // 12 Professional Job Openings Data
  const jobListings = [
    {
      id: 'job-1',
      title: 'Senior MERN Stack Developer',
      department: 'Engineering',
      experience: '3-5 Years',
      type: 'Full-Time',
      location: 'Ahmedabad (On-Site)',
      salary: '₹6,00,000 - ₹11,00,000 PA',
      skills: ['React.js', 'Node.js', 'Express', 'MongoDB', 'AWS', 'Tailwind CSS'],
      status: 'Urgent',
      postedDate: '2 Days Ago',
      openings: 4
    },
    {
      id: 'job-2',
      title: 'Full Stack React & Node Developer',
      department: 'Engineering',
      experience: '1-3 Years',
      type: 'Full-Time',
      location: 'Ahmedabad (Hybrid)',
      salary: '₹4,00,000 - ₹7,00,000 PA',
      skills: ['React.js', 'Node.js', 'JavaScript ES6', 'PostgreSQL', 'Git'],
      status: 'Hiring',
      postedDate: '3 Days Ago',
      openings: 6
    },
    {
      id: 'job-3',
      title: 'AI & Machine Learning Engineer',
      department: 'AI & Data Intelligence',
      experience: '2-4 Years',
      type: 'Full-Time',
      location: 'Ahmedabad (On-Site)',
      salary: '₹7,50,000 - ₹13,00,000 PA',
      skills: ['Python', 'PyTorch', 'OpenAI API', 'LangChain', 'FastAPI', 'Docker'],
      status: 'New',
      postedDate: '1 Day Ago',
      openings: 3
    },
    {
      id: 'job-4',
      title: 'Mobile App Developer (Flutter / React Native)',
      department: 'Mobile Engineering',
      experience: '2-4 Years',
      type: 'Full-Time',
      location: 'Ahmedabad (Hybrid)',
      salary: '₹5,00,000 - ₹9,50,000 PA',
      skills: ['Flutter', 'React Native', 'Dart', 'Redux', 'REST API', 'Firebase'],
      status: 'Hiring',
      postedDate: '4 Days Ago',
      openings: 2
    },
    {
      id: 'job-5',
      title: 'QA Lead & Automation Engineer',
      department: 'Quality Assurance',
      experience: '3-5 Years',
      type: 'Full-Time',
      location: 'Ahmedabad (On-Site)',
      salary: '₹5,50,000 - ₹9,00,000 PA',
      skills: ['Cypress', 'Selenium', 'Postman API Testing', 'Jest', 'CI/CD'],
      status: 'Urgent',
      postedDate: 'Just Today',
      openings: 2
    },
    {
      id: 'job-6',
      title: 'Cloud Systems & DevOps Engineer',
      department: 'Cloud & Infrastructure',
      experience: '3-6 Years',
      type: 'Full-Time',
      location: 'Ahmedabad (Remote / Hybrid)',
      salary: '₹8,00,000 - ₹14,00,000 PA',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux Admin', 'GitHub Actions'],
      status: 'New',
      postedDate: '2 Days Ago',
      openings: 3
    }
  ];

  // Internship Openings Data
  const internshipPrograms = [
    {
      id: 'intern-1',
      title: 'Full Stack MERN Web Engineering Internship',
      duration: '6 Months',
      technology: 'React.js, Node.js, Express, MongoDB, Tailwind',
      certificate: 'ISO Certified Completion + Placement Assistance',
      mode: 'On-Site (Solaris Hub, Ahmedabad)',
      stipend: 'Stipend Provided Based on Evaluation'
    },
    {
      id: 'intern-2',
      title: 'Python & Generative AI Solutions Internship',
      duration: '6 Months',
      technology: 'Python 3.11, Django, LangChain, OpenAI APIs, Vector DBs',
      certificate: 'ISO Certified Completion + Placement Assistance',
      mode: 'Hybrid (Ahmedabad)',
      stipend: 'Stipend Provided Based on Evaluation'
    },
    {
      id: 'intern-3',
      title: 'Cross-Platform Mobile App Engineering Internship',
      duration: '6 Months',
      technology: 'Flutter, React Native, Dart, Firebase, RESTful APIs',
      certificate: 'ISO Certified Completion + Placement Assistance',
      mode: 'On-Site (Solaris Hub, Ahmedabad)',
      stipend: 'Stipend Provided Based on Evaluation'
    }
  ];

  // Filter Logic
  const filteredJobs = useMemo(() => {
    return jobListings.filter(job => {
      const q = searchKeyword.toLowerCase().trim();
      const matchesKeyword = !q || (
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.skills.some(s => s.toLowerCase().includes(q))
      );

      const matchesExp = !selectedExp || job.experience.includes(selectedExp);
      const matchesDept = !selectedDept || job.department === selectedDept;
      const matchesLoc = !selectedLoc || job.location.includes(selectedLoc);
      const matchesType = !selectedType || job.type === selectedType;

      return matchesKeyword && matchesExp && matchesDept && matchesLoc && matchesType;
    });
  }, [searchKeyword, selectedExp, selectedDept, selectedLoc, selectedType]);

  const toggleSaveJob = (id) => {
    setSavedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedExp('');
    setSelectedDept('');
    setSelectedLoc('');
    setSelectedType('');
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplySubmitting(true);
    setApplySuccessMsg('');

    try {
      const fullUrl = getApiUrl('/api/candidates');
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: applyForm.fullName,
          email: applyForm.email,
          mobile: applyForm.mobile,
          experienceYears: Number(applyForm.experienceYears) || 0,
          resumeUrl: applyForm.resumeUrl,
          appliedProfileName: applyJob?.title || 'General Application'
        })
      });

      const data = await response.json();
      if (data.success) {
        setApplySuccessMsg(`Application submitted successfully! Your Candidate Registration Code: ${data.data?.candidateCode || 'CAND-OK'}.`);
        setTimeout(() => {
          setApplyJob(null);
          setApplySuccessMsg('');
          setApplyForm({ fullName: '', email: '', mobile: '', experienceYears: '', resumeUrl: '', coverNote: '' });
        }, 3000);
      } else {
        alert(data.message || 'Submission failed. Please verify your details.');
      }
    } catch (err) {
      alert('Network issue. Please try submitting again.');
    } finally {
      setApplySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* 1. TOP CORPORATE HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Kevalon Technology Logo" className="h-9 w-auto object-contain" />
            <div className="border-l border-slate-300 pl-3">
              <span className="font-extrabold text-sm tracking-wider uppercase text-slate-900 block leading-tight">
                Kevalon Technology
              </span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest block">
                Careers & Talent Portal
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <a href="#openings" className="hover:text-[#034665] transition">Open Positions</a>
            <a href="#why-join" className="hover:text-[#034665] transition">Why Join Us</a>
            <a href="#internships" className="hover:text-[#034665] transition">Internships</a>
            <a href="#benefits" className="hover:text-[#034665] transition">Benefits</a>
            <a href="#process" className="hover:text-[#034665] transition">Process</a>
            <a href="#contact" className="hover:text-[#034665] transition">Contact HR</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={onNavigateCandidateLogin}>
              <Users size={14} className="text-[#034665]" /> Candidate Sign In
            </Button>
            <Button variant="primary" size="sm" onClick={onNavigateEmployeeLogin}>
              <Shield size={14} /> Employee Portal
            </Button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-white py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-extrabold tracking-wider uppercase">
              <Sparkles size={14} className="text-yellow-400" /> Now Hiring Developers & Engineers
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Build Your Career with <span className="text-yellow-400">Kevalon Technology</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
              Ahmedabad thi start karo, global clients sathe kaam karo. Join a team of passionate engineers building high-scale web apps, AI solutions, and cloud infrastructure for international clients.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" size="lg" onClick={() => setApplyJob({ title: 'General Career Application' })}>
                Apply Now <ArrowRight size={18} />
              </Button>
              <a href="#openings">
                <Button variant="secondary" size="lg">
                  View Open Positions
                </Button>
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">10+</div>
                <div className="text-slate-400 font-medium">Countries Served</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-yellow-400">2020</div>
                <div className="text-slate-400 font-medium">Founded Year</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">100%</div>
                <div className="text-slate-400 font-medium">Career Growth</div>
              </div>
            </div>
          </div>

          {/* Right Hero Graphic Illustration Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700/80 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#034665] rounded-xl flex items-center justify-center text-white font-bold">
                    KT
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Engineering Culture</h3>
                    <p className="text-[11px] text-slate-400">Solaris Hub, Ahmedabad</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <Laptop size={18} className="text-blue-400" />
                  <div>
                    <div className="font-bold text-white">Enterprise Stack Experience</div>
                    <div className="text-slate-400 text-[11px]">MERN, Python, Next.js, AWS Cloud</div>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <Globe size={18} className="text-emerald-400" />
                  <div>
                    <div className="font-bold text-white">Global Client Interaction</div>
                    <div className="text-slate-400 text-[11px]">USA, UK, Australia, Middle East Projects</div>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <Award size={18} className="text-yellow-400" />
                  <div>
                    <div className="font-bold text-white">Performance Appraisals</div>
                    <div className="text-slate-400 text-[11px]">Bi-annual reviews & promotions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY JOIN KEVALON (6 PREMIUM CARDS) */}
      <section id="why-join" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="primary">Why Join Kevalon</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Build Your Career with Meaningful Impact
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            We provide a high-growth environment where developers design enterprise systems and scale their engineering potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Globe,
              title: "Global Client Exposure",
              desc: "Collaborate directly with international founders and enterprise teams across North America, Europe, and Asia."
            },
            {
              icon: Zap,
              title: "Modern Tech Stack",
              desc: "Master modern frameworks including React, Next.js, Node.js, Python, Generative AI, and AWS Cloud DevOps."
            },
            {
              icon: Award,
              title: "Accelerated Career Growth",
              desc: "Clear career advancement tracks with transparent performance appraisals and fast-track promotions."
            },
            {
              icon: GraduationCap,
              title: "Mentorship & Learning",
              desc: "Direct 1-on-1 mentorship from principal architects, weekly technical workshops, and sponsored certifications."
            },
            {
              icon: HeartHandshake,
              title: "Flexible & Respectful Culture",
              desc: "Balanced work-life environment with hybrid flexibility, supportive peers, and a zero-micromanagement policy."
            },
            {
              icon: Shield,
              title: "Competitive Rewards",
              desc: "Industry-leading compensation packages, joining bonuses, health coverage, and performance incentives."
            }
          ].map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <div 
                key={idx} 
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#034665]/40 transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-blue-50 text-[#034665] rounded-xl flex items-center justify-center group-hover:bg-[#034665] group-hover:text-white transition-colors">
                    <CardIcon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CURRENT OPENINGS & TOP SEARCH FILTER BAR */}
      <section id="openings" className="bg-slate-100/70 py-16 sm:py-20 px-4 sm:px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge variant="primary">Explore Roles</Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Current Open Positions ({filteredJobs.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Find your next role at Kevalon Technology's Corporate Development Hub.
              </p>
            </div>
          </div>

          {/* TOP SEARCH & FILTER BAR */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              
              {/* Keyword Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  placeholder="Search job title or skills..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#034665] focus:bg-white outline-none transition"
                />
                <Search className="absolute left-3 top-3 text-slate-400" size={15} />
              </div>

              {/* Experience Filter */}
              <select
                value={selectedExp}
                onChange={e => setSelectedExp(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#034665] focus:bg-white outline-none"
              >
                <option value="">All Experience Levels</option>
                <option value="1-3">1 - 3 Years</option>
                <option value="3-5">3 - 5 Years</option>
                <option value="3-6">3 - 6 Years</option>
              </select>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#034665] focus:bg-white outline-none"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="AI & Data Intelligence">AI & Data Intelligence</option>
                <option value="Mobile Engineering">Mobile Engineering</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
              </select>

              {/* Location Filter */}
              <select
                value={selectedLoc}
                onChange={e => setSelectedLoc(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#034665] focus:bg-white outline-none"
              >
                <option value="">All Locations</option>
                <option value="On-Site">Ahmedabad (On-Site)</option>
                <option value="Hybrid">Ahmedabad (Hybrid)</option>
                <option value="Remote">Remote / Hybrid</option>
              </select>

              {/* Reset Filters Button */}
              <Button variant="secondary" size="md" onClick={handleResetFilters} icon={RotateCcw}>
                Reset Filter
              </Button>
            </div>
          </div>

          {/* CORPORATE JOB CARDS GRID */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl space-y-3">
              <Briefcase size={32} className="text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Job Openings Found</h3>
              <p className="text-xs text-slate-500">No positions match your selected filter criteria. Try resetting filters.</p>
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Clear Search Filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map(job => {
                const isSaved = savedJobIds.has(job.id);
                return (
                  <div 
                    key={job.id} 
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-[#034665]/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge 
                            variant={job.status === 'Urgent' ? 'danger' : job.status === 'New' ? 'success' : 'primary'}
                          >
                            {job.status} Position
                          </Badge>
                          <h3 className="text-base font-black text-slate-900 mt-2">{job.title}</h3>
                          <div className="text-xs font-semibold text-[#034665]">{job.department}</div>
                        </div>

                        <button 
                          onClick={() => toggleSaveJob(job.id)}
                          className={`p-2 rounded-xl border transition ${
                            isSaved ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                          title="Save Job"
                        >
                          <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Briefcase size={14} className="text-slate-400" /> {job.experience}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <MapPin size={14} className="text-slate-400" /> {job.location}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock size={14} className="text-slate-400" /> {job.type}
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {job.salary}
                        </div>
                      </div>

                      {/* Required Skills Tags */}
                      <div className="pt-2">
                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">Required Skills:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[11px] font-semibold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
                      <div className="text-[11px] text-slate-500 font-medium">
                        <span>Posted {job.postedDate}</span> &bull; <strong className="text-slate-800">{job.openings} Openings</strong>
                      </div>

                      <Button variant="primary" size="sm" onClick={() => setApplyJob(job)}>
                        Apply Now
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. INTERNSHIP PROGRAMS */}
      <section id="internships" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        <div>
          <Badge variant="primary">Early Career & Internships</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Project-Based Internship Programs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Gain hands-on production codebase experience under the mentorship of senior Kevalon engineers.
          </p>
        </div>

        <div className="space-y-4">
          {internshipPrograms.map(intern => (
            <div 
              key={intern.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#034665]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-900 font-bold border border-indigo-200 rounded-full text-[10px] uppercase">
                    Duration: {intern.duration}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 rounded-full text-[10px] uppercase">
                    {intern.stipend}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-slate-900">{intern.title}</h3>
                
                <div className="text-xs text-slate-600 font-medium space-y-1">
                  <div><strong>Technologies Covered:</strong> {intern.technology}</div>
                  <div><strong>Certification & Perks:</strong> {intern.certificate}</div>
                  <div><strong>Training Mode:</strong> {intern.mode}</div>
                </div>
              </div>

              <Button variant="primary" size="md" onClick={() => setApplyJob({ title: intern.title })} className="w-full md:w-auto">
                Apply for Internship <ArrowRight size={16} />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. BENEFITS */}
      <section id="benefits" className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="px-3 py-1 bg-blue-950 text-blue-300 text-xs font-extrabold uppercase tracking-widest rounded-full border border-blue-500/40">
              Employee Perks & Benefits
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Designed for Professional Excellence
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: GraduationCap, label: "Continuous Learning" },
              { icon: Award, label: "Fast Career Growth" },
              { icon: Laptop, label: "Flexible Environment" },
              { icon: Sparkles, label: "Performance Rewards" },
              { icon: Globe, label: "Global Exposure" },
              { icon: Calendar, label: "Events & Hackathons" }
            ].map((ben, bIdx) => {
              const BIcon = ben.icon;
              return (
                <div key={bIdx} className="bg-slate-800/80 border border-slate-700/70 p-5 rounded-2xl text-center space-y-3 hover:border-yellow-400 transition">
                  <div className="w-10 h-10 bg-[#034665] text-yellow-400 rounded-xl flex items-center justify-center mx-auto">
                    <BIcon size={20} />
                  </div>
                  <div className="text-xs font-bold text-slate-200">{ben.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. APPLICATION PROCESS TIMELINE */}
      <section id="process" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="primary">Hiring Workflow</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Our 5-Step Transparent Recruitment Process
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            { step: "01", title: "Apply Online", desc: "Submit your resume & profile via our careers portal." },
            { step: "02", title: "HR Screening", desc: "Initial call for academic & background verification." },
            { step: "03", title: "Technical Round", desc: "1-on-1 coding assessment & architectural discussion." },
            { step: "04", title: "HR Interview", desc: "Cultural alignment, compensation & role expectations." },
            { step: "05", title: "Offer Letter", desc: "Formal offer letter & smooth onboarding." }
          ].map((proc, pIdx) => (
            <div key={pIdx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative space-y-2">
              <div className="text-2xl font-black text-[#034665] font-mono">{proc.step}</div>
              <h4 className="font-bold text-slate-900 text-sm">{proc.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{proc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CORPORATE CONTACT SECTION */}
      <section id="contact" className="bg-slate-100 py-16 sm:py-20 px-4 sm:px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 space-y-4">
            <Badge variant="primary">Corporate Contact</Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Connect Directly with Our HR Recruitment Team
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Have questions about open roles, interview schedules, or campus drives? Our HR team is ready to assist you.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-800">
              <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <Phone size={18} className="text-[#034665]" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Phone Helpline:</div>
                  <strong className="text-sm font-mono">+91 9081012218</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <Mail size={18} className="text-[#034665]" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">HR Recruitment Email:</div>
                  <strong className="text-sm">hr@kevalontechnology.in</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <MapPin size={18} className="text-[#034665]" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Corporate Headquarters:</div>
                  <strong className="text-xs">913, Solaris Business Hub, Parshwanath Jain BRTS, Bhuyangdev, Ahmedabad, Gujarat - 380061</strong>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a 
                href="https://maps.google.com/?q=Solaris+Business+Hub+Ahmedabad" 
                target="_blank" 
                rel="noreferrer"
              >
                <Button variant="outline" size="md" icon={ExternalLink}>
                  Open in Google Maps
                </Button>
              </a>
            </div>
          </div>

          {/* Contact CTA Card */}
          <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4 text-center">
            <Building2 size={36} className="text-[#034665] mx-auto" />
            <h3 className="text-xl font-black text-slate-900">Still Have Career Questions?</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Send your profile directly to our talent acquisition team. We respond within 24 business hours.
            </p>
            <Button variant="primary" size="lg" onClick={() => setApplyJob({ title: 'General Career Inquiry' })} className="w-full">
              Contact HR Team Now
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-8 px-4 border-t border-slate-800 text-xs text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="h-6 w-auto object-contain" />
            <span className="text-slate-200 font-bold uppercase text-[11px]">Kevalon Technology Careers Portal</span>
          </div>
          <div>&copy; {new Date().getFullYear()} Kevalon Technology Enterprise Systems. All rights reserved.</div>
        </div>
      </footer>

      {/* QUICK APPLY JOB MODAL */}
      <Modal isOpen={!!applyJob} onClose={() => setApplyJob(null)} title={`Job Application: ${applyJob?.title}`}>
        {applyJob && (
          <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
            {applySuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-bold">
                {applySuccessMsg}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={applyForm.fullName}
                onChange={e => setApplyForm({ ...applyForm, fullName: e.target.value })}
                placeholder="e.g. Harsh V. Patel"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={applyForm.email}
                  onChange={e => setApplyForm({ ...applyForm, email: e.target.value })}
                  placeholder="harsh@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={applyForm.mobile}
                  onChange={e => setApplyForm({ ...applyForm, mobile: e.target.value })}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={applyForm.experienceYears}
                  onChange={e => setApplyForm({ ...applyForm, experienceYears: e.target.value })}
                  placeholder="e.g. 2"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Resume / LinkedIn Link</label>
                <input
                  type="text"
                  value={applyForm.resumeUrl}
                  onChange={e => setApplyForm({ ...applyForm, resumeUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" type="button" onClick={() => setApplyJob(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={applySubmitting}>
                {applySubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
