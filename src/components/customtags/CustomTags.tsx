
import {
    ListItemProps,
    MultiSelect,
} from "@progress/kendo-react-dropdowns";
import React, { cloneElement } from "react";
import { filterBy } from "@progress/kendo-data-query";
import countries from "./countries";

/**
 * A component that renders a MultiSelect with custom checkbox items.
 * Allows filtering countries via an input field.
 */
export const CustomTags = () => {
    // State to hold the filtered or initial list of countries
    const [data, setData] = React.useState(countries.slice());

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
                />
                {React.Children.map(li.props.children, child => child)}
            </>
        );
        return cloneElement(li, {}, itemChildren);
    };

    // Handles the filter change event to filter the list of countries based on user input.
    const handleFilterChange = (event: any) => {
        setData(filterBy(countries.slice(), event.filter));
    };

    return (
        <div className="example-wrapper">
            <p>Select European countries:</p>
            <MultiSelect
                data={data}
                itemRender={itemRender}
                style={{ width: "300px" }}
                placeholder="e.g. Austria"
                filterable={true}
                adaptive={true} // Enables responsive behavior for the MultiSelect
                onFilterChange={handleFilterChange}
            />
        </div>
    )
}
