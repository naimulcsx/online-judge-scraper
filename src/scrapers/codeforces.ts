import type { Problem, TestCase } from '../types/problem.js';
import { Scraper } from './base.js';
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

export class CodeforcesScraper implements Scraper<CodeforcesURLParams> {
  static urlPatterns = [
    {
      type: 'contest_url' as const,
      regexp:
        /^https?:\/\/codeforces\.com\/contest\/(\d+)\/problem\/([A-Z][0-9]*)(?:\?.*)?(?:#.*)?$/i,
    },
    {
      type: 'problemset_url' as const,
      regexp:
        /^https?:\/\/codeforces\.com\/problemset\/problem\/(\d+)\/([A-Z][0-9]*)(?:\?.*)?(?:#.*)?$/i,
    },
    {
      type: 'gym_url' as const,
      regexp:
        /^https?:\/\/codeforces\.com\/gym\/(\d+)\/problem\/([A-Z][0-9]*)(?:\?.*)?(?:#.*)?$/i,
    },
    {
      type: 'group_url' as const,
      regexp:
        /^https?:\/\/codeforces\.com\/group\/([a-zA-Z0-9]+)\/contest\/(\d+)\/problem\/([A-Za-z][0-9]*)(?:\?.*)?(?:#.*)?$/i,
    },
  ];

  getParams(url: string) {
    for (const pattern of CodeforcesScraper.urlPatterns) {
      const match = url.match(pattern.regexp);
      if (!match) continue;

      if (pattern.type === 'group_url') {
        if (!match[1] || !match[2] || !match[3]) {
          return null;
        }
        return {
          type: pattern.type,
          groupId: match[1],
          contestId: match[2],
          problemId: match[3],
        };
      } else {
        if (!match[1] || !match[2]) {
          return null;
        }
        return {
          type: pattern.type,
          contestId: match[1],
          problemId: match[2],
        };
      }
    }
    return null;
  }

  canHandle(url: string) {
    return this.getParams(url) !== null;
  }

  extractProblem(html: string) {
    const $ = cheerio.load(html);
    const problemStatement = $('.problem-statement');

    // Extract problem name
    const name = problemStatement.find('.header .title').text().trim();

    // Extract time limit
    const timeLimit = problemStatement
      .find('.header .time-limit')
      .text()
      .replace('time limit per test', '')
      .trim();

    // Extract memory limit
    const memoryLimit = problemStatement
      .find('.header .memory-limit')
      .text()
      .replace('memory limit per test', '')
      .trim();

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
    sampleTests.each((_, sampleTest) => {
      const input = $(sampleTest).find('.input pre').text().trim();
      const output = $(sampleTest).find('.output pre').text().trim();
      sampleTestCases.push({ input, output });
    });

    // Extract notes
    const notes = problemStatement
      .find('.note')
      .children()
      .not('.section-title')
      .text()
      .trim();

    // Extract tags if available
    const tags: string[] = [];
    $('.tag-box').each((_, tag) => {
      const tagText = $(tag).text().trim();
      if (tagText && !tagText.startsWith('*')) {
        // Skip difficulty tags that start with *
        tags.push(tagText);
      }
    });

    // Extract difficulty if available
    let difficulty = '';
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

  async fetchProblemPage(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch problem page: ${response.statusText}`);
    }
    return response.text();
  }

  async getProblem(url: string) {
    const html = await this.fetchProblemPage(url);
    return this.extractProblem(html);
  }
}
