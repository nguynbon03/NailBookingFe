import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import PriceList from "@/components/PriceList";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-0">
        <Hero />
        <About />
        <Services />
        <PriceList />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
