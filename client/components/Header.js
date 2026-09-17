import Link from "next/link";

function Header({ currentUser }) {
  const links = [
    !currentUser && { label: "Sign Up", href: "/auth/signup" },
    !currentUser && { label: "Sign In", href: "/auth/signin" },
    currentUser && { label: "Sign Out", href: "/auth/signout" },
  ]
    .filter((link) => link)
    .map(({ label, href }) => {
      return (
        <li className="nav-item" key={href}>
          <Link className="nav-link" href={href}>{label}</Link>
        </li>
      );
    });
  return (
    <nav className="navbar navbar-expand-lg navbar-light container">
      <Link className="navbar-brand" href="/">
        GTX
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">{links}</ul>
      </div>
    </nav>
  );
}

export default Header;
