import { render, screen } from '@testing-library/react';
import App from './App';

test('renders my github link', () => {
  render(<App />)
  const linkElement = screen.getByText(/ElliotFriend/)
  expect(linkElement).toBeInTheDocument()
})
