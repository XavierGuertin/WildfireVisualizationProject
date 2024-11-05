import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingOverlay from "../src/app/components/LoadingOverlay";

describe('Test loading overlay component', () => {
  it('should render successfully', () => {
    render(<LoadingOverlay progress={10} isVisible={true}/>);
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('Loading Dataset...')).toBeInTheDocument();
  });
})
