import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingModule from "../src/app/components/LoadingModule";

describe('Test LoadingModule component', () => {

  it('should render with initial progress', () => {
    render(<LoadingModule progress={10} isVisible={true} datasetBeingLoaded={"dataset 1"}/>);
    expect(screen.getByText(/10%/)).toBeInTheDocument();
    expect(screen.getByText(/Loading dataset/)).toBeInTheDocument();
    expect(screen.getByText(/dataset 1/)).toBeInTheDocument();
  });

  it('should update and display different progress values', () => {
    render(<LoadingModule progress={50} isVisible={true} datasetBeingLoaded={"dataset 1"}/>);
    expect(screen.getByText(/50%/)).toBeInTheDocument();
    expect(screen.getByText(/dataset 1/)).toBeInTheDocument();
  });

  it('should display 0% correctly', () => {
    render(<LoadingModule progress={0} isVisible={true} datasetBeingLoaded={"dataset 1"}/>);
    expect(screen.getByText(/0%/)).toBeInTheDocument();
    expect(screen.getByText(/dataset 1/)).toBeInTheDocument();
  });

  it('should display 100% correctly', () => {
    render(<LoadingModule progress={100} isVisible={true} datasetBeingLoaded={"dataset 1"}/>);
    expect(screen.getByText(/100%/)).toBeInTheDocument();
    expect(screen.getByText(/dataset 1/)).toBeInTheDocument();
  });

  it('should display dataset 2 correctly', () => {
    render(<LoadingModule progress={100} isVisible={true} datasetBeingLoaded={"dataset 2"}/>);
    expect(screen.getByText(/100%/)).toBeInTheDocument();
    expect(screen.getByText(/dataset 2/)).toBeInTheDocument();
  });

  it('should not render anything when isVisible is false', () => {
    const { container } = render(<LoadingModule progress={50} isVisible={false} datasetBeingLoaded={"dataset 1"}/>);
    expect(container.firstChild).toBeNull();
  });

  // it('should apply correct width style based on progress', () => {
  //   render(<LoadingOverlay progress={75} isVisible={true} />);
  //   const progressBar = screen.getByText('75%').closest('.progress-bar');
  //   expect(progressBar).toHaveStyle('width: 75%');
  // });

});
