import { Search, CircleUserRound } from 'lucide-react'

export function TopNav() {
  return <header className="topnav shell">
    <a className="brand" href="#top">LUMEN</a>
    <nav className="navlinks"><a className="active" href="#top">Home</a><a href="#library">Library</a><a href="#story">Timeline</a></nav>
    <div className="nav-actions"><button aria-label="Search"><Search size={18}/></button><button aria-label="Profile"><CircleUserRound size={20}/></button></div>
  </header>
}
