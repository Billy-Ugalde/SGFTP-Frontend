import React from 'react';
import type { HeroSection } from '../services/informativeService';
import '../styles/public-view.css';

interface HeroProps {
  data: HeroSection;
}

const Hero: React.FC<HeroProps> = ({ data }) => {
  return (
    <section className="hero" id={data.id}>
      <div className="hero-content">
        <h1>{data.title}</h1>
        <p className="subtitle"><em>{data.subtitle}</em></p>
        <p>{data.description}</p>
      </div>
    </section>
  );
};

export default Hero;
