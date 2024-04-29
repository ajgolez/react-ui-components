import {
    ListItemProps,
    MultiSelect,
    MultiSelectChangeEvent, MultiSelectFilterChangeEvent
} from "@progress/kendo-react-dropdowns";
import React, { cloneElement, useState } from "react";
import { filterBy } from "@progress/kendo-data-query";
import datalist from "./countries";

/**
 * A component that renders a MultiSelect with custom checkbox items.
 * Allows filtering countries via an input field.
 */
export const DropdownMultiSelect = () => {
    const [data, setData] = React.useState(datalist);
    const [selectedItem, setSelectedItem] = useState<string[]>([]);

    // Custom rendering function for each dropdown item
    const renderDropdownItem = (
        li: React.ReactElement<HTMLLIElement>,
        itemProps: ListItemProps
    ) => {
        const itemChildren = (
            <>
                <input
                    type="checkbox"
                    name={itemProps.dataItem}
                    checked={itemProps.selected}
                    onChange={(e) => toggleSelection(itemProps.dataItem, e.target.checked)}
                /><span> d</span>
                {React.Children.map(li.props.children, child => child)}
            </>
        );
        return cloneElement(li, {}, itemChildren);
    };

    // Toggle selection state item    
    const toggleSelection = (dataItem: string, isChecked: boolean) => {
        setSelectedItem(prev => {
            // Create a new array from the previous state
            const newSelected = [...prev];
            const index = newSelected.indexOf(dataItem);

            if (isChecked && index === -1) {
                // Item not in the array and should be added
                newSelected.push(dataItem);
            } else if (!isChecked && index !== -1) {
                // Item in the array and should be removed
                newSelected.splice(index, 1);
            }

            return newSelected;
        });
    };


    // Handle changes in the search filter
    const handleFilterChange = (event: MultiSelectFilterChangeEvent) => {
        setData(filterBy(datalist, event.filter));
    };

    // Handle changes in the selected items
    const handleChange = (event: MultiSelectChangeEvent) => {
        setSelectedItem(event.target.value as string[]);
    };

    return (
        <div className="example-wrapper">
            <p>Select item/s:</p>
            <MultiSelect
                data={data}
                value={selectedItem}
                onChange={handleChange}
                itemRender={renderDropdownItem}
                textField="text"
                dataItemKey="id"
                placeholder="Type to search..."
                filterable={true}
                adaptive={true}
                onFilterChange={handleFilterChange}
                required={true}
                skipDisabledItems={true}
                style={{ width: "300px" }}
            />
        </div>
    )
}
