import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FAQAccordion from '../../shared/FAQAccordion';
import type { FAQItem } from '../faqData';

const MOCK_ITEMS: FAQItem[] = [
    { question: 'Pregunta uno', answer: 'Respuesta uno' },
    { question: 'Pregunta dos', answer: 'Respuesta dos' },
    { question: 'Pregunta tres', answer: 'Respuesta tres' },
];

describe('FAQAccordion', () => {
    it('renderiza todas las questions del array', () => {
        render(<FAQAccordion items={MOCK_ITEMS} />);
        MOCK_ITEMS.forEach((item) => {
            expect(screen.getByText(item.question)).toBeInTheDocument();
        });
    });

    it('las respuestas están inicialmente colapsadas (aria-expanded="false")', () => {
        render(<FAQAccordion items={MOCK_ITEMS} />);
        const buttons = screen.getAllByRole('button');
        buttons.forEach((btn) => {
            expect(btn).toHaveAttribute('aria-expanded', 'false');
        });
    });

    it('click en un item lo expande (aria-expanded="true")', async () => {
        const user = userEvent.setup();
        render(<FAQAccordion items={MOCK_ITEMS} />);
        const buttons = screen.getAllByRole('button');
        await user.click(buttons[0]);
        expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    });

    it('click en otro item cierra el anterior (solo uno abierto a la vez)', async () => {
        const user = userEvent.setup();
        render(<FAQAccordion items={MOCK_ITEMS} />);
        const buttons = screen.getAllByRole('button');

        await user.click(buttons[0]);
        expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');

        await user.click(buttons[1]);
        expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
        expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    });

    it('click en item abierto lo cierra', async () => {
        const user = userEvent.setup();
        render(<FAQAccordion items={MOCK_ITEMS} />);
        const buttons = screen.getAllByRole('button');

        await user.click(buttons[0]);
        expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');

        await user.click(buttons[0]);
        expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    });
});
