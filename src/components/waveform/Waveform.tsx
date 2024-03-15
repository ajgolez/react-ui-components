import { useEffect, useState, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions';
import MarkersPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.markers';
import { Region } from 'wavesurfer.js/src/plugin/regions';
import './Waveform.css';
import { createPopper } from '@popperjs/core';

enum ResultTypeId {
    Success = 0,
    Failed,
    Satisfactory,
    Aborted,
    InternalError,
    Pending
}

type GroupedAudioSection = {
    id: string
    sections: Array<AudioSection>
    start: number | null
    end: number | null
    title?: string;
    type?: string;
}

interface AudioSection {
    id: string;
    start: number | null;
    end: number | null;
    title?: string;
    type?: string;
    popoverDetails?: {
        stepNo: number;
        resultTypeId: ResultTypeId;
        resultDetail: string;
        responseTime: string;
        duration: string;
    };
}

type AudioInspectorProps = {
    file: string;
    sections: Array<AudioSection>;
    previousStepLabel?: string;
    nextStepLabel?: string;
    startLabel?: string;
    endLabel?: string;
    channelTopLabel?: string;
    channelBottomLabel?: string;
    zoomInSelectionLabel?: string;
    zoomInLabel?: string;
    zoomOutLabel?: string;
    zoomOutSelectionLabel?: string;
    resetZoomLabel?: string;
    channelSingleLabel?: string;
    channelMultiLabel?: string;
    zoomLabel?: string;
    zoomIncrement?: number;
    groupingFactor?: number
    onLoaded?: () => void;
    onError?: (error: any) => void;
    waveColor?: string;
    rightContainer?: React.ReactNode;
    leftContainer?: React.ReactNode;
}

export const Waveform = ({
    file,
    sections,
    previousStepLabel = 'Previous Step',
    nextStepLabel = 'Next Step',
    startLabel = 'Go to Start',
    endLabel = 'Go to End',
    channelTopLabel = 'Heard',
    channelBottomLabel = 'Replied With',
    zoomInSelectionLabel = 'Zoom Selection',
    zoomInLabel = 'Zoom In',
    zoomOutLabel = 'Zoom Out',
    resetZoomLabel = 'Reset Zoom',
    zoomLabel = 'Zoom',
    zoomIncrement = 100,
    groupingFactor = 2,
    onLoaded,
    onError,
    waveColor = '#3E80D1',
    ...props }: AudioInspectorProps) => {
    let waveColour = waveColor;
    const [splitChannels, setSplitChannels] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasError, setHasError] = useState(false);
    let [zoomReset, setZoomReset] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hasMultiChannel, setHasMultiChannel] = useState(false);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [_suppressRegionPopover, setSuppressRegionPopover] = useState<boolean>(false);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    let [group, setGroup] = useState<Array<GroupedAudioSection>>([]);
    const progressLoaderRef = useRef(null);
    const progressLoader = progressLoaderRef.current;
    const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
    let [selectionText, setSelectionText] = useState('');
    let _groupedSections: Array<GroupedAudioSection> = [];
    let suppressRegionClear: boolean;
    let seekPosition: number = 0;
    const [popperIsVisible, setPopperIsVisible] = useState(false);
    const [selectionZoomed, setSelectionZoomed] = useState(false);

    if (referenceElement && popperElement) {
        // Create a Popper instance to position the popper element relative to the reference element
        createPopper(referenceElement, popperElement, {
            strategy: 'fixed',
            placement: 'top',
            modifiers: [{
                name: 'offset',
                options: {
                    offset: () => {
                        return [0, -5];
                    },
                },
            }],
        });
    }
    const updateSelectionText = (region: Region) => {
        // Calculate the duration of the selected region in seconds
        let seconds = (region.end - region.start);
        setSelectionText(seconds.toFixed(2) + 's')
        const zoomSelectionBtn = document.getElementById('zoomSelectionBtn') as HTMLButtonElement
        if (zoomSelectionBtn) {
            zoomSelectionBtn.disabled = seconds < 0.25;
        }
    };

    //Converts a hexadecimal color string to an RGB object.
    const hexToRgb = (hex: string) => {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    const getResultTypeInfo = (resultTypeId: ResultTypeId | undefined) => {
        switch (resultTypeId) {
            case ResultTypeId.Success:
                return { className: 'success', text: 'Success' };
            case ResultTypeId.Failed:
                return { className: 'failed', text: 'Failed' };
            case ResultTypeId.Satisfactory:
                return { className: 'satisfactory', text: 'Satisfactory' };
            case ResultTypeId.Aborted:
                return { className: 'aborted', text: 'Aborted' };
            case ResultTypeId.InternalError:
                return { className: 'internal-error', text: 'Internal Error' };
            default:
                return { className: 'pending', text: 'Pending' };
        }
    }

    // This hook handles the logic for updating the waveform display 
    // based on the splitChannels and hasMultiChannel states.
    useEffect(() => {
        if (!hasMultiChannel) {
            setSplitChannels(false);
        } else {
            if (wavesurferRef.current) {
                wavesurferRef.current.params.splitChannels = splitChannels;
                wavesurferRef.current.setHeight(80);
            }
        }
        // Redraw the waveform and apply zoom after
        setTimeout(() => {
            wavesurferRef.current?.drawBuffer();
            wavesurfer?.zoom();
        }, 500);
    }, [splitChannels, hasMultiChannel, wavesurfer]);

    // Handle the 'ready' event of WaveSurfer and call the onLoaded callback if provided
    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.on('ready', () => {
                setIsLoading(false);
                if (onLoaded) {
                    onLoaded();
                }
            });
        }
    }, []);

    // Initialize WaveSurfer with configuration options
    useEffect(() => {

        // Convert color to rgb for opacity
        let color = hexToRgb(waveColour);
        let waveColor = `rgba(${color?.r},${color?.g},${color?.b}, 1)`;
        if (containerRef.current) {
            let ws = wavesurferRef.current;
            ws = WaveSurfer.create({
                container: containerRef.current,
                waveColor: waveColor,
                cursorColor: '#555555',
                progressColor: '#555555',
                responsive: true,
                hideScrollbar: false,
                splitChannels: true,
                height: 80,
                splitChannelsOptions: {
                    overlay: false
                },
                barHeight: 1,
                pixelRatio: 1,
                plugins: [
                    CursorPlugin.create({
                        showTime: true,
                        opacity: `1`,
                        customShowTimeStyle: {
                            'background-color': '#555555',
                            color: '#fff',
                            padding: '0.25rem',
                            'font-size': '0.6rem',
                            'border-radius': `0 4px 4px 0`
                        },
                        formatTimeCallback: (t: number) => {
                            return `${t.toFixed(2)}s`;
                        },
                        cursorWidth: 3
                    }),
                    RegionsPlugin.create(
                        {
                            dragSelection: {
                                slop: 1
                            }
                        }
                    ),
                    MarkersPlugin.create()
                ]
            });
            // Assign the WaveSurfer instance to the ref and state
            wavesurferRef.current = ws;
            setWavesurfer(ws);
            // Loads the audio file
            if (file) {
                setHasError(false);
                setIsLoading(true);
                ws.load(file);
            } else {
                setIsLoading(true);
            }
            ws.on('ready', () => {
                // Perform actions when WaveSurfer is ready
                if (ws?.backend) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const buffer = (ws.backend as any).buffer;
                    if (buffer instanceof AudioBuffer) {
                        const isMultiChannel = buffer.numberOfChannels > 1;
                        setHasMultiChannel(isMultiChannel);
                        setSplitChannels(isMultiChannel);
                    }
                } else {
                    setHasMultiChannel(false);
                    setSplitChannels(false);
                }
                if (ws) {
                    setDuration(ws.getDuration());
                }
                setIsLoading(false);
            });
            ws.on('pause', () => {
                setIsPlaying(false)
            });
            ws.on('play', () => {
                setIsPlaying(true)
            });
            ws.on('error', (error) => {
                setHasError(true);
                setIsLoading(false);
                if (onError) {
                    onError(error);
                }
            });
            ws.on('loading', (loading) => {
                setIsLoading(true)
                //progressLoader.value = loading;
            });
            ws.on('zoom', (zoom) => {
                const newZoom = (!zoom || zoom < 0) ? 0 : Number(zoom);
                setZoomLevel(newZoom);
                setTimeout(() => {
                    toggleZoomControls(newZoom);
                }, 100);
            });
            // ws.on('seek', (e) => {
            //     console.log('suppressRegionClear', suppressRegionClear)
            //     setSeekPosition(e);
            //     if (!suppressRegionClear) {
            //         clearSelection();
            //     }
            //     setSuppressRegionClear(false);
            // });
            let events = [`region-created`,
                `region-updated`, `region-update-end`,
                `region-mouseenter`, `region-removed`, `region-click`,
                `marker-click`
            ];
            events.forEach(event => {
                wavesurferRef.current?.on(event, (region) => {
                    if (event === 'region-update-end') {
                        // Stop suppressing the popover and check if the zoom should be reset
                        setSuppressRegionPopover(false);
                        checkZoomReset();
                    } else if (event === 'region-updated') {
                        // Remove any other regions that are not steps
                        for (let k in wavesurferRef.current?.regions.list) {
                            if ((wavesurferRef.current?.regions.list[k] !== region) && (!wavesurferRef.current?.regions.list[k].data.step)) {
                                wavesurferRef.current?.regions.list[k].remove();
                            }
                        }
                        // Mark the region as a selection and update the cursor element
                        if (region.element.className.indexOf('selection') === -1) {
                            region.data.type = 'selection';
                            region.element.className += ' selection';
                            const cursorElement = document.querySelector('.cursor');
                            if (cursorElement && cursorElement.className.indexOf('no-label') === -1) {
                                cursorElement.className = 'no-label';
                            }
                        }
                        // Set the reference element for the popper and make it visible
                        const regionElement = document.querySelector(`[data-id="${region.id}"]`) as HTMLElement | null;
                        if (regionElement) {
                            setReferenceElement(regionElement);
                        }
                        setPopperIsVisible(true);
                        // Update the selection text and hide other popovers
                        updateSelectionText(region)
                        hideStepPopovers();
                        setSuppressRegionPopover(true);
                    } else if (event === 'region-created') {
                        // Handle the creation of a new region
                        region.showTooltip = false;
                        region.element.removeAttribute('title');
                        if (region.data) {
                            if (region.data.step) {
                                region.element.className += ' no-handle ';
                            }
                            if (region.data.class) {
                                region.element.className += ` ${region.data.class}`;
                            }
                        }
                    } else if (event === 'region-mouseenter') {
                        // Show the popover for the region on mouse enter, if there's no active selection
                        if (!getActiveSelection()) {
                            if (region && region.data) {
                                if (region.data.step) {
                                    showStepPopover(region.id);
                                }
                            }
                        }
                    } else if (event === 'region-click' && !suppressRegionClear) {
                        // Clear the selection and hide the popover on region click
                        clearSelection();
                        setPopperIsVisible(false);
                        clearActiveRegions();
                    }
                });
            });
            // Redraw the waveform on window resize
            window.onresize = () => {
                if (wavesurferRef.current) {
                    wavesurferRef.current.drawBuffer()
                }
            }
            // Handle clicks outside the waveform container to hide popovers and toggle zoom controls
            const handleClick = (e: MouseEvent) => {
                if (containerRef.current && 'contains' in containerRef.current) {
                    let t = e.target as Node;
                    let clickedInside = containerRef.current.contains(t);
                    if (!clickedInside) {
                        hideStepPopovers();
                        //toggleZoomControls();
                    }
                }
            };
            document.addEventListener('click', handleClick);

            // Cleanup function to destroy the WaveSurfer instance when the component unmounts
            return () => {
                ws?.destroy();
            };
        }
    }, []);


    // Group all sections then add markers after the wavesurfer state has been updated
    useEffect(() => {
        if (wavesurfer) {
            groupSections();
            addMarkers();
        }
    }, [wavesurfer]);

    // Toggles the visibility of a specific step popover
    const showStepPopover = async (id: string) => {

        if (_suppressRegionPopover) {
            return;
        }

        // First, close all existing popovers
        const allPopovers = document.querySelectorAll('audio-inspector-popover');
        allPopovers.forEach((pop) => {
            pop.classList.remove('open');
        });

        // Find the popover corresponding to the given id
        let popover = document.querySelector(`audio-inspector-popover[data-id="${id}"], audio-inspector-popover[data-group="${id}"]`);

        // Adjust the position of the popover based on its height
        if (popover instanceof HTMLElement) {
            const popoverHeight = popover.offsetHeight;
            popover.style.top = (-popoverHeight - 5) + 'px'; // Position it above its reference element
        }

        // Toggle the 'open' class to show or hide the popover
        popover?.classList.toggle('open');
    };

    // Hides all step popovers
    const hideStepPopovers = async () => {
        const allPopovers = document.querySelectorAll('audio-inspector-popover');
        allPopovers.forEach((pop) => {
            pop.classList.remove('open');
        });
    }
    // Clear all non selection regions
    const clearStepRegions = () => {
        for (let k in wavesurfer?.regions.list) {
            if (wavesurfer?.regions.list[k].data.type !== `selection`) {
                wavesurfer?.regions.list[k].remove();
            }
        }
    }
    // Clear out any regions that may be set as active
    const clearActiveRegions = () => {
        for (let k in wavesurfer?.regions.list) {
            if (wavesurfer?.regions.list[k]) {
                wavesurfer.regions.list[k].element.className = wavesurfer.regions.list[k].element.className.replace(`active`, ``);
            }
        }
    }

    // Generate the markers based on groups of sections
    const addMarkers = () => {
        if (wavesurfer) {
            // Remove all non-selection-based markers and regions
            wavesurfer.clearMarkers();
            clearStepRegions();
            setGroup(_groupedSections);

            // Generate the wavesurfer regions and markers based on sections
            _groupedSections.forEach((groupedSection) => {

                // Add a region for each section
                wavesurfer.addRegion({
                    start: groupedSection.start,
                    end: groupedSection.end,
                    id: groupedSection.id,
                    drag: false,
                    resize: false,
                    data: {
                        step: true,
                        class: groupedSection.type,
                        label: groupedSection.title
                    }
                });

                // Add a marker for each section
                wavesurfer.addMarker({
                    time: groupedSection.start,
                    label: groupedSection.title,
                    position: `top`
                });

                // Create and append popovers for each section
                const containers = document.querySelectorAll('.waveform-container');
                containers.forEach((container) => {
                    const markers = container.querySelectorAll('marker > div > span');

                    // For each marker, check if it already has a popover, and if not, create and append a new popover
                    markers.forEach((marker, i) => {
                        if (!marker.querySelector('audio-inspector-popover')) {
                            let popover = document.createElement('audio-inspector-popover');
                            popover.setAttribute('data-id', `${groupedSection.id}`);
                            popover.className = 'popover';
                            let popoverContent = '';

                            // Iterate through each section in the grouped section
                            groupedSection.sections.forEach((section) => {
                                popoverContent += `
                <div class="c-popover-details-wrapper">
                    <div class="c-popover-top-wrapper">
                        <div class="c-popover-step">
                            <strong>Step ${section.popoverDetails?.stepNo}</strong>
                        </div>
                        <div class="c-popover-badge ${getResultTypeInfo(section.popoverDetails?.resultTypeId).className}">
                            ${getResultTypeInfo(section.popoverDetails?.resultTypeId).text}
                        </div>
                    </div>
                    <div class="c-popover-result-wrapper">
                        <div class="c-popover-result-detail">${section.popoverDetails?.resultDetail}</div>
                        <div class="c-popover-response-time">Response Time: ${section.popoverDetails?.responseTime}</div>
                        <div class="c-popover-duration">Duration: ${section.popoverDetails?.duration}</div>
                    </div>
                </div>`;
                            });

                            popover.innerHTML = popoverContent;
                            marker.appendChild(popover);
                        }
                    });
                });
            });

            // Add a class to the first marker to adjust its position
            const containers = document.querySelectorAll('.waveform-container');
            containers.forEach((container) => {
                const markers = container.querySelectorAll('.wavesurfer-marker');
                if (markers.length > 0) {
                    markers[0].classList.add('marker-start');
                }
            });
        }

        // Accessibility-compliance, markers to have unique IDs
        const polygons = document.querySelectorAll('svg polygon');
        polygons.forEach((polygon, index) => {
            polygon.setAttribute('id', `polygon-${index}`);
        });
    }

    // Determine if steps need to be grouped based on their proximity
    const groupSections = () => {
        let groups: Array<Array<AudioSection>> = [];
        let groupedIds: string[] = [];
        const totalDuration = sections[sections.length - 1].end ?? 0;
        const stepGroupThreshold = totalDuration * (groupingFactor / 100);

        // Iterate over sections to check for adjacent sections to group
        for (let i = 0; i < sections.length; i++) {
            let isGrouped = false;

            // Check if the current section is already part of a group
            for (let group of groups) {
                if (group.some(groupEl => groupEl.id === sections[i].id)) {
                    isGrouped = true;
                    break;
                }
            }

            // If not grouped, check if it should be grouped with adjacent sections
            if (!isGrouped) {
                let newGroup: Array<AudioSection> = [sections[i]];

                for (let j = i + 1; j < sections.length; j++) {
                    let range = Math.abs((sections[i].start ?? 0) - (sections[j].start ?? 0));
                    if (range <= stepGroupThreshold) {
                        newGroup.push(sections[j]);
                        groupedIds.push(sections[j].id);
                    } else {
                        break;
                    }
                }

                groups.push(newGroup);
                groupedIds.push(sections[i].id);
            }
        }

        // Create grouped sections based on the groups formed
        groups.forEach((group, i) => {
            let sectionEnd: number | null = null;
            let sectionStart: number | null = null;
            let title = '';
            let type: string = 'default';
            const titles: string[] = [];

            // Determine the start, end, title, and type for the grouped section
            group.forEach((section, i) => {
                // Track all section IDs in the group
                groupedIds.push(section.id);

                // Determine the earliest start time for the group
                if (section.start !== null && (!sectionStart || section.start <= sectionStart)) {
                    sectionStart = section.start;
                }

                // Determine the latest end time for the group
                if (section.end !== null && (!sectionEnd || section.end > sectionEnd)) {
                    sectionEnd = section.end;
                }

                // Collect titles of all sections in the group
                titles.push(section.title || '');

                // If any section in the group has an error, mark the entire group as an error
                if (section.type === `error`) {
                    type = `error`;
                }
            });

            // Construct the title for the grouped section, joining individual titles with ", " and adding " & " before the last title
            if (titles.length > 1) {
                title = titles.slice(0, -1).join(", ") + " & " + titles[titles.length - 1];
            } else if (titles.length === 1) {
                // If there's only one title, use it as is
                title = titles[0];
            }

            // Add the grouped section to _groupedSections
            _groupedSections.push({
                id: `g-${i}`,
                start: sectionStart,
                end: sectionEnd,
                type: type,
                title: title,
                sections: group
            })
        });

        // Include non-grouped sections in _groupedSections
        sections.forEach(section => {
            if (groupedIds.indexOf(section.id) === -1) {
                const newGroupedSection: GroupedAudioSection = {
                    id: section.id,
                    sections: [section],
                    start: section.start,
                    end: section.end,
                    title: section.title,
                    type: section.type
                };
                _groupedSections.push(newGroupedSection);
            }
        });
    }

    // Update the style of the waveform
    const updateOverflow = (overflow: string) => {
        const wave = document.querySelector('.wave > wave') as HTMLElement;
        if (wave) {
            wave.style.setProperty('overflow', overflow, 'important');
        }
    };

    // Update the zoom level of the waveform and adjust marker positions
    const updateZoomLevels = (value: number) => {
        updateOverflow('visible');
        wavesurfer?.zoom(value);
        suppressRegionClear = true;
        wavesurfer?.seekAndCenter(seekPosition);
    }

    // Get a region object from its ID
    const getRegionFromId = (id: string): Region | null => {
        if (!wavesurfer) {
            return null;
        }
        let regions = Object.values(wavesurfer.regions.list);
        let selectedRegion = null;
        regions.forEach((region: Region) => {
            if (region.id === id) {
                selectedRegion = region;
            }
        });
        return selectedRegion;
    }

    // Get the currently active selection region
    const getActiveSelection = (): Region | null => {
        if (wavesurferRef.current) {
            const regions = wavesurferRef.current.regions.list;
            for (let id of Object.keys(regions)) {
                const region = regions[id];
                if (region.element.classList.contains('selection')) {
                    return getRegionFromId(id);
                }
            }
        }
        return null;
    }

    // Toggle play/pause for the waveform or the active selection
    const togglePlay = () => {
        if (isPlaying) {
            wavesurfer?.pause();
        } else {
            // Play the active selection if it exists, otherwise play the entire waveform
            let activeSelection = getActiveSelection();
            if (activeSelection) {
                activeSelection.play(0);
            } else {
                wavesurfer?.play();
            }
        }
    }

    // Clear the current selection in the waveform
    const clearSelection = () => {
        // Remove all regions marked as 'selection'
        clearRegions();
        // wavesurfer?.enableDragSelection({ slop: 5 });
        // Check if the zoom level should be reset
        checkZoomReset();
    }

    // Remove all regions with the 'selection' class
    const clearRegions = () => {
        if (wavesurferRef.current) {
            const regions = wavesurferRef.current.regions.list;
            Object.keys(regions).forEach((id) => {
                const region = regions[id];
                if (region.element.classList.contains('selection')) {
                    region.remove();
                }
            });
        }
    };

    // Toggle visibility of zoom controls based on the current zoom level
    const toggleZoomControls = (newZoom: number) => {
        if (newZoom === 0) {
            // Hide zoomed controls if zoom level is 0
            setSelectionZoomed(false);
        } else {
            // Show zoomed controls
            setSelectionZoomed(true);
        }
        // Check if the zoom level should be reset
        checkZoomReset();
    }

    // Navigate to different steps in the waveform based on the given direction
    const goToStep = (direction: 'first' | 'end' | 'next' | 'previous') => {
        if (!wavesurfer) {
            return null;
        }
        const currentTime = wavesurfer.getCurrentTime();
        // Sort the sections by their start time
        const sortedGroups = group.sort((a, b) => (a.start ?? 0) - (b.start ?? 0));

        // Seek to a given section and display its popover
        const seekToSection = (section: AudioSection) => {
            wavesurfer.seekTo(section.start! / wavesurfer.getDuration());
            setTimeout(() => {
                const id = `${section.id}`;
                showStepPopover(id);
            }, 100);
        };
        if (direction === 'first') {
            seekToSection(sortedGroups[0]);
        } else if (direction === 'end') {
            const lastSection = sortedGroups[sortedGroups.length - 1];
            wavesurfer.setCurrentTime(lastSection.end ?? wavesurfer.getDuration());
            setTimeout(() => {
                const id = `${lastSection.id}`;
                showStepPopover(id);
            }, 100);
        } else if (direction === 'next') {
            for (let i = 0; i < sortedGroups.length; i++) {
                if (sortedGroups[i].start! > currentTime) {
                    console.log('sortedGroups[i]', sortedGroups)
                    seekToSection(sortedGroups[i]);
                    break;
                }
            }
        } else if (direction === 'previous') {
            const buffer = 1;
            for (let i = sortedGroups.length - 1; i >= 0; i--) {
                if (sortedGroups[i].start! < currentTime - buffer) {
                    seekToSection(sortedGroups[i]);
                    break;
                }
            }
        }
    };

    // Zoom into a specific region of the waveform
    const zoomRegion = (region: Region) => {
        let container = containerRef.current;
        if (container) {
            // Calculate the zoom level based on the container width and region duration
            let zoom = (container.clientWidth / (region.end - region.start));
            // Center the waveform on the middle of the region
            wavesurfer?.setCurrentTime(region.start + ((region.end - region.start) / 2));
            wavesurfer?.zoom(zoom);
        }
    }

    // Toggle zoom in/out for a specific region
    const checkRegionZoomAction = (region: Region) => {
        suppressRegionClear = true;
        let zoomLevel = 0;
        if (zoomLevel === 0) {
            // Zoom in if the current zoom level is 0
            zoomLevel = 100;
            wavesurfer?.zoom(zoomLevel);
            zoomRegion(region);
        } else {
            // Zoom out if the current zoom level is not 0
            zoomLevel = 0;
            wavesurfer?.zoom(zoomLevel);
        }
        suppressRegionClear = false;
    }

    // Check if the zoom level should be reset based on the presence of an active selection
    const checkZoomReset = () => {
        setZoomReset(zoomLevel != 0 && !getActiveSelection());
    }

    // Zoom into the currently active region
    const zoomActiveRegion = () => {
        //updateMarker('relative');
        updateOverflow('hidden');
        let region = getActiveSelection();
        if (region) {
            checkRegionZoomAction(region);
            setSelectionZoomed(true)
        }
    }

    // Incrementally zoom in
    const zoomInIncrement = () => {
        wavesurfer?.zoom(zoomLevel + zoomIncrement);
        suppressRegionClear = true;
        setSelectionZoomed(true);
        //wavesurfer?.seekAndCenter(seekPosition);
    }

    // Incrementally zoom out
    const zoomOutIncrement = () => {
        wavesurfer?.zoom(zoomLevel - zoomIncrement);
        suppressRegionClear = true;
        setSelectionZoomed(zoomLevel <= 0 ? false : true)
        // if (zoomLevel <= 0) {
        //     setSelectionZoomed(false);
        // } else {
        //     setSelectionZoomed(true);
        // }
        // wavesurfer?.seekAndCenter(seekPosition);
    }

    let containerClass = `core-container`;
    if (isLoading) {
        containerClass += ' loading';
    }
    if (splitChannels) {
        containerClass += ' multi-channel';
    }

    return (
        <>
            {popperIsVisible && (
                <div className="selection-bar popper-element" ref={setPopperElement} >
                    <div className="selection-text">{selectionText}</div>
                    <div className="selection-btn">
                        <div className={`selection-zoomed ${!selectionZoomed ? 'd-none' : ''}`}>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                zoomOutIncrement();
                            }} title={zoomOutLabel}>
                                -
                            </button>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                zoomInIncrement();
                            }} title={zoomInLabel}>
                                +
                            </button>
                            <button onClick={(e) => {
                                e.stopPropagation();
                            }} >
                                {zoomLevel.toFixed(0)}%&nbsp;
                                <div className="zoom-popup" slot="popover">
                                    <ul >
                                        <li onClick={() => { updateZoomLevels(0) }}>{resetZoomLabel}</li>
                                        <li onClick={() => { updateZoomLevels(200) }}>{zoomLabel} 200%</li>
                                        {/* <li onClick={() => { updateZoomLevels(500) }}>{zoomLabel} 500%</li>
                                        <li onClick={() => { updateZoomLevels(1000) }}>{zoomLabel} 1000%</li> */}
                                    </ul>
                                </div>
                            </button>
                        </div>
                        <div className={`selection-base ${selectionZoomed ? 'd-none' : ''}`}>
                            <button id='zoomSelectionBtn' onClick={(e) => {
                                e.stopPropagation();
                                zoomActiveRegion();
                            }}>
                                {zoomInSelectionLabel}
                            </button>
                        </div>
                    </div>
                </div>)}
            <div className="cursor-popover">
                <slot name="cursor-tooltip"></slot>
                <div className="arrow" data-popper-arrow></div>
            </div>
            <div className={`zoom-reset ${!zoomReset ? `d-none` : ``}`}>
                <button onClick={() => { updateZoomLevels(0); }} >
                    <b> - </b>&nbsp;&nbsp;{resetZoomLabel}
                </button>
            </div>
            <div className={containerClass}>
                {/* <div title='pre-loader here'>{`waveform-container ${(hasError || isLoading) ? `v-hidden` : `test`}`}</div> */}
                <div className={`waveform-container ${(hasError || isLoading) ? `v-hidden` : ``}`}>
                    <div className={splitChannels ? `labels` : `labels d-none`}>
                        <div><div>{channelTopLabel}</div></div>
                        <div><div>{channelBottomLabel}</div></div>
                    </div>
                    <div className="waveform" id="waveform">
                        <div className="wave" ref={containerRef} />
                    </div>
                </div>
                <div className={`toolbar px-1 ${(hasError || isLoading) ? `v-hidden` : ``}`}>
                    <div className="options">
                        <div className="lhs-utility-container">{props.leftContainer}</div>
                    </div>
                    <div className="controls">
                        <div className="start-time">0s</div>
                        <div className="controls-inner">
                            <button disabled={isLoading} title={startLabel} onClick={() => { goToStep('first'); }} className="mr-2">Start</button>
                            <button disabled={isLoading} title={previousStepLabel} onClick={() => { goToStep('previous'); }} className="mr-2">Back</button>
                            <button disabled={isLoading} title={isPlaying ? 'Pause' : 'Play'} onClick={() => { togglePlay(); }} className="mr-2">{isPlaying ? 'Pause' : 'Play'}</button>
                            <button disabled={isLoading} title={nextStepLabel} onClick={() => { goToStep('next'); }} className="mr-2">Next</button>
                            <button disabled={isLoading} title={endLabel} onClick={() => { goToStep('end'); }} className="mr-2">End</button>
                        </div>
                        <div className="end-time">{duration.toFixed(2)}s</div>
                    </div>
                    <div className="rhs-utility-container">{props.rightContainer}</div>
                </div>
            </div>
        </>
    );
}