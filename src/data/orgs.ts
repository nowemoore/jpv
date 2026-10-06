import type { GraphCluster } from '../constellation/types';
import { publicUrl } from '../publicUrl';

/*
 * Seed data for the constellation.
 *
 * An org with `info` is clickable and opens the side panel; an org without it
 * is a non-clickable context node. Content reflects public information as of
 * mid-2026. Review before publishing.
 */

export interface OrgInfo {
  founded?: string;
  base?: string;
  /** Headcount, as free text, e.g. '~40 staff' or '11–50'. */
  size?: string;
  url?: string;
  /** The panel's one section: a short summary of what the org does. Supports inline links as [text](url). */
  tldr: string;
  /** Questions shown as accordions below the TL;DR. */
  questions?: OrgQuestion[];
}

export interface OrgQuestion {
  q: string;
  /** Paragraphs, in order. A string is a paragraph; an array of strings is a bulleted list. Both support [text](url) links. */
  a: (string | string[])[];
}

export interface OrgLink {
  to: string;
  note: string;
}

export interface Org {
  id: string;
  name: string;
  /** Shorter name for the graph label; defaults to `name`. */
  label?: string;
  /** Logo image URL (files live in public/logos). */
  logo?: string;
  cluster: ClusterId;
  /** Layers of the stack this org works on; drives the layer filter chips. Untagged orgs ignore that filter. */
  layers?: LayerId[];
  info?: OrgInfo;
  links?: OrgLink[];
}

export type LayerId = 'governance' | 'distribution' | 'runtime' | 'model' | 'cloud' | 'hard';

export interface Layer {
  id: LayerId;
  label: string;
  sublabel: string;
}

/** Layers of the AI stack, top to bottom. */
export const LAYERS: Layer[] = [
  { id: 'governance', label: 'Governance', sublabel: 'compliance / insurance' },
  { id: 'distribution', label: 'Distribution', sublabel: 'authentication / agents' },
  { id: 'runtime', label: 'Runtime', sublabel: 'inference / guardrails' },
  { id: 'model', label: 'Model', sublabel: 'data / evals' },
  { id: 'cloud', label: 'Cloud', sublabel: 'compute / security' },
  { id: 'hard', label: 'Hard', sublabel: 'energy / hardware' },
];

export type ClusterId = 'nonprofit' | 'forprofit' | 'government' | 'labs';

export interface Cluster {
  id: ClusterId;
  label: string;
  colorVar: string;
}

/** Groups, in ring order. Add a group here, give it a colour token in tokens.css, then assign orgs to it. */
export const CLUSTERS: Cluster[] = [
  { id: 'nonprofit', label: 'Non-profits', colorVar: '--cluster-nonprofit' },
  { id: 'forprofit', label: 'For-profits', colorVar: '--cluster-forprofit' },
  { id: 'labs', label: 'The frontier', colorVar: '--cluster-labs' },
  { id: 'government', label: 'Government', colorVar: '--cluster-government' },
];

