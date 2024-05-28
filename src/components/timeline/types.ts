export interface TimelineItem {
    date: string;
    flag?: string;
    title?: string;
    subtitle?: string;
    content?: JSX.Element;
}

export interface DataModel {
    items: TimelineItem[];
}
