import React from 'react';

import {ControlProps} from '../types';
import {useForkRef} from './useForkRef';
import {eventBroker} from './event-broker';

export function useCheckbox({
    name,
    value,
    id,
    defaultChecked,
    checked,
    indeterminate,
    onUpdate,
    onChange,
    controlRef,
    controlProps,
    onFocus,
    onBlur,
    disabled,
}: ControlProps) {
    const innerControlRef = React.useRef<HTMLInputElement>(null);
    const [checkedState, setCheckedState] = React.useState(defaultChecked ?? false);
    const isControlled = typeof checked === 'boolean';
    const isChecked = isControlled ? checked : checkedState;
    const inputChecked = indeterminate ? false : checked;
    const inputAriaChecked = indeterminate ? 'mixed' : isChecked;

    const handleRef = useForkRef(controlRef, innerControlRef);

    React.useLayoutEffect(() => {
        if (innerControlRef.current) {
            innerControlRef.current.indeterminate = Boolean(indeterminate);
        }
    }, [indeterminate]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) {
            setCheckedState(event.target.checked);
        }

        if (onChange) {
            onChange(event);
        }

        if (onUpdate) {
            onUpdate(event.target.checked);
        }
    };

    const handleClick = React.useCallback(
        (event: React.MouseEvent<HTMLInputElement> & {target: {checked?: boolean}}) => {
            eventBroker.publish({
                componentId: 'Checkbox',
                eventId: 'click',
                domEvent: event,
                meta: {
                    checked: event.target.checked,
                },
            });
            controlProps?.onClick?.(event);
        },
        [controlProps?.onClick],
    );

    const inputProps: React.InputHTMLAttributes<HTMLInputElement> &
        React.RefAttributes<HTMLInputElement> = {
        ...controlProps,
        name,
        value,
        id,
        onFocus,
        onBlur,
        disabled,
        type: 'checkbox',
        onChange: handleChange,
        onClick: handleClick,
        defaultChecked: defaultChecked,
        checked: inputChecked,
        'aria-checked': inputAriaChecked,
        ref: handleRef,
    };

    return {checked: isChecked, inputProps};
}
