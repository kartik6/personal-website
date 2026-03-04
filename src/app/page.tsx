import { CornerEasterEgg } from "@/components/corner-easter-egg";
import { DigitalTwinChat } from "@/components/digital-twin-chat";
import { ThemeToggle } from "@/components/theme-toggle";

const careerHighlights = [
  {
    role: "Senior Software Engineer",
    company: "Sense",
    period: "Apr 2025 - Present",
    location: "Bengaluru, Karnataka, India",
    impact: [
      <>
        Led our transition to SOC2 compliance by managing a <strong>major Spring Boot 3.x upgrade across 20+
        services</strong>, ensuring the platform is secure and ready for next-gen AI library integrations.
      </>,
      <>
        Identified and optimized a high-throughput webhook processing system, <strong>reducing infrastructure
        footprint by 85%</strong>, saving thousands of dollars annually in compute costs, and permanently eliminating
        processing lag.
      </>,
      <>
        Owned the end-to-end development of the <strong>mission-critical Batching Engine</strong>, enabling enterprise
        customers to spread high-volume communications while protecting sender reputation and platform infrastructure.
      </>,
      <>
        Built advanced JVM monitoring tools beyond standard CPU/RAM metrics, with <strong>30+ metrics being
        measured</strong> including heap, GC, threads, and OS resources, enabling faster root-cause analysis and
        catching deep system issues like file descriptor leaks before customer impact.
      </>,
      <>
        Thrived in high-pressure environments and frequently served as a <strong>lead responder for production
        incidents</strong>.
      </>
    ]
  },
  {
    role: "Software Engineer",
    company: "Sense",
    period: "Jul 2023 - Apr 2025",
    location: "Bengaluru, Karnataka, India",
    impact: [
      <>
        Designed a backpressure-isolated <strong>Kafka</strong> processing architecture with async offloading to
        <strong> SQS</strong>, eliminating consumer group rebalancing as a failure mode and removing recurring monthly
        outages.
      </>,
      <>
        Designed and developed a <strong>Cross-Platform Email Migration tool</strong> enabling seamless synchronization
        of assets (links, images, and dynamic variables) between legacy and next-gen engines, increasing platform
        adoption and reducing manual user effort by <strong>roughly 95%</strong>.
      </>,
      <>
        Established a comprehensive monitoring framework for the flagship automation product, deploying <strong>5+
        custom dashboards</strong> and <strong>15+ visualizations</strong>.
      </>,
      <>
        Led the transition to version-controlled database migrations by introducing <strong>Flyway</strong> into
        Java-based microservices, authoring the integration strategy, and conducting team-wide knowledge-sharing
        sessions to standardize schema deployment.
      </>,
      <>
        Collaborated with DevOps on high-stakes infrastructure tasks, including <strong>Kafka cluster upgrades</strong>.
      </>,
      <>
        Actively helped new hires and junior engineers through technical deep dives and on-call readiness training to
        improve team-wide incident response capabilities.
      </>
    ]
  },
  {
    role: "Software Engineer Intern",
    company: "Sense",
    period: "Jan 2023 - Jun 2023",
    location: "Bengaluru, Karnataka, India",
    impact: [
      <>
        Owned and delivered the Domain Configuration feature from scratch, allowing clients to set up custom
        subdomains for their Sense Landing Pages. Built on <strong>AWS using S3, CloudFront, and Certificate
        Manager</strong>.
      </>,
      <>
        Designed and implemented <strong>gRPC APIs</strong> to enable faster, more efficient communication between
        microservices.
      </>,
      <>
        Maintained <strong>90% unit test coverage</strong> using <strong>JUnit</strong> and <strong>Mockito</strong>{" "}
        across Java and Spring Boot services.
      </>
    ]
  }
];

const techStack = [
  {
    category: "Backend Foundations",
    items: ["Java", "Springboot", "gRPC", "Apache Camel", "C++"]
  },
  {
    category: "Data & Event Infrastructure",
    items: ["MySQL", "Kafka", "SQS", "Redis"]
  },
  {
    category: "Cloud & Delivery",
    items: ["AWS", "S3", "Cloudfront"]
  },
  {
    category: "Quality, Observability & Emerging Interfaces",
    items: ["JUnit", "Mockito", "Grafana", "MCP"]
  }
];
const projects = [
  {
    id: "oss-github",
    label: "oss-github",
    source: "github.com/kartik6",
    period: "active",
    title: "Open Source and Engineering Projects",
    description: "Public repositories, experiments, and backend-centric implementations.",
    linkLabel: "Visit GitHub Profile",
    href: "https://github.com/kartik6"
  },
  {
    id: "oss-llm-eng",
    label: "oss-llm-eng",
    source: "ed-donner/llm_engineering",
    period: "recent contributions",
    title: "Contributions to LLM Engineering Repository",
    description: "Pull requests and improvements submitted to Ed Donner's LLM Engineering repo.",
    linkLabel: "View Contribution PRs",
    href: "https://github.com/ed-donner/llm_engineering/pulls?q=is%3Apr+author%3Akartik6+"
  }
];
const bootLines = [
  "[boot] initializing profile runtime...",
  "[ok] loading /whoami -> kartik.sharma",
  "[ok] role -> Senior Software Engineer @ Sense",
  "[ok] focus -> resilient backend systems, reliability, scale",
  "[ok] location -> Bengaluru, India",
  "[ready] portfolio service online"
];

