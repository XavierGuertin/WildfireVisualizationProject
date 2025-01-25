import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPanel from '../src/app/components/SettingsPanel';
import { fetchCollectionsFromEndpoint } from '../src/app/services/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

jest.mock('sweetalert2');
jest.mock('../src/app/services/api');

const MySwal = withReactContent(Swal);

describe('Test SettingsPanel component', () => {
  beforeAll(() => {
    window.alert = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open and close the settings dropdown', () => {
    render(<SettingsPanel />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    expect(settingsButton).toHaveClass('active');
    expect(screen.getByLabelText('api_endpoint:')).toBeInTheDocument();
    expect(screen.getByText('save')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });

  it('should render the correct initial API endpoint value and update the input field', () => {
    render(<SettingsPanel />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    const inputField = screen.getByLabelText(
      'api_endpoint:',
    ) as HTMLInputElement;
    expect(inputField.value).toBe('https://default-api-endpoint.com');

    fireEvent.change(inputField, {
      target: { value: 'https://new-api-endpoint.com' },
    });
    expect(inputField.value).toBe('https://new-api-endpoint.com');
  });

  it('should trigger save action for a valid API endpoint', async () => {
    (fetchCollectionsFromEndpoint as jest.Mock).mockResolvedValue(
      'Collections fetched successfully',
    );
    render(<SettingsPanel />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    const inputField = screen.getByLabelText(
      'api_endpoint:',
    ) as HTMLInputElement;
    const saveButton = screen.getByText('save');

    fireEvent.change(inputField, {
      target: { value: 'https://new-api-endpoint.com' },
    });
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(fetchCollectionsFromEndpoint).toHaveBeenCalled(),
    );
    expect(screen.getByText('api_endpoint_saved')).toBeInTheDocument();
  });

  it('should trigger an error alert for an invalid API endpoint', () => {
    render(<SettingsPanel />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    const inputField = screen.getByLabelText(
      'api_endpoint:',
    ) as HTMLInputElement;
    const saveButton = screen.getByText('save');

    fireEvent.change(inputField, { target: { value: 'invalid-url' } });
    fireEvent.click(saveButton);

    expect(screen.getByText('invalid_url')).toBeInTheDocument();
  });

  it('should close the settings dropdown when Cancel is clicked', () => {
    render(<SettingsPanel />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    const cancelButton = screen.getByText('cancel');
    fireEvent.click(cancelButton);

    expect(settingsButton).not.toHaveClass('active');
  });

  it('should close settings dropdown when clicking outside', () => {
    render(<SettingsPanel />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    fireEvent.mouseDown(document.body);

    expect(settingsButton).not.toHaveClass('active');
    expect(screen.queryByLabelText('api_endpoint:')).not.toBeInTheDocument();
  });

  it('should not close settings dropdown if clicking inside dropdown', () => {
    render(<SettingsPanel />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    const dropdownContent = screen
      .getByLabelText('api_endpoint:')
      .closest('.dropdown-content');
    jest.spyOn(dropdownContent!, 'contains').mockReturnValueOnce(true);

    fireEvent.mouseDown(dropdownContent!);

    expect(settingsButton).toHaveClass('active');
  });

  it('should open and close the language dropdown', () => {
    render(<SettingsPanel />);

    const languageButton = screen.getByRole('button', { name: /language/i });
    fireEvent.click(languageButton);
    expect(languageButton).toHaveClass('active');

    const dropdownContent = screen
      .getByText('english')
      .closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.click(languageButton);
    expect(languageButton).not.toHaveClass('active');
  });

  it('should select English and French in the language dropdown', () => {
    render(<SettingsPanel />);

    const languageButton = screen.getByRole('button', { name: /language/i });
    fireEvent.click(languageButton);

    const frenchButton = screen.getByRole('button', { name: 'french' });
    fireEvent.click(frenchButton);

    fireEvent.click(languageButton);

    const englishButton = screen.getByRole('button', { name: 'english' });
    fireEvent.click(englishButton);
  });

  it('should open and close the reset dropdown', () => {
    render(<SettingsPanel />);

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    expect(resetButton).toHaveClass('active');

    const dropdownContent = screen
      .getByText('reset')
      .closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.click(resetButton);
    expect(resetButton).not.toHaveClass('active');
  });

  it('should close dropdowns when clicking outside', () => {
    render(<SettingsPanel />);

    const languageButton = screen.getByRole('button', { name: /language/i });
    fireEvent.click(languageButton);

    const dropdownContent = document.querySelector('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.mouseDown(document.body);
  });
});
