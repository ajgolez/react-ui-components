

import {
    ListItemProps,
    MultiSelect,
    MultiSelectChangeEvent,
} from "@progress/kendo-react-dropdowns";
import React, { cloneElement, useState } from "react";
import { filterBy } from "@progress/kendo-data-query";
import countries from "./countries";
/**
 * A component that renders a MultiSelect with custom checkbox items.
 * Allows filtering countries via an input field.
 */
export const CustomTags = () => {
    // State to hold the filtered or initial list of countries
    const [data, setData] = React.useState(countries.slice());
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]); // Explicitly declare the state type as string[]
    // It renders a checkbox with each country and maps over children for additional customization.
    const itemRender = (
        li: React.ReactElement<HTMLLIElement>,
        itemProps: ListItemProps
    ) => {
        const itemChildren = (
            <>
                <input
                    type="checkbox"
                    name={itemProps.dataItem}
                    checked={itemProps.selected}
                    onChange={(e) => handleCheckboxChange(itemProps.dataItem, e.target.checked)}
                />
                {React.Children.map(li.props.children, child => child)}
            </>
        );
        return cloneElement(li, {}, itemChildren);
    };
    const handleCheckboxChange = (dataItem: string, isChecked: boolean) => {
        setSelectedCountries(prev => {
            const newSelected = new Set(prev);
            if (isChecked) {
                newSelected.add(dataItem);
            } else {
                newSelected.delete(dataItem);
            }
            return Array.from(newSelected);
        });
    };
    // Handles the filter change event to filter the list of countries based on user input.
    const handleFilterChange = (event: any) => {
        setData(filterBy(countries.slice(), event.filter));
    };
    // Handle change event for MultiSelect
    const handleChange = (event: MultiSelectChangeEvent) => {
        console.log('handlechange')
        setSelectedCountries(event.target.value as string[]); // Cast to string[] if you're certain of the structure
    };
    return (
        <div className="example-wrapper">
            <p>Select European countries:</p>
            <MultiSelect
                data={data}
                itemRender={itemRender}
                style={{ width: "300px" }}
                placeholder="Type to search."
                filterable={true}
                adaptive={true} // Enables responsive behavior for the MultiSelect
                onFilterChange={handleFilterChange}
                value={selectedCountries}
                onChange={handleChange}
                required={true}
                skipDisabledItems={true}
            />
        </div>
    )
}
