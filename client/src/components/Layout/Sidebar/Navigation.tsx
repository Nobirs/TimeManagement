import NavLink from "./NavLink";

const Navigation = () => (
    <nav className="p-4">
              <NavLink to="/" icon="dashboard">Dashboard</NavLink>
              <NavLink to="/calendar" icon="calendar">Calendar</NavLink>
              <NavLink to="/tasks" icon="tasks">Tasks</NavLink>
              <NavLink to="/projects" icon="projects">Projects</NavLink>
              <NavLink to="/notes" icon="notes">Notes</NavLink>
              <NavLink to="/tracker" icon="tracker">Tracker</NavLink>
              <NavLink to="/goals" icon="goals">Goals</NavLink>
              <NavLink to="/habits" icon="habits">Habits</NavLink>
              <NavLink to="/pomodoro" icon="pomodoro" >Pomodoro Timer</NavLink>
              <NavLink to="/roadmap" icon="roadmap" >Roadmap</NavLink>
    </nav>
);

export default Navigation;