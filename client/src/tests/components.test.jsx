import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, Button, Card, Input, Spinner } from '../components/ui';
import PasswordStrengthIndicator from '../components/ui/PasswordStrengthIndicator';

describe('Alert', () => {
  it('renders children text', () => {
    render(<Alert variant="error">Something went wrong</Alert>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    render(<Alert variant="success">Done!</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with error variant as alert role', () => {
    render(<Alert variant="error">Error!</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders optional title', () => {
    render(<Alert variant="info" title="Heads up">Details here</Alert>);
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Details here')).toBeInTheDocument();
  });
});

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('can be set to type="submit"', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('is disabled when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>No click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Full</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });
});

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="mt-4">Test</Card>);
    expect(container.firstChild).toHaveClass('mt-4');
  });

  it('renders as a different element when "as" prop is used', () => {
    render(<Card as="section">Section card</Card>);
    const el = screen.getByText('Section card');
    expect(el.tagName).toBe('SECTION');
  });
});

describe('Input', () => {
  it('renders with a label', () => {
    render(<Input id="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Input id="email" label="Email" error="Email is required" />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input id="email" label="Email" error="Required" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when there is no error', () => {
    render(<Input id="email" label="Email" />);
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
  });

  it('renders placeholder', () => {
    render(<Input id="email" label="Email" placeholder="you@example.com" />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('renders with status role', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('accepts custom label', () => {
    render(<Spinner label="Processing" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Processing');
  });
});

describe('PasswordStrengthIndicator', () => {
  it('renders nothing when password is empty', () => {
    const { container } = render(<PasswordStrengthIndicator password="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when password is undefined', () => {
    const { container } = render(<PasswordStrengthIndicator password={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows "Weak" for a weak password', () => {
    render(<PasswordStrengthIndicator password="a" />);
    expect(screen.getByText('Weak')).toBeInTheDocument();
  });

  it('shows "Strong" for a strong password', () => {
    render(<PasswordStrengthIndicator password="Strong1pass" />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('renders all 4 password rules', () => {
    render(<PasswordStrengthIndicator password="test" />);
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('One lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('One number')).toBeInTheDocument();
  });
});
