import React from 'react';
import { render, screen } from '@testing-library/react';
import Test from '../src/components/Test';
import '@testing-library/jest-dom';

describe('Test component', () => {
  it('should render successfully', () => {
    render(<Test />);
    expect(screen.getByText('Hello, Next.js')).toBeInTheDocument();
    expect(screen.getByText('This is a test page.')).toBeInTheDocument();
  });
})