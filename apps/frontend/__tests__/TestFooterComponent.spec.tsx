import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../src/app/components/Footer';

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
    render(<Footer />);

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
    render(<Footer />);

    // Click to start playing
    const playPauseButton = screen.getByTestId('play-pause-button');
    fireEvent.click(playPauseButton);
    expect(screen.getByTestId('pause-icon')).toBeInTheDocument(); // Verify it shows pause icon

    // Click again to pause
    fireEvent.click(playPauseButton);
    expect(screen.getByTestId('play-icon')).toBeInTheDocument(); // Verify it shows play icon
  });

  it('resets to initial state when stop button is pressed', () => {
    render(<Footer />);

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
    render(<Footer />);

    const slider = screen.getByTestId('slider');
    fireEvent.change(slider, { target: { value: '50' } });

    // Verify slider value changed
    expect(slider.getAttribute('value')).toBe('50');
    // Verify localStorage updated
    expect(localStorage.getItem('playbackSpeed')).toBe('1');
  });

  it('displays a success message when speed is saved', async () => {
    render(<Footer />);

    const speedButton = screen.getByTestId('speed-button-2');
    fireEvent.click(speedButton);

    // Verify success message appears
    expect(screen.getByText('speed_saved')).toBeInTheDocument();

    // Advance timers to allow the success message to disappear
    jest.advanceTimersByTime(1000);

    // Wait for the message to disappear
    await waitFor(() => {
      expect(screen.queryByText('speed_saved')).toBeNull();
    });
  });

  it('displays an error message if localStorage throws an error when saving speed', () => {
    // Mock localStorage to throw an error
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('1'),
        setItem: jest.fn().mockImplementation(() => { throw new Error('LocalStorage Error'); }),
      },
      writable: true,
    });

    render(<Footer />);

    const speedButton = screen.getByTestId('speed-button-2');
    fireEvent.click(speedButton);

    // Verify error message appears
    expect(screen.getByText('Failed to save playback speed.')).toBeInTheDocument();
  });

  it('displays success message when speed is changed', () => {
    render(<Footer />);

    // Change speed to 1.5x
    const speedButton = screen.getByTestId('speed-button-1.5');
    fireEvent.click(speedButton);

    // Check that the success message is displayed
    expect(screen.getByText('speed_saved')).toBeInTheDocument();
  });

  it('handles keyboard spacebar for play/pause toggle', () => {
    render(<Footer />);

    // Trigger spacebar keydown event to toggle play/pause
    fireEvent.keyDown(window, { code: 'Space' });

    // Verify play is toggled to pause
    expect(screen.getByTestId('pause-icon')).toBeInTheDocument();

    // Trigger spacebar keydown event again to toggle back to play
    fireEvent.keyDown(window, { code: 'Space' });

    // Verify play is toggled back to play icon
    expect(screen.getByTestId('play-icon')).toBeInTheDocument();
  });
});
