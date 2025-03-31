import { test, expect, describe, beforeEach } from 'vitest';
import { CodeforcesScraper } from '../src/scrapers/codeforces.js';
import * as cheerio from 'cheerio';

describe('CodeforcesScraper', () => {
  let scraper: CodeforcesScraper;

  beforeEach(() => {
    scraper = new CodeforcesScraper();
  });

  describe('getParams', () => {
    test('SHOULD parse contest url correctly', () => {
      const url = 'https://codeforces.com/contest/1234/problem/A';
      const params = scraper.getParams(url);

      expect(params).toEqual({
        type: 'contest_url',
        contestId: '1234',
        problemId: 'A',
      });
    });

    test('SHOULD parse problemset url correctly', () => {
      const url = 'https://codeforces.com/problemset/problem/1234/A';
      const params = scraper.getParams(url);

      expect(params).toEqual({
        type: 'problemset_url',
        contestId: '1234',
        problemId: 'A',
      });
    });

    test('SHOULD parse gym url correctly', () => {
      const url = 'https://codeforces.com/gym/1234/problem/A';
      const params = scraper.getParams(url);

      expect(params).toEqual({
        type: 'gym_url',
        contestId: '1234',
        problemId: 'A',
      });
    });

    test('SHOULD parse group url correctly', () => {
      const url =
        'https://codeforces.com/group/9Ei3G8AUCY/contest/599780/problem/A';
      const params = scraper.getParams(url);

      expect(params).toEqual({
        type: 'group_url',
        groupId: '9Ei3G8AUCY',
        contestId: '599780',
        problemId: 'A',
      });
    });

    test('SHOULD parse problem IDs with numbers correctly', () => {
      const url = 'https://codeforces.com/contest/1234/problem/A1';
      const params = scraper.getParams(url);

      expect(params).toEqual({
        type: 'contest_url',
        contestId: '1234',
        problemId: 'A1',
      });
    });

    test('SHOULD return null for invalid url', () => {
      const invalidUrl = 'https://codeforces.com/invalid/url';
      const params = scraper.getParams(invalidUrl);
      expect(params).toBeNull();
    });

    test('SHOULD handle HTTP protocol instead of HTTPS', () => {
      const url = 'http://codeforces.com/contest/1234/problem/A';
      const params = scraper.getParams(url);

      expect(params).toEqual({
        type: 'contest_url',
        contestId: '1234',
        problemId: 'A',
      });
    });

    test('SHOULD return null for various invalid URLs', () => {
      const invalidUrls = [
        'https://codeforces.com/contest/1234/problem/A/',
        'codeforces.com/contest/1234/problem/A',
        'https://www.codeforces.com/contest/1234/problem/A',
        'https://codeforces.com/contest/abc/problem/A',
        'https://codeforces.com/contest/1234/problem/',
      ];

      for (const url of invalidUrls) {
        expect(scraper.getParams(url)).toBeNull();
      }
    });

    test('SHOULD handle URLs with query parameters', () => {
      const url = 'https://codeforces.com/contest/1234/problem/A?locale=en';
      const params = scraper.getParams(url);

      expect(params).toEqual({
        type: 'contest_url',
        contestId: '1234',
        problemId: 'A',
      });
    });

    test('SHOULD handle URLs with fragments/anchors', () => {
      const url = 'https://codeforces.com/contest/1234/problem/A#sample';
      const params = scraper.getParams(url);

      expect(params).toEqual({
        type: 'contest_url',
        contestId: '1234',
        problemId: 'A',
      });
    });

    test('SHOULD be case-insensitive for domain and path components', () => {
      const url = 'https://CODEFORCES.com/Contest/1234/Problem/A';
      const params = scraper.getParams(url);

      expect(params).toEqual({
        type: 'contest_url',
        contestId: '1234',
        problemId: 'A',
      });
    });
  });

  describe('canHandle', () => {
    test('SHOULD return true for valid Codeforces URLs', () => {
      const validUrls = [
        'https://codeforces.com/contest/1234/problem/A',
        'https://codeforces.com/problemset/problem/1234/A',
        'https://codeforces.com/gym/1234/problem/A',
        'https://codeforces.com/group/9Ei3G8AUCY/contest/599780/problem/A',
      ];

      for (const url of validUrls) {
        expect(scraper.canHandle(url)).toBe(true);
      }
    });

    test('SHOULD return false for invalid URLs', () => {
      const invalidUrls = [
        'https://codeforces.com/invalid/url',
        'https://codeforces.com/contest/abc/problem/A',
        'https://www.codeforces.com/contest/1234/problem/A',
        'https://codeforces.com/contest/1234/problem/',
        'https://leetcode.com/problems/two-sum',
        'https://atcoder.jp/contests/abc123/tasks/abc123_a',
      ];

      for (const url of invalidUrls) {
        expect(scraper.canHandle(url)).toBe(false);
      }
    });
  });

  describe('getProblem', () => {
    // Helper function to normalize whitespace
    const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim();

    test('SHOULD return problem data for contest URL', async () => {
      const url = 'https://codeforces.com/contest/1/problem/A';
      const problem = await scraper.getProblem(url);

      expect(problem.name).toBe('A. Theatre Square');

      const $ = cheerio.load(problem.description);

      console.log(problem.description);

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
  });
});
