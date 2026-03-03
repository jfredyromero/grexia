interface Step {
    number: number;
    label: string;
}

interface StepProgressProps {
    steps: readonly Step[];
    currentStep: number;
    maxReachedStep?: number;
    onStepClick?: (stepNumber: number) => void;
}

export default function StepProgress({ steps, currentStep, maxReachedStep, onStepClick }: StepProgressProps) {
    const maxReached = maxReachedStep ?? currentStep;

    return (
        <>
            {/* Desktop: numbered circles with connector lines */}
            <div className="no-print hidden sm:flex items-center justify-between">
                {steps.map((step, idx) => {
                    const isCompleted = step.number < currentStep;
                    const isActive = step.number === currentStep;
                    const isAccessible = step.number <= maxReached;
                    const isClickable = isAccessible && !isActive && !!onStepClick;
                    const isLocked = !isAccessible;

                    const circleContent = (
                        <>
                            <div
                                className={[
                                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all',
                                    isCompleted
                                        ? 'bg-primary text-white'
                                        : isActive
                                          ? 'bg-secondary text-white ring-4 ring-secondary/15'
                                          : 'bg-white border-2 border-slate-200 text-slate-400',
                                ].join(' ')}
                            >
                                {isCompleted ? (
                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                ) : (
                                    step.number
                                )}
                            </div>
                            <span
                                className={[
                                    'text-xs font-semibold whitespace-nowrap',
                                    isActive ? 'text-secondary' : 'text-slate-400',
                                ].join(' ')}
                            >
                                {step.label}
                            </span>
                        </>
                    );

                    return (
                        <div
                            key={step.number}
                            className="flex flex-1 items-center"
                        >
                            {isClickable ? (
                                <button
                                    type="button"
                                    onClick={() => onStepClick(step.number)}
                                    aria-label={`Ir al paso ${step.number}: ${step.label}`}
                                    className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer bg-transparent border-none p-0"
                                >
                                    {circleContent}
                                </button>
                            ) : (
                                <div
                                    className={[
                                        'flex flex-col items-center gap-1.5 shrink-0',
                                        isLocked ? 'cursor-not-allowed' : '',
                                    ].join(' ')}
                                >
                                    {circleContent}
                                </div>
                            )}

                            {/* Connector line */}
                            {idx < steps.length - 1 && (
                                <div
                                    className={[
                                        'flex-1 h-0.5 mx-2 mb-5 rounded-full',
                                        step.number < currentStep ? 'bg-primary' : 'bg-slate-200',
                                    ].join(' ')}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile: compact text indicator */}
            <div className="no-print flex sm:hidden items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white text-sm font-bold shrink-0">
                    {currentStep}
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-medium">
                        Paso {currentStep} de {steps.length}
                    </p>
                    <p className="text-sm font-bold text-secondary">
                        {steps.find((s) => s.number === currentStep)?.label}
                    </p>
                </div>
                <div className="ml-auto flex gap-1">
                    {steps.map((step) => {
                        const isActive = step.number === currentStep;
                        const isCompletedDot = step.number < currentStep;
                        const isAccessible = step.number <= maxReached;
                        const isClickable = isAccessible && !isActive && !!onStepClick;
                        const isLocked = !isAccessible;

                        const dotClass = [
                            'h-1.5 rounded-full transition-all',
                            isActive ? 'w-6 bg-secondary' : isCompletedDot ? 'w-3 bg-primary' : 'w-3 bg-slate-200',
                        ].join(' ');

                        return isClickable ? (
                            <button
                                key={step.number}
                                type="button"
                                onClick={() => onStepClick(step.number)}
                                aria-label={`Ir al paso ${step.number}: ${step.label}`}
                                className={`${dotClass} cursor-pointer border-none p-0`}
                            />
                        ) : (
                            <div
                                key={step.number}
                                className={`${dotClass}${isLocked ? ' cursor-not-allowed' : ''}`}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
}
