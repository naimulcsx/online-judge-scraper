import { describe, expect, test } from 'vitest';
import { getProblem } from '../src/utils/get-problem.js';
import * as cheerio from 'cheerio';

describe('getProblem', () => {
  const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim();

  test('should fetch and parse Codeforces problem correctly', async () => {
    const url = 'https://codeforces.com/contest/1/problem/A';
    const problem = await getProblem(url);

    expect(problem.name).toBe('A. Theatre Square');

    const $ = cheerio.load(problem.description);

    // Validate text content
    // Extract content, input, and output sections separately
    const contentText = normalizeText($('div').first().text());
    const inputText = normalizeText(
      $('.section-title:contains("Input")').next('p').text(),
    );
    const outputText = normalizeText(
      $('.section-title:contains("Output")').next('p').text(),
    );

    // Combine all sections with spaces between them
    const htmlText = `${contentText} Input ${inputText} Output ${outputText}`;
    const plainText = normalizeText(problem.plainTextDescription);
    expect(htmlText).toBe(plainText);

    expect(problem.timeLimit).toBe('1 second');
    expect(problem.memoryLimit).toBe('256 megabytes');
    expect(problem.tags).toEqual(['math']);
    expect(problem.difficulty).toBe('*1000');
    expect(problem.sampleTestCases).toEqual([
      {
        input: '6 6 4',
        output: '4',
      },
    ]);
  });

  test('should throw error for unsupported domain', async () => {
    const url = 'https://unsupported-judge.com/problem/123';
    await expect(getProblem(url)).rejects.toThrow(
      'No scraper found for domain unsupported-judge.com',
    );
  });

  test('should throw error for invalid URL', async () => {
    const url = 'not-a-url';
    await expect(getProblem(url)).rejects.toThrow('Invalid URL: not-a-url');
  });
});
