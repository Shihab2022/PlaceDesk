import Header from "@/components/homepage/Header";
import Hero from "@/components/homepage/Hero";
import TrustStrip from "@/components/homepage/TrustStrip";
import ProblemSection from "@/components/homepage/ProblemSection";
import ProductIntro from "@/components/homepage/ProductIntro";
import Capabilities from "@/components/homepage/Capabilities";
import LayerStory from "@/components/homepage/LayerStory";
import CityExplorer from "@/components/homepage/CityExplorer";
import UseCases from "@/components/homepage/UseCases";
import HowItWorks from "@/components/homepage/HowItWorks";
import DataTransformation from "@/components/homepage/DataTransformation";
import SearchExperience from "@/components/homepage/SearchExperience";
import Philosophy from "@/components/homepage/Philosophy";
import FinalCTA from "@/components/homepage/FinalCTA";
import Footer from "@/components/homepage/Footer";
import SpatialBackground from "@/components/homepage/SpatialBackground";

/**
 * PlaceDesk — marketing / product homepage.
 * Introduces the location-intelligence product and links to the live
 * workspace at /dashboard. Not the GIS application itself.
 */
export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SpatialBackground />
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <ProblemSection />
        <ProductIntro />
        <Capabilities />
        <LayerStory />
        <DataTransformation />
        <CityExplorer />
        <UseCases />
        <HowItWorks />
        <SearchExperience />
        <Philosophy />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
