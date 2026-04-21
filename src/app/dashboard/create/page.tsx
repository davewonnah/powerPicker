"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPoll, uploadImage } from "@/lib/api";
import { TEMPLATES, TEMPLATE_CATEGORIES, type ElectionTemplate } from "@/lib/templates";

type VoteType = "single" | "multiple" | "ranked";

interface Option {
  id: string;
  label: string;
  candidate_position: string;
  party: string;
  bio: string;
  image_url: string;
}

interface Voter {
  id: string;
  name: string;
  email: string;
  code: string;
  weight: string;
}

const COMMON_COUNTRIES: { code: string; name: string }[] = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" }, { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" }, { code: "AZ", name: "Azerbaijan" }, { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" }, { code: "BD", name: "Bangladesh" }, { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" }, { code: "BE", name: "Belgium" }, { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" }, { code: "BT", name: "Bhutan" }, { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" }, { code: "BW", name: "Botswana" }, { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" }, { code: "BG", name: "Bulgaria" }, { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" }, { code: "CV", name: "Cabo Verde" }, { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" }, { code: "CA", name: "Canada" }, { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" }, { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" }, { code: "KM", name: "Comoros" }, { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo (DRC)" }, { code: "CR", name: "Costa Rica" }, { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatia" }, { code: "CU", name: "Cuba" }, { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" }, { code: "DK", name: "Denmark" }, { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" }, { code: "DO", name: "Dominican Republic" }, { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" }, { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" }, { code: "EE", name: "Estonia" }, { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" }, { code: "FJ", name: "Fiji" }, { code: "FI", name: "Finland" },
  { code: "FR", name: "France" }, { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" }, { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" }, { code: "GD", name: "Grenada" }, { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" }, { code: "GW", name: "Guinea-Bissau" }, { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" }, { code: "HN", name: "Honduras" }, { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" }, { code: "IN", name: "India" }, { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" }, { code: "IQ", name: "Iraq" }, { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" }, { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" }, { code: "JO", name: "Jordan" }, { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" }, { code: "KI", name: "Kiribati" }, { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" }, { code: "LA", name: "Laos" }, { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" }, { code: "LS", name: "Lesotho" }, { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" }, { code: "LI", name: "Liechtenstein" }, { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" }, { code: "MG", name: "Madagascar" }, { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" }, { code: "MV", name: "Maldives" }, { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" }, { code: "MH", name: "Marshall Islands" }, { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" }, { code: "MX", name: "Mexico" }, { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" }, { code: "MC", name: "Monaco" }, { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" }, { code: "MA", name: "Morocco" }, { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" }, { code: "NA", name: "Namibia" }, { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" }, { code: "NL", name: "Netherlands" }, { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" }, { code: "NE", name: "Niger" }, { code: "NG", name: "Nigeria" },
  { code: "KP", name: "North Korea" }, { code: "MK", name: "North Macedonia" }, { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" }, { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" }, { code: "PG", name: "Papua New Guinea" }, { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "QA", name: "Qatar" }, { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" }, { code: "RW", name: "Rwanda" }, { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" }, { code: "VC", name: "Saint Vincent and the Grenadines" }, { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" }, { code: "ST", name: "Sao Tome and Principe" }, { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" }, { code: "RS", name: "Serbia" }, { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" }, { code: "SG", name: "Singapore" }, { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" }, { code: "SB", name: "Solomon Islands" }, { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" }, { code: "KR", name: "South Korea" }, { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" }, { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" }, { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" }, { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" }, { code: "TH", name: "Thailand" }, { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" }, { code: "TO", name: "Tonga" }, { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" }, { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" }, { code: "UG", name: "Uganda" }, { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" }, { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" }, { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" }, { code: "VN", name: "Vietnam" }, { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" }, { code: "ZW", name: "Zimbabwe" },
];

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += "-";
  }
  return code;
}

