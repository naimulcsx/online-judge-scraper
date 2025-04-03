import type { Problem } from '../types/problem.js';
import { Scraper } from '../scrapers/base.js';
import { CodeforcesScraper } from '../scrapers/codeforces.js';

const scraperMap: Record<string, Scraper> = {
  'codeforces.com': new CodeforcesScraper(),
};

/**
 * Extracts the domain from a URL.
 *
 * @param url - URL to extract domain from
 * @returns The domain name
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

/**
 * Main function to get problem data from any supported online judge.
 * Uses the URL domain to quickly identify the appropriate scraper.
 *
 * @param url - URL of the problem to fetch
 * @returns A Promise that resolves to the Problem object
 * @throws Error if the URL is not supported or scraping fails
 *
 */
export async function getProblem(url: string): Promise<Problem> {
  try {
    const domain = extractDomain(url);
    const scraper = scraperMap[domain];

    if (!scraper) {
      throw new Error(
        `No scraper found for domain ${domain}. This online judge may not be supported yet.`,
      );
    }

    // Double-check that this scraper can handle this specific URL
    // (in case there are multiple types of URLs for the same domain)
    if (!scraper.canHandle(url)) {
      throw new Error(
        `The ${domain} scraper does not support this specific URL format: ${url}`,
      );
    }

    // Use the appropriate scraper to get the problem
    return await scraper.getProblem(url);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get problem: ${error.message}`);
    }
    throw new Error('Failed to get problem: Unknown error');
  }
}
