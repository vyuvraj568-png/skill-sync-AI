import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BarChart3, BookOpen, BrainCircuit, BriefcaseBusiness,
  Check, CheckCircle2, ChevronRight, CircleHelp, Compass, Download, GraduationCap, LoaderCircle,
  Menu, Moon, Network, RotateCcw, Sparkles, Sun, Target, TrendingUp, X,
} from "lucide-react";
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend as ChartLegend, LinearScale,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { api } from "./services/api.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, ChartLegend, ChartTooltip);

const skillLabels = {
  python: "Python", sql: "SQL", excel: "Excel", statistics: "Statistics",
  data_visualization: "Data visualization", machine_learning: "Machine learning",
  deep_learning: "Deep learning", web_development: "Web development", testing: "Software testing",
  cloud: "Cloud fundamentals", business_analysis: "Business analysis", communication: "Communication",
  problem_solving: "Problem solving", teamwork: "Teamwork", critical_thinking: "Critical thinking",
};
const defaultProfile = {
  highest_qualification: "", experience_level: "", preferred_domain: "", interest: "", skills: [], learning_goals: "",
};

function Logo({ small = false }) {
  return <div className={`brand ${small ? "brand-small" : ""}`}><span className="brand-mark"><Network size={18} /></span><span>skillsync<span className="brand-ai">.ai</span></span></div>;
}

