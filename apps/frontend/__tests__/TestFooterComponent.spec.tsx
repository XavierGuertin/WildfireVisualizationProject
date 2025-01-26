import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../src/app/components/Footer';
import { toast } from 'react-toastify';
import { MapProvider } from '../src/app/components/MapContext';

jest.mock('react-toastify');
beforeEach(() => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => (store[key] = value || ''),
      clear: () => (store = {}),
    };
  })();
  Object.defineProperty(global, 'localStorage', { value: localStorageMock });
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('Footer component', () => {
  it('renders the footer with initial elements', () => {
    render(<MapProvider><Footer /></MapProvider>);

    // Verify speed buttons
    [0.5, 1, 1.5, 2, 4].forEach((speed) => {
      expect(screen.getByTestId(`speed-button-${speed}`)).toBeInTheDocument();
    });

    // Verify slider, play, and stop buttons
    expect(screen.getByTestId('slider')).toBeInTheDocument();
    expect(screen.getByTestId('play-pause-button')).toBeInTheDocument();
    expect(screen.getByTestId('stop-button')).toBeInTheDocument();
    expect(screen.getByTestId('play-icon')).toBeInTheDocument(); // Should display play icon initially
  });

  it('toggles play and pause states correctly', () => {
    render(<MapProvider><Footer /></MapProvider>);

    // Click to start playing
    const playPauseButton = screen.getByTestId('play-pause-button');
    fireEvent.click(playPauseButton);
    expect(screen.getByTestId('pause-icon')).toBeInTheDocument(); // Verify it shows pause icon

    // Click again to pause
    fireEvent.click(playPauseButton);
    expect(screen.getByTestId('play-icon')).toBeInTheDocument(); // Verify it shows play icon
  });

  it('resets to initial state when stop button is pressed', () => {
    render(<MapProvider><Footer /></MapProvider>);

    // Start playback
    const playPauseButton = screen.getByTestId('play-pause-button');
    fireEvent.click(playPauseButton);

    // Advance timer to move slider
    jest.advanceTimersByTime(2000);

    // Stop playback
    const stopButton = screen.getByTestId('stop-button');
    fireEvent.click(stopButton);

    // Verify slider reset and play icon is visible
    expect(screen.getByTestId('play-icon')).toBeInTheDocument(); // Should show play icon again
    const slider = screen.getByTestId('slider');
    expect(slider.getAttribute('value')).toBe('0'); // Slider should reset to 0
  });

  it('changes the slider value when user interacts with it', () => {
    render(<MapProvider><Footer /></MapProvider>);

    const slider = screen.getByTestId('slider');
    fireEvent.change(slider, { target: { value: '50' } });

    // Verify slider value changed
    expect(slider.getAttribute('value')).toBe('50');
    // Verify localStorage updated
    expect(localStorage.getItem('playbackSpeed')).toBe('1');
  });


  it('should display toast message when speed is retrieved from localStorage', async () => {
    localStorage.setItem('playbackSpeed', '1.5');

    render(<MapProvider><Footer /></MapProvider>);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('speed_retrieved'));
  });
  it('should display toast message when default speed is used (no speed in localStorage)', async () => {
    render(<MapProvider><Footer /></MapProvider>);

    await waitFor(() => expect(toast.info).toHaveBeenCalledWith('default_speed_retrieved'));
  });
  it('should handle speed change and save to localStorage', () => {
    render(<MapProvider><Footer /></MapProvider>);

    const speedButton = screen.getByTestId('speed-button-1.5');

    fireEvent.click(speedButton);

    expect(localStorage.getItem('playbackSpeed')).toBe('1.5');
  });

});
