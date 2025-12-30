import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentSwipeNavClient } from "./DocumentSwipeNavClient";

const router = { push: vi.fn() };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

beforeEach(() => {
  router.push.mockReset();
  Object.defineProperty(window, "innerWidth", { value: 320, configurable: true });
});

describe("DocumentSwipeNavClient", () => {
  it("navigates to next doc on left swipe past threshold", () => {
    render(
      <DocumentSwipeNavClient
        prev={{ id: "prev-doc", title: "Prev" }}
        next={{ id: "next-doc", title: "Next" }}
      >
        <div>Content</div>
      </DocumentSwipeNavClient>,
    );

    const root = screen.getByTestId("document-swipe-nav");

    fireEvent.pointerDown(root, { pointerId: 1, pointerType: "touch", clientX: 200, clientY: 100 });
    fireEvent.pointerMove(root, { pointerId: 1, pointerType: "touch", clientX: 80, clientY: 103 });
    fireEvent.pointerUp(root, { pointerId: 1, pointerType: "touch", clientX: 80, clientY: 103 });

    expect(router.push).toHaveBeenCalledWith("/corpus/next-doc");
  });

  it("does not navigate when swipe is below threshold", () => {
    render(
      <DocumentSwipeNavClient
        prev={{ id: "prev-doc", title: "Prev" }}
        next={{ id: "next-doc", title: "Next" }}
      >
        <div>Content</div>
      </DocumentSwipeNavClient>,
    );

    const root = screen.getByTestId("document-swipe-nav");

    fireEvent.pointerDown(root, { pointerId: 1, pointerType: "touch", clientX: 200, clientY: 100 });
    fireEvent.pointerMove(root, { pointerId: 1, pointerType: "touch", clientX: 140, clientY: 102 });
    fireEvent.pointerUp(root, { pointerId: 1, pointerType: "touch", clientX: 140, clientY: 102 });

    expect(router.push).not.toHaveBeenCalled();
  });
});
