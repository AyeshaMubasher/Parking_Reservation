import { AbstractControl, ValidationErrors } from '@angular/forms';

export function startTimeGreaterThanCurrentTime() {
    return (control: AbstractControl): ValidationErrors | null => {
        const currentTime = new Date();
        const startTime = new Date(control.value);

        // If start time is in the past
        if (startTime <= currentTime) {
            return { startTimeGreaterThanCurrentTime: true };
        }

        return null;
    };
}

