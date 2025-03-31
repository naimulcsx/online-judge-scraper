# Online Judge Scraper

![npm](https://img.shields.io/npm/v/online-judge-scraper)
![Tests](https://img.shields.io/github/actions/workflow/status/naimulcsx/online-judge-scraper/ci.yml?label=tests)
![License](https://img.shields.io/npm/l/online-judge-scraper)

A powerful TypeScript library that enables developers to extract problem data from various competitive programming platforms (online judges) without writing complex scraping logic.

## Features

- 🌐 **Multi-Platform Support:** Supports over 10 platforms with more platforms coming soon
- 🧩 **Unified API:** Extract problem data using a consistent interface across all platforms
- 🔌 **Extensible:** Easily add support for new platforms not supported by the library
- 📦 **TypeScript Ready:** Full TypeScript support with comprehensive type definitions
- ⚡ **Promise-Based:** Modern asynchronous API for seamless integration

## Installation

```
npm install online-judge-scraper
```

Or using yarn:

```
yarn add online-judge-scraper
```

## Quickstart

```ts
import { getProblem } from 'online-judge-scraper';

async function main() {
  try {
    // Get problem data from Codeforces
    const problem = await getProblem(
      'https://codeforces.com/contest/1/problem/A',
    );

    console.log(`Problem Name: ${problem.name}`);
    console.log(`Difficulty: ${problem.difficulty}`);
    console.log(`Time Limit: ${problem.timeLimit}`);
    console.log(`Memory Limit: ${problem.memoryLimit}`);
    console.log(`Tags: ${problem.tags?.join(', ')}`);

    // Access sample test cases
    problem.sampleTestCases?.forEach((testCase, index) => {
      console.log(`\nTest Case ${index + 1}:`);
      console.log(`Input:\n${testCase.input}`);
      console.log(`Expected Output:\n${testCase.output}`);
    });

    // Get plain text or HTML description
    console.log(`\nDescription:\n${problem.plainTextDescription}`);
    // or HTML version: problem.description
  } catch (error) {
    console.error('Error fetching problem:', error);
  }
}

main();
```

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-platform`
3. Add support for a new platform or improve existing ones
4. Run tests: `npm test`
5. Submit a pull request
