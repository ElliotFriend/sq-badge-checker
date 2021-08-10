import React from 'react'

/**
 * This component displays a simple footer on the bottom of the page. Nothing
 * too fancy here.
 */
export default function Footer() {
  return (
    <footer className="footer mt-auto py-3 bg-dark">
      <div className="container text-center">
        <span className="text-muted">Made with plenty of Adderall by <a className="text-decoration-none" target="_blank" rel="noreferrer" href="https://github.com/elliotfriend">ElliotFriend</a></span>
      </div>
    </footer>
  )
}