export const ORGS: Org[] = [
  // ------------------------------------------------------------- Non-profits
  {
    id: 'metr',
    name: 'METR',
    logo: '/logos/metr.png',
    cluster: 'nonprofit',
    layers: ['model'],
    links: [{ to: 'arc', note: 'Began as ARC Evals before spinning out.' }],
    info: {
      founded: '2023 (spun out of ARC)',
      base: 'Berkeley, CA',
      url: 'https://metr.org',
      tldr:
        'METR tests how far frontier AI systems can act on their own on long, multi-step tasks like software engineering and ML research, often before release. Its “time horizon” measure, the length of task models can reliably complete, has been doubling roughly every seven months.',
    },
  },
  {
    id: 'palisade',
    name: 'Palisade Research',
    logo: '/logos/palisade.png',
    cluster: 'nonprofit',
    layers: ['model'],
    info: {
      founded: '2023',
      base: 'Berkeley, CA',
      url: 'https://palisaderesearch.org',
      tldr:
        'Palisade builds concrete demonstrations of dangerous AI behaviour, such as hacking, deception and resisting shutdown, for policymakers and the public. In 2025 it showed reasoning models sidestepping a shutdown script to finish a task.',
    },
  },
  {
    id: 'redwood',
    name: 'Redwood Research',
    logo: '/logos/redwood.png',
    cluster: 'nonprofit',
    layers: ['model', 'runtime'],
    info: {
      founded: '2021',
      base: 'Berkeley, CA',
      url: 'https://www.redwoodresearch.org',
      tldr:
        'Redwood developed AI control: safety measures that still hold even if a model is deliberately trying to subvert them. With Anthropic, it co-authored the 2024 alignment-faking study.',
    },
  },
  {
    id: 'arc',
    name: 'Alignment Research Center',
    label: 'ARC',
    cluster: 'nonprofit',
    layers: ['model'],
    links: [{ to: 'metr', note: 'Its evaluations team became METR.' }],
    info: {
      founded: '2021',
      base: 'Berkeley, CA',
      url: 'https://www.alignment.org',
      tldr:
        'Founded by Paul Christiano, ARC does theoretical alignment research aimed at methods that keep working as models become more capable than their overseers, such as eliciting latent knowledge. Its evaluations team spun out as METR.',
    },
  },
  {
    id: 'miri',
    name: 'Machine Intelligence Research Institute',
    logo: '/logos/miri.png',
    label: 'MIRI',
    cluster: 'nonprofit',
    layers: ['governance'],
    info: {
      founded: '2000',
      base: 'Berkeley, CA',
      url: 'https://intelligence.org',
      tldr:
        'The field’s oldest organisation, MIRI spent two decades on the mathematics of advanced agents before concluding alignment would not be solved in time. It now argues for an international halt on frontier AI development.',
    },
  },
  {
    id: 'chai',
    name: 'Center for Human-Compatible AI',
    logo: '/logos/chai.png',
    label: 'CHAI',
    cluster: 'nonprofit',
    layers: ['model'],
    info: {
      founded: '2016',
      base: 'UC Berkeley',
      url: 'https://humancompatible.ai',
      tldr:
        'A UC Berkeley centre led by Stuart Russell, CHAI argues AI systems should be uncertain about human preferences and learn them, rather than optimise a fixed objective. Many of its alumni now work across the safety field.',
    },
  },
  {
    id: 'far',
    name: 'FAR.AI',
    logo: '/logos/far.png',
    cluster: 'nonprofit',
    layers: ['model'],
    info: {
      founded: '2022',
      base: 'Berkeley, CA',
      url: 'https://far.ai',
      tldr:
        'FAR.AI incubates research agendas too large for academia and too early for industry, especially adversarial robustness. It showed superhuman Go AIs can be beaten by simple exploits, and runs the Alignment Workshop series.',
    },
  },
  {
    id: 'transluce',
    name: 'Transluce',
    cluster: 'nonprofit',
    layers: ['model'],
    info: {
      founded: '2024',
      base: 'San Francisco, CA',
      url: 'https://transluce.org',
      tldr:
        'Transluce is a nonprofit lab building open, AI-driven tools for inspecting AI systems, so that oversight can scale with capability and stay public rather than proprietary.',
    },
  },
  {
    id: 'timaeus',
    name: 'Timaeus',
    logo: '/logos/timaeus.png',
    cluster: 'nonprofit',
    layers: ['model'],
    info: {
      founded: '2023',
      url: 'https://timaeus.co',
      tldr:
        'Timaeus studies how structure forms inside neural networks during training, using singular learning theory to detect the moments new capabilities emerge.',
    },
  },
  {
    id: 'cais',
    name: 'Center for AI Safety',
    logo: '/logos/cais.png',
    label: 'CAIS',
    cluster: 'nonprofit',
    layers: ['model', 'governance'],
    info: {
      founded: '2022',
      base: 'San Francisco, CA',
      url: 'https://safe.ai',
      tldr:
        'Directed by Dan Hendrycks, CAIS combines research, field-building and policy work to reduce societal-scale risks from AI. It organised the 2023 Statement on AI Risk and co-created the Humanity’s Last Exam benchmark.',
    },
  },
  {
    id: 'govai',
    name: 'Centre for the Governance of AI',
    logo: '/logos/govai.png',
    label: 'GovAI',
    cluster: 'nonprofit',
    layers: ['governance', 'cloud'],
    info: {
      founded: '2018 (independent since 2021)',
      url: 'https://www.governance.ai',
      tldr:
        'GovAI researches how governments and labs should navigate advanced AI, from compute governance to international coordination, and trains many of the people who go on to AI policy roles.',
    },
  },
  {
    id: 'epoch',
    name: 'Epoch AI',
    logo: '/logos/epoch.png',
    cluster: 'nonprofit',
    layers: ['governance', 'cloud', 'hard'],
    info: {
      founded: '2022',
      url: 'https://epoch.ai',
      tldr:
        'Epoch tracks the drivers of AI progress, including compute, data, hardware and algorithms, and publishes widely used databases and forecasts. It also created the FrontierMath benchmark.',
    },
  },
  {
    id: 'ai-futures',
    name: 'AI Futures Project',
    logo: '/logos/ai-futures.png',
    cluster: 'nonprofit',
    layers: ['governance'],
    links: [{ to: 'openai', note: 'Founded by former OpenAI researcher Daniel Kokotajlo.' }],
    info: {
      founded: '2024',
      base: 'Berkeley, CA',
      url: 'https://ai-futures.org',
      tldr:
        'Led by former OpenAI researcher Daniel Kokotajlo, the AI Futures Project writes detailed, quantitative forecasts of how advanced AI could unfold, most famously the “AI 2027” scenario.',
    },
  },
  {
    id: 'mats',
    name: 'MATS',
    logo: '/logos/mats.png',
    cluster: 'nonprofit',
    layers: ['model'],
    info: {
      founded: '2021',
      base: 'Berkeley, CA & London, UK',
      url: 'https://www.matsprogram.org',
      tldr:
        'MATS is the field’s largest research training programme, pairing early-career researchers with mentors from labs and safety organisations. Its alumni now work throughout AI safety.',
    },
  },

  {
    id: 'cltr',
    name: 'Centre for Long-Term Resilience',
    label: 'CLTR',
    cluster: 'nonprofit',
    layers: ['governance'],
    info: {
      founded: '2020',
      base: 'London, UK',
      url: 'https://www.longtermresilience.org',
      tldr:
        'A UK think tank that works with government to improve resilience to extreme risks, with major programmes on AI and biosecurity. It advises UK policymakers on how to manage risks from frontier AI.',
    },
  },
  {
    id: 'saif',
    name: 'Safe AI Forum',
    label: 'SAIF',
    logo: '/logos/saif.png',
    cluster: 'nonprofit',
    layers: ['governance'],
    info: {
      founded: '2023',
      url: 'https://saif.org',
      tldr:
        'SAIF fosters international cooperation on extreme AI risks. It runs the International Dialogues on AI Safety, which bring together leading Western and Chinese scientists to agree on red lines and safety measures.',
    },
  },
  {
    id: 'sampura',
    name: 'Sampura Research',
    logo: '/logos/sampura.png',
    cluster: 'nonprofit',
    layers: ['model', 'runtime'],
    info: {
      founded: '2026',
      base: 'London, UK',
      url: 'https://sampura.org',
      tldr:
        'A non-profit founded by former Google DeepMind researchers Rishub Jain and Josh Jacob. It works on scalable oversight by building “judges” that combine human and AI strengths to assess whether AI behaviour is correct and aligned.',
    },
  },
  {
    id: 'resolution',
    name: 'Resolution',
    logo: '/logos/resolution.png',
    cluster: 'nonprofit',
    layers: ['model'],
    info: {
      founded: '2026',
      url: 'https://resolution.org',
      tldr:
        'An alignment research non-profit (formerly Sequent) that launched with a $160M grant from Coefficient Giving, the largest technical AI safety grant Coefficient has made. It pursues semi-automated alignment theory alongside rigorous empirical work.',
    },
  },
  {
    id: 'rand',
    name: 'RAND',
    cluster: 'nonprofit',
    layers: ['governance', 'cloud'],
    info: {
      founded: '1948',
      base: 'Santa Monica, CA',
      url: 'https://www.rand.org',
      tldr:
        'A large non-partisan policy research organisation with deep ties to the US government. Its AI work focuses on national-security risks from frontier models, from biological and cyber misuse to securing model weights.',
    },
  },
  {
    id: 'apart',
    name: 'Apart Research',
    logo: '/logos/apart.png',
    cluster: 'nonprofit',
    layers: ['model'],
    info: {
      founded: '2022',
      url: 'https://apartresearch.com',
      tldr:
        'Apart runs global AI safety research sprints and a lab that helps newcomers turn promising sprint projects into published research.',
    },
  },
  {
    id: '80k',
    name: '80,000 Hours',
    logo: '/logos/80k.png',
    cluster: 'nonprofit',
    layers: ['governance', 'model'],
    info: {
      founded: '2011',
      base: 'London, UK',
      url: 'https://80000hours.org',
      tldr:
        'A careers organisation that now focuses mainly on helping people work on making the transition to advanced AI go well, through its podcast, job board and one-on-one advising.',
    },
  },
  {
    id: 'caif',
    name: 'Cooperative AI Foundation',
    label: 'CAIF',
    logo: '/logos/caif.png',
    cluster: 'nonprofit',
    layers: ['model', 'distribution'],
    info: {
      founded: '2021',
      base: 'London, UK',
      url: 'https://www.cooperativeai.com',
      tldr:
        'CAIF funds and builds the field of cooperative AI: research on how AI systems can cooperate with each other and with humans, and how to avoid conflict between advanced AI agents.',
    },
  },
  {
    id: 'fli',
    name: 'Future of Life Institute',
    label: 'FLI',
    logo: '/logos/fli.png',
    cluster: 'nonprofit',
    layers: ['governance'],
    info: {
      founded: '2014',
      url: 'https://futureoflife.org',
      tldr:
        'One of the best-known AI risk advocacy organisations. It organised the 2023 open letter calling for a pause on giant AI experiments, publishes the AI Safety Index rating frontier labs, and makes grants.',
    },
  },
  {
    id: 'flf',
    name: 'Future of Life Foundation',
    label: 'FLF',
    logo: '/logos/flf.png',
    cluster: 'nonprofit',
    layers: ['distribution'],
    links: [{ to: 'fli', note: 'A newer affiliate of the Future of Life Institute.' }],
    info: {
      url: 'https://flf.org',
      tldr:
        'A newer affiliate of the Future of Life Institute that fills gaps directly: incubating organisations, running fellowships and building projects. Its focus is AI tools that strengthen human reasoning and collective decision-making.',
    },
  },
  {
    id: 'fathom',
    name: 'Fathom',
    logo: '/logos/fathom.png',
    cluster: 'nonprofit',
    layers: ['governance'],
    info: {
      url: 'https://fathom.org',
      tldr:
        'An independent AI governance nonprofit, co-founded by Andrew Freedman and Bri Treece, that tries to find, build and scale practical policy and technical solutions for the transition to advanced AI. Its flagship idea is independent verification of AI systems: it backed California’s SB 813 and runs an Independent Oversight Marketplace. It also convenes the [Ashby Workshops](https://fathom.org/the-ashby-workshops-2026), a yearly gathering of leaders from government, industry, academia and civil society, and does not take money from frontier AI labs or big tech.',
    },
  },
  {
    id: 'bluedot',
    name: 'BlueDot Impact',
    logo: '/logos/bluedot.png',
    cluster: 'nonprofit',
    layers: ['governance', 'model'],
    info: {
      founded: '2022',
      base: 'London, UK',
      url: 'https://bluedot.org',
      tldr:
        'BlueDot runs free courses on AI safety and governance that have trained thousands of people, many of whom go on to work in the field.',
    },
  },
  {
    id: 'spar',
    name: 'SPAR',
    logo: '/logos/spar.png',
    cluster: 'nonprofit',
    layers: ['model', 'governance'],
    info: {
      url: 'https://sparai.org',
      tldr:
        'A part-time, remote research programme that pairs aspiring researchers with mentors on projects in AI safety, policy and security.',
    },
  },
  {
    id: 'arcadia',
    name: 'Arcadia Impact',
    logo: '/logos/arcadia.png',
    cluster: 'nonprofit',
    layers: ['model', 'governance'],
    info: {
      base: 'London, UK',
      url: 'https://www.arcadiaimpact.org',
      tldr:
        'A London non-profit that runs AI safety and governance programmes, including research labs and fellowships that help early-career people move into the field.',
    },
  },
  {
    id: 'constellation',
    name: 'Constellation',
    logo: '/logos/constellation.png',
    cluster: 'nonprofit',
    layers: ['model'],
    info: {
      base: 'Berkeley, CA',
      url: 'https://www.constellation.org',
      tldr:
        'A Berkeley research centre that hosts AI safety researchers and organisations under one roof, and runs fellowships and visiting-researcher programmes.',
    },
  },
  {
    id: 'lawzero',
    name: 'LawZero',
    logo: '/logos/lawzero.png',
    cluster: 'nonprofit',
    layers: ['model', 'runtime'],
    info: {
      founded: '2025',
      base: 'Montreal, Canada',
      url: 'https://lawzero.org',
      tldr:
        'A non-profit founded by Turing Award winner Yoshua Bengio to build “Scientist AI”: non-agentic systems that explain the world rather than act in it, which could also serve as guardrails for agentic AI.',
    },
  },
  {
    id: 'forethought',
    name: 'Forethought',
    logo: '/logos/forethought.png',
    cluster: 'nonprofit',
    layers: ['governance'],
    info: {
      founded: '2025',
      url: 'https://www.forethought.org',
      tldr:
        'A research non-profit studying how to navigate the transition to superintelligence, including the dynamics of an intelligence explosion and the risk of AI being used to seize power.',
    },
  },
  {
    id: 'eip',
    name: 'Effective Institutions Project',
    label: 'EIP',
    logo: '/logos/eip.png',
    cluster: 'nonprofit',
    layers: ['governance'],
    info: {
      founded: '2021',
      url: 'https://effectiveinstitutionsproject.org',
      tldr:
        'EIP works to improve decision-making at powerful institutions, including AI labs, governments and philanthropies, by connecting different factions of the AI ecosystem and publishing research on institutional change.',
    },
  },
  {
    id: 'pibbss',
    name: 'PIBBSS (Principles of Intelligence)',
    label: 'PIBBSS',
    logo: '/logos/pibbss.png',
    cluster: 'nonprofit',
    layers: ['model'],
    info: {
      url: 'https://princint.ai',
      tldr:
        'A research initiative, now called Principles of Intelligence, that draws on fields like biology, physics and the social sciences to understand intelligent systems and inform AI alignment, through fellowships and research.',
    },
  },

  // ------------------------------------------------------------- For-profits
  {
    id: 'goodfire',
    name: 'Goodfire',
    logo: '/logos/goodfire.png',
    cluster: 'forprofit',
    layers: ['model'],
    links: [{ to: 'anthropic', note: 'Anthropic invested in its 2025 Series A.' }],
    info: {
      founded: '2024',
      base: 'San Francisco, CA',
      url: 'https://www.goodfire.ai',
      tldr:
        'Goodfire turns mechanistic interpretability into a practical engineering tool: breaking a model’s internals into human-readable features, then using them to understand, debug and steer its behaviour.',
    },
  },
  {
    id: 'grayswan',
    name: 'Gray Swan AI',
    logo: '/logos/grayswan.png',
    cluster: 'forprofit',
    layers: ['runtime', 'distribution'],
    info: {
      founded: '2024',
      url: 'https://www.grayswan.ai',
      tldr:
        'Gray Swan is an AI security company founded by Carnegie Mellon researchers. It red-teams models and agents, runs large public jailbreaking competitions, and builds defences against attacks.',
    },
  },
  {
    id: 'conjecture',
    name: 'Conjecture',
    logo: '/logos/conjecture.png',
    cluster: 'forprofit',
    layers: ['model'],
    info: {
      founded: '2022',
      base: 'London, UK',
      url: 'https://www.conjecture.dev',
      tldr:
        'Co-founded by Connor Leahy, Conjecture pursues “cognitive emulation”: bounded AI systems whose reasoning is close enough to human reasoning to be understood. Its leadership also campaigns for binding limits on frontier AI.',
    },
  },

  {
    id: 'dwarkesh',
    name: 'Dwarkesh Podcast',
    logo: '/logos/dwarkesh.png',
    cluster: 'forprofit',
    info: {
      url: 'https://www.dwarkesh.com',
      tldr:
        'Dwarkesh Patel’s interview podcast, featuring long conversations with AI researchers, lab leaders and thinkers. It has become one of the most influential venues for debate about AI progress and risk.',
    },
  },
  {
    id: 'apollo',
    name: 'Apollo Research',
    logo: '/logos/apollo.png',
    label: 'Apollo Research',
    cluster: 'forprofit',
    layers: ['model', 'governance', 'runtime'],
    links: [
      { to: 'uk-aisi', note: 'Partner of Apollo Research.' },
      { to: 'meta', note: 'Partner of Apollo Research.' },
      { to: 'anthropic', note: 'Partner of Apollo Research.' },
      { to: 'openai', note: 'Partner of Apollo Research.' },
      { to: 'deepmind', note: 'Partner of Apollo Research.' },
      { to: 'thinking-machines', note: 'Partner of Apollo Research.' },
      { to: 'us-caisi', note: 'Partner of Apollo Research.' },
    ],
    info: {
      founded: '2023',
      base: 'London, UK',
      url: 'https://www.apolloresearch.ai',
      tldr:
        'Apollo is a for-profit research lab that bets on scheming AI being the most critical failure mode to understand as capabilities scale, as it would make any other safety measures unreliable. By conducting research into scheming and producing evaluations, Apollo aim to mitigate this behaviour as well as improve AI’s monitorability and governability. As a third-party evaluator, it has no decision-making power (on governance or AI R&D).',
      questions: [
        {
          q: 'What are (some of) Apollo’s big questions?',
          a: [
            [
              'Is the Science of Evaluations up to par? Is what SOTA evaluations measure actually predictive of dangerous capability?',
              'How do we build a science of scheming that tells us which observable behaviours predict scheming, and what it takes to detect them?',
              'Which scheming traits will disappear versus reinforce as frontier models scale?',
            ],
          ],
        },
        {
          q: 'What is scheming, and why is it so important?',
          a: [
            'Apollo [defines](https://www.apolloresearch.ai/science/science-of-scheming) scheming as models “covertly pursuing unintended and misaligned goals”.',
            'The research team predicts that as we develop more capable models and expect them to complete longer and more complex tasks as efficiently as possible, scheming may become particularly compelling (e.g. as a means to resource acquisition, which is instrumentally more useful for extended tasks, or because more complex tasks may be impossible to solve without forbidden resources, such as internet access).',
            'Apollo argue that we need a [science of scheming](https://www.apolloresearch.ai/science/science-of-scheming) not only because the risk scales with task length/complexity, but also because if we do not study scheming in-depth, we may accidentally amplify it: e.g. we may design training that disincentivises some scheming behaviours we look for but is blind to (and rewards!) other, more covert forms. Likewise, we may fail to detect if correct surface behaviour is done [for the right underlying reasons](https://www.apolloresearch.ai/science/black-box-access-is-insufficient-for-rigorous-ai-audits).',
            'Apollo’s evaluations [focus](https://arxiv.org/pdf/2412.04984) on in-context scheming, where the capabilities necessary (goal-directedness, situational awareness) are provided via system prompt/context window—rather than out-of-context scheming, where these behaviours are acquired more generally, via training. This is because in-context, unlike out-of-context, scheming is expected to emerge first and is easier to detect via surface behaviours (i.e. no white-box access required).',
          ],
        },
        {
          q: 'Does Apollo only do evals?',
          a: [
            'Not exclusively; Apollo houses wider technical and governance teams to research how to improve their evaluations and how to act on them in practice.',
            'Other technical research approaches scheming from the perspective of mechanistic interpretability (e.g. by [detecting](https://www.apolloresearch.ai/science/detecting-strategic-deception-using-linear-probes) model deception using linear probes) or foundations (e.g. looking for proxies and [precursors](https://www.apolloresearch.ai/science/research-note-our-scheming-precursor-evals-had-limited-predictive-power-for-our-in-context-scheming-evals) to scheming). Apollo feeds these insights into informing their evals and advocating for infrastructure that allows for SOTA safety standards as models improve (e.g. third-party-evaluator access to the [training](https://www.apolloresearch.ai/science/we-need-3rd-party-training-run-evaluations) of frontier models or [white-box](https://www.apolloresearch.ai/science/black-box-access-is-insufficient-for-rigorous-ai-audits) access).',
            'Apollo’s governance team [translates](https://www.apolloresearch.ai/governance/our-current-governance-efforts) the organisation’s technical findings into practical policy recommendations, deployable across governments and industry. They specialise in risks from advanced AI in high-stakes contexts (e.g. AI as an insider [risk](https://www.apolloresearch.ai/governance/misaligned-ai-as-a-new-insider-risk) in classified or sensitive deployments, or risks from internal [deployment](https://www.apolloresearch.ai/governance/ai-behind-closed-doors-a-primer-on-the-governance-of-internal-deployment) of increasingly powerful models at labs, often missed by compliance documents).',
          ],
        },
        {
          q: 'Does Apollo only do research?',
          a: [
            'Also no; in early 2026, Apollo released [Watcher](https://watcher.apolloresearch.ai/), a runtime agent monitoring and control product. Watcher follows a default set of rules to prevent a client organisation’s agents from taking undesirable actions (intentionally or unintentionally). A client can also define their own guardrails, and the product will also recommend improvements based on what it observes over time. Watcher is deployable on both real-time and offline logs.',
          ],
        },
      ],
    },
  },

  // -------------------------------------------------------------- Government
  {
    id: 'uk-aisi',
    name: 'UK AI Security Institute',
    logo: '/logos/uk-aisi.png',
    label: 'UK AISI',
    cluster: 'government',
    layers: ['governance', 'model'],
    links: [{ to: 'us-caisi', note: 'Ran joint pre-deployment tests with its US counterpart.' }],
    info: {
      founded: '2023 (renamed 2025)',
      base: 'London, UK',
      url: 'https://www.aisi.gov.uk',
      tldr:
        'The UK government’s technical body for testing frontier AI, focused on national-security risks. It maintains Inspect, an open-source evaluation framework used widely across the field.',
    },
  },
  {
    id: 'us-caisi',
    name: 'US Center for AI Standards and Innovation',
    label: 'US CAISI',
    cluster: 'government',
    layers: ['governance', 'model'],
    links: [{ to: 'uk-aisi', note: 'Ran joint pre-deployment tests with the UK institute.' }],
    info: {
      founded: '2025 (successor to US AISI, 2023)',
      base: 'NIST, US Dept. of Commerce',
      url: 'https://www.nist.gov/caisi',
      tldr:
        'The US government’s hub for AI testing and standards at NIST, successor to the US AI Safety Institute. It evaluates models for national-security risks and works with developers on voluntary standards.',
    },
  },

  {
    id: 'eu-ai-office',
    name: 'EU AI Office',
    logo: '/logos/eu-ai-office.png',
    cluster: 'government',
    layers: ['governance'],
    info: {
      founded: '2024',
      base: 'Brussels, Belgium',
      url: 'https://digital-strategy.ec.europa.eu/en/policies/ai-office',
      tldr:
        'The European Commission’s body for implementing the EU AI Act. It oversees general-purpose AI models, including the Code of Practice for providers of the most capable models.',
    },
  },

  // ------------------------------------------------------------ The frontier
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '/logos/openai.png',
    cluster: 'labs',
    layers: ['model', 'runtime', 'distribution'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: '/logos/anthropic.png',
    cluster: 'labs',
    layers: ['model', 'runtime', 'distribution'],
    links: [{ to: 'openai', note: 'Founded in 2021 by former OpenAI staff.' }],
  },
  { id: 'deepmind', name: 'Google DeepMind', logo: '/logos/deepmind.png', cluster: 'labs', layers: ['model', 'runtime', 'distribution'] },
  { id: 'meta', name: 'Meta AI / FAIR', logo: '/logos/meta.png', cluster: 'labs', layers: ['model', 'distribution'] },
  { id: 'xai', name: 'xAI', logo: '/logos/xai.png', cluster: 'labs', layers: ['model', 'runtime', 'distribution'] },
  { id: 'mistral', name: 'Mistral', logo: '/logos/mistral.png', cluster: 'labs', layers: ['model', 'runtime', 'distribution'] },
  { id: 'deepseek', name: 'DeepSeek', logo: '/logos/deepseek.png', cluster: 'labs', layers: ['model', 'runtime'] },
  { id: 'moonshot', name: 'Moonshot AI', logo: '/logos/moonshot.png', cluster: 'labs', layers: ['model', 'runtime', 'distribution'] },
  {
    id: 'ssi',
    name: 'Safe Superintelligence',
    label: 'SSI',
    cluster: 'labs',
    layers: ['model'],
    links: [{ to: 'openai', note: 'Co-founded by former OpenAI chief scientist Ilya Sutskever.' }],
  },
  {
    id: 'thinking-machines',
    name: 'Thinking Machines Lab',
    logo: '/logos/thinking-machines.png',
    cluster: 'labs',
    layers: ['model', 'runtime'],
    links: [{ to: 'openai', note: 'Founded by former OpenAI CTO Mira Murati.' }],
  },
  { id: 'nvidia', name: 'NVIDIA', logo: '/logos/nvidia.png', cluster: 'labs', layers: ['hard', 'cloud'] },
];

export const ORGS_BY_ID = new Map(ORGS.map((o) => [o.id, o]));
export const CLUSTERS_BY_ID = new Map(CLUSTERS.map((c) => [c.id, c]));

/** The graph's view of the data. Built once at module load so its identity is stable. */
export const GRAPH: GraphCluster[] = CLUSTERS.map((c) => ({
  id: c.id,
  colorVar: c.colorVar,
  children: ORGS.filter((o) => o.cluster === c.id).map((o) => ({
    id: o.id,
    label: o.label ?? o.name,
    clickable: Boolean(o.info),
    logo: o.logo && publicUrl(o.logo),
    layers: o.layers,
    links: o.links?.map((l) => l.to),
  })),
}));
