/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/no-require-imports */

const {
  calculateFileComplexity,
  estimateFileReviewTime,
  formatAsComment,
  CONFIG
} = require('../../../scripts/pr-analysis.js');

describe('PR Analysis Script', () => {
  describe('calculateFileComplexity', () => {
    it('should calculate complexity for TypeScript files', () => {
      const file = {
        filename: 'src/components/TaskForm.tsx',
        added: 50,
        removed: 10,
        isBinary: false
      };
      
      const complexity = calculateFileComplexity(file);
      expect(complexity).toBeGreaterThan(60); // 60 * 1.2 (tsx) * 1.3 (components)
    });

    it('should have lower complexity for documentation files', () => {
      const file = {
        filename: 'docs/README.md',
        added: 50,
        removed: 10,
        isBinary: false
      };
      
      const complexity = calculateFileComplexity(file);
      expect(complexity).toBeLessThan(30); // 60 * 0.3 (md) * 0.4 (docs)
    });

    it('should handle binary files', () => {
      const file = {
        filename: 'public/image.png',
        added: 0,
        removed: 0,
        isBinary: true
      };
      
      const complexity = calculateFileComplexity(file);
      expect(complexity).toBe(0);
    });
  });

  describe('estimateFileReviewTime', () => {
    it('should estimate time for TypeScript files', () => {
      const file = {
        filename: 'src/lib/utils.ts',
        added: 100,
        removed: 20,
        isBinary: false
      };
      
      const time = estimateFileReviewTime(file);
      expect(time).toBeGreaterThan(50); // Should be substantial for 120 lines
    });

    it('should estimate less time for JSON files', () => {
      const file = {
        filename: 'package.json',
        added: 50,
        removed: 10,
        isBinary: false
      };
      
      const time = estimateFileReviewTime(file);
      expect(time).toBeLessThan(20); // JSON should be quick to review
    });
  });

  describe('formatAsComment', () => {
    it('should format analysis as GitHub comment', () => {
      const analysis = {
        summary: 'Test summary',
        reviewSuggestions: ['Test suggestion'],
        stats: { totalComplexity: 100 }
      };
      
      const comment = formatAsComment(analysis);
      expect(comment).toContain('## 🤖 Automated PR Analysis');
      expect(comment).toContain('Test summary');
      expect(comment).toContain('Test suggestion');
      expect(comment).toContain('Complexity score: 100');
    });
  });

  describe('CONFIG', () => {
    it('should have proper configuration values', () => {
      expect(CONFIG.COMPLEXITY_WEIGHTS.typescript).toBe(1.0);
      expect(CONFIG.COMPLEXITY_WEIGHTS.tsx).toBe(1.2);
      expect(CONFIG.COMPLEXITY_WEIGHTS.md).toBe(0.3);
      expect(CONFIG.REVIEW_TIME_BASE.typescript).toBe(0.5);
    });

    it('should have reasonable thresholds', () => {
      expect(CONFIG.THRESHOLDS.simple.score).toBeLessThan(CONFIG.THRESHOLDS.moderate.score);
      expect(CONFIG.THRESHOLDS.moderate.score).toBeLessThan(CONFIG.THRESHOLDS.complex.score);
    });
  });
});