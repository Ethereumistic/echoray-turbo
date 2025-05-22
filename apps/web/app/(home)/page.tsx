import { showBetaFeature } from '@repo/feature-flags';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { Cases } from './components/cases';
import { CTA } from './components/cta';
import { FAQ } from './components/faq';
import { Features } from './components/features';
import { Hero } from './components/hero';
import { Stats } from './components/stats';
import { Testimonials } from './components/testimonials';
import { Funnel } from './components/funnel';
import { Services } from './components/services';
import { Process } from './components/process';
import { Benefits } from './components/benefits';

const meta = {
  title: 'EchoRay',
  description:
    "EchoRay is a full-service digital agency that specializes in creating a wide range of web applications, including portfolios, blogs, document management systems, databases, and AI integrations.",
};

export const metadata: Metadata = createMetadata(meta);

const Home = async () => {
  const betaFeature = await showBetaFeature();

  return (
    <>
      {betaFeature && (
        <div className="w-full bg-black py-2 text-center text-white">
          Beta feature now available
        </div>
      )}
      <Hero />
      <Services />
      <Process />
      <Benefits />
      {/* <Cases />
      <Features />
      <Funnel />
      <Stats />
      <Testimonials /> */}
      <FAQ />
      <CTA />
    </>
  );
};

export default Home;
