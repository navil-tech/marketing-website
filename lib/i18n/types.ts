export type Locale = "ru" | "en" | "he";

export type TextDirection = "ltr" | "rtl";

export type NavKey = "shippers" | "carriers" | "about";

export type ActiveNav = NavKey | "none";

export interface LinkedText {
  before: string;
  link: string;
  after: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Step {
  title: string;
  text: string;
}

export interface Offer {
  name: string;
  price: string;
  meta: string;
}

export interface Order {
  route: string;
  what: string;
  when: string;
}

export interface HeaderDictionary {
  brand: string;
  nav: Record<NavKey, string>;
  themeToggle: string;
  openMenu: string;
  closeMenu: string;
  menuLabel: string;
  language: string;
  languageGroup: string;
  languages: Record<Locale, string>;
  languagesLong: Record<Locale, string>;
  carrierCta: string;
  shipperCta: string;
}

export interface FooterDictionary {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailValue: string;
  phoneLabel: string;
  phoneValue: string;
  brand: string;
  description: string;
  serviceTitle: string;
  documentsTitle: string;
  privacy: string;
  terms: string;
  contactTitle: string;
  whatsapp: string;
  email: string;
  copyright: string;
}

export interface FieldsDictionary {
  name: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phoneHint: string;
  phonePlaceholder: string;
  region: string;
  regionPlaceholder: string;
  vehicle: string;
  vehiclePlaceholder: string;
}

export interface LeadFormDictionary {
  title: string;
  subtitle: string;
  submit: string;
  consent: LinkedText;
  regions: string[];
}

export interface LeadCardDictionary {
  eyebrow: string;
  title: string;
  text: string;
  submit: string;
  mobileCta: string;
  consent: LinkedText;
}

export interface FaqDictionary {
  title: string;
  text: string;
  cta: string;
  items: FaqItem[];
}

export interface PhoneDemoDictionary {
  title: string;
  time: string;
  cargo: string;
  from: string;
  to: string;
  statusSearching: string;
  statusResponding: string;
  statusFound: string;
  responseWords: string[];
  offers: Offer[];
  tagNew: string;
  tagPicked: string;
  footnote: string;
}

export interface ShippersDictionary {
  metaTitle: string;
  eyebrow: string;
  title: string;
  lead: string;
  heroCta: string;
  checklist: string[];
  note: string;
  form: LeadFormDictionary;
  how: {
    title: string;
    subtitle: string;
    steps: Step[];
    cta: string;
    caption: string;
    demo: PhoneDemoDictionary;
  };
  leadCard: LeadCardDictionary;
  faq: FaqDictionary;
}

export interface CarriersDictionary {
  metaTitle: string;
  eyebrow: string;
  title: string;
  lead: string;
  heroCta: string;
  checklist: string[];
  note: string;
  form: LeadFormDictionary;
  feed: {
    title: string;
    text: string;
    feedTitle: string;
    example: string;
    badge: string;
    badgeShort: string;
    orders: Order[];
  };
  price: {
    title: string;
    amount: string;
    now: string;
    free: string;
    text: string;
    founderBadge: string;
    founderText: string;
    cta: string;
  };
  leadCard: LeadCardDictionary;
  faq: FaqDictionary;
}

export interface AboutFact {
  title: string;
  text: string;
  mobileText: string;
}

export interface AboutDictionary {
  metaTitle: string;
  eyebrow: string;
  title: string;
  lead: string;
  paragraphs: string[];
  israel: {
    title: string;
    facts: AboutFact[];
  };
  shipperCard: { eyebrow: string; title: string };
  carrierCard: { eyebrow: string; title: string };
}

export interface ThanksDictionary {
  metaTitle: string;
  title: string;
  text: LinkedText;
  home: string;
}

export interface Dictionary {
  header: HeaderDictionary;
  footer: FooterDictionary;
  fields: FieldsDictionary;
  shippers: ShippersDictionary;
  carriers: CarriersDictionary;
  about: AboutDictionary;
  thanks: ThanksDictionary;
}
