import { motion } from 'framer-motion'
import type { Game } from '../data/games'

export function GameRail({ games, selectedId, onSelect }: { games:Game[], selectedId:string, onSelect:(g:Game)=>void }) {
  return <div className="rail" role="list">
    {games.map((game,index)=><motion.button key={game.id} role="listitem" className={`game-card ${game.id===selectedId?'selected':''}`} onClick={()=>onSelect(game)} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.2}} transition={{duration:.5,delay:Math.min(index*.04,.3)}} whileHover={{y:-8}}>
      <div className="poster-wrap"><img src={game.cover} alt=""/><div className="poster-shade"/><span className="poster-score">{game.score}</span></div>
      <span className="card-title">{game.title}</span><span className="card-meta">{game.status} · {game.platform}</span>
    </motion.button>)}
  </div>
}
