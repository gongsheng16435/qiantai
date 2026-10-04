import { AnimatePresence, motion } from 'framer-motion'
import { Play, Plus } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { Game } from '../data/games'

export function HeroStage({ game }: { game: Game }) {
  return <section className="hero" id="top" style={{'--accent': game.accent} as CSSProperties}>
    <AnimatePresence mode="popLayout">
      <motion.div key={game.id} className="hero-image" initial={{opacity:0,scale:1.035}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:.9,ease:[.22,1,.36,1]}} style={{backgroundImage:`url(${game.hero})`}}/>
    </AnimatePresence>
    <div className="hero-scrim"/><div className="hero-ambient"/>
    <div className="shell hero-content">
      <AnimatePresence mode="wait">
        <motion.div key={game.id+'copy'} className="hero-copy" initial={{opacity:0,y:26}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:.55,ease:[.22,1,.36,1]}}>
          <span className="eyebrow">Featured in your library</span>
          <h1>{game.title}</h1><p className="kicker">{game.kicker}</p><p className="hero-description">{game.description}</p>
          <div className="meta-row"><span>{game.year}</span><i/><span>{game.genre}</span><i/><span>{game.playtime}h played</span></div>
          <div className="hero-actions"><button className="primary"><Play fill="currentColor" size={17}/> Open</button><button className="secondary"><Plus size={18}/> My list</button></div>
        </motion.div>
      </AnimatePresence>
      <div className="score-orbit"><strong>{game.score}</strong><span>YOUR SCORE</span></div>
    </div>
    <a className="scroll-cue" href="#library"><span/>Explore library</a>
  </section>
}
