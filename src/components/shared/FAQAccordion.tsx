import { useState } from 'react';

export interface FAQItem {
    question: string;
    answer: string;
}

interface FAQAccordionProps {
    items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (idx: number) => {
        setOpenIndex((prev) => (prev === idx ? null : idx));
    };

    return (
        <div className="divide-y divide-slate-200">
            {items.map((item, idx) => {
                const isOpen = openIndex === idx;
                const buttonId = `faq-btn-${idx}`;
                const regionId = `faq-region-${idx}`;

                return (
                    <div key={idx}>
                        <button
                            id={buttonId}
                            aria-expanded={isOpen}
                            aria-controls={regionId}
                            onClick={() => toggle(idx)}
                            className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-slate-800 hover:text-primary transition-colors"
                        >
                            <span>{item.question}</span>
                            <span
                                className={`material-symbols-outlined shrink-0 text-[20px] text-primary transition-transform duration-200 ${
                                    isOpen ? 'rotate-180' : ''
                                }`}
                            >
                                expand_more
                            </span>
                        </button>
                        <div
                            id={regionId}
                            role="region"
                            aria-labelledby={buttonId}
                            style={{
                                display: 'grid',
                                gridTemplateRows: isOpen ? '1fr' : '0fr',
                                transition: 'grid-template-rows 200ms ease',
                            }}
                        >
                            <div className="overflow-hidden">
                                <p className="pb-5 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
