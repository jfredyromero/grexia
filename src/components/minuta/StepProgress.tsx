import SharedStepProgress from '../shared/StepProgress';
import { STEPS } from './types';

interface StepProgressProps {
    currentStep: number;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
    return <SharedStepProgress steps={STEPS} currentStep={currentStep} />;
}
