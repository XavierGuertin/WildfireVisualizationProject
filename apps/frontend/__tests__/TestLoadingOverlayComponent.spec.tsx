import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingOverlay from "../src/app/components/LoadingModule";

describe('Test LoadingOverlay component', () => {

  it('should render with initial progress', () => {
    render(<LoadingOverlay progress={10} isVisible={true} />);
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('Loading Dataset...')).toBeInTheDocument();
  });

  it('should update and display different progress values', () => {
    render(<LoadingOverlay progress={50} isVisible={true} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should display 0% correctly', () => {
    render(<LoadingOverlay progress={0} isVisible={true} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should display 100% correctly', () => {
    render(<LoadingOverlay progress={100} isVisible={true} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should not render anything when isVisible is false', () => {
    const { container } = render(<LoadingOverlay progress={50} isVisible={false} />);
    expect(container.firstChild).toBeNull();
  });

  // it('should apply correct width style based on progress', () => {
  //   render(<LoadingOverlay progress={75} isVisible={true} />);
  //   const progressBar = screen.getByText('75%').closest('.progress-bar');
  //   expect(progressBar).toHaveStyle('width: 75%');
  // });

});
