import type { Problem, TestCase } from '../types/problem.js';
import { Scraper, ScraperError } from './base.js';
import * as cheerio from 'cheerio';

export type CodeforcesURLParams =
  | {
      type: 'group_url';
      contestId: string;
      problemId: string;
      groupId: string;
    }
  | {
      type: 'contest_url' | 'problemset_url' | 'gym_url';
      contestId: string;
      problemId: string;
    };

export class CodeforcesScraperError extends ScraperError {
  constructor(type: string, message: string) {
    super('Codeforces', type, message);
  }
}

export class CodeforcesScraper implements Scraper<CodeforcesURLParams> {
  static readonly URL_PATTERNS = [
    {
      type: 'contest_url',
      regexp:
        /^https?:\/\/codeforces\.com\/contest\/(\d+)\/problem\/([A-Z][0-9]*)(?:\?.*)?(?:#.*)?$/i,
    },
    {
      type: 'problemset_url',
      regexp:
        /^https?:\/\/codeforces\.com\/problemset\/problem\/(\d+)\/([A-Z][0-9]*)(?:\?.*)?(?:#.*)?$/i,
    },
    {
      type: 'gym_url',
      regexp:
        /^https?:\/\/codeforces\.com\/gym\/(\d+)\/problem\/([A-Z][0-9]*)(?:\?.*)?(?:#.*)?$/i,
    },
    {
      type: 'group_url',
      regexp:
        /^https?:\/\/codeforces\.com\/group\/([a-zA-Z0-9]+)\/contest\/(\d+)\/problem\/([A-Za-z][0-9]*)(?:\?.*)?(?:#.*)?$/i,
    },
  ] as const;

  private assert(
    condition: boolean,
    type: keyof typeof ScraperError.ERROR_TYPES,
    message?: string,
  ): asserts condition {
    if (!condition) {
      throw new CodeforcesScraperError(
        type,
        message ?? ScraperError.ERROR_TYPES[type],
      );
    }
  }

  canHandle(url: string) {
    return this.getParams(url) !== null;
  }

  getParams(url: string) {
    for (const pattern of CodeforcesScraper.URL_PATTERNS) {
      const match = url.match(pattern.regexp);
      if (!match) continue;

      if (pattern.type === 'group_url') {
        this.assert(!!match[1] && !!match[2] && !!match[3], 'INVALID_URL');
        return {
          type: pattern.type,
          groupId: match[1],
          contestId: match[2],
          problemId: match[3],
        };
      } else {
        this.assert(!!match[1] && !!match[2], 'INVALID_URL');
        return {
          type: pattern.type,
          contestId: match[1],
          problemId: match[2],
        };
      }
    }
    return null;
  }

  extractData(html: string) {
    const $ = cheerio.load(html);
    const problemStatement = $('.problem-statement');

    this.assert(problemStatement.length > 0, 'PARSING_ERROR', 'Invalid HTML');

    // Extract problem name
    const name = problemStatement.find('.header .title').text().trim();
    this.assert(name.length > 0, 'PARSING_ERROR', 'Problem name not found');

    // Extract time limit
    const timeLimit = problemStatement
      .find('.header .time-limit')
      .text()
      .replace('time limit per test', '')
      .trim();
    this.assert(timeLimit.length > 0, 'PARSING_ERROR', 'Time limit not found');

    // Extract memory limit
    const memoryLimit = problemStatement
      .find('.header .memory-limit')
      .text()
      .replace('memory limit per test', '')
      .trim();
    this.assert(
      memoryLimit.length > 0,
      'PARSING_ERROR',
      'Memory limit not found',
    );

    // Extract problem description HTML
    const descriptionHtml = problemStatement
      .find('.header')
      .nextUntil('.input-specification')
      .map((_, el) => $.html(el))
      .get()
      .join('');

    // Extract input format HTML
    const inputFormatHtml =
      problemStatement.find('.input-specification').html() || '';

    // Extract output format HTML
    const outputFormatHtml =
      problemStatement.find('.output-specification').html() || '';

    // Combine all HTML sections
    const description = descriptionHtml + inputFormatHtml + outputFormatHtml;

    // Extract input format text
    const inputFormat = problemStatement
      .find('.input-specification')
      .children()
      .not('.section-title')
      .text()
      .trim();

    // Extract output format text
    const outputFormat = problemStatement
      .find('.output-specification')
      .children()
      .not('.section-title')
      .text()
      .trim();

    // Extract samples
    const sampleTestCases: TestCase[] = [];
    const sampleTests = problemStatement.find('.sample-test');
    this.assert(
      sampleTests.length > 0,
      'PARSING_ERROR',
      'No sample test cases found',
    );
    sampleTests.each((_, sampleTest) => {
      const input = $(sampleTest).find('.input pre').text().trim();
      const output = $(sampleTest).find('.output pre').text().trim();
      sampleTestCases.push({ input, output });
    });

    // Extract tags if available
    const tags: string[] = [];
    $('.tag-box').each((_, tag) => {
      const tagText = $(tag).text().trim();
      if (tagText && !tagText.startsWith('*')) {
        tags.push(tagText);
      }
    });

    // Extract difficulty if available
    let difficulty: string | undefined;
    $('.tag-box').each((_, tag) => {
      const tagText = $(tag).text().trim();
      if (tagText.startsWith('*')) {
        difficulty = tagText;
      }
    });

    // Get plain text description by combining all parts
    const plainTextDescription = [
      $(descriptionHtml).text().trim(),
      'Input',
      inputFormat,
      'Output',
      outputFormat,
    ].join('\n\n');

    return {
      name,
      description,
      plainTextDescription,
      timeLimit,
      memoryLimit,
      tags,
      difficulty,
      sampleTestCases,
    } satisfies Problem;
  }

  async getProblem(url: string) {
    this.assert(this.canHandle(url), 'INVALID_URL');

    const response = await fetch(url);
    this.assert(
      response.ok,
      'NETWORK_ERROR',
      `Failed to fetch problem page: ${response.status} ${response.statusText}`,
    );

    const html = await response.text();
    this.assert(
      html.length > 0,
      'NETWORK_ERROR',
      'Received empty HTML from server',
    );

    return this.extractData(html);
  }
}