const voteTypes: { value: VoteType; label: string; description: string }[] = [
  { value: "single", label: "Single Choice", description: "Voters pick one option." },
  { value: "multiple", label: "Multiple Choice", description: "Voters can select more than one option." },
  { value: "ranked", label: "Ranked Choice", description: "Voters rank options by preference." },
];

export default function CreateVotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [voteType, setVoteType] = useState<VoteType>("single");
  const [options, setOptions] = useState<Option[]>([
    { id: "1", label: "", candidate_position: "", party: "", bio: "", image_url: "" },
    { id: "2", label: "", candidate_position: "", party: "", bio: "", image_url: "" },
  ]);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [voterAccess, setVoterAccess] = useState<"link" | "email">("link");
  const [voters, setVoters] = useState<Voter[]>([]);
  const [newVoterName, setNewVoterName] = useState("");
  const [newVoterEmail, setNewVoterEmail] = useState("");
  const [quorum, setQuorum] = useState("");
  const [reminderHoursBefore, setReminderHoursBefore] = useState("");
  const [allowedCountries, setAllowedCountries] = useState<string[]>([]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bulkEmails, setBulkEmails] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadingOptions, setUploadingOptions] = useState<Set<string>>(new Set());
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  function applyTemplate(t: ElectionTemplate) {
    setTitle(t.titlePlaceholder);
    setDescription(t.descriptionPlaceholder);
    setVoteType(t.voteType);
    setVoterAccess(t.voterAccess);
    setOptions(
      t.options.map((o) => ({
        id: crypto.randomUUID(),
        label: o.label,
        candidate_position: o.candidate_position ?? "",
        party: o.party ?? "",
        bio: "",
        image_url: "",
      }))
    );
    setExpandedOption(null);
    setShowTemplates(false);
  }

  function addVoter() {
    if (!newVoterName.trim() || !newVoterEmail.trim()) return;
    setVoters([...voters, {
      id: crypto.randomUUID(),
      name: newVoterName.trim(),
      email: newVoterEmail.trim(),
      code: generateCode(),
      weight: "1",
    }]);
    setNewVoterName("");
    setNewVoterEmail("");
  }

  function addBulkVoters() {
    const lines = bulkEmails.split("\n").map((l) => l.trim()).filter(Boolean);
    const newVoters: Voter[] = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const email = parts.find((p) => p.includes("@")) || parts[0];
      const name = parts.find((p) => !p.includes("@")) || email.split("@")[0];
      return { id: crypto.randomUUID(), name, email, code: generateCode(), weight: "1" };
    });
    setVoters([...voters, ...newVoters]);
    setBulkEmails("");
    setShowBulkInput(false);
  }

  function removeVoter(id: string) {
    setVoters(voters.filter((v) => v.id !== id));
  }

  function regenerateCode(id: string) {
    setVoters(voters.map((v) => (v.id === id ? { ...v, code: generateCode() } : v)));
  }

  function copyCode(id: string, code: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function addOption() {
    setOptions([...options, { id: crypto.randomUUID(), label: "", candidate_position: "", party: "", bio: "", image_url: "" }]);
  }

  function removeOption(id: string) {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
    if (expandedOption === id) setExpandedOption(null);
  }

  function updateOption(id: string, field: keyof Option, value: string) {
    setOptions(options.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  }

  // Convert datetime-local value to ISO string
  function toISO(localDatetime: string): string | undefined {
    if (!localDatetime) return undefined;
    return new Date(localDatetime).toISOString();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uploadingOptions.size > 0) return;
    setError("");
    setSubmitting(true);
    try {
      const { poll } = await createPoll({
        title,
        description: description || undefined,
        voteType,
        voterAccess,
        startsAt: toISO(startDate),
        closesAt: toISO(endDate),
        quorum: quorum ? parseInt(quorum) : undefined,
        reminderHoursBefore: reminderHoursBefore ? parseInt(reminderHoursBefore) : undefined,
        allowedCountries: allowedCountries.length > 0 ? allowedCountries : undefined,
        options: options
          .filter((o) => o.label.trim())
          .map((o) => ({
            label: o.label.trim(),
            candidate_position: o.candidate_position.trim() || undefined,
            party: o.party.trim() || undefined,
            bio: o.bio.trim() || undefined,
            image_url: o.image_url.trim() || undefined,
          })),
        voters: voterAccess === "email" ? voters.map((v) => ({ name: v.name, email: v.email, code: v.code, weight: v.weight ? parseFloat(v.weight) : undefined })) : undefined,
      });
      router.push(`/dashboard/votes/${poll.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create vote");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredTemplates = activeCategory === "All"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Poll</h1>
          <p className="mt-1 text-sm text-slate-500">Set up a new election or poll for your group.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#1E3A8A]/30 bg-[#1E3A8A]/5 px-4 py-2.5 text-sm font-medium text-[#1E3A8A] hover:bg-[#1E3A8A]/10"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
          {showTemplates ? "Hide Templates" : "Use a Template"}
        </button>
      </div>

      {/* Template picker */}
      {showTemplates && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Election Templates</h2>
            <p className="text-sm text-slate-500 mt-0.5">Pick a template to pre-fill the form. You can edit anything afterwards.</p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {["All", ...TEMPLATE_CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-[#1E3A8A] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 text-left transition-all hover:border-[#1E3A8A]/40 hover:bg-[#1E3A8A]/5 hover:shadow-sm"
              >
                <span className="text-2xl shrink-0 mt-0.5">{t.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {t.voteType}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      t.voterAccess === "email"
                        ? "bg-blue-50 text-[#1E3A8A]"
                        : "bg-green-50 text-green-700"
                    }`}>
                      {t.voterAccess === "email" ? "invite only" : "open link"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Basic Info</h2>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Student Council President 2026"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Provide context or instructions for voters..."
            />
          </div>
        </section>

        {/* Vote type */}
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Vote Type</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {voteTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setVoteType(type.value)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  voteType === type.value
                    ? "border-blue-800 bg-blue-50 ring-2 ring-blue-800"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <p className={`text-sm font-semibold ${voteType === type.value ? "text-blue-900" : "text-slate-900"}`}>
                  {type.label}
                </p>
                <p className="mt-1 text-xs text-slate-500">{type.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Options / Candidates */}
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Options / Candidates</h2>
            <p className="mt-1 text-sm text-slate-500">Add a name for each candidate. Expand to fill in position, party, image and campaign message.</p>
          </div>
          <div className="space-y-3">
            {options.map((option, index) => {
              const expanded = expandedOption === option.id;
              const hasDetails = option.candidate_position || option.party || option.bio || option.image_url;
              return (
                <div key={option.id} className="rounded-lg border border-slate-200 bg-slate-50">
                  {/* Row */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-500">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={option.label}
                      onChange={(e) => updateOption(option.id, "label", e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder={`Candidate ${index + 1} name`}
                    />
                    <button
                      type="button"
                      onClick={() => setExpandedOption(expanded ? null : option.id)}
                      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        expanded ? "bg-blue-100 text-blue-900" : hasDetails ? "bg-blue-50 text-blue-800" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {expanded ? "Done" : "Details"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      disabled={options.length <= 2}
                      className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded details */}
                  {expanded && (
                    <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Position / Role</label>
                          <input
                            type="text"
                            value={option.candidate_position}
                            onChange={(e) => updateOption(option.id, "candidate_position", e.target.value)}
                            placeholder="e.g. President, Secretary"
                            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Party / Affiliation</label>
                          <input
                            type="text"
                            value={option.party}
                            onChange={(e) => updateOption(option.id, "party", e.target.value)}
                            placeholder="e.g. Independent, Team A"
                            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Photo</label>
                        <div className="flex items-center gap-3">
                          {option.image_url ? (
                            <img src={option.image_url} alt="" className="h-12 w-12 rounded-full object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className="h-12 w-12 shrink-0 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                              <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                              </svg>
                            </div>
                          )}
                          <label className={`flex-1 ${uploadingOptions.has(option.id) ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <div className={`flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm transition-colors ${
                              uploadingOptions.has(option.id)
                                ? "border-blue-200 bg-blue-50 text-blue-400"
                                : "border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-800"
                            }`}>
                              {uploadingOptions.has(option.id) ? (
                                <>
                                  <svg className="h-4 w-4 shrink-0 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  <span>Uploading…</span>
                                </>
                              ) : (
                                <>
                                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                  </svg>
                                  <span>{option.image_url ? "Change photo" : "Upload photo"}</span>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              disabled={uploadingOptions.has(option.id)}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 5 * 1024 * 1024) {
                                  setUploadErrors((prev) => ({ ...prev, [option.id]: "File must be under 5 MB" }));
                                  e.target.value = "";
                                  return;
                                }
                                setUploadErrors((prev) => { const n = { ...prev }; delete n[option.id]; return n; });
                                setUploadingOptions((prev) => new Set(prev).add(option.id));
                                try {
                                  const url = await uploadImage(file);
                                  updateOption(option.id, "image_url", url);
                                } catch (err) {
                                  setUploadErrors((prev) => ({ ...prev, [option.id]: err instanceof Error ? err.message : "Upload failed" }));
                                } finally {
                                  setUploadingOptions((prev) => { const n = new Set(prev); n.delete(option.id); return n; });
                                }
                                e.target.value = "";
                              }}
                            />
                          </label>
                          {option.image_url && !uploadingOptions.has(option.id) && (
                            <button
                              type="button"
                              onClick={() => updateOption(option.id, "image_url", "")}
                              className="shrink-0 rounded p-1 text-slate-400 hover:text-red-500"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {uploadErrors[option.id] && (
                          <p className="mt-1.5 text-xs text-red-600">{uploadErrors[option.id]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Campaign Message</label>
                        <textarea
                          rows={3}
                          value={option.bio}
                          onChange={(e) => updateOption(option.id, "bio", e.target.value)}
                          placeholder="Short campaign statement or bio..."
                          className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button type="button" onClick={addOption} className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-800 hover:text-blue-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add candidate
          </button>
        </section>

        {/* Schedule */}
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Schedule</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">
                Start date & time <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">
                End date & time <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="quorum" className="block text-sm font-medium text-slate-700">
                Quorum <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="quorum"
                type="number"
                min={1}
                value={quorum}
                onChange={(e) => setQuorum(e.target.value)}
                placeholder="e.g. 50"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">Auto-close the poll once this many votes are cast.</p>
            </div>
            <div>
              <label htmlFor="reminderHoursBefore" className="block text-sm font-medium text-slate-700">
                Voter reminder <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="reminderHoursBefore"
                type="number"
                min={1}
                value={reminderHoursBefore}
                onChange={(e) => setReminderHoursBefore(e.target.value)}
                placeholder="e.g. 24"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">Send a reminder email this many hours before close (email-access polls only).</p>
            </div>
          </div>

          {/* Geo-restriction */}
          <div>
            <button
              type="button"
              onClick={() => setShowCountryPicker(!showCountryPicker)}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-800 hover:text-blue-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              {allowedCountries.length > 0
                ? `Geo-restriction: ${allowedCountries.length} countr${allowedCountries.length === 1 ? "y" : "ies"} allowed`
                : "Restrict by country (optional)"}
            </button>

            {showCountryPicker && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <p className="text-xs text-slate-500">Only voters from the selected countries can cast a vote. Leave all unchecked to allow any country.</p>
                <input
                  type="text"
                  placeholder="Search countries…"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="max-h-56 overflow-y-auto grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                  {COMMON_COUNTRIES.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map((c) => (
                    <label key={c.code} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowedCountries.includes(c.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAllowedCountries([...allowedCountries, c.code]);
                          } else {
                            setAllowedCountries(allowedCountries.filter((x) => x !== c.code));
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{c.name}</span>
                    </label>
                  ))}
                </div>
                {allowedCountries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAllowedCountries([])}
                    className="text-xs text-slate-400 hover:text-red-500"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Voter access */}
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Voter Access</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { value: "link" as const, label: "Share via Link", desc: "Anyone with the link can vote. Great for quick polls." },
              { value: "email" as const, label: "Email Invite Only", desc: "Only invited email addresses can vote. Best for elections." },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVoterAccess(opt.value)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  voterAccess === opt.value
                    ? "border-blue-800 bg-blue-50 ring-2 ring-blue-800"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <p className={`text-sm font-semibold ${voterAccess === opt.value ? "text-blue-900" : "text-slate-900"}`}>
                  {opt.label}
                </p>
                <p className="mt-1 text-xs text-slate-500">{opt.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Voters (email access only) */}
        {voterAccess === "email" && (
          <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Voters</h2>
                <p className="mt-1 text-sm text-slate-500">Add voters and each will receive a unique voting code.</p>
              </div>
              {voters.length > 0 && (
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {voters.length} voter{voters.length !== 1 && "s"}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newVoterName}
                onChange={(e) => setNewVoterName(e.target.value)}
                placeholder="Name"
                className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-1/3"
              />
              <input
                type="email"
                value={newVoterEmail}
                onChange={(e) => setNewVoterEmail(e.target.value)}
                placeholder="Email address"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVoter(); }}}
                className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:flex-1"
              />
              <button
                type="button"
                onClick={addVoter}
                className="shrink-0 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
              >
                Add Voter
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowBulkInput(!showBulkInput)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-800 hover:text-blue-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                {showBulkInput ? "Hide bulk add" : "Bulk add voters"}
              </button>

              {showBulkInput && (
                <div className="mt-3 space-y-3">
                  <textarea
                    rows={4}
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    placeholder={"Name, email@example.com\nJane Smith, jane@example.com\njohn@example.com"}
                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                  <p className="text-xs text-slate-400">One voter per line. Format: Name, email — or just an email address.</p>
                  <button
                    type="button"
                    onClick={addBulkVoters}
                    className="rounded-lg border border-blue-800 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50"
                  >
                    Add All
                  </button>
                </div>
              )}
            </div>

            {voters.length > 0 && (
              <div className="space-y-2">
                <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-3 px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                  <span>Name</span>
                  <span>Email</span>
                  <span className="w-28 text-center">Voting Code</span>
                  <span className="w-16 text-center">Weight</span>
                  <span className="w-20" />
                </div>
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {voters.map((voter) => (
                    <div key={voter.id} className="flex flex-col gap-2 px-3 py-3 sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-center sm:gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{voter.name}</p>
                        <p className="text-xs text-slate-500 sm:hidden">{voter.email}</p>
                      </div>
                      <p className="hidden text-sm text-slate-600 sm:block">{voter.email}</p>
                      <div className="flex items-center gap-1.5">
                        <code className="w-28 rounded-md bg-slate-100 px-2.5 py-1.5 text-center text-sm font-semibold tracking-wider text-blue-900">
                          {voter.code}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyCode(voter.id, voter.code)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          {copiedId === voter.id ? (
                            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={voter.weight}
                          onChange={(e) => setVoters(voters.map((v) => v.id === voter.id ? { ...v, weight: e.target.value } : v))}
                          className="w-16 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-center text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-auto w-20 justify-end">
                        <button type="button" onClick={() => regenerateCode(voter.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => removeVoter(voter.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-400">Codes are single-use. Each voter enters their code to access the ballot.</p>
                  <button
                    type="button"
                    onClick={() => {
                      const csv = ["Name,Email,Voting Code", ...voters.map((v) => `${v.name},${v.email},${v.code}`)].join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "voter-codes.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-800 hover:text-blue-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export CSV
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/votes")}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingOptions.size > 0}
            className="rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 disabled:opacity-60"
          >
            {submitting ? "Creating…" : uploadingOptions.size > 0 ? "Uploading photos…" : "Create Poll"}
          </button>
        </div>
      </form>
    </div>
  );
}
