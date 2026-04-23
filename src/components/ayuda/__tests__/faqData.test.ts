import { describe, it, expect } from 'vitest';
import { FAQ_DATA } from '../faqData';

describe('FAQ_DATA', () => {
    it('exporta exactamente 12 items', () => {
        expect(FAQ_DATA).toHaveLength(12);
    });

    it('cada item tiene question y answer como strings no vacíos', () => {
        FAQ_DATA.forEach((item, idx) => {
            expect(typeof item.question, `item[${idx}].question debe ser string`).toBe('string');
            expect(typeof item.answer, `item[${idx}].answer debe ser string`).toBe('string');
            expect(item.question.trim().length, `item[${idx}].question no debe estar vacío`).toBeGreaterThan(0);
            expect(item.answer.trim().length, `item[${idx}].answer no debe estar vacío`).toBeGreaterThan(0);
        });
    });

    it('todas las questions son únicas', () => {
        const questions = FAQ_DATA.map((item) => item.question);
        const unique = new Set(questions);
        expect(unique.size).toBe(FAQ_DATA.length);
    });
});
