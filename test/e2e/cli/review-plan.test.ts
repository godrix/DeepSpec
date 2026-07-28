import { describe, it, strict } from 'poku';
import { ABC_DOCS } from '../../../src/cli/review-plan.js';

await describe('review plan ABC menu', async () => {
  await it('exposes A, B, and C in order', () => {
    strict.equal(ABC_DOCS.length, 3);
    strict.equal(ABC_DOCS[0].letter, 'A');
    strict.equal(ABC_DOCS[1].letter, 'B');
    strict.equal(ABC_DOCS[2].letter, 'C');
    strict.equal(ABC_DOCS[0].fileName, 'APPROACH.md');
    strict.equal(ABC_DOCS[1].fileName, 'BUSINESS_CONTEXT.md');
    strict.equal(ABC_DOCS[2].fileName, 'COMPLETION_REPORT.md');
  });
});
