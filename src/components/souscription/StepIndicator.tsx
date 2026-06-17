import { Check } from 'lucide-react'
import { clsx } from 'clsx'

interface Step {
  number: number
  label: string
}

interface StepIndicatorProps {
  currentStep: number
  steps: Step[]
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-navy transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              {/* Circle */}
              <div
                className={clsx(
                  'h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
                  isCompleted
                    ? 'bg-navy text-white'
                    : isCurrent
                    ? 'bg-navy text-white ring-4 ring-navy/20'
                    : 'bg-gray-200 text-gray-400'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>

              {/* Label */}
              <span
                className={clsx(
                  'mt-2 text-xs font-medium hidden sm:block text-center max-w-[80px]',
                  isCurrent ? 'text-navy' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Mobile current step label */}
      <div className="sm:hidden mt-4 text-center">
        <span className="text-sm font-medium text-navy">
          Étape {currentStep} : {steps.find((s) => s.number === currentStep)?.label}
        </span>
      </div>
    </div>
  )
}
