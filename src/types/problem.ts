/**
 * Represents a programming problem from an online judge platform.
 *
 * @example
 * ```ts
 * const problem: Problem = {
 *   name: "Theatre Square",
 *   description: "<p>Theatre Square in the capital city...</p>",
 *   plainTextDescription: "Theatre Square in the capital city...",
 *   timeLimit: "1 second",
 *   memoryLimit: "256 megabytes",
 *   tags: ["math", "geometry"],
 *   difficulty: "easy",
 *   sampleTestCases: [
 *     {
 *       input: "6 6 4",
 *       output: "4"
 *     }
 *   ]
 * };
 * ```
 */
export interface Problem {
  /**
   * The title or name of the problem as shown on the platform.
   */
  name: string;

  /**
   * Full problem description, typically in HTML format.
   * May include formatting, images, and mathematical notation.
   */
  description: string;

  /**
   * Plain text version of the problem description.
   * Useful for text-based applications or accessibility.
   */
  plainTextDescription: string;

  /**
   * Time limit for solutions, usually expressed as a human-readable string.
   * Format varies by platform (e.g., "1 second", "2.5 seconds").
   */
  timeLimit?: string;

  /**
   * Memory limit for solutions, usually expressed as a human-readable string.
   * Format varies by platform (e.g., "256 megabytes", "1024MB").
   */
  memoryLimit?: string;

  /**
   * List of tags or categories that describe the problem.
   * Useful for filtering or organizing problems by topic.
   */
  tags?: string[];

  /**
   * Difficulty level of the problem, typically expressed as a string.
   * Format varies by platform (e.g., "easy", "medium", "hard", "expert").
   */
  difficulty?: string;

  /**
   * Sample test cases provided with the problem statement.
   * These are examples that demonstrate the expected behavior of solutions.
   */
  sampleTestCases?: TestCase[];

  /**
   * Additional platform-specific metadata about the problem.
   * Can contain any properties unique to particular online judges.
   */
  metadata?: Record<string, any>;
}

/**
 * Represents a test case with input and expected output.
 *
 * @example
 * ```ts
 * const testCase: TestCase = {
 *   input: "6 6 4",
 *   output: "4",
 *   explanation: "We need to cover a 6×6 square with 4×4 tiles. Each tile can cover 16 squares, and we need 4 tiles to cover all 36 squares."
 * };
 * ```
 */
export interface TestCase {
  /**
   * Input data for the test case.
   * Usually represents what would be provided to stdin.
   */
  input: string;

  /**
   * Expected output for the test case.
   * Solutions should produce this exact output (accounting for whitespace rules per platform).
   */
  output: string;

  /**
   * Optional explanation of the test case.
   * Helps users understand the reasoning behind the expected output.
   */
  explanation?: string;
}
