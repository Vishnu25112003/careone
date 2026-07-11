import {
  Heart,
  BedSingle,
  Activity,
  Wind,
  Syringe,
  Stethoscope,
  Ambulance,
  HeartPulse,
} from "lucide-react";

// The 8 departments from the v2 design. `short` feeds the department grids,
// `long` + `points` feed the tabbed service detail on the Services page.
export const departments = [
  {
    slug: "elder-care",
    image: "/images/services/elder-care.avif",
    name: "Elder Care",
    icon: Heart,
    short: "Daily living support, companionship and medication reminders for seniors at home.",
    long: "Our trained caregivers support elders with everyday living — bathing, mobility, meals and medication reminders — while keeping families informed at every step. From gentle companionship to careful patient monitoring, we make sure your loved ones are never alone and always cared for with dignity.",
    points: "Daily living support · Companionship · Medication reminders · Monitoring",
  },
  {
    slug: "bedridden-patient-care",
    image: "/images/services/bedridden-patient-care.jpg",
    name: "Bedridden Patient Care",
    icon: BedSingle,
    short: "Hygienic, round-the-clock care for patients confined to bed.",
    long: "Bedridden patients need skilled, patient and hygienic care. Our nurses manage everything from bed sore prevention and careful repositioning to catheterization and Ryles tube feeding — keeping your loved one comfortable, clean and safe at home, day and night.",
    points: "Bed sore management · Catheterization · Ryles tube · Repositioning",
  },
  {
    slug: "stroke-patient-care",
    image: "/images/services/stroke-patient-care.webp",
    name: "Stroke Patient Care",
    icon: Activity,
    short: "Rehab support and monitoring for steady recovery at home.",
    long: "Stroke recovery takes consistency and encouragement. We bring physiotherapy, rehabilitation and mobility support to your home along with continuous vitals monitoring — so recovery never has to pause, and every small win is built upon.",
    points: "Physiotherapy at home · Rehab & mobility · Vitals monitoring",
  },
  {
    slug: "tracheostomy-patient-care",
    image: "/images/services/tracheostomy-patient-care.jpg",
    name: "Tracheostomy Patient Care",
    icon: Wind,
    short: "ICU-standard airway care with strict hygiene protocols.",
    long: "Tracheostomy care demands trained hands and strict hygiene. Our nurses handle airway management, suctioning and infection prevention with hospital-level protocols — bringing ICU-standard care into the comfort and safety of your home.",
    points: "Airway management · Suctioning · Infection prevention",
  },
  {
    slug: "post-operative-care",
    image: "/images/services/post-operative-care.avif",
    name: "Post Operative Care",
    icon: Syringe,
    short: "Monitored recovery after surgery, without hospital stays.",
    long: "Recovering after surgery is easier at home with the right support. We manage wound dressing, injections and IV therapy, coordinate doctor visits and monitor recovery closely — so healing stays on track without extended hospital stays.",
    points: "Wound dressing · Injections & IV · Doctor visits · Monitoring",
  },
  {
    slug: "medical-equipment-rental",
    image: "/images/services/medical-equipment-rental.jpg",
    name: "Medical Equipment Rental",
    icon: Stethoscope,
    short: "Hospital equipment delivered and installed at home.",
    long: "We deliver and set up hospital-grade equipment at your home, ready when you need it — oxygen concentrators, hospital beds, wheelchairs and suction machines — with guidance on safe use for the whole family.",
    points: "Oxygen concentrators · Hospital beds · Wheelchairs · Suction machines",
  },
  {
    slug: "ambulance-services",
    image: "/images/services/ambulance-services.jpg",
    name: "Ambulance Services",
    icon: Ambulance,
    short: "24/7 ambulance support for emergencies and transfers.",
    long: "Emergencies don’t wait, and neither do we. Our ambulance support is available 24/7 for emergencies and safe, comfortable hospital transfers — coordinated end-to-end by our care team.",
    points: "Emergency response · Hospital transfers · Round the clock",
  },
  {
    slug: "palliative-care",
    image: "/images/services/palliative-care.jpg",
    name: "Palliative Care",
    icon: HeartPulse,
    short: "Comfort-focused care for serious illness, with dignity.",
    long: "For patients living with serious illness, comfort matters most. Our palliative care focuses on pain management, day-to-day comfort and emotional support for both the patient and the family — delivered with warmth and dignity.",
    points: "Pain management · Comfort care · Family support",
  },
];

// The home page's department panel shows the first six.
export const homeDepartments = departments.slice(0, 6);

export const enquiryServiceOptions = [
  ...departments.map((d) => d.name),
  "Not sure — need guidance",
];
