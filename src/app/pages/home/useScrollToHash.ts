import { useEffect } from "react";
import { useLocation } from "react-router";

// A link such as "/#stats" opens a page at a section. React Router does not scroll to the section,
// thus the page calls this hook after it renders its sections.
export function useScrollToHash(): void {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === "") return;
    // An attribute selector works for each ID, also an ID that is not a valid CSS name.
    const id = JSON.stringify(decodeURIComponent(hash.slice(1)));
    document.querySelector(`[id=${id}]`)?.scrollIntoView();
  }, [hash]);
}
