import { DEFAULT_ABOUT_WTS } from "@/lib/constants/about-wts";
import { JobListing } from "@/lib/types";

export const seedJobs: JobListing[] = [
  {
    id: "eng-fullstack-01",
    title: "Full Stack Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
    aboutWts: DEFAULT_ABOUT_WTS,
    aboutTeam:
      "The engineering team owns the core platform powering internal workflows and customer-facing experiences.",
    aboutRole:
      "Work across Next.js and backend services to deliver high-impact features, improve reliability, and collaborate closely with operations and product teams.",
    postedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "pm-platform-01",
    title: "Product Manager, Platform",
    team: "Product Management",
    location: "Remote",
    type: "Full-time",
    aboutWts: DEFAULT_ABOUT_WTS,
    aboutTeam:
      "The platform product team defines and prioritizes initiatives that unlock scale across the business.",
    aboutRole:
      "Own discovery, prioritization, and delivery for platform initiatives. Partner with design, engineering, and operations to align outcomes with company goals.",
    postedAt: "2026-02-03T00:00:00.000Z",
  },
  {
    id: "design-product-01",
    title: "Product Designer",
    team: "Design",
    location: "Remote",
    type: "Full-time",
    aboutWts: DEFAULT_ABOUT_WTS,
    aboutTeam:
      "Design works closely with product and engineering to simplify complex operational workflows.",
    aboutRole:
      "Shape experiences from concept to implementation, produce high-fidelity UI, and collaborate on research to make operational tools simple and effective.",
    postedAt: "2026-02-04T00:00:00.000Z",
  },
  {
    id: "marketing-growth-01",
    title: "Growth Marketing Manager",
    team: "Marketing",
    location: "Remote",
    type: "Full-time",
    aboutWts: DEFAULT_ABOUT_WTS,
    aboutTeam:
      "The growth team drives awareness, demand generation, and measurable pipeline impact.",
    aboutRole:
      "Lead multi-channel growth experiments, messaging strategy, and funnel optimization with a data-driven approach and close partnership with sales.",
    postedAt: "2026-02-05T00:00:00.000Z",
  },
  {
    id: "ops-coordinator-01",
    title: "Operations Coordinator",
    team: "Operations",
    location: "Remote",
    type: "Full-time",
    aboutWts: DEFAULT_ABOUT_WTS,
    aboutTeam:
      "Operations coordinates execution across teams to keep service delivery consistent and reliable.",
    aboutRole:
      "Support day-to-day operational execution, monitor service quality, and improve SOP adherence across internal and partner teams.",
    postedAt: "2026-02-06T00:00:00.000Z",
  },
];
