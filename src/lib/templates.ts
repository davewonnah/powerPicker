export interface ElectionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string; // emoji
  voteType: "single" | "multiple" | "ranked";
  voterAccess: "link" | "email";
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  options: { label: string; candidate_position?: string; party?: string }[];
}

export const TEMPLATES: ElectionTemplate[] = [
  {
    id: "agm-chairperson",
    name: "AGM Chairperson",
    description: "Annual General Meeting — elect a chairperson from nominated candidates.",
    category: "Corporate",
    icon: "🏛️",
    voteType: "single",
    voterAccess: "email",
    titlePlaceholder: "AGM 2026 — Chairperson Election",
    descriptionPlaceholder: "Members are invited to vote for the next Chairperson. Only registered members may vote.",
    options: [
      { label: "Candidate A", candidate_position: "Chairperson Nominee" },
      { label: "Candidate B", candidate_position: "Chairperson Nominee" },
      { label: "Candidate C", candidate_position: "Chairperson Nominee" },
    ],
  },
  {
    id: "student-president",
    name: "Student Union President",
    description: "School or university student union presidential election.",
    category: "Education",
    icon: "🎓",
    voteType: "single",
    voterAccess: "email",
    titlePlaceholder: "Student Union Presidential Election 2026",
    descriptionPlaceholder: "All registered students are eligible to vote. Each student may cast one vote.",
    options: [
      { label: "Candidate A", candidate_position: "Presidential Candidate" },
      { label: "Candidate B", candidate_position: "Presidential Candidate" },
      { label: "Candidate C", candidate_position: "Presidential Candidate" },
    ],
  },
  {
    id: "board-directors",
    name: "Board of Directors",
    description: "Elect multiple board members in a single vote.",
    category: "Corporate",
    icon: "💼",
    voteType: "multiple",
    voterAccess: "email",
    titlePlaceholder: "Board of Directors Election 2026",
    descriptionPlaceholder: "Shareholders may vote for up to three candidates for the board.",
    options: [
      { label: "Candidate A", candidate_position: "Board Nominee" },
      { label: "Candidate B", candidate_position: "Board Nominee" },
      { label: "Candidate C", candidate_position: "Board Nominee" },
      { label: "Candidate D", candidate_position: "Board Nominee" },
    ],
  },
  {
    id: "church-pastor",
    name: "Church Leadership",
    description: "Elect a pastor, deacon, or elder from nominated candidates.",
    category: "Religious",
    icon: "⛪",
    voteType: "single",
    voterAccess: "email",
    titlePlaceholder: "Church Elder Election 2026",
    descriptionPlaceholder: "All adult members of the congregation are invited to vote.",
    options: [
      { label: "Candidate A", candidate_position: "Elder Nominee" },
      { label: "Candidate B", candidate_position: "Elder Nominee" },
    ],
  },
  {
    id: "community-poll",
    name: "Community Poll",
    description: "Open poll for community feedback or decisions.",
    category: "Community",
    icon: "🏘️",
    voteType: "single",
    voterAccess: "link",
    titlePlaceholder: "Community Decision — [Topic]",
    descriptionPlaceholder: "Share your preference. This poll is open to all community members.",
    options: [
      { label: "Option A" },
      { label: "Option B" },
      { label: "Option C" },
    ],
  },
  {
    id: "sports-captain",
    name: "Sports Captain",
    description: "Team vote to elect a captain or vice-captain.",
    category: "Sports",
    icon: "⚽",
    voteType: "single",
    voterAccess: "email",
    titlePlaceholder: "Team Captain Election — [Season]",
    descriptionPlaceholder: "Players vote for who should lead the team this season.",
    options: [
      { label: "Player A", candidate_position: "Captain Nominee" },
      { label: "Player B", candidate_position: "Captain Nominee" },
      { label: "Player C", candidate_position: "Captain Nominee" },
    ],
  },
  {
    id: "yes-no",
    name: "Yes / No Motion",
    description: "Put a motion to a vote — simple yes or no.",
    category: "General",
    icon: "✅",
    voteType: "single",
    voterAccess: "link",
    titlePlaceholder: "Motion: [Describe the motion]",
    descriptionPlaceholder: "Members vote to accept or reject the motion.",
    options: [
      { label: "Yes — I support this motion" },
      { label: "No — I oppose this motion" },
      { label: "Abstain" },
    ],
  },
  {
    id: "ranked-choice",
    name: "Ranked Preference",
    description: "Let voters rank options in order of preference.",
    category: "General",
    icon: "📊",
    voteType: "ranked",
    voterAccess: "link",
    titlePlaceholder: "Preference Vote — [Topic]",
    descriptionPlaceholder: "Rank your preferred option.",
    options: [
      { label: "Option A" },
      { label: "Option B" },
      { label: "Option C" },
    ],
  },
];

export const TEMPLATE_CATEGORIES = [...new Set(TEMPLATES.map((t) => t.category))];
