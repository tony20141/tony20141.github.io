// ─────────────────────────────────────────────────────────────
// Site metadata — the single place to edit card text, links and
// videos. The actual content lives in the markdown files under
// projects/ (edit those, the site rebuilds from them).
// ─────────────────────────────────────────────────────────────

export const SITE = {
  title: "Tony2D's Project",
  author: 'Yimin Qiu',
  tagline: "Cyber security study — learning with AI, one project at a time.",
  description:
    "Yimin Qiu's cyber security study. Showcasing projects, skills, and experience in learning, gadget, linux, Python, and more.",
  email: 'tony2014@gmail.com',
  github: 'https://www.github.com/tony20141',
  linkedin: 'https://www.linkedin.com/in/yimin-qiu-09232a9a/',
  youtube: 'https://www.youtube.com',
  // Credly share badge id (kept from the old site)
  credly: '47bc4ebe-4cd3-4ffe-ae25-d26866d1b300',
};

/**
 * Project card text. Keys are the folder names under projects/.
 * Add a new folder projects/projectN/<your>.md + a cover jpg named
 * after the project, then add it here (or leave it out: the first
 * markdown line is used as the title).
 */
export const PROJECT_META = {
  project1: {
    title: 'CCNA notes (AI+personal)',
    description: "It's my CCNA book notes",
    cover: '/projects/project1/cisco.jpg',
  },
  project2: {
    title: 'Linux study notes',
    description: "It's my Linux notes",
    cover: '/projects/project2/linux.jpg',
  },
  project3: {
    title: 'Java study notes',
    description: "It's my Java notes",
    cover: '/projects/project3/java.jpg',
  },
  project4: {
    title: 'AzureAI with AnythingLLM',
    description: 'AzureAI with AnythingLLM local implementation notes',
    cover: '/projects/project4/AzureAI.jpg',
  },
  project5: {
    title: 'Security Installation & Tools',
    description: 'Security Installation & Tools Usage',
    cover: '/projects/project5/security.jpg',
  },
  project6: {
    title: 'A school project',
    description:
      'Build from scratch, installation to configuration, wire, wireless, cameras, vlan, security',
    cover: '/projects/project6/school.jpg',
  },
  project7: {
    title: 'CCNA',
    description: 'Cisco CCNA graduation practice',
    cover: '/projects/project7/final.jpg',
  },
  project8: {
    title: 'Security',
    description: 'ISC2 CC Notes',
    cover: '/projects/project8/isc2cc.jpg',
  },
  project9: {
    title: 'Feed back community',
    description: 'Giving back to the community',
    cover: '/projects/project9/community.jpg',
  },
};

// Projects that get the searchable question-bank viewer even if their
// headings are not "## Question N" (the ISC2 glossary uses "## 1. ...").
export const FORCE_BANKS = new Set(['project8']);