export default function Home() {
  const currentYear = new Date().getFullYear();
  const yearsOfImpact = Math.max(1, currentYear - 2023);

  return (
    <main className="site-shell">
      <CornerEasterEgg />
      <DigitalTwinChat />
      <div className="noise-layer" />
      <section className="hero section">
        <div className="terminal-window">
          <div className="terminal-topbar">
            <div className="terminal-dots">
              <span />
              <span />
              <span />
            </div>
            <p className="terminal-title">kartik@portfolio:~</p>
          </div>
          <div className="terminal-body">
            {bootLines.map((line) => (
              <p className="boot-line" key={line}>
                <span className="prompt">$</span> {line}
              </p>
            ))}
            <p className="boot-line command">
              <span className="prompt">$</span> open --profile kartik-sharma
            </p>
          </div>
        </div>
        <div className="hero-topbar">
          <p className="eyebrow">Senior Software Engineer</p>
          <ThemeToggle />
        </div>
        <h1>Kartik Sharma</h1>
        <p className="lead">
          I build resilient, high-scale backend systems that perform under pressure and stay reliable in the
          real world.
        </p>
         <div className="hero-actions">
          <a className="btn primary" href="mailto:kartiks2001@gmail.com">
            Contact Me
          </a>
          <a
            className="btn ghost"
            href="https://www.linkedin.com/in/kartik-sharma-"
            target="_blank"
            rel="noreferrer"
          >
            <span className="link-icon">in</span> LinkedIn
          </a>
          <a className="btn ghost" href="https://github.com/kartik6" target="_blank" rel="noreferrer">
            <span className="link-icon">gh</span> GitHub
          </a>
          <a className="btn ghost" href="https://leetcode.com/u/kartiks2001/" target="_blank" rel="noreferrer">
            <span className="link-icon">lc</span> LeetCode
          </a>
          <a
            className="btn ghost"
            href="https://drive.google.com/file/d/1bWSjIKU27L6H0HDgfLopZ5fZ9Lzm5IUf/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
          >
            <span className="link-icon">📄</span> Resume
          </a>
        </div>
        <div className="meta-strip">
          <span>Bengaluru, India</span>
          <span>Java • Spring Boot • AWS • Kafka</span>
          <span>{yearsOfImpact} years of backend engineering impact</span>
        </div>
      </section>

      <section className="section card-stack" id="about">
        <article className="panel about">
          <h2>About Me</h2>
          <p>
            I am a backend-focused engineer with a product mindset. My work centers on designing systems that are
            secure, observable, and performant at enterprise scale.
          </p>
          <p>
            I studied Computer Science at PES University and have grown from intern to senior engineer by solving
            hard production problems, improving platform reliability, and helping teams execute with clarity.
          </p>
        </article>
      </section>

      <section className="section" id="learning">
        <article className="focus-panel">
          <p className="badge">Currently Learning</p>
          <h2>LLMs and MCP</h2>
          <p className="focus-copy">
            As a backend developer, I spend most of my time building APIs and systems that need to work reliably in
            production. LLMs are now being used in real products, so I aim to understand how to support them
            properly. I do not want to treat them as a black box API call. I want to know how they fit into backend
            systems and how to run them safely at scale.
          </p>
          <p className="focus-copy">
            I am also learning MCP because it helps explain how models interact with backend tools in a structured way
            and how we can make LLMs more powerful and fit our products to work within daily AI tools.
          </p>
          <p className="focus-copy">
            Current course:{" "}
            <a
              href="https://www.udemy.com/course/ai-coder-from-vibe-coder-to-agentic-engineer/"
              target="_blank"
              rel="noreferrer"
            >
              AI Coder: From Vibe Coder to Agentic Engineer
            </a>
          </p>
        </article>
      </section>

      <section className="section" id="stack">
        <h2>Tech Stack</h2>
        <div className="stack-grid">
          {techStack.map((group) => (
            <article className="stack-card" key={group.category}>
              <h3>{group.category}</h3>
              <div className="stack-tags">
                {group.items.map((item) => (
                  <span key={`${group.category}-${item}`}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="journey">
        <h2>Career Log</h2>
        <div className="git-log">
          {careerHighlights.map((item) => (
            <article className="git-entry" key={`${item.role}-${item.period}`}>
              <div className="git-meta">
                <p className="git-hash">{`${item.role.slice(0, 3).toLowerCase()}-${item.period
                  .replace(/\s+/g, "")
                  .replace(/[^a-zA-Z0-9-]/g, "")
                  .toLowerCase()}`}</p>
                <p className="git-author">{item.company}</p>
                <p className="git-date">{item.period}</p>
              </div>
              <div className="git-subject">
                <h3>{item.role}</h3>
                <p>{item.location}</p>
              </div>
              <ul className="git-files">
                {item.impact.map((point, index) => (
                  <li key={`${item.role}-${index}`}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="portfolio">
        <h2>Open Source Log</h2>
        <div className="git-log">
          {projects.map((project) => (
            <article className="git-entry" key={project.id}>
              <div className="git-meta">
                <p className="git-hash">{project.label}</p>
                <p className="git-author">{project.source}</p>
                <p className="git-date">{project.period}</p>
              </div>
              <div className="git-subject">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
              <ul className="git-files">
                <li>
                  <a href={project.href} target="_blank" rel="noreferrer">
                    {project.linkLabel}
                  </a>
                </li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta">
        <h2>Open to impactful engineering collaborations</h2>
        <p>
          If you are building systems where reliability and scale matter, I would like to connect.
        </p>
        <div className="hero-actions">
          <a className="btn primary" href="mailto:kartiks2001@gmail.com">
            Start a Conversation
          </a>
          <a
            className="btn ghost"
            href="https://www.linkedin.com/in/kartik-sharma-"
            target="_blank"
            rel="noreferrer"
          >
            <span className="link-icon">in</span> Message on LinkedIn
          </a>
        </div>
      </section>
    </main>
  );
}
