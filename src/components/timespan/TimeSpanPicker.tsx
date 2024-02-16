import React, { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import TimeSpinner from './TimeSpinner';
import './TimeSpanPicker.css';
import { v4 as uuidv4 } from 'uuid'

type TimeSpanPickerProps = {
    placeholder?: string;
    minHours?: number;
    maxHours?: number;
    minMinutes?: number;
    maxMinutes?: number;
    minSeconds?: number;
    maxSeconds?: number;
    disabled?: boolean
    id?: string
}
type Time = {
    hours: number;
    minutes: number;
    seconds: number;
}
// TimeSpanPicker component
const TimeSpanPicker = ({ placeholder, minHours = 0, maxHours = 24, minMinutes = 0, maxMinutes = 59, minSeconds = 0, maxSeconds = 59, disabled = false, id }: TimeSpanPickerProps) => {
    // State for controlling the popup visibility
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // State for temporarily holding selected time before setting
    const [tempSelectedTime, setTempSelectedTime] = useState<Time>({ hours: 0, minutes: 0, seconds: 0 });

    // State for the input value displayed in the text field
    const [inputValue, setInputValue] = useState("");

    // State to track whether the input is focused
    const [isFocused, setIsFocused] = useState(false);

    // State to generate id for accessibility
    const [timeSpanId, setTimeSpanId] = useState('')

    // Refs for accessing DOM elements directly
    const popupRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const popupButtonRef = useRef<HTMLButtonElement>(null);

    // Handle global key and mouse events for popup control
    useEffect(() => {
        setTimeSpanId(uuidv4())

        const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setIsPopupOpen(false);
        const handleClickOutside = (e: MouseEvent) => {
            if (!popupRef.current?.contains(e.target as Node)) setIsPopupOpen(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    // Parses the current inputValue to the Time format
    const parseInputValue = () => {
        const parts = inputValue.split(':').map(Number);
        return {
            hours: parts[0] || 0,
            minutes: parts[1] || 0,
            seconds: parts[2] || 0,
        };
    };
    // Toggles the visibility of the popup
    const togglePopup = () => {
        if (!isPopupOpen) {
            const newTime = parseInputValue();
            setTempSelectedTime(newTime);
        }
        setIsPopupOpen(!isPopupOpen);

        // Blur the button after opening the popup
        if (popupButtonRef.current && isPopupOpen) {
            popupButtonRef.current.blur();
        }
    };
    // Updates the tempSelectedTime state when time changes
    const handleTimeChange = (time: Time) => {
        setTempSelectedTime(time);
    };
    // Formats and sets the selected time upon confirmation
    const handleSetTime = () => {
        const formattedTime = `${tempSelectedTime.hours.toString().padStart(2, '0')}:${tempSelectedTime.minutes.toString().padStart(2, '0')}:${tempSelectedTime.seconds.toString().padStart(2, '0')}`;
        setInputValue(formattedTime);
        setIsPopupOpen(false);
    };
    // Updates inputValue based on user input, maintaining time format
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const cursorPosition = e.target.selectionStart || 0;
        let newValue = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        // Reformat the newValue to ensure it has the correct structure (HH:MM:SS)
        newValue = newValue.slice(0, 6).replace(/(\d{2})(?=\d)/g, '$1:'); // Add colons after every two digits
        setInputValue(newValue);
        const [newHours, newMinutes, newSeconds] = newValue.split(':').map(num => parseInt(num, 10) || 0);
        setTempSelectedTime({ hours: newHours, minutes: newMinutes, seconds: newSeconds });
        // Move cursor to the next segment if two digits are entered
        setTimeout(() => {
            if (inputRef.current) {
                const newCursorPosition = cursorPosition + (cursorPosition === 2 || cursorPosition === 5 ? 1 : 0);
                inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        }, 0);
    };

    // Handle arrow key presses for time adjustment and navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') || e.key === 'Backspace') {
            e.preventDefault(); // Prevent the default select all behavior
            return;
        }

        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown':
                handleTimeAdjustment(e);
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
                handleNavigation(e);
                break;
            default:
                return;
        }
    };
    // Handles the adjustment of time based on arrow key presses (up/down)
    const handleTimeAdjustment = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        const cursorPosition = e.currentTarget.selectionStart || 0;
        const timeParts = inputValue.split(':').map(Number);
        const minValues = [minHours, minMinutes, minSeconds];
        const maxValues = [maxHours, maxMinutes, maxSeconds];

        // Determine which part of the time to adjust based on cursor position
        const timeIndex = cursorPosition <= 2 ? 0 : cursorPosition >= 3 && cursorPosition < 6 ? 1 : 2;
        const adjustment = e.key === 'ArrowUp' ? 1 : -1;

        // Adjust the selected time part and ensure it wraps around correctly
        timeParts[timeIndex] += adjustment;
        if (timeParts[timeIndex] < minValues[timeIndex]) timeParts[timeIndex] = maxValues[timeIndex];
        else if (timeParts[timeIndex] > maxValues[timeIndex]) timeParts[timeIndex] = minValues[timeIndex];

        // Format and set the new input value
        const newValue = formatTimeValue(timeParts);
        setInputValue(newValue);
        setTempSelectedTime({ hours: timeParts[0], minutes: timeParts[1], seconds: timeParts[2] });

        // Maintain the cursor position after the input value is updated
        maintainCursorPosition(cursorPosition);
    };
    // Handles navigation through the input with left/right arrow keys
    const handleNavigation = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        const cursorPosition = e.currentTarget.selectionStart || 0;
        let newCursorPosition = cursorPosition;

        // Adjust cursor position based on key press
        if (e.key === 'ArrowRight') {
            newCursorPosition = cursorPosition < 3 ? 3 : cursorPosition >= 3 && cursorPosition < 6 ? 6 : cursorPosition;
        } else if (e.key === 'ArrowLeft') {
            newCursorPosition = cursorPosition >= 1 && cursorPosition <= 5 ? 0 : cursorPosition >= 6 ? 3 : cursorPosition;
        }

        // Update the cursor position after calculation
        maintainCursorPosition(newCursorPosition);
    };
    // Updates the cursor position in the input field
    const maintainCursorPosition = (position: number) => {
        // Timeout ensures the cursor position is updated after React's render cycle
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(position, position);
            }
        }, 0);
    };
    // Formatting function for converting timeParts array to string
    const formatTimeValue = (timeParts: number[]) => {
        return timeParts.map(part => part.toString().padStart(2, '0')).join(':');
    };
    const resetInputValue = useCallback(() => {
        setInputValue("00:00:00");
        // Ensure the input is focused and cursor is positioned at the start
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.setSelectionRange(0, 0);
            }
        }, 0);
    }, []);
    // Set input value to "00:00:00" if it's empty
    const handleFocus = useCallback(() => {
        setIsFocused(true);
        if (!inputValue.trim()) {
            resetInputValue();
        }
    }, [inputValue, resetInputValue]);
    // Clear input if it's "00:00:00", showing the placeholder
    const handleBlur = () => {
        setIsFocused(false);
        if (inputValue === "00:00:00") {
            setInputValue("");
        }
    };
    // Clears the input field and resets tempSelectedTime
    const handleClearInput = () => {
        resetInputValue();
    };
    // Determine whether to show the clear button
    const showClearButton = inputValue && inputValue !== "00:00:00";
    return (
        <div className={`c-timespan ${isFocused ? 'c-focus' : ''}`} >
            <span className='c-inner'>
                <input
                    className='c-input'
                    id={`timespan${id ? -id : ''}`}
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    title={inputValue}
                    disabled={disabled}
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    aria-haspopup="dialog"
                    aria-disabled={disabled}
                    aria-controls={isPopupOpen ? timeSpanId : undefined}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    data-testid='timespan-input'
                />
            </span>
            {showClearButton && (
                <button type="button" onClick={handleClearInput} disabled={disabled} aria-disabled={disabled} aria-label="Clear" title="Clear">
                    X
                </button>
            )}
            <button type="button" ref={popupButtonRef} onClick={togglePopup} disabled={disabled} aria-disabled={disabled} aria-label="Toggle TimeSpanSelector" title="Open Time Span picker">
                <svg aria-hidden="true" className="open-popup-button" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 128h-32v160h160v-32H256V128zm0-96C132.3 32 32 132.3 32 256s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zm0 416c-105.9 0-192-86.1-192-192S150.1 64 256 64s192 86.1 192 192-86.1 192-192 192z"></path></svg>
            </button>
            {isPopupOpen && <Popup
                popupRef={popupRef}
                maxHours={maxHours}
                minHours={minHours}
                minMinutes={minMinutes}
                maxMinutes={maxMinutes}
                minSeconds={minSeconds}
                maxSeconds={maxSeconds}
                tempSelectedTime={tempSelectedTime}
                onTimeChange={handleTimeChange}
                onSetTime={handleSetTime}
                onClose={() => setIsPopupOpen(false)}
                timeSpanId={timeSpanId}
            />}
        </div>
    );
};
interface PopupProps {
    popupRef: React.RefObject<HTMLDivElement>;
    minHours?: number;
    maxHours?: number;
    minMinutes?: number;
    maxMinutes?: number;
    minSeconds?: number;
    maxSeconds?: number;
    tempSelectedTime: Time;
    timeSpanId: string;
    onTimeChange: (time: Time) => void;
    onSetTime: () => void;
    onClose: () => void;
}
const Popup = ({
    popupRef,
    minHours,
    maxHours,
    minMinutes,
    maxMinutes,
    minSeconds,
    maxSeconds,
    tempSelectedTime,
    timeSpanId,
    onTimeChange,
    onSetTime,
    onClose }: PopupProps) => (
    <div className="c-timespan-popup" ref={popupRef} id={timeSpanId}>
        <div className="popup-inner">
            <TimeSpinner
                minHours={minHours}
                maxHours={maxHours}
                minMinutes={minMinutes}
                maxMinutes={maxMinutes}
                minSeconds={minSeconds}
                maxSeconds={maxSeconds}
                selectedTime={tempSelectedTime}
                onTimeChange={onTimeChange}
            />
            {/* Buttons to set the time or close the popup */}
            <div className="c-time-footer">
                <button onClick={onSetTime} className="set-button">Set</button>
                <button onClick={onClose} className="close-button">Close</button>
            </div>
        </div>
    </div>
);
export default TimeSpanPicker;
