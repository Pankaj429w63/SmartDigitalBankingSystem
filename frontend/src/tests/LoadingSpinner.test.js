/**
 * LoadingSpinner.test.js — Jest + React Testing Library example
 * Tests the LoadingSpinner component in multiple configurations
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

describe('LoadingSpinner Component', () => {

  // Test 1: Renders with default props
  test('renders loading text by default', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  // Test 2: Renders custom text
  test('renders custom loading text when provided', () => {
    render(<LoadingSpinner text="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  // Test 3: Does not render text when text prop is empty
  test('does not render text element when text is empty string', () => {
    render(<LoadingSpinner text="" />);
    const textEl = screen.queryByText('Loading...');
    expect(textEl).not.toBeInTheDocument();
  });

  // Test 4: Renders full screen overlay
  test('renders full-screen overlay when fullScreen is true', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    const overlay = container.querySelector('.loading-overlay');
    expect(overlay).toBeInTheDocument();
  });

  // Test 5: Does NOT render overlay when fullScreen is false
  test('does not render full-screen overlay by default', () => {
    const { container } = render(<LoadingSpinner />);
    const overlay = container.querySelector('.loading-overlay');
    expect(overlay).not.toBeInTheDocument();
  });

  // Test 6: Spinner element is present
  test('contains a spinning div element', () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerDiv = container.querySelector('div[style*="border-radius: 50%"]');
    expect(spinnerDiv).toBeInTheDocument();
  });

});
