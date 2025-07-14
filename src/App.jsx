import React from 'react';
import CubeAnimation from './components/CubeAnimation';
import HeroSimulation from './components/HeroSimulation';
import GlowSections from './components/botaoAnimado';

export default function Landing() {
  return (
    <div>
      {/* SEÇÃO 1: Hero com animação de blocos */}
      <section style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        {/* Conteúdo do Hero atrás da animação */}
        <HeroSimulation />
        
        {/* Animação de blocos em canvas por cima */}
        <CubeAnimation />
      </section>

      {/* SEÇÃO 2: Botões animados */}
      <section>
        <GlowSections />
      </section>
    </div>
  );
}