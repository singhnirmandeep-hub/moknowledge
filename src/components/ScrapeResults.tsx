import type { ReactNode } from "react";
import type {
  CompanyFoundation,
  FaqEntry,
  Gender,
  KeyPerson,
  KnowledgeBase,
  Offering,
  OfferingCategory,
  SocialPlatform,
} from "@/types/knowledge";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";

const PLATFORMS: SocialPlatform[] = ["linkedin", "facebook", "instagram", "twitter", "youtube", "tiktok"];
const CATEGORIES: OfferingCategory[] = ["product", "service", "package", "property", "other"];
const GENDERS: Gender[] = ["male", "female", "unknown"];

// Returns a new list with one item changed. The original list is not modified.
function updateAt<T>(list: T[], index: number, patch: Partial<T>): T[] {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

// Returns a new list without the item at the given index
function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

// One label on the left, one input on the right
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="sm:col-span-2">{children}</span>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  multiline?: boolean;
}) {
  const handle = (raw: string) => onChange(raw.trim() === "" ? null : raw);
  return (
    <Row label={label}>
      {multiline ? (
        <textarea
          rows={3}
          value={value ?? ""}
          onChange={(e) => handle(e.target.value)}
          placeholder="Not found"
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => handle(e.target.value)}
          placeholder="Not found"
          className={inputClass}
        />
      )}
    </Row>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <Row label={label}>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        placeholder="Not found"
        className={inputClass}
      />
    </Row>
  );
}

// Lists are edited as one item per line
function ListField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <Row label={label}>
      <textarea
        rows={2}
        value={items.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        placeholder="One per line"
        className={inputClass}
      />
    </Row>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70 transition hover:shadow-md">
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
      <div className="p-6">
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h3>
        <div className="mt-2 divide-y divide-gray-100">{children}</div>
      </div>
    </section>
  );
}

// A box around one offering, person, or FAQ, with a Remove button
function ItemCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">{title || "Untitled"}</p>
        <button type="button" onClick={onRemove} className="text-sm text-red-600 hover:text-red-700">
          Remove
        </button>
      </div>
      <div className="mt-1 divide-y divide-gray-200">{children}</div>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
    >
      + {label}
    </button>
  );
}

