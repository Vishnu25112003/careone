export const site = {
  name: "CareOne Nursing Services",
  tagline: "Compassionate Care. Professional Service. Better Life.",
  promise: "Your Care, Our Promise",
  familyLine: "We Care Like Family",
  phone: "8838562250",
  phoneDisplay: "88385 62250",
  whatsapp: "918838562250",
  email: "careone247@gmail.com",
  domain: "careonenursing.in",
  area: "Pondicherry & Surrounding Areas",
  hours: "24/7",
  social: [
    { name: "Facebook", href: "#" },
    { name: "Instagram", href: "#" },
    { name: "YouTube", href: "#" },
  ],
};

export const telHref = `tel:+91${site.phone}`;

export const mailHref = `mailto:${site.email}`;

export const waHref = (text = "") =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
