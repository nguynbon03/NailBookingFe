import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import NailMarquee from "@/components/NailMarquee";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-0">
        <Hero />
        <NailMarquee />
        <About />
        <Services />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
