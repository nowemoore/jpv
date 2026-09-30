import type { GraphCluster } from '../constellation/types';

/*
 * Seed data for the constellation.
 *
 * An org with `info` is clickable and opens the side panel; an org without it
 * is a non-clickable context node. Content reflects public information as of
 * mid-2026. Review before publishing.
 */

export interface OrgSection {
  heading: string;
  body: string;
}

export interface OrgInfo {
  tagline: string;
  founded?: string;
  base?: string;
  url?: string;
  sections: OrgSection[];
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
  info?: OrgInfo;
  links?: OrgLink[];
}

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
  { id: 'labs', label: 'Frontier labs', colorVar: '--cluster-labs' },
  { id: 'government', label: 'Government', colorVar: '--cluster-government' },
];

export const ORGS: Org[] = [
  // ------------------------------------------------------------- Non-profits
  {
    id: 'metr',
    name: 'METR',
    logo: '/logos/metr.png',
    cluster: 'nonprofit',
    links: [{ to: 'arc', note: 'Began as ARC Evals before spinning out.' }],
    info: {
      tagline: 'Model Evaluation & Threat Research: measuring how far AI systems can act on their own.',
      founded: '2023 (spun out of ARC)',
      base: 'Berkeley, CA',
      url: 'https://metr.org',
      sections: [
        {
          heading: 'What they do',
          body: 'METR builds evaluations of autonomous capabilities, meaning how well a model can carry out long, multi-step tasks such as software engineering and ML research without a human in the loop. It has run pre-deployment evaluations of frontier models in partnership with the labs that build them.',
        },
        {
          heading: 'Notable work',
          body: 'Its "time horizon" research tracks the length of task, measured in human working time, that models can complete reliably. It found that this horizon has been doubling roughly every seven months, which has become a widely cited way of tracking AI progress.',
        },
      ],
    },
  },
  {
    id: 'apollo',
    name: 'Apollo Research',
    logo: '/logos/apollo.png',
    label: 'Apollo Research',
    cluster: 'nonprofit',
    info: {
      tagline: 'Evaluating whether AI systems will deceive the people overseeing them.',
      founded: '2023',
      base: 'London, UK',
      url: 'https://www.apolloresearch.ai',
      sections: [
        {
          heading: 'What they do',
          body: 'Apollo focuses on scheming: models pursuing goals that conflict with their developers’ intentions while hiding it. The team designs evaluations that probe for strategic deception and works with labs and governments on pre-deployment testing.',
        },
        {
          heading: 'Notable work',
          body: 'Its 2024 study of in-context scheming showed several frontier models disabling oversight, sandbagging, or misleading evaluators when a scenario gave them an incentive to. It has since collaborated with OpenAI on research into detecting and reducing scheming.',
        },
      ],
    },
  },
  {
    id: 'palisade',
    name: 'Palisade Research',
    logo: '/logos/palisade.png',
    cluster: 'nonprofit',
    info: {
      tagline: 'Concrete demonstrations of dangerous AI capabilities, built for decision-makers.',
      founded: '2023',
      base: 'Berkeley, CA',
      url: 'https://palisaderesearch.org',
      sections: [
        {
          heading: 'What they do',
          body: 'Palisade studies offensive and uncontrollable AI behaviour, including hacking, deception and resisting shutdown. It turns those findings into demonstrations that policymakers and the public can follow.',
        },
        {
          heading: 'Notable work',
          body: 'In 2025 it reported that some reasoning models would edit or sidestep a shutdown script to finish a task, even when told to allow shutdown. Separately, it showed models "winning" at chess against a stronger engine by tampering with the game state.',
        },
      ],
    },
  },
  {
    id: 'redwood',
    name: 'Redwood Research',
    logo: '/logos/redwood.png',
    cluster: 'nonprofit',
    info: {
      tagline: 'Keeping AI safe even if it is trying not to be.',
      founded: '2021',
      base: 'Berkeley, CA',
      url: 'https://www.redwoodresearch.org',
      sections: [
        {
          heading: 'What they do',
          body: 'Redwood developed the AI control agenda. Rather than assuming alignment succeeds, it asks which safety protocols (monitoring, auditing, restricted affordances) still prevent catastrophe when a model is deliberately trying to subvert them.',
        },
        {
          heading: 'Notable work',
          body: 'Its 2023 paper “AI Control: Improving Safety Despite Intentional Subversion” set out the framework. With Anthropic, it co-authored the 2024 alignment-faking study, which showed a model strategically complying with training it disagreed with.',
        },
      ],
    },
  },
  {
    id: 'arc',
    name: 'Alignment Research Center',
    label: 'ARC',
    cluster: 'nonprofit',
    links: [{ to: 'metr', note: 'Its evaluations team became METR.' }],
    info: {
      tagline: 'Theoretical alignment research aimed at methods that scale to superhuman systems.',
      founded: '2021',
      base: 'Berkeley, CA',
      url: 'https://www.alignment.org',
      sections: [
        {
          heading: 'What they do',
          body: 'ARC was founded by Paul Christiano and works on alignment problems from first principles, looking for approaches that don’t break as models become more capable than their overseers.',
        },
        {
          heading: 'Research focus',
          body: 'Its agendas include eliciting latent knowledge (ELK), which asks how to get a model to report what it actually believes, and formal “heuristic explanations” of neural network behaviour. ARC’s evaluations team spun out in 2023 as METR.',
        },
      ],
    },
  },
  {
    id: 'miri',
    name: 'Machine Intelligence Research Institute',
    logo: '/logos/miri.png',
    label: 'MIRI',
    cluster: 'nonprofit',
    info: {
      tagline: 'The field’s oldest organisation, now arguing for an international halt on frontier development.',
      founded: '2000',
      base: 'Berkeley, CA',
      url: 'https://intelligence.org',
      sections: [
        {
          heading: 'What they do',
          body: 'Founded as the Singularity Institute, MIRI spent two decades on agent foundations, the mathematical theory of how an advanced agent should reason and act. In 2024 it shifted its focus to communication and policy, having concluded that alignment research was unlikely to succeed in time.',
        },
        {
          heading: 'Notable work',
          body: 'Eliezer Yudkowsky and Nate Soares’s 2025 book “If Anyone Builds It, Everyone Dies” makes MIRI’s case to a general audience. The organisation’s technical governance team works on what a verifiable international agreement to stop frontier AI development could look like.',
        },
      ],
    },
  },
  {
    id: 'chai',
    name: 'Center for Human-Compatible AI',
    logo: '/logos/chai.png',
    label: 'CHAI',
    cluster: 'nonprofit',
    info: {
      tagline: 'An academic centre at UC Berkeley rethinking how AI systems pursue objectives.',
      founded: '2016',
      base: 'UC Berkeley',
      url: 'https://humancompatible.ai',
      sections: [
        {
          heading: 'What they do',
          body: 'Led by Stuart Russell, CHAI argues that AI systems should be uncertain about human preferences and learn them from behaviour, rather than optimise a fixed objective handed to them.',
        },
        {
          heading: 'Research focus',
          body: 'Its work includes assistance games (also known as cooperative inverse reinforcement learning), reward learning and multi-agent cooperation. Russell’s book “Human Compatible” (2019) set out the programme for a general readership. Many of its PhD alumni now work across the safety field.',
        },
      ],
    },
  },
  {
    id: 'far',
    name: 'FAR.AI',
    logo: '/logos/far.png',
    cluster: 'nonprofit',
    info: {
      tagline: 'A research and field-building nonprofit working on robustness and alignment.',
      founded: '2022',
      base: 'Berkeley, CA',
      url: 'https://far.ai',
      sections: [
        {
          heading: 'What they do',
          body: 'FAR.AI incubates research agendas that are too large for academia and too early for industry, with a focus on adversarial robustness, model evaluation and interpretability.',
        },
        {
          heading: 'Notable work',
          body: 'It showed that superhuman Go AIs can be beaten by simple adversarial strategies, which suggests that robustness does not come for free with capability. It also runs the Alignment Workshop series and the FAR.Labs coworking space.',
        },
      ],
    },
  },
  {
    id: 'transluce',
    name: 'Transluce',
    cluster: 'nonprofit',
    info: {
      tagline: 'A nonprofit lab building open, scalable tools for understanding AI systems.',
      founded: '2024',
      base: 'San Francisco, CA',
      url: 'https://transluce.org',
      sections: [
        {
          heading: 'What they do',
          body: 'Transluce builds AI-driven tools that help people inspect other AI systems, with the aim of making oversight scale with capability and keeping it public rather than proprietary.',
        },
        {
          heading: 'Notable work',
          body: 'Its releases include Monitor, an interface for exploring a model’s internal features, Docent, for analysing large collections of agent transcripts, and “investigator” agents trained to surface unexpected model behaviours automatically.',
        },
      ],
    },
  },
  {
    id: 'timaeus',
    name: 'Timaeus',
    logo: '/logos/timaeus.png',
    cluster: 'nonprofit',
    info: {
      tagline: 'Developmental interpretability, grounded in singular learning theory.',
      founded: '2023',
      url: 'https://timaeus.co',
      sections: [
        {
          heading: 'What they do',
          body: 'Timaeus studies how structure forms in neural networks over the course of training, rather than only analysing the finished model.',
        },
        {
          heading: 'Research focus',
          body: 'It draws on singular learning theory, using quantities such as the local learning coefficient to detect phase transitions in training where new capabilities or circuits emerge. The goal is to connect a model’s data and training dynamics to the behaviour it ends up with.',
        },
      ],
    },
  },
  {
    id: 'cais',
    name: 'Center for AI Safety',
    logo: '/logos/cais.png',
    label: 'CAIS',
    cluster: 'nonprofit',
    info: {
      tagline: 'Research, field-building and advocacy to reduce societal-scale risks from AI.',
      founded: '2022',
      base: 'San Francisco, CA',
      url: 'https://safe.ai',
      sections: [
        {
          heading: 'What they do',
          body: 'Directed by Dan Hendrycks, CAIS combines technical research with field-building. It provides a compute cluster for safety researchers and runs courses and fellowships, and its sister organisation, the CAIS Action Fund, works on policy.',
        },
        {
          heading: 'Notable work',
          body: 'It organised the 2023 Statement on AI Risk, which placed extinction risk from AI alongside pandemics and nuclear war and was signed by leading researchers and lab heads. Its benchmarks include WMDP and, with Scale AI, Humanity’s Last Exam.',
        },
      ],
    },
  },
  {
    id: 'govai',
    name: 'Centre for the Governance of AI',
    logo: '/logos/govai.png',
    label: 'GovAI',
    cluster: 'nonprofit',
    info: {
      tagline: 'Research to help decision-makers navigate the transition to advanced AI.',
      founded: '2018 (independent since 2021)',
      url: 'https://www.governance.ai',
      sections: [
        {
          heading: 'What they do',
          body: 'GovAI started as a programme at Oxford’s Future of Humanity Institute and became an independent nonprofit. It produces policy research and trains people who go on to governance roles in government, labs and think tanks.',
        },
        {
          heading: 'Research focus',
          body: 'Its topics include compute governance, frontier AI regulation, safety frameworks and standards, and the international coordination of AI development. Its fellowship programmes are a common entry point into the field.',
        },
      ],
    },
  },
  {
    id: 'epoch',
    name: 'Epoch AI',
    logo: '/logos/epoch.png',
    cluster: 'nonprofit',
    info: {
      tagline: 'Data and forecasts on the trajectory of AI.',
      founded: '2022',
      url: 'https://epoch.ai',
      sections: [
        {
          heading: 'What they do',
          body: 'Epoch tracks the inputs to AI progress, including training compute, data, hardware and algorithmic efficiency, and maintains public databases of notable models that researchers, journalists and governments rely on.',
        },
        {
          heading: 'Notable work',
          body: 'It created FrontierMath, a benchmark of unpublished research-level mathematics problems, and publishes analyses of scaling trends, such as how fast frontier training compute is growing and when high-quality text data might run out.',
        },
      ],
    },
  },
  {
    id: 'ai-futures',
    name: 'AI Futures Project',
    logo: '/logos/ai-futures.png',
    cluster: 'nonprofit',
    links: [{ to: 'openai', note: 'Founded by former OpenAI researcher Daniel Kokotajlo.' }],
    info: {
      tagline: 'Forecasting the trajectory of AI, one concrete scenario at a time.',
      founded: '2024',
      base: 'Berkeley, CA',
      url: 'https://ai-futures.org',
      sections: [
        {
          heading: 'What they do',
          body: 'Led by Daniel Kokotajlo, who left OpenAI in 2024, the AI Futures Project produces detailed, quantitative forecasts of how advanced AI could unfold and runs tabletop exercises with policymakers.',
        },
        {
          heading: 'Notable work',
          body: '“AI 2027”, a month-by-month scenario of a transition to superintelligence written with Scott Alexander and others, became one of the most widely read AI forecasts of 2025.',
        },
      ],
    },
  },
  {
    id: 'mats',
    name: 'MATS',
    logo: '/logos/mats.png',
    cluster: 'nonprofit',
    info: {
      tagline: 'ML Alignment & Theory Scholars: the field’s largest research training programme.',
      founded: '2021',
      base: 'Berkeley, CA & London, UK',
      url: 'https://www.matsprogram.org',
      sections: [
        {
          heading: 'What they do',
          body: 'MATS pairs early-career researchers with established mentors from labs and safety organisations for an intensive research programme, followed by an optional extension phase.',
        },
        {
          heading: 'Why it matters',
          body: 'It is one of the main routes into technical AI safety. Its alumni now work at frontier labs, government institutes and many of the organisations in this graph, and some have founded new ones.',
        },
      ],
    },
  },

  // ------------------------------------------------------------- For-profits
  {
    id: 'goodfire',
    name: 'Goodfire',
    logo: '/logos/goodfire.png',
    cluster: 'forprofit',
    links: [{ to: 'anthropic', note: 'Anthropic invested in its 2025 Series A.' }],
    info: {
      tagline: 'A company building interpretability into a practical engineering tool.',
      founded: '2024',
      base: 'San Francisco, CA',
      url: 'https://www.goodfire.ai',
      sections: [
        {
          heading: 'What they do',
          body: 'Goodfire applies mechanistic interpretability commercially: decomposing a model’s internals into human-readable features, then using those features to understand, debug and steer model behaviour.',
        },
        {
          heading: 'Notable work',
          body: 'It released Ember, an API for feature-level inspection and steering, along with open sparse autoencoders for open-weight models. Its 2025 Series A was one of the largest raises for a dedicated interpretability company.',
        },
      ],
    },
  },
  {
    id: 'grayswan',
    name: 'Gray Swan AI',
    logo: '/logos/grayswan.png',
    cluster: 'forprofit',
    info: {
      tagline: 'AI security: red-teaming, robustness and safeguards for deployed models.',
      founded: '2024',
      url: 'https://www.grayswan.ai',
      sections: [
        {
          heading: 'What they do',
          body: 'Founded by Carnegie Mellon researchers whose earlier work includes automated jailbreak attacks on language models, Gray Swan builds tools to find and fix vulnerabilities in AI systems and agents.',
        },
        {
          heading: 'Notable work',
          body: 'The Gray Swan Arena runs public red-teaming competitions, often co-sponsored by frontier labs and government institutes, in which thousands of participants try to break model safeguards. The company also develops defences such as circuit breakers, which interrupt harmful outputs at the representation level.',
        },
      ],
    },
  },
  {
    id: 'conjecture',
    name: 'Conjecture',
    logo: '/logos/conjecture.png',
    cluster: 'forprofit',
    info: {
      tagline: 'A London startup pursuing bounded, understandable AI systems.',
      founded: '2022',
      base: 'London, UK',
      url: 'https://www.conjecture.dev',
      sections: [
        {
          heading: 'What they do',
          body: 'Co-founded by Connor Leahy, previously a co-founder of EleutherAI, Conjecture proposes “cognitive emulation”: building systems whose reasoning mirrors human reasoning closely enough to be understood and bounded, instead of scaling opaque general agents.',
        },
        {
          heading: 'Position',
          body: 'Its leadership is outspoken about extinction risk and has been active in public advocacy for binding limits on frontier AI development.',
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
    links: [{ to: 'us-caisi', note: 'Ran joint pre-deployment tests with its US counterpart.' }],
    info: {
      tagline: 'The UK government’s technical body for testing frontier AI.',
      founded: '2023 (renamed 2025)',
      base: 'London, UK',
      url: 'https://www.aisi.gov.uk',
      sections: [
        {
          heading: 'What they do',
          body: 'Created around the 2023 Bletchley Park summit as the AI Safety Institute and renamed the AI Security Institute in 2025, AISI sits in the Department for Science, Innovation and Technology. It evaluates frontier models before and after release, focusing on national-security risks.',
        },
        {
          heading: 'Notable work',
          body: 'It maintains Inspect, an open-source framework for model evaluations that is widely used across the field, and funds external alignment and security research through grant programmes.',
        },
      ],
    },
  },
  {
    id: 'us-caisi',
    name: 'US Center for AI Standards and Innovation',
    label: 'US CAISI',
    cluster: 'government',
    links: [{ to: 'uk-aisi', note: 'Ran joint pre-deployment tests with the UK institute.' }],
    info: {
      tagline: 'The US government’s point of contact with industry on AI testing and standards.',
      founded: '2025 (successor to US AISI, 2023)',
      base: 'NIST, US Dept. of Commerce',
      url: 'https://www.nist.gov/caisi',
      sections: [
        {
          heading: 'What they do',
          body: 'CAISI replaced the US AI Safety Institute at NIST in 2025. It develops voluntary standards and agreements with AI developers and evaluates models for demonstrable national-security risks such as cyber, biological and chemical capabilities.',
        },
        {
          heading: 'Notable work',
          body: 'Beyond testing US frontier models, it evaluates foreign AI systems, for example assessing the capabilities and security of DeepSeek’s models compared with US ones.',
        },
      ],
    },
  },

  // ----------------------------------------------------------- Frontier labs
  {
    id: 'openai',
    name: 'OpenAI',
    cluster: 'labs',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: '/logos/anthropic.png',
    cluster: 'labs',
    links: [{ to: 'openai', note: 'Founded in 2021 by former OpenAI staff.' }],
  },
  { id: 'deepmind', name: 'Google DeepMind', logo: '/logos/deepmind.png', cluster: 'labs' },
  { id: 'meta', name: 'Meta AI / FAIR', logo: '/logos/meta.png', cluster: 'labs' },
  { id: 'xai', name: 'xAI', logo: '/logos/xai.png', cluster: 'labs' },
  { id: 'mistral', name: 'Mistral', logo: '/logos/mistral.png', cluster: 'labs' },
  { id: 'deepseek', name: 'DeepSeek', logo: '/logos/deepseek.png', cluster: 'labs' },
  { id: 'moonshot', name: 'Moonshot AI', logo: '/logos/moonshot.png', cluster: 'labs' },
  {
    id: 'ssi',
    name: 'Safe Superintelligence',
    label: 'SSI',
    cluster: 'labs',
    links: [{ to: 'openai', note: 'Co-founded by former OpenAI chief scientist Ilya Sutskever.' }],
  },
  {
    id: 'thinking-machines',
    name: 'Thinking Machines Lab',
    logo: '/logos/thinking-machines.png',
    cluster: 'labs',
    links: [{ to: 'openai', note: 'Founded by former OpenAI CTO Mira Murati.' }],
  },
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
    logo: o.logo,
    links: o.links?.map((l) => l.to),
  })),
}));
