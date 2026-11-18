export interface ProportionTest {
  total: number;
  successes: number;
  failures: number;
  share: number;
  threshold: number;
  pValue: number;
  confirmed: boolean;
  lowerBound: number;
}

export interface ErrorSummary {
  count: number;
  median: number;
  maxAbsolute: number;
}

const BISECTION_STEPS = 60;

export function testProportion(successes: number, total: number, threshold: number, alpha: number): ProportionTest {
  const failures = total - successes;
  const pValue = total === 0 ? 1 : binomialLowerTail(failures, total, 1 - threshold);
  return {
    total,
    successes,
    failures,
    share: total === 0 ? 0 : successes / total,
    threshold,
    pValue,
    confirmed: pValue <= alpha,
    lowerBound: lowerConfidenceBound(successes, total, alpha),
  };
}

export function summarizeErrors(errors: number[]): ErrorSummary {
  const count = errors.length;
  if (count === 0) {
    return { count, median: 0, maxAbsolute: 0 };
  }
  const sorted = [...errors].sort((a: number, b: number) => a - b);
  const middle = Math.floor(count / 2);
  return {
    count,
    median: count % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle],
    maxAbsolute: Math.max(...errors.map((value: number) => Math.abs(value))),
  };
}

function binomialLowerTail(limit: number, total: number, probability: number): number {
  let tail = 0;
  for (let count = 0; count <= limit; count += 1) {
    tail += Math.exp(
      logChoose(total, count) + count * Math.log(probability) + (total - count) * Math.log1p(-probability),
    );
  }
  return Math.min(1, tail);
}

function logChoose(total: number, count: number): number {
  let result = 0;
  for (let step = 1; step <= count; step += 1) {
    result += Math.log(total - count + step) - Math.log(step);
  }
  return result;
}

function lowerConfidenceBound(successes: number, total: number, alpha: number): number {
  if (total === 0 || successes === 0) {
    return 0;
  }
  let low = 0;
  let high = 1;
  for (let step = 0; step < BISECTION_STEPS; step += 1) {
    const middle = (low + high) / 2;
    if (binomialLowerTail(total - successes, total, 1 - middle) > alpha) {
      high = middle;
    } else {
      low = middle;
    }
  }
  return low;
}
