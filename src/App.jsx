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
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

const projects = [
  {
    number: '01',
    name: 'Taifa AI',
    type: 'AI DEVELOPMENT TOOL',
    status: 'In development',
    description:
      'An offline-first coding agent that helps developers work with code using locally running AI models.',
    challenge:
      'Make AI-assisted development more accessible without depending on a cloud API for every coding task.',
    highlights: [
      'React interface with a Node.js and Express backend.',
      'Local model integration through Ollama.',
      'Workspace-aware coding workflows and proposed code changes.',
      'Review and approval before applying file edits.',
    ],
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
      'An asset management platform for tracking organizational assets and managing their operational lifecycle.',
    challenge:
      'Give organizations clearer oversight of assets, responsibility, movement, maintenance, and accountability.',
    highlights: [
      'Role-based access for administrators, managers, and viewers.',
      'Asset transfers, maintenance records, and disposal workflows.',
      'Audit trails and operational reporting.',
      'QR-based asset lookup and department-aware workflows.',
    ],
    tags: ['JavaScript', 'Firebase', 'RBAC', 'Audit trails'],
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
      'An ICT support system designed to organize issue reporting and help teams manage support requests.',
    challenge:
      'Replace scattered support requests with a more structured process for reporting, assigning, and tracking ICT issues.',
    highlights: [
      'Android client built with Kotlin and XML.',
      'Firebase-based authentication and data workflows.',
      'Backend services for support operations and notifications.',
      'Ticket status and service-level workflow concepts.',
    ],
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
      'A payment workflow project exploring mobile-money collection and transaction status management.',
    challenge:
      'Structure a reliable payment flow that can receive provider callbacks and track transaction outcomes.',
    highlights: [
      'Node.js and Express backend.',
      'M-Pesa integration workflow exploration.',
      'Callback handling and payment status tracking.',
      'Firebase-backed application data.',
    ],
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
  const [cvUrl, setCvUrl] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [profile, setProfile] = useState({
    full_name: '',
    headline: '',
    bio: '',
  })

  useEffect(() => {
    let active = true

    async function loadPublicProfile() {
      if (!supabase) return

      const { data, error } = await supabase
        .from('portfolio_profile')
        .select('full_name, headline, bio, cv_path, photo_path')
        .eq('id', 1)
        .maybeSingle()

      if (!active || error || !data) return

      setProfile({
        full_name: data.full_name || '',
        headline: data.headline || '',
        bio: data.bio || '',
      })

      if (data.cv_path) {
        const { data: cvData } = supabase.storage
          .from('profile-cv')
          .getPublicUrl(data.cv_path)

        if (active && cvData?.publicUrl) {
          setCvUrl(cvData.publicUrl)
        }
      }

      if (data.photo_path) {
        const { data: photoData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(data.photo_path)

        if (active && photoData?.publicUrl) {
          setPhotoUrl(photoData.publicUrl)
        }
      }
    }

    loadPublicProfile()

    return () => {
      active = false
    }
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="site-shell">
      <header className="navbar">
        <a className="brand" href="#home" onClick={closeMenu}>
          {photoUrl && (
            <img
              className="brand-profile-photo"
              src={photoUrl}
              alt=""
            />
          )}
          <span>{profile.full_name || 'Your Name'}</span>
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
              {(profile.headline || 'Software Developer').toUpperCase()}
            </div>

            <h1>
              Building software
              <br />
              for <span className="gradient-text">real-world</span>
              <br />
              problems.
            </h1>

            <p className="hero-description">
              {profile.bio ||
                'I build practical software, explore AI coding tools and business systems, and focus on maintainable code and solving real-world problems.'}
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
              {cvUrl && (
                <a
                  className="button-secondary"
                  href={cvUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View my CV <ArrowUpRight size={18} />
                </a>
              )}
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
                {profile.bio ||
                  'I build practical software, explore AI coding tools and business systems, and focus on maintainable code and solving real-world problems.'}
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
        <a className="footer-identity" href="#home" aria-label="Back to homepage">
          <span className="footer-identity-copy">
            <span className="footer-name">{profile.full_name || 'Your Name'}</span>
            <span className="footer-profession">
              {profile.headline || 'Software Developer'}
            </span>
          </span>
        </a>

        <div className="footer-meta">
          <span className="footer-copyright">
            © {new Date().getFullYear()} {profile.full_name || 'Your Name'}. All rights reserved.
          </span>
        </div>

        <a href="#home" className="back-to-top">Back to top ↑</a>
      </footer>
    </div>
  )
}

export default App