export default function ScrapeResults({
  kb,
  onChange,
}: {
  kb: KnowledgeBase;
  onChange: (next: KnowledgeBase) => void;
}) {
  const f = kb.foundation;
  const links = kb.online.socialLinks;

  // Each helper creates a new knowledge base with one section changed
  const setFoundation = (patch: Partial<CompanyFoundation>) =>
    onChange({ ...kb, foundation: { ...f, ...patch } });
  const setPositioning = (patch: Partial<KnowledgeBase["positioning"]>) =>
    onChange({ ...kb, positioning: { ...kb.positioning, ...patch } });
  const setMarket = (patch: Partial<KnowledgeBase["market"]>) =>
    onChange({ ...kb, market: { ...kb.market, ...patch } });
  const setBranding = (patch: Partial<KnowledgeBase["branding"]>) =>
    onChange({ ...kb, branding: { ...kb.branding, ...patch } });
  const setLinks = (next: KnowledgeBase["online"]["socialLinks"]) =>
    onChange({ ...kb, online: { socialLinks: next } });
  const setPeople = (next: KeyPerson[]) => onChange({ ...kb, keyPeople: next });
  const setOfferings = (next: Offering[]) => onChange({ ...kb, offerings: next });
  const setFaqs = (next: FaqEntry[]) => onChange({ ...kb, content: { ...kb.content, faqs: next } });
  const setTrust = (patch: Partial<KnowledgeBase["trust"]>) =>
    onChange({ ...kb, trust: { ...kb.trust, ...patch } });
  const setLegal = (patch: Partial<KnowledgeBase["legal"]>) =>
    onChange({ ...kb, legal: { ...kb.legal, ...patch } });

  return (
    <div className="space-y-6">
      <Card title="Company Foundation">
        <TextField label="Name" value={f.name} onChange={(v) => setFoundation({ name: v ?? "" })} />
        <TextField label="Website" value={f.website} onChange={(v) => setFoundation({ website: v ?? "" })} />
        <TextField label="Description" value={f.description} multiline onChange={(v) => setFoundation({ description: v ?? "" })} />
        <TextField label="Industry" value={f.industry} onChange={(v) => setFoundation({ industry: v ?? "" })} />
        <TextField label="Business model" value={f.businessModel} multiline onChange={(v) => setFoundation({ businessModel: v })} />
        <TextField label="Company role" value={f.companyRole} onChange={(v) => setFoundation({ companyRole: v })} />
        <NumberField label="Year founded" value={f.yearFounded} onChange={(v) => setFoundation({ yearFounded: v })} />
        <TextField label="Legal entity type" value={f.legalEntityType} onChange={(v) => setFoundation({ legalEntityType: v })} />
        <NumberField label="Employee count" value={f.employeeCount} onChange={(v) => setFoundation({ employeeCount: v })} />
        <TextField label="Main address" value={f.mainAddress} onChange={(v) => setFoundation({ mainAddress: v })} />
        <ListField label="Other locations" items={f.otherLocations} onChange={(v) => setFoundation({ otherLocations: v })} />
        <ListField label="Service locations" items={f.serviceLocations} onChange={(v) => setFoundation({ serviceLocations: v })} />
        <ListField label="Alternative names" items={f.altNames} onChange={(v) => setFoundation({ altNames: v })} />
      </Card>

      <Card title="Positioning">
        <TextField label="Pitch" value={kb.positioning.pitch} multiline onChange={(v) => setPositioning({ pitch: v })} />
        <TextField label="Founding story" value={kb.positioning.foundingStory} multiline onChange={(v) => setPositioning({ foundingStory: v })} />
        <ListField label="Unique selling points" items={kb.positioning.uniqueSellingPoints} onChange={(v) => setPositioning({ uniqueSellingPoints: v })} />
        <ListField label="Differentiators" items={kb.positioning.differentiators} onChange={(v) => setPositioning({ differentiators: v })} />
      </Card>

      <Card title="Market & Customers">
        <ListField label="Buyers" items={kb.market.buyers} onChange={(v) => setMarket({ buyers: v })} />
        <TextField label="Customer needs" value={kb.market.customerNeeds} multiline onChange={(v) => setMarket({ customerNeeds: v })} />
        <TextField label="Ideal persona" value={kb.market.idealPersona} multiline onChange={(v) => setMarket({ idealPersona: v })} />
        <ListField label="Industry groupings" items={kb.market.industryGroupings} onChange={(v) => setMarket({ industryGroupings: v })} />
        <TextField label="Industry outlook" value={kb.market.industryOutlook} multiline onChange={(v) => setMarket({ industryOutlook: v })} />
        <ListField label="Channels" items={kb.market.channels} onChange={(v) => setMarket({ channels: v })} />
        <ListField label="Funnels" items={kb.market.funnels} onChange={(v) => setMarket({ funnels: v })} />
        <ListField label="CTAs" items={kb.market.ctas} onChange={(v) => setMarket({ ctas: v })} />
        <ListField label="Suppliers" items={kb.market.suppliers} onChange={(v) => setMarket({ suppliers: v })} />
      </Card>

      <Card title="Branding & Style">
        <TextField label="Writing style" value={kb.branding.writingStyle} multiline onChange={(v) => setBranding({ writingStyle: v })} />
        <TextField label="Art style" value={kb.branding.artStyle} multiline onChange={(v) => setBranding({ artStyle: v })} />
        <ListField label="Fonts" items={kb.branding.fonts} onChange={(v) => setBranding({ fonts: v })} />
        <ListField label="Colors" items={kb.branding.colors} onChange={(v) => setBranding({ colors: v })} />
        <ListField label="Logos" items={kb.branding.logos} onChange={(v) => setBranding({ logos: v })} />
      </Card>

      <Card title="Online Presence">
        {PLATFORMS.map((platform) => (
          <TextField
            key={platform}
            label={platform}
            value={links[platform] ?? null}
            onChange={(v) => setLinks({ ...links, [platform]: v ?? undefined })}
          />
        ))}
      </Card>

      <Card title={`Key People (${kb.keyPeople.length})`}>
        {kb.keyPeople.map((person, i) => (
          <ItemCard
            key={i}
            title={person.name}
            onRemove={() => setPeople(removeAt(kb.keyPeople, i))}
          >
            <TextField label="Name" value={person.name} onChange={(v) => setPeople(updateAt(kb.keyPeople, i, { name: v ?? "" }))} />
            <TextField label="Title" value={person.title} onChange={(v) => setPeople(updateAt(kb.keyPeople, i, { title: v }))} />
            <Row label="Gender">
              <select
                value={person.gender}
                onChange={(e) => setPeople(updateAt(kb.keyPeople, i, { gender: e.target.value as Gender }))}
                className={inputClass}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Row>
            <TextField label="Background" value={person.background} multiline onChange={(v) => setPeople(updateAt(kb.keyPeople, i, { background: v }))} />
          </ItemCard>
        ))}
        <AddButton
          label="Add person"
          onClick={() => setPeople([...kb.keyPeople, { name: "", title: null, gender: "unknown", background: null }])}
        />
      </Card>

      <Card title={`Offerings (${kb.offerings.length})`}>
        {kb.offerings.map((o, i) => (
          <ItemCard key={i} title={o.name} onRemove={() => setOfferings(removeAt(kb.offerings, i))}>
            <TextField label="Name" value={o.name} onChange={(v) => setOfferings(updateAt(kb.offerings, i, { name: v ?? "" }))} />
            <Row label="Category">
              <select
                value={o.category}
                onChange={(e) => setOfferings(updateAt(kb.offerings, i, { category: e.target.value as OfferingCategory }))}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Row>
            <TextField label="Pricing" value={o.pricing} onChange={(v) => setOfferings(updateAt(kb.offerings, i, { pricing: v }))} />
            <TextField label="Description" value={o.description} multiline onChange={(v) => setOfferings(updateAt(kb.offerings, i, { description: v ?? "" }))} />
          </ItemCard>
        ))}
        <AddButton
          label="Add offering"
          onClick={() =>
            setOfferings([...kb.offerings, { name: "", category: "service", description: "", features: [], pricing: null }])
          }
        />
      </Card>

      <Card title={`FAQs (${kb.content.faqs.length})`}>
        {kb.content.faqs.map((faq, i) => (
          <ItemCard key={i} title={faq.question} onRemove={() => setFaqs(removeAt(kb.content.faqs, i))}>
            <TextField label="Question" value={faq.question} onChange={(v) => setFaqs(updateAt(kb.content.faqs, i, { question: v ?? "" }))} />
            <TextField label="Answer" value={faq.answer} multiline onChange={(v) => setFaqs(updateAt(kb.content.faqs, i, { answer: v ?? "" }))} />
            {faq.sourceUrl && (
              <Row label="Source">
                <span className="text-sm text-gray-500">{faq.sourceUrl}</span>
              </Row>
            )}
          </ItemCard>
        ))}
        <AddButton
          label="Add FAQ"
          onClick={() => setFaqs([...kb.content.faqs, { question: "", answer: "" }])}
        />
      </Card>

      <Card title="Trust & Legal">
        <ListField label="Certifications" items={kb.trust.certifications} onChange={(v) => setTrust({ certifications: v })} />
        <ListField label="Awards" items={kb.trust.awards} onChange={(v) => setTrust({ awards: v })} />
        <NumberField label="Years in business" value={kb.trust.yearsInBusiness} onChange={(v) => setTrust({ yearsInBusiness: v })} />
        <TextField label="Privacy policy" value={kb.legal.privacyPolicyUrl} onChange={(v) => setLegal({ privacyPolicyUrl: v })} />
      </Card>
    </div>
  );
}