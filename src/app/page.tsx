import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Signature } from "@/components/sections/Signature";
import { HowTo } from "@/components/sections/HowTo";
import { Unit } from "@/components/sections/Unit";
import { Final } from "@/components/sections/Final";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Signature />
        <HowTo />
        <Unit />
        <Final />
      </main>
      <Footer />
    </>
  );
}
