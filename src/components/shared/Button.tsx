import { Button as HeadlessButton } from '@headlessui/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    children: React.ReactNode;
}

const variants = {
    primary:
        'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-hover data-hover:-translate-y-px data-disabled:opacity-60 data-disabled:cursor-not-allowed data-disabled:hover:translate-y-0',
    outline:
        'border border-primary text-primary bg-transparent hover:bg-primary/5 data-disabled:opacity-60 data-disabled:cursor-not-allowed',
    ghost: 'text-primary bg-transparent hover:bg-primary/5 data-disabled:opacity-60 data-disabled:cursor-not-allowed',
};

export default function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
    return (
        <HeadlessButton
            {...props}
            className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-all ${variants[variant]}${className ? ` ${className}` : ''}`}
        >
            {children}
        </HeadlessButton>
    );
}
