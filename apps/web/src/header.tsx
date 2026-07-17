import { AppBar, TitlePortal, useRefresh } from "react-admin";
import { Link } from "react-router-dom";
import { ACTOR_CHANGED_EVENT, ACTOR_STORAGE_KEY, ACTORS } from "./data-provider";

export function AppHeader() {
  const refresh = useRefresh();
  const selected = localStorage.getItem(ACTOR_STORAGE_KEY) ?? ACTORS[0].token;
  const changeActor = (event: React.ChangeEvent<HTMLSelectElement>) => {
    localStorage.setItem(ACTOR_STORAGE_KEY, event.target.value);
    window.dispatchEvent(new Event(ACTOR_CHANGED_EVENT));
    refresh();
  };
  return (
    <AppBar color="primary">
      <TitlePortal />
      <nav className="top-nav" aria-label="Main navigation">
        <Link to="/honeymoon-periods">Ranked ideas</Link>
        <Link to="/capture">Save a link</Link>
      </nav>
      <label className="actor-select">
        <span>Acting as</span>
        <select aria-label="Acting as participant" defaultValue={selected} onChange={changeActor}>
          {ACTORS.map((actor) => (
            <option key={actor.id} value={actor.token}>
              {actor.name} — {actor.token}
            </option>
          ))}
        </select>
      </label>
    </AppBar>
  );
}
