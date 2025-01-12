import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TestStac from "../src/app/testComponents/TestStac";
import { fetchTestStacData } from "../src/app/services/api";

// Mock the API function
jest.mock("../src/app/services/api");

describe("Test TestStac Component", () => {
  it("should render the component with the title and button", () => {
    render(<TestStac />);
    expect(screen.getByText("Test STAC Endpoint")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fetch Data" })).toBeInTheDocument();
  });

  it("should show loading state when the button is clicked", async () => {
    (fetchTestStacData as jest.Mock).mockImplementation(() => new Promise(() => {})); // Simulate pending promise
    render(<TestStac />);
    fireEvent.click(screen.getByRole("button", { name: "Fetch Data" }));

    expect(screen.getByRole("button", { name: "Loading..." })).toBeDisabled();
  });

  it("should display an error message when the API call fails", async () => {
    (fetchTestStacData as jest.Mock).mockResolvedValue({ error: "Failed to fetch data" });

    render(<TestStac />);
    fireEvent.click(screen.getByRole("button", { name: "Fetch Data" }));

    const error = await screen.findByText("Error:");
    expect(error).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fetch Data" })).toBeEnabled();
  });
});
