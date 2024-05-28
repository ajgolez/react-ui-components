import React, { useEffect, useState } from 'react';
//import { TimelineGroup } from './types';
import { classNames } from '@progress/kendo-react-common';

interface TimelineItem {
    date: string;
    flag?: string;
    title?: string;
    subtitle?: string;
    content?: JSX.Element;
}

interface DataModel {
    items: TimelineItem[];
}

interface TimelineProps {
    data: DataModel[];
    orientation?: 'horizontal' | 'vertical';
    position?: 'k-reverse' | 'alternate' | ''
}

const Timeline: React.FC<TimelineProps> = ({ data, position = 'alternate', orientation = 'vertical' }) => {
    const [collapsedItems, setCollapsedItems] = useState<{ [key: string]: boolean }>({});
    const [selectedItem, setSelectedItem] = useState<{ dataIndex: number; itemIndex: number } | null>(null);
    const [calloutPosition, setCalloutPosition] = useState<{ left: number } | null>(null);

    const handleCircleClick = (event: React.MouseEvent, dataIndex: number, itemIndex: number) => {
        const target = event.currentTarget.getBoundingClientRect();
        setCalloutPosition({ left: target.left + target.width / 2 - 40 });
        setSelectedItem(prevState =>
            prevState && prevState.dataIndex === dataIndex && prevState.itemIndex === itemIndex
                ? null
                : { dataIndex, itemIndex }
        );
    };

    useEffect(() => {
        const initialCollapsedState: { [key: string]: boolean } = {};
        data.forEach((group, dataIndex) => {
            group.items.forEach((_, itemIndex) => {
                initialCollapsedState[`${dataIndex}-${itemIndex}`] = true;
            });
        });
        setCollapsedItems(initialCollapsedState);
    }, [data]);

    const toggleCollapse = (dataIndex: number, itemIndex: number) => {
        const key = `${dataIndex}-${itemIndex}`;
        setCollapsedItems(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }));
    };


    let togglePosition = false;

    return (
        <>
            {orientation === 'vertical' &&
                <div className={`k-timeline k-timeline-${orientation} ${position === 'alternate' ? 'k-timeline-alternating' : ''}`}>
                    <ul>
                        {data.map((group, dataIndex) => (
                            <React.Fragment key={`group-${dataIndex}`}>
                                {group.items.map((item, itemIndex) => {
                                    let itemPosition = position;
                                    if (position === 'alternate') {
                                        itemPosition = togglePosition ? 'k-reverse' : '';
                                        togglePosition = !togglePosition;
                                    } else {
                                        itemPosition = position;
                                    }

                                    const isCollapsed = collapsedItems[`${dataIndex}-${itemIndex}`] || false;

                                    return (
                                        <React.Fragment key={`item-${dataIndex}-${itemIndex}`}>
                                            {item.flag && <li key={`flag-${dataIndex}-${itemIndex}`} className="k-timeline-flag-wrap"><span className="k-timeline-flag">{item.flag}</span></li>}

                                            <li key={`event-${dataIndex}-${itemIndex}`} className={`k-timeline-event ${itemPosition}`}>
                                                <div className="k-timeline-date-wrap">
                                                    <span className="k-timeline-date">{item.date}</span>
                                                </div>
                                                <span className="k-timeline-circle"></span>
                                                <div className={`k-timeline-card ${isCollapsed ? 'k-collapsed' : ''}`}>
                                                    <div className={`k-card k-card-with-callout k-card-${orientation}`} aria-live="polite" aria-atomic="true" role="button" aria-expanded={`${isCollapsed ? false : true}`}>
                                                        <span className={`k-timeline-card-callout k-card-callout k-callout-${itemPosition == '' ? 'w' : 'e'}`}></span>
                                                        <div className="k-card-inner">
                                                            <div className="k-card-header">
                                                                <div className="k-card-title">
                                                                    {item.title &&
                                                                        <span className="k-event-title">{item.title}</span>
                                                                    }
                                                                    {item.content &&
                                                                        <button className="k-button k-button-md k-button-flat k-button-flat-base k-rounded-md k-icon-button k-event-collapse" onClick={() => toggleCollapse(dataIndex, itemIndex)}>
                                                                            <span className="k-icon k-svg-icon k-svg-i-chevron-right k-button-icon" aria-hidden={`${isCollapsed ? true : false}`}>
                                                                                <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                                                    <path d="m158.059 129.941 126.06 126.06-126.06 126.061L192 416l160-159.999L192 96z"></path></svg></span>
                                                                        </button>
                                                                    }
                                                                </div>
                                                                {item.subtitle && <div className="k-card-subtitle">{item.subtitle}</div>}
                                                            </div>
                                                            {!isCollapsed && (
                                                                <div className="k-animation-container k-animation-container-relative">
                                                                    <div className="k-child-animation-container" >
                                                                        <div className="k-card-body">
                                                                            <div className="k-card-description">{item.content}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        </React.Fragment>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            }
            {orientation === 'horizontal' &&
                <div className={`k-timeline k-timeline-${orientation}`}>
                    <div className="k-timeline-track-wrap">
                        <button aria-hidden="true" className="k-button k-button-md k-button-solid k-button-solid-base k-rounded-full k-icon-button k-timeline-arrow k-timeline-arrow-left k-disabled">
                            <span className="k-icon k-svg-icon k-svg-i-caret-alt-left k-button-icon" aria-hidden="true">
                                <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="m160 256 192-128v256z"></path></svg></span></button>
                        <button aria-hidden="true" className="k-button k-button-md k-button-solid k-button-solid-base k-rounded-full k-icon-button k-timeline-arrow k-timeline-arrow-right">
                            <span className="k-icon k-svg-icon k-svg-i-caret-alt-right k-button-icon" aria-hidden="true">
                                <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M352 256 160 384V128z"></path></svg></span></button>
                        <div className="k-timeline-track">
                            <ul className="k-timeline-scrollable-wrap" role="tablist" tab-index="0">
                                {data.map((group, dataIndex) => (
                                    <React.Fragment key={`group-${dataIndex}`}>
                                        {group.items.map((item, itemIndex) =>
                                            <React.Fragment key={`item-${dataIndex}-${itemIndex}`}>
                                                {item.flag && <li key={`flag-${dataIndex}-${itemIndex}`} role="none" className="k-timeline-track-item k-timeline-flag-wrap">
                                                    <span className="k-timeline-flag">{item.flag}</span>
                                                </li>}
                                                <li key={`event-${dataIndex}-${itemIndex}`} role="tab"
                                                    className="k-timeline-track-item"
                                                    aria-selected="false"
                                                    onClick={(event) => handleCircleClick(event, dataIndex, itemIndex)}>

                                                    <div className="k-timeline-date-wrap">
                                                        <span className="k-timeline-date">{item.date}</span>
                                                    </div>
                                                    <span className="k-timeline-circle"></span>
                                                </li>
                                            </React.Fragment>
                                        )}
                                    </React.Fragment>
                                )
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className="k-timeline-events-list">
                        <ul className="k-timeline-scrollable-wrap">
                            {data.map((group, dataIndex) => (
                                <React.Fragment key={`group-${dataIndex}`}>
                                    {group.items.map((item, itemIndex) =>
                                        <li key={`event-${dataIndex}-${itemIndex}`} className="k-timeline-event">
                                            <div data-testid="k-timeline-card"
                                                className={classNames('k-timeline-card', { 'k-hidden': !(selectedItem && selectedItem.dataIndex === dataIndex && selectedItem.itemIndex === itemIndex) })}
                                            >
                                                <div className="k-card k-card-with-callout k-card-vertical" aria-live="polite" aria-atomic="true" tab-index="-1" role="tabpanel" aria-expanded="false">
                                                    <span className="k-timeline-card-callout k-card-callout k-callout-n" style={selectedItem && selectedItem.dataIndex === dataIndex && selectedItem.itemIndex === itemIndex && calloutPosition ? {
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: calloutPosition.left,
                                                        transform: 'translate(-50%, -50%) rotate(45deg)'
                                                    } : {}}></span>
                                                    <div className="k-card-inner">
                                                        <div className="k-card-header">
                                                            {item.title && <div className="k-card-title">
                                                                <span className="k-event-title">{item.title}</span>
                                                            </div>}

                                                            {item.subtitle && <div className="k-card-subtitle">{item.subtitle}</div>}
                                                        </div>
                                                        <div className="k-card-body">
                                                            <div className="k-card-description">{item.content}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    )}
                                </React.Fragment>
                            ))}
                        </ul>
                    </div>
                </div>
            }
        </>
    );
};


export default Timeline;

