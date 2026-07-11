import * as React from 'react';

import { checkConsistency } from 'app/data/consistency';

export function Consistency() {
  if (import.meta.env.PROD) {
    return null;
  }
  const problems = [...checkConsistency()];
  if (problems.length === 0) {
    return null;
  }
  return (
    <ul>
      {problems.map((problem, i) => (
        <li key={i}>{problem}</li>
      ))}
    </ul>
  );
}
