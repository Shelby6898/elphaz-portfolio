import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  Layers3,
  Mail,
  Menu,
  ShieldCheck,
  Terminal,
  X,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import './App.css'

const projects = [
  {
    number: '01',
    name: 'Taifa AI',
    type: 'AI DEVELOPMENT TOOL',
    status: 'In development',
    description:
      'An offline-first AI coding agent designed to help developers understand, write, test, and manage software locally.',
    tags: ['React', 'Node.js', 'Ollama', 'Local AI'],
    icon: Terminal,
    link: 'https://github.com/Shelby6898/taifa-ai',
    linkLabel: 'Explore repository',
  },
  {
    number: '02',
    name: 'Taifa Asset Manager',
    type: 'ENTERPRISE SOFTWARE',
    status: 'Live platform',
    description:
      'An asset management platform built around role-based access, asset tracking, transfers, maintenance, and audit trails.',
    tags: ['JavaScript', 'Firebase', 'RBAC', 'Reporting'],
    icon: Layers3,
    link: 'https://taifatech.org',
    linkLabel: 'Visit platform',
  },
  {
    number: '03',
    name: 'ICT Ticketing System',
    type: 'SERVICE MANAGEMENT',
    status: 'Development',
    description:
      'A support ticketing solution focused on ICT issue reporting, ticket management, and service workflows.',
    tags: ['Kotlin', 'Firebase', 'Node.js', 'REST API'],
    icon: ShieldCheck,
    link: 'https://github.com/Shelby6898/ict-ticketing-system',
    linkLabel: 'Explore repository',
  },
  {
    number: '04',
    name: 'Bungoma Pay',
    type: 'PAYMENT WORKFLOWS',
    status: 'Development',
    description:
      'A payment integration project exploring mobile money collection workflows, callback handling, and payment status tracking.',
    tags: ['Node.js', 'Express', 'Firebase', 'M-Pesa'],
    icon: Zap,
    link: null,
    linkLabel: '',
  },
]

