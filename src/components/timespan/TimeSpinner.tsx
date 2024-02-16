import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TimeSpanProps {
    minHours?: number;
    maxHours?: number;
    minMinutes?: number;
    maxMinutes?: number;
    minSeconds?: number;
    maxSeconds?: number;
    placeholder?: string;
    selectedTime: { hours: number, minutes: number, seconds: number };
    onTimeChange: (time: { hours: number, minutes: number, seconds: number }) => void;
}

const TimeSpinner = ({
    minHours = 0,
    maxHours = 24,
    minMinutes = 0,
    maxMinutes = 59,
    minSeconds = 0,
    maxSeconds = 59, selectedTime, onTimeChange }: TimeSpanProps) => {

    // State for hours, minutes, and seconds
    const [hours, setHours] = useState<number>(selectedTime.hours || minHours);
    const [minutes, setMinutes] = useState<number>(selectedTime.minutes || minMinutes);
    const [seconds, setSeconds] = useState<number>(selectedTime.seconds || minSeconds);

    // Refs for focus management
    const hoursRef = useRef<HTMLDivElement | null>(null);
    const minutesRef = useRef<HTMLDivElement | null>(null);
    const secondsRef = useRef<HTMLDivElement | null>(null);

    // State for managing UI interactions
    const [focusedField, setFocusedField] = useState<number | null>(null);
    const [hoveredField, setHoveredField] = useState<number | null>(null);

    // State for managing scroll progress in the spinners
    const [hoursScrollProgress, setHoursScrollProgress] = useState<number>(0);
    const [minutesScrollProgress, setMinutesScrollProgress] = useState<number>(0);
    const [secondsScrollProgress, setSecondsScrollProgress] = useState<number>(0);

    // Handles number selection from the spinner
    const handleNumberClick = (num: number) => {
        // Update the time based on the focused field
        if (focusedField === 0) {
            setHours(num);
            onTimeChange({ ...selectedTime, hours: num });
        } else if (focusedField === 1) {
            setMinutes(num);
            onTimeChange({ ...selectedTime, minutes: num });
        } else if (focusedField === 2) {
            setSeconds(num);
            onTimeChange({ ...selectedTime, seconds: num });
        }
        return num;
    };


    // Handles scrolling on the spinners
    const handleWheel = (
        e: React.WheelEvent<HTMLDivElement>,
        setFunction: React.Dispatch<React.SetStateAction<number>>,
        setScrollProgress: React.Dispatch<React.SetStateAction<number>>,
        scrollProgress: number,
        minValue: number,
        maxValue: number,
        fieldIndex: number
    ) => {
        e.preventDefault(); // Prevents the whole page from scrolling
        const newScrollProgress = scrollProgress + e.deltaY; // Accumulate deltaY values from the wheel event
        const deltaYThreshold = 100; // Threshold for when to apply the scroll progress as a step
        if (Math.abs(newScrollProgress) >= deltaYThreshold) {
            const steps = Math.floor(Math.abs(newScrollProgress) / deltaYThreshold) * (newScrollProgress > 0 ? 1 : -1);
            setFunction((prevValue) => {
                let newValue = prevValue + steps;
                newValue = Math.max(Math.min(newValue, maxValue), minValue); // Ensure newValue is between minValue and maxValue
                setScrollProgress(newScrollProgress % deltaYThreshold); // Reset scroll progress

                // After updating the state, call with the new values
                if (fieldIndex === 0) {
                    onTimeChange({ ...selectedTime, hours: newValue });
                } else if (fieldIndex === 1) {
                    onTimeChange({ ...selectedTime, minutes: newValue });
                } else if (fieldIndex === 2) {
                    onTimeChange({ ...selectedTime, seconds: newValue });
                }
                return newValue;
            });
        } else {
            // Update scroll progress without applying changes
            setScrollProgress(newScrollProgress);
        }
        setHoveredField(fieldIndex); // Update hovered field if needed
    };


    // Reset hovered field
    const handleMouseLeave = () => {
        setHoveredField(null);
    };

    // Set focus to the input field
    const handleFocus = (fieldIndex: number) => {
        setFocusedField(fieldIndex);
    };

    // Reset focused field
    const handleBlur = () => {
        setFocusedField(null);
    };

    // Handles arrow key navigation for adjusting time
    const handleArrowKeys = useCallback((e: KeyboardEvent) => {
        const arrowKeyStep = 1; // Step for arrow keys. TODO: May need to be added to property for customizability
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (document.activeElement === hoursRef.current) {
                setHours(prevHours => {
                    const newHours = ((prevHours - arrowKeyStep + maxHours + 1) % (maxHours + 1));
                    onTimeChange({ ...selectedTime, hours: newHours });
                    return newHours;
                });
            } else if (document.activeElement === minutesRef.current) {
                setMinutes(prevMinutes => {
                    const newMinutes = ((prevMinutes - arrowKeyStep + 60) % 60);
                    onTimeChange({ ...selectedTime, minutes: newMinutes });
                    return newMinutes;
                });
            } else if (document.activeElement === secondsRef.current) {
                setSeconds(prevSeconds => {
                    const newSeconds = ((prevSeconds - arrowKeyStep + 60) % 60);
                    onTimeChange({ ...selectedTime, seconds: newSeconds });
                    return newSeconds;
                });
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (document.activeElement === hoursRef.current) {
                setHours(prevHours => {
                    const newHours = ((prevHours + arrowKeyStep + maxHours + 1) % (maxHours + 1));
                    onTimeChange({ ...selectedTime, hours: newHours });
                    return newHours;
                });

            } else if (document.activeElement === minutesRef.current) {
                setMinutes(prevMinutes => {
                    const newMinutes = ((prevMinutes + arrowKeyStep) % 59);
                    onTimeChange({ ...selectedTime, minutes: newMinutes });
                    return newMinutes;
                });

            } else if (document.activeElement === secondsRef.current) {
                setSeconds(prevSeconds => {
                    const newSeconds = ((prevSeconds + arrowKeyStep) % 59);
                    onTimeChange({ ...selectedTime, seconds: newSeconds });
                    return newSeconds;
                });

            }
        }
    }, [maxHours, onTimeChange, selectedTime]);


    // Handles tab navigation between spinners
    const handleTab = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (document.activeElement === hoursRef.current) {
                minutesRef.current?.focus();
            } else if (document.activeElement === minutesRef.current) {
                secondsRef.current?.focus();
            }
        }
    }, []);

    // Renders the spinner numbers
    const renderSpinnerNumbers = (value: number, minValue: number, maxValue: number) => {
        const totalNumbersToShow = 3; // Total before/after numbers to show
        const numbers = [];

        // Generate beforeNumbers with consideration for minValue
        for (let i = totalNumbersToShow; i > 0; i--) {
            let beforeNumber = value - i;
            if (beforeNumber < minValue) {
                beforeNumber = maxValue - (minValue - beforeNumber - 1);
            }
            numbers.push(beforeNumber);
        }

        // Add the current value
        numbers.push(value);

        // Generate afterNumbers with consideration for maxValue
        for (let i = 1; i <= totalNumbersToShow; i++) {
            let afterNumber = value + i;
            if (afterNumber > maxValue) {
                afterNumber = minValue + (afterNumber - maxValue - 1);
            }
            numbers.push(afterNumber);
        }

        // Render the numbers
        return (
            <>
                {numbers.map((num, index) => (
                    <div
                        key={index}
                        className={`c-item ${num === value ? 'selected' : ''}`}
                        onClick={() => handleNumberClick(num)}
                    >
                        {num}
                    </div>
                ))}
            </>
        );
    };


    useEffect(() => {

        const currentHoursRef = hoursRef.current;
        const currentMinutesRef = minutesRef.current;
        const currentSecondsRef = secondsRef.current;

        if (
            currentHoursRef && currentMinutesRef && currentSecondsRef
        ) {
            currentHoursRef.tabIndex = 0;
            currentMinutesRef.tabIndex = 1;
            currentSecondsRef.tabIndex = 2;

            // Add keydown event listeners to each spinner for arrow key and tab navigation
            currentHoursRef.addEventListener('keydown', handleArrowKeys);
            currentMinutesRef.addEventListener('keydown', handleArrowKeys);
            currentSecondsRef.addEventListener('keydown', handleArrowKeys);
            currentHoursRef.addEventListener('keydown', handleTab);
            currentMinutesRef.addEventListener('keydown', handleTab);
            currentSecondsRef.addEventListener('keydown', handleTab);

            // Cleanup function removes event listeners to prevent memory leaks
            return () => {
                currentHoursRef.removeEventListener('keydown', handleArrowKeys);
                currentMinutesRef.removeEventListener('keydown', handleArrowKeys);
                currentSecondsRef.removeEventListener('keydown', handleArrowKeys);
                currentHoursRef.removeEventListener('keydown', handleTab);
                currentMinutesRef.removeEventListener('keydown', handleTab);
                currentSecondsRef.removeEventListener('keydown', handleTab);
            };
        }
    }, [handleArrowKeys, handleTab]);

    return (
        <div className="c-time-list-container">
            <div className='c-time-highlight'></div>
            <div className="c-time-list-wrapper">
                <span className='c-time-list-title'>Hours</span>
                <div
                    tabIndex={0}
                    className={`c-time-list ${hoveredField === 0 ? 'Hovered' : ''}`}
                    ref={hoursRef}
                    onWheel={(e) => handleWheel(e, setHours, setHoursScrollProgress, hoursScrollProgress, minHours, maxHours, 0)} // For hours
                    onMouseLeave={handleMouseLeave}
                    onFocus={() => handleFocus(0)}
                    onBlur={handleBlur}
                >
                    {renderSpinnerNumbers(hours, minHours, maxHours)}
                </div>
            </div>
            <div className="c-separator">:</div>
            <div className="c-time-list-wrapper">
                <span className='c-time-list-title'>Minutes</span>
                <div
                    tabIndex={1}
                    className={`c-time-list ${hoveredField === 0 ? 'Hovered' : ''}`}
                    ref={minutesRef}
                    onWheel={(e) => handleWheel(e, setMinutes, setMinutesScrollProgress, minutesScrollProgress, minMinutes, maxMinutes, 1)} // For minutes
                    onMouseLeave={handleMouseLeave}
                    onFocus={() => handleFocus(1)}
                    onBlur={handleBlur}
                >
                    {renderSpinnerNumbers(minutes, minMinutes, maxMinutes)}
                </div>
            </div>
            <div className="c-separator">:</div>
            <div className="c-time-list-wrapper">
                <span className='c-time-list-title'>Seconds</span>
                <div
                    tabIndex={2}
                    className={`c-time-list ${hoveredField === 0 ? 'Hovered' : ''}`}
                    ref={secondsRef}
                    onWheel={(e) => handleWheel(e, setSeconds, setSecondsScrollProgress, secondsScrollProgress, minSeconds, maxSeconds, 2)} // For seconds
                    onMouseLeave={handleMouseLeave}
                    onFocus={() => handleFocus(2)}
                    onBlur={handleBlur}>
                    {renderSpinnerNumbers(seconds, minSeconds, maxSeconds)}
                </div>
            </div>
        </div>
    );

};
export default TimeSpinner;
