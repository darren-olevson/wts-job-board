import { DEFAULT_ABOUT_WTS } from "@/lib/constants/about-wts";
import { JobListing } from "@/lib/types";

export const seedJobs: JobListing[] = [
  {
    id: "product-product-operations-manager-01",
    title: "Product Operations Manager",
    team: "Product",
    location: "Remote",
    type: "Full-time",
    aboutWts: DEFAULT_ABOUT_WTS,
    aboutTeam: "",
    aboutRole:
      "Drive operational excellence across product workflows, tooling, and cross-functional processes. You'll partner closely with product managers, engineers, and business stakeholders to streamline how we build and ship.",
    postedAt: "2026-02-20T00:00:00.000Z",
  },
  {
    id: "product-senior-product-manager-01",
    title: "Senior Product Manager",
    team: "Product",
    location: "Remote",
    type: "Full-time",
    aboutWts: DEFAULT_ABOUT_WTS,
    aboutTeam: "",
    aboutRole:
      "Own discovery, prioritization, and delivery for platform initiatives. Partner with design, engineering, and operations to align outcomes with company goals.",
    postedAt: "2026-02-19T00:00:00.000Z",
  },
  {
    id: "eng-senior-software-engineer-01",
    title: "Senior Software Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
    aboutWts: DEFAULT_ABOUT_WTS,
    aboutTeam: "",
    aboutRole:
      "Build and scale backend services and client-facing products. Work across the stack to deliver high-impact features, improve reliability, and collaborate closely with product and operations teams.",
    postedAt: "2026-02-18T00:00:00.000Z",
  },
  {
    id: "eng-ios-software-engineer-01",
    title: "Intermediate/Senior iOS Software Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
    aboutWts: DEFAULT_ABOUT_WTS,
    aboutTeam: "",
    aboutRole:
      "Design, build, and ship native iOS experiences for WTS products. Collaborate with product and backend teams to deliver performant, polished mobile applications.",
    postedAt: "2026-02-17T00:00:00.000Z",
  },
];
