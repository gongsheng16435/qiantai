import { useMemo, useState } from 'react'
import { TopNav } from './components/TopNav'
import { HeroStage } from './components/HeroStage'
import { GameRail } from './components/GameRail'
import { StoryPanel } from './components/StoryPanel'
import { games, type Game } from './data/games'

export default function App(){
  const [selected,setSelected]=useState<Game>(games[0])
  const favorites=useMemo(()=>games.filter(g=>g.score>=94),[])
  const indie=useMemo(()=>games.filter(g=>g.platform==='Indie'),[])
  return <main><TopNav/><HeroStage game={selected}/>
    <section className="library-section" id="library">
      <div className="shell section-heading"><span className="eyebrow dark">Your collection</span><div className="heading-row"><h2>Made to be remembered.</h2><p>Twenty worlds, one personal archive. Select a cover and the whole room changes with it.</p></div></div>
      <div className="shell rail-block"><div className="rail-title"><h3>Recently played</h3><span>{games.length} games</span></div><GameRail games={games.slice(0,10)} selectedId={selected.id} onSelect={setSelected}/></div>
      <div className="shell rail-block"><div className="rail-title"><h3>Masterpieces</h3><span>94+ personal score</span></div><GameRail games={favorites} selectedId={selected.id} onSelect={setSelected}/></div>
      <div className="shell rail-block"><div className="rail-title"><h3>Independent worlds</h3><span>Small teams. Big memories.</span></div><GameRail games={indie} selectedId={selected.id} onSelect={setSelected}/></div>
    </section>
    <section className="statement"><div className="shell"><span>YOUR LIBRARY</span><h2>No feeds.<br/>No storefront.<br/><em>Just your games.</em></h2></div></section>
    <StoryPanel/><footer className="footer shell"><strong>LUMEN</strong><span>Personal Game Library · Prototype 0.1</span></footer>
  </main>
}