function App() {
  const [page, setPage] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [light, setLight] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");
  const [catalog, setCatalog] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [profile, setProfile] = useState(defaultProfile);
  const [result, setResult] = useState(null);
  const [gap, setGap] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("skillsync-history") || "[]"));

  useEffect(() => {
    api.health().then(() => setApiStatus("online")).catch(() => setApiStatus("offline"));
    api.careers().then(setCatalog).catch((err) => setError(err.message));
    api.metrics().then(setMetrics).catch(() => {});
  }, []);

  const navigate = (next) => {
    setPage(next);
    setMenuOpen(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const updateProfile = (key, value) => setProfile((current) => ({ ...current, [key]: value }));
  const toggleSkill = (skill) => updateProfile("skills", profile.skills.includes(skill)
    ? profile.skills.filter((item) => item !== skill) : [...profile.skills, skill]);

  const analyze = async (event) => {
    event.preventDefault();
    setError("");
    if (!profile.highest_qualification || !profile.experience_level || !profile.preferred_domain || !profile.interest) {
      setError("Complete each profile field before generating your career analysis.");
      return;
    }
    if (profile.skills.length === 0) {
      setError("Select at least one skill so the model can evaluate your profile.");
      return;
    }
    setLoading(true);
    try {
      const prediction = await api.predict(profile);
      const [skillGap, learningPlan] = await Promise.all([
        api.skillGap(prediction.predicted_role, profile.skills),
        api.roadmap(prediction.predicted_role, profile.skills),
      ]);
      setResult(prediction);
      setGap(skillGap);
      setRoadmap(learningPlan);
      setCompletedWeeks([]);
      setHistory((previous) => {
        const next = [{ role: prediction.predicted_role, date: new Date().toLocaleDateString(), confidence: prediction.confidence }, ...previous].slice(0, 5);
        localStorage.setItem("skillsync-history", JSON.stringify(next));
        return next;
      });
      navigate("Your results");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const reset = () => { setProfile(defaultProfile); setResult(null); setGap(null); setRoadmap(null); navigate("Analyze profile"); };
  const domainRoles = useMemo(() => catalog?.careers || [], [catalog]);

  return (
    <div className={`${light ? "app light" : "app"} min-h-screen transition-colors duration-300`}>
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top"><Logo /><button className="icon-btn mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {[["Overview", BarChart3], ["Analyze profile", Sparkles], ["Career explorer", Compass], ["Model evaluation", BrainCircuit]].map(([label, Icon]) =>
            <button key={label} className={`nav-item ${page === label || (label === "Overview" && page === "Your results") ? "active" : ""}`} onClick={() => navigate(label)}><Icon size={18} /><span>{label}</span>{label === "Analyze profile" && <span className="nav-indicator" />}</button>,
          )}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-tip"><div className="tip-icon"><CircleHelp size={17} /></div><strong>Small steps, real progress.</strong><p>Your next opportunity starts with understanding what you already bring.</p><button onClick={() => navigate("Career explorer")}>Explore careers <ArrowRight size={14} /></button></div>
        <div className="profile-mini"><div className="avatar">YS</div><div><strong>Your workspace</strong><span>Career explorer</span></div><ChevronRight size={16} /></div>
      </aside>
      {menuOpen && <button className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <main className="main">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-btn menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20} /></button><span className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>{page}</strong></span></div>
          <div className="topbar-actions"><div className={`api-pill ${apiStatus}`}><span />{apiStatus === "checking" ? "Connecting" : apiStatus === "online" ? "API connected" : "API offline"}</div><button className="icon-btn theme-toggle" onClick={() => setLight(!light)} aria-label="Toggle theme">{light ? <Moon size={18} /> : <Sun size={18} />}</button><div className="avatar top-avatar">YS</div></div>
        </header>
        {error && <div className="error-banner" role="alert"><CircleHelp size={17} />{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}
        {page === "Overview" && <Overview navigate={navigate} history={history} result={result} />}
        {page === "Analyze profile" && <Analyze catalog={catalog} profile={profile} updateProfile={updateProfile} toggleSkill={toggleSkill} onSubmit={analyze} loading={loading} />}
        {page === "Career explorer" && <CareerExplorer careers={domainRoles} />}
        {page === "Model evaluation" && <ModelEvaluation metrics={metrics} />}
        {page === "Your results" && result && <Results result={result} gap={gap} roadmap={roadmap} completedWeeks={completedWeeks} setCompletedWeeks={setCompletedWeeks} reset={reset} />}
        {page === "Your results" && !result && <EmptyResults navigate={navigate} />}
      </main>
    </div>
  );
}

function Overview({ navigate, history, result }) {
  return <div className="page-content">
    <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> YOUR CAREER, IN FOCUS</div><h1>Your next career move<br /><span>starts here.</span></h1><p className="welcome-copy">Turn your skills and interests into a clearer direction. Get an evidence-led career match and a practical plan to move forward.</p><div className="hero-actions"><button className="btn btn-primary" onClick={() => navigate("Analyze profile")}>Build my career profile <ArrowRight size={17} /></button><button className="btn btn-ghost" onClick={() => navigate("Career explorer")}>Explore careers <ArrowUpRight size={16} /></button></div></div><div className="hero-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" /><div className="hero-center"><BrainCircuit size={44} /></div><div className="float-card float-top"><span className="float-icon cyan"><Target size={16} /></span><div><small>CAREER MATCH</small><strong>{result?.predicted_role || "Built around you"}</strong></div></div><div className="float-card float-bottom"><span className="float-icon purple"><TrendingUp size={16} /></span><div><small>YOUR NEXT STEP</small><strong>{result ? "Skills identified" : "Skills to strengths"}</strong></div></div><span className="sparkle sparkle-a">✳</span><span className="sparkle sparkle-b">✳</span></div></section>
    <div className="section-heading"><div><span className="eyebrow">YOUR CAREER TOOLKIT</span><h2>A little clarity goes a long way.</h2></div><button className="text-button" onClick={() => navigate("Analyze profile")}>See how it works <ArrowRight size={15} /></button></div>
    <div className="feature-grid">
      <FeatureCard icon={Sparkles} tone="violet" tag="01 / DISCOVER" title="Find your fit" text="Compare your profile with career patterns learned from a transparent educational dataset." />
      <FeatureCard icon={Target} tone="blue" tag="02 / UNDERSTAND" title="See the skill gap" text="Know what you already have, what to build next, and where to focus your time." />
      <FeatureCard icon={BookOpen} tone="mint" tag="03 / TAKE ACTION" title="Make a plan" text="Get a four-week learning roadmap with practical tasks and curated starting points." />
    </div>
    <section className="lower-grid"><div className="panel workflow-panel"><div className="panel-head"><div><span className="eyebrow">A SIMPLE WORKFLOW</span><h3>From profile to progress</h3></div><span className="soft-icon"><ArrowDown size={17} /></span></div><div className="workflow-steps"><div className="workflow-step"><span className="step-num">01</span><div><strong>Tell us about you</strong><p>Share your education, experience, skills, and what interests you.</p></div><CheckCircle2 size={18} /></div><div className="workflow-step"><span className="step-num">02</span><div><strong>Explore your match</strong><p>Review model-generated role probabilities and relevant alternatives.</p></div><CheckCircle2 size={18} /></div><div className="workflow-step"><span className="step-num">03</span><div><strong>Build your next steps</strong><p>Turn role requirements into focused, achievable weekly goals.</p></div><CheckCircle2 size={18} /></div></div></div><div className="panel history-panel"><div className="panel-head"><div><span className="eyebrow">YOUR JOURNEY</span><h3>Recent analyses</h3></div><BriefcaseBusiness size={19} className="muted-icon" /></div>{history.length ? history.map((item, index) => <div className="history-item" key={`${item.date}-${index}`}><span className="history-icon"><GraduationCap size={16} /></span><div><strong>{item.role}</strong><span>{item.date} · Career match</span></div><ChevronRight size={16} /></div>) : <div className="empty-history"><div className="empty-graphic"><Sparkles size={20} /></div><strong>Your story starts here</strong><p>Complete your profile to see your career analysis.</p><button className="text-button" onClick={() => navigate("Analyze profile")}>Create your profile <ArrowRight size={14} /></button></div>}</div></section>
    <footer className="app-footer"><Logo small /><span>Career exploration, grounded in your skills.</span><span>For learning and reflection — not a hiring guarantee.</span></footer>
  </div>;
}

function FeatureCard({ icon: Icon, tone, tag, title, text }) {
  return <article className="feature-card"><div className={`feature-icon ${tone}`}><Icon size={20} /></div><span className="eyebrow">{tag}</span><h3>{title}</h3><p>{text}</p><span className="feature-arrow"><ArrowUpRight size={16} /></span></article>;
}

function Analyze({ catalog, profile, updateProfile, toggleSkill, onSubmit, loading }) {
  const skillSections = [
    ["Data & analysis", ["python", "sql", "excel", "statistics", "data_visualization"]],
    ["Engineering", ["machine_learning", "deep_learning", "web_development", "testing", "cloud"]],
    ["Ways of working", ["business_analysis", "communication", "problem_solving", "teamwork", "critical_thinking"]],
  ];
  return <div className="page-content"><div className="page-intro"><div className="eyebrow"><Sparkles size={14} /> CAREER PROFILE</div><h1>Let’s find your direction.</h1><p>A few details help our trained models identify roles that may fit your current skills and interests.</p></div><form className="profile-form panel" onSubmit={onSubmit}>
    <div className="form-section"><div className="form-section-title"><span>01</span><div><h3>Your starting point</h3><p>Tell us about your education and experience.</p></div></div><div className="field-grid">
      <label className="field"><span>Highest qualification <b>*</b></span><select value={profile.highest_qualification} onChange={(e) => updateProfile("highest_qualification", e.target.value)} required><option value="">Choose qualification</option>{catalog?.qualifications?.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="field"><span>Experience level <b>*</b></span><select value={profile.experience_level} onChange={(e) => updateProfile("experience_level", e.target.value)} required><option value="">Choose experience level</option>{catalog?.experience_levels?.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="field"><span>Preferred domain <b>*</b></span><select value={profile.preferred_domain} onChange={(e) => updateProfile("preferred_domain", e.target.value)} required><option value="">Choose a domain</option>{catalog?.domains?.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="field"><span>What interests you most? <b>*</b></span><select value={profile.interest} onChange={(e) => updateProfile("interest", e.target.value)} required><option value="">Choose an interest</option>{catalog?.interests?.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div></div>
    <div className="form-section"><div className="form-section-title"><span>02</span><div><h3>Skills you can bring</h3><p>Select everything you have learned or used, even at a beginner level.</p></div></div><div className="skill-groups">{skillSections.map(([heading, items]) => <div className="skill-group" key={heading}><strong>{heading}</strong><div className="skill-chips">{items.map((skill) => <button type="button" key={skill} className={`skill-chip ${profile.skills.includes(skill) ? "selected" : ""}`} onClick={() => toggleSkill(skill)} aria-pressed={profile.skills.includes(skill)}>{profile.skills.includes(skill) && <Check size={13} />}{skillLabels[skill]}</button>)}</div></div>)}</div><div className="selection-note"><CheckCircle2 size={15} />{profile.skills.length} skill{profile.skills.length === 1 ? "" : "s"} selected</div></div>
    <div className="form-section last-form-section"><div className="form-section-title"><span>03</span><div><h3>What would you like to achieve?</h3><p>Optional — add a learning goal to keep your exploration focused.</p></div></div><label className="field"><span>Learning goals</span><textarea rows="3" maxLength="400" value={profile.learning_goals} onChange={(e) => updateProfile("learning_goals", e.target.value)} placeholder="For example: build a portfolio project or become more confident with SQL..." /></label></div>
    <div className="form-submit"><div><span className="privacy-dot" />Your profile stays in this browser session.</div><button className="btn btn-primary" type="submit" disabled={loading || !catalog}>{loading ? <><LoaderCircle className="spin" size={17} /> Analyzing your profile…</> : <>Generate my career insights <ArrowRight size={17} /></>}</button></div>
  </form></div>;
}

function Results({ result, gap, roadmap, completedWeeks, setCompletedWeeks, reset }) {
  const chartData = {
    labels: ["Covered", "To build"],
    datasets: [{ data: [gap?.available_skills.length || 0, gap?.missing_skills.length || 0], backgroundColor: ["#7767f5", "#252940"], borderWidth: 0, hoverOffset: 4 }],
  };
  const probabilityData = {
    labels: result.probabilities.slice(0, 4).map((item) => item.role),
    datasets: [{ label: "Model probability", data: result.probabilities.slice(0, 4).map((item) => Math.round(item.probability * 100)), backgroundColor: result.probabilities.slice(0, 4).map((_, index) => index === 0 ? "#8274ff" : "#4f5c82"), borderRadius: 5, barThickness: 13 }],
  };
  const probabilityOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.raw}%` } } },
    scales: {
      x: { min: 0, max: 100, grid: { color: "rgba(157,169,215,.12)" }, ticks: { color: "#858ba1", callback: (value) => `${value}%`, font: { size: 10 } } },
      y: { grid: { display: false }, ticks: { color: "#a8aec5", font: { size: 10 } } },
    },
  };
  const toggleWeek = (week) => setCompletedWeeks((previous) => previous.includes(week) ? previous.filter((item) => item !== week) : [...previous, week]);
  return <div className="page-content results-page"><div className="results-top"><div><div className="eyebrow"><Sparkles size={14} /> YOUR PERSONALIZED ANALYSIS</div><h1>A direction worth exploring.</h1><p>Use this as a starting point for reflection. Your model match and skill coverage are different measures.</p></div><div className="result-actions"><button className="btn btn-light" onClick={() => window.print()}><Download size={16} /> Export report</button><button className="btn btn-ghost" onClick={reset}><RotateCcw size={16} /> Re-analyze</button></div></div>
    <div className="result-hero panel"><div className="result-hero-copy"><span className="result-kicker"><span className="live-dot" /> TOP MODEL MATCH</span><h2>{result.predicted_role}</h2><p>{result.description}</p><div className="match-tags">{result.matched_skills.slice(0, 4).map((skill) => <span key={skill}><Check size={12} />{skillLabels[skill]}</span>)}</div></div><div className="confidence-card"><div className="confidence-orbit"><div><strong>{Math.round(result.confidence * 100)}<small>%</small></strong><span>MODEL CONFIDENCE</span></div></div><p>How strongly the model favors this role<br />among the roles it knows.</p></div></div>
    <div className="profile-summary panel"><span className="eyebrow">PROFILE SUMMARY</span><div className="profile-summary-values"><span><small>QUALIFICATION</small><strong>{result.profile_summary.qualification}</strong></span><span><small>EXPERIENCE</small><strong>{result.profile_summary.experience}</strong></span><span><small>PREFERRED DOMAIN</small><strong>{result.profile_summary.domain}</strong></span><span><small>SKILLS SELECTED</small><strong>{result.profile_summary.selected_skills.length} skills</strong></span></div></div>
    <div className="result-grid"><div className="panel result-panel probability-panel"><div className="panel-head"><div><span className="eyebrow">MODEL OUTPUT</span><h3>Role probability distribution</h3></div><span className="info-pill">Not a job probability</span></div><div className="probability-chart"><Bar data={probabilityData} options={probabilityOptions} /></div><div className="model-caption"><BrainCircuit size={15} /> Predicted by the evaluated <strong>{result.model}</strong> classifier.</div></div>
      <div className="panel result-panel coverage-panel"><div className="panel-head"><div><span className="eyebrow">SKILL GAP</span><h3>Your current coverage</h3></div><span className="info-pill">Separate from confidence</span></div><div className="coverage-content"><div className="coverage-donut"><Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, cutout: "76%", plugins: { legend: { display: false }, tooltip: { enabled: false } } }} /><div className="donut-label"><strong>{gap?.coverage_percentage || 0}%</strong><span>covered</span></div></div><div className="coverage-legend"><span><i className="legend-dot covered" />{gap?.available_skills.length || 0} matched skills</span><span><i className="legend-dot missing" />{gap?.missing_skills.length || 0} to develop</span></div><div className="coverage-meter"><span>Skill coverage</span><strong>{gap?.coverage_percentage || 0}%</strong><div><i style={{ width: `${gap?.coverage_percentage || 0}%` }} /></div></div></div></div></div>
    <div className="result-grid second-result-grid"><div className="panel result-panel"><div className="panel-head"><div><span className="eyebrow">YOUR NEXT OPPORTUNITY</span><h3>Skills to develop</h3></div><Target size={19} className="muted-icon" /></div><div className="gap-list">{gap?.missing_skills.map((item, index) => <div className="gap-item" key={item.skill}><span className="gap-index">{String(index + 1).padStart(2, "0")}</span><span className="gap-name">{skillLabels[item.skill]}</span><span className={`priority ${item.priority.toLowerCase()}`}>{item.priority} priority</span></div>)}</div>{gap?.missing_skills.length === 0 && <p className="all-covered"><CheckCircle2 size={17} />You cover all listed core skills for this role.</p>}</div>
      <div className="panel result-panel alternatives-panel"><div className="panel-head"><div><span className="eyebrow">OTHER DIRECTIONS</span><h3>Alternative role matches</h3></div><Compass size={18} className="muted-icon" /></div>{result.alternatives.map((item) => <div className="alternative" key={item.role}><span className="alt-mark"><BriefcaseBusiness size={16} /></span><span><strong>{item.role}</strong><small>Model match</small></span><span className="alt-score">{Math.round(item.probability * 100)}%</span></div>)}</div></div>
    <div className="panel roadmap-panel"><div className="roadmap-header"><div><span className="eyebrow"><BookOpen size={13} /> YOUR FOUR-WEEK ROADMAP</span><h3>Turn insight into action.</h3><p>A gentle structure to get started — adapt it to your pace and interests.</p></div><div className="roadmap-progress"><span>{completedWeeks.length} of 4 complete</span><div><i style={{ width: `${completedWeeks.length * 25}%` }} /></div></div></div><div className="roadmap-weeks">{roadmap?.weeks.map((week) => <article className={`week-card ${completedWeeks.includes(week.week) ? "week-done" : ""}`} key={week.week}><button className="week-check" onClick={() => toggleWeek(week.week)} aria-label={`Mark week ${week.week} ${completedWeeks.includes(week.week) ? "incomplete" : "complete"}`}>{completedWeeks.includes(week.week) && <Check size={15} />}</button><div className="week-top"><span>WEEK {String(week.week).padStart(2, "0")}</span><span className="week-skill">{skillLabels[week.skill]}</span></div><h4>{week.goal}</h4><div className="week-topics"><span>Topics</span>{week.topics.join(" · ")}</div><p>{week.practice_task}</p><div className="mini-project"><Sparkles size={14} /><span><b>Mini-project</b> {week.mini_project}</span></div><div className="week-resource"><BookOpen size={14} /><span>{week.resource}</span></div></article>)}</div></div>
    <div className="results-disclaimer"><CircleHelp size={15} />This educational tool uses synthetic training data, not hiring outcomes. Model probabilities express model preference, not the likelihood of employment. Use career matches as prompts to explore.</div>
  </div>;
}

function CareerExplorer({ careers }) {
  const [selected, setSelected] = useState(null);
  return <div className="page-content"><div className="page-intro"><div className="eyebrow"><Compass size={14} /> CAREER EXPLORER</div><h1>Explore what’s possible.</h1><p>Get a quick feel for the roles in our learning catalogue. Choose a role to see common skills, responsibilities, and useful places to begin.</p></div><div className="career-grid">{careers.map((career, index) => <article key={career.role} className={`career-card panel ${selected === career.role ? "career-selected" : ""}`}><div className="career-card-top"><span className={`career-symbol symbol-${index}`}><BriefcaseBusiness size={18} /></span><span className="career-domain">{career.domain}</span></div><h3>{career.role}</h3><p>{career.description}</p><div className="career-skills">{career.required_skills.slice(0, 4).map((skill) => <span key={skill}>{skillLabels[skill]}</span>)}{career.required_skills.length > 4 && <span>+{career.required_skills.length - 4}</span>}</div><button className="career-expand" onClick={() => setSelected(selected === career.role ? null : career.role)}>{selected === career.role ? "Hide details" : "Explore this role"}<ArrowRight size={15} /></button>{selected === career.role && <div className="career-details"><strong>Typical responsibilities</strong><ul>{career.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul><strong>Learning resources</strong><ul>{career.resources.map((item) => <li key={item}>{item}</li>)}</ul></div>}</article>)}</div><p className="catalog-note"><CircleHelp size={15} />Role profiles are an educational catalogue, not a guarantee of job availability or hiring requirements.</p></div>;
}

const algorithmDescriptions = {
  "Decision Tree": "A sequence of feature-based decisions. Easy to interpret, but a single tree can overfit.",
  "Random Forest": "An ensemble of decision trees that averages their predictions to reduce variance.",
  "K-Nearest Neighbors": "Predicts from the labels of nearby training profiles after feature preprocessing and scaling.",
};
function ModelEvaluation({ metrics }) {
  if (!metrics) return <div className="page-content"><div className="page-intro"><div className="eyebrow"><BrainCircuit size={14} /> MODEL EVALUATION</div><h1>See how the models learn.</h1><p>Model evaluation is unavailable. Confirm the Flask API is running and models have been trained.</p></div><div className="empty-evaluation panel"><LoaderCircle size={23} /><span>Waiting for real evaluation metrics from the API.</span></div></div>;
  const scores = Object.entries(metrics.models).map(([name, data]) => ({ name, Accuracy: +(data.accuracy * 100).toFixed(1), Precision: +(data.precision * 100).toFixed(1), Recall: +(data.recall * 100).toFixed(1), "Macro F1": +(data.f1_score * 100).toFixed(1) }));
  const colors = ["#8979ff", "#55c8d7", "#52c9a2", "#e7ae65"];
  const selectedMetrics = metrics.models[metrics.selected_model];
  const evaluationData = {
    labels: scores.map((item) => item.name),
    datasets: ["Accuracy", "Precision", "Recall", "Macro F1"].map((metric, index) => ({
      label: metric,
      data: scores.map((item) => item[metric]),
      backgroundColor: colors[index],
      borderRadius: 4,
    })),
  };
  const evaluationOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { color: "#a8aec5", usePointStyle: true, boxWidth: 7, font: { size: 10 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#858ba1", font: { size: 10 } } },
      y: { min: 0, max: 100, grid: { color: "rgba(157,169,215,.12)" }, ticks: { color: "#858ba1", font: { size: 10 }, callback: (value) => `${value}%` } },
    },
  };
  return <div className="page-content"><div className="page-intro"><div className="eyebrow"><BrainCircuit size={14} /> MODEL EVALUATION</div><h1>Evidence behind the match.</h1><p>Three supervised classifiers are compared on the same held-out test data. The selected model is chosen using cross-validation.</p></div>
    <div className="selected-model-banner"><span className="selected-model-icon"><Sparkles size={20} /></span><div><span className="eyebrow">SELECTED MODEL · BEST MEAN CROSS-VALIDATION ACCURACY</span><h2>{metrics.selected_model}</h2><p>Mean 5-fold training validation accuracy: <strong>{(selectedMetrics.mean_cross_validation_accuracy * 100).toFixed(1)}%</strong></p></div><div className="test-score"><strong>{(selectedMetrics.accuracy * 100).toFixed(1)}%</strong><span>held-out accuracy</span></div></div>
    <div className="panel evaluation-panel"><div className="panel-head"><div><span className="eyebrow">HELD-OUT TEST PERFORMANCE</span><h3>Classifier comparison</h3></div><span className="info-pill">Macro averages · %</span></div><div className="eval-chart"><Bar data={evaluationData} options={evaluationOptions} /></div></div>
    <div className="algorithm-grid">{Object.entries(metrics.models).map(([name, data], index) => <article className="algorithm-card panel" key={name}><div className="algorithm-card-top"><span className={`algorithm-number algo-${index}`}>0{index + 1}</span>{name === metrics.selected_model && <span className="best-pill"><Check size={12} /> Selected</span>}</div><h3>{name}</h3><p>{algorithmDescriptions[name]}</p><div className="metric-list">{[["Accuracy", data.accuracy], ["Precision", data.precision], ["Recall", data.recall], ["Macro F1", data.f1_score]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{(value * 100).toFixed(1)}%</strong></div>)}</div><details className="confusion-details"><summary>View confusion matrix <ChevronRight size={15} /></summary><div className="matrix-wrap"><table><thead><tr><th>Actual \ Pred.</th>{data.labels.map((label) => <th key={label}>{label.replace(" ", "\n")}</th>)}</tr></thead><tbody>{data.confusion_matrix.map((row, rowIndex) => <tr key={data.labels[rowIndex]}><th>{data.labels[rowIndex]}</th>{row.map((value, colIndex) => <td className={rowIndex === colIndex ? "matrix-correct" : ""} key={data.labels[colIndex]}>{value}</td>)}</tr>)}</tbody></table></div></details><div className="cv-note">5-fold mean validation: <strong>{(data.mean_cross_validation_accuracy * 100).toFixed(1)}%</strong></div></article>)}</div>
    <div className="dataset-note panel"><div className="dataset-note-icon"><CircleHelp size={18} /></div><div><h3>About this training data</h3><p>{metrics.dataset.description} The dataset contains <strong>{metrics.dataset.records}</strong> synthetic profiles across {metrics.dataset.roles.length} roles ({metrics.dataset.train_records} train / {metrics.dataset.test_records} test). Test results measure performance on a held-out portion of this generated dataset; they do not estimate real-world career or hiring outcomes. Replace the CSV with representative, consented labelled data before drawing real-world conclusions.</p></div></div>
  </div>;
}

function EmptyResults({ navigate }) {
  return <div className="page-content"><div className="empty-state panel"><div className="empty-graphic"><Sparkles size={23} /></div><h2>Your career analysis is waiting.</h2><p>Share your profile to see the model’s role matches, skill coverage, and a four-week roadmap.</p><button className="btn btn-primary" onClick={() => navigate("Analyze profile")}>Build my profile <ArrowRight size={16} /></button></div></div>;
}

export default App;