const services = [
  {
    title: 'Full-stack development',
    description:
      'Web applications, REST APIs, authentication, databases, and admin dashboards.',
  },
  {
    title: 'AI-powered development',
    description:
      'AI-assisted workflows, local model integration, developer tools, and automation.',
  },
  {
    title: 'Business systems',
    description:
      'Asset management, support ticketing, operational workflows, and reporting.',
  },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="site-shell">
      <header className="navbar">
        <a className="brand" href="#home" onClick={closeMenu}>
          <span className="brand-mark">E.</span>
          <span>ELPHAZ SHELBY</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <a href="#work" onClick={closeMenu}>Projects</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          <a
            className="nav-cta"
            href="mailto:elphazshelby@gmail.com"
            onClick={closeMenu}
          >
            Let's talk <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <div className="availability">
              <span className="status-dot" />
              DEVELOPER · FOUNDER · PROBLEM SOLVER
            </div>

            <h1>
              Building software
              <br />
              for <span className="gradient-text">real-world</span>
              <br />
              problems.
            </h1>

            <p className="hero-description">
              I'm Elphaz Shelby, an IT student and software developer
              building practical digital products through Taifatech Solutions.
              I turn ideas into systems people can use.
            </p>

            <div className="hero-actions">
              <a className="button-primary" href="#work">
                Explore my work <ArrowDownRight size={18} />
              </a>
              <a
                className="button-secondary"
                href="https://github.com/Shelby6898"
                target="_blank"
                rel="noreferrer"
              >
                <Code2 size={18} /> GitHub profile
              </a>
            </div>

            <div className="hero-footnote">
              <span>BASED IN KENYA</span>
              <span className="footnote-line" />
              <span>BUILDING WITH PURPOSE</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Developer workspace illustration">
            <div className="visual-glow" />
            <div className="code-window">
              <div className="window-bar">
                <div className="window-dots">
                  <i /><i /><i />
                </div>
                <span>taifatech / vision.js</span>
                <Code2 size={15} />
              </div>

              <div className="code-content">
                <div className="code-line"><span>01</span><code><b>const</b> developer = {'{'}</code></div>
                <div className="code-line"><span>02</span><code>&nbsp; name: <em>'Elphaz Shelby'</em>,</code></div>
                <div className="code-line"><span>03</span><code>&nbsp; focus: <em>'Real-world software'</em>,</code></div>
                <div className="code-line"><span>04</span><code>&nbsp; company: <em>'Taifatech'</em>,</code></div>
                <div className="code-line"><span>05</span><code>&nbsp; mindset: <em>'Build. Test. Improve.'</em></code></div>
                <div className="code-line"><span>06</span><code>{'}'}</code></div>
                <div className="code-gap" />
                <div className="code-line"><span>07</span><code><b>function</b> buildSolution(problem) {'{'}</code></div>
                <div className="code-line"><span>08</span><code>&nbsp; <b>return</b> problem.<u>solve</u>()</code></div>
                <div className="code-line"><span>09</span><code>{'}'}</code></div>
                <div className="terminal-status">
                  <span className="status-dot" /> ALWAYS LEARNING, ALWAYS BUILDING
                </div>
              </div>
            </div>
            <div className="floating-card">
              <span className="floating-icon"><Terminal size={19} /></span>
              <span>
                <strong>Taifa AI</strong>
                <small>Building locally-first AI</small>
              </span>
              <ArrowUpRight size={17} />
            </div>
          </div>

          <a href="#work" className="scroll-hint">
            <ArrowDown size={15} /> SCROLL TO EXPLORE
          </a>
        </section>

        <section className="trust-strip">
          <div className="section-wrap trust-inner">
            <span>AREAS I WORK IN</span>
            <div><Code2 size={17} /> SOFTWARE ENGINEERING</div>
            <div><Terminal size={17} /> AI & DEVELOPER TOOLS</div>
            <div><Layers3 size={17} /> BUSINESS SYSTEMS</div>
            <div><ShieldCheck size={17} /> SECURE WORKFLOWS</div>
          </div>
        </section>

        <section className="section-wrap projects-section" id="work">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SELECTED WORK / 01</span>
              <h2>Projects built to <span>solve.</span></h2>
              <p>
                A growing collection of products and systems built around
                practical problems, not just code.
              </p>
            </div>
            <a
              className="text-link"
              href="https://github.com/Shelby6898"
              target="_blank"
              rel="noreferrer"
            >
              More on GitHub <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="project-grid">
            {projects.map((project) => {
              const Icon = project.icon

              return (
                <article className="project-card" key={project.number}>
                  <div className="project-card-top">
                    <span className="project-number">{project.number}</span>
                    <span className="project-icon"><Icon size={21} /></span>
                  </div>

                  <span className="eyebrow">{project.type}</span>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>

                  <div className="tag-list">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="project-card-bottom">
                    <span className="project-status">
                      <span className="status-dot" />
                      {project.status}
                    </span>
                    {project.link ? (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${project.linkLabel}: ${project.name}`}
                      >
                        {project.linkLabel} <ArrowUpRight size={16} />
                      </a>
                    ) : (
                      <span className="project-private">Details available on request</span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="section-wrap about-grid">
            <div>
              <span className="eyebrow">A LITTLE ABOUT ME / 02</span>
              <h2>Student by training.<br /><span>Builder by practice.</span></h2>
            </div>
            <div className="about-copy">
              <p>
                I’m pursuing a Bachelor of Science in Information Technology
                at Kaimosi Friends University while building software that
                connects technical learning with real operational needs.
              </p>
              <p>
                Through Taifatech Solutions, I’m exploring AI coding tools,
                business software, payment workflows, and secure application
                development. I value maintainable code, honest testing, and
                solving the right problem before adding complexity.
              </p>
              <a
                className="text-link"
                href="https://github.com/Shelby6898"
                target="_blank"
                rel="noreferrer"
              >
                Follow my development journey <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="section-wrap services-section" id="services">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HOW I CAN HELP / 03</span>
              <h2>From idea to <span>implementation.</span></h2>
              <p>
                Open to suitable freelance work, collaborations, and
                internship opportunities.
              </p>
            </div>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service.title}>
                <span className="service-index">0{index + 1}</span>
                <BriefcaseBusiness size={21} />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="section-wrap contact-inner">
            <span className="eyebrow">HAVE A PROJECT IN MIND? / 04</span>
            <h2>Let's build something<br /><span>that matters.</span></h2>
            <p>
              Have a project, an opportunity, or an idea worth exploring?
              Let's start a conversation.
            </p>
            <a
              className="button-primary"
              href="mailto:elphazshelby@gmail.com?subject=Project%20or%20Collaboration%20Inquiry"
            >
              <Mail size={17} /> Get in touch <ArrowUpRight size={17} />
            </a>
            <div className="contact-links">
              <a href="mailto:elphazshelby@gmail.com">Email</a>
              <a href="https://github.com/Shelby6898" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://taifatech.org" target="_blank" rel="noreferrer">Taifatech</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer section-wrap">
        <a className="brand" href="#home">
          <span className="brand-mark">E.</span>
          <span>ELPHAZ SHELBY</span>
        </a>
        <span>Designed with intent. Built in Kenya.</span>
        <a href="#home" className="back-to-top">Back to top ↑</a>
      </footer>
    </div>
  )
}

export default App
