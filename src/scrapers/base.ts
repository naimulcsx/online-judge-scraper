import type { Problem } from '../types/index.js';

/**
 * Abstract base class for online judge problem scrapers.
 * Each platform-specific scraper should extend this class and implement its methods.
 */
export abstract class Scraper<TURLParams extends Record<string, string> = {}> {
  /**
   * Extracts the URL parameters from the given URL.
   *
   * @param url - The URL to extract the parameters from
   * @returns The extracted URL parameters
   */
  abstract getParams(url: string): TURLParams | null;

  /**
   * Checks if this scraper can handle the given URL.
   *
   * @param url - The URL to check
   * @returns True if this scraper can handle the URL, false otherwise
   */
  abstract canHandle(url: string): boolean;

  /**
   * Scrapes problem data from the given URL.
   *
   * @param url - The URL of the problem to scrape
   * @returns A Promise that resolves to the Problem object
   * @throws Error if scraping fails
   */
  abstract getProblem(url: string): Promise<Problem>;

  /**
   * Extracts all problem data from the parsed document.
   *
   * @param document - The parsed HTML document
   * @param url - The original problem URL
   * @returns The extracted Problem object
   */
  abstract extractData(html: string): Problem;
}

/**
 * Error class for scraper errors.
 */
export class ScraperError extends Error {
  readonly judge: string;
  readonly type: string;

  static readonly ERROR_TYPES = {
    INVALID_URL: 'Invalid URL',
    VALIDATION_ERROR: 'Validation error',
    PARSING_ERROR: 'Parsing error',
    NETWORK_ERROR: 'Network error',
  } as const;

  constructor(judge: string, type: string, message: string) {
    super(`[${judge}] ${type}: ${message}`);
    this.name = `${judge}ScraperError`;
    this.judge = judge;
    this.type = type;
  }
}
