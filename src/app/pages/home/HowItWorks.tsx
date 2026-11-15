import { text } from "../../../text/en";
import styles from "./HomePage.module.css";

const words = text.home.steps;

// Three steps from the first visit to the next day, in one row between two lines.
// The heading is only for a screen reader. The list is ordered, so the CSS shows the step numbers.
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className={styles.stepsSection}
    >
      <h2 id="how-it-works-heading" className="visually-hidden">
        {words.heading}
      </h2>
      <ol className={styles.steps}>
        {words.items.map((step) => (
          <li key={step.title} className={styles.step}>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
