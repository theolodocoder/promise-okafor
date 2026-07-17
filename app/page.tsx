import { Home } from "@/components/home";
import { StructuredData } from "@/components/structured-data";
import { PERSON_ID, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_LINKS, WEBSITE_ID } from "@/lib/site";

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: "Promise Okafor Portfolio",
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profile-page`,
        url: SITE_URL,
        name: "Promise Okafor — Senior Frontend Engineer",
        description: SITE_DESCRIPTION,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: SITE_NAME,
        url: SITE_URL,
        jobTitle: "Senior Frontend Engineer",
        description: SITE_DESCRIPTION,
        sameAs: SOCIAL_LINKS,
        knowsAbout: ["Frontend architecture", "Angular", "React", "Next.js", "TypeScript", "React Native", "Electron", "Web performance", "Accessibility", "Design systems"],
        worksFor: [{ "@type": "Organization", name: "Zabira" }, { "@type": "Organization", name: "Lightforth" }],
      },
    ],
  };

  return <><StructuredData data={structuredData} /><Home /></>;
}
