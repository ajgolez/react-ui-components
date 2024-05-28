import wavfile from './assets/sample-single-channel.wav';
import TimeSpanPicker from './components/timespan/TimeSpanPicker';
import wavfile2 from './assets/sample-multi-channel.wav';
import { Waveform } from './components/waveform/Waveform';
import { Icon } from './components/icon/icon';
//import '@progress/kendo-theme-default/dist/all.css';
import '@progress/kendo-theme-bootstrap/dist/all.css';
import { DropdownMultiSelect } from './components/customtags/CustomTags';

import Timeline from './components/timeline/Timeline';
import { DataModel } from './components/timeline/types';

const groups: DataModel[] = [
  {
    items: [
      { date: '2021-01-01 A', flag: '2006', title: 'Title 1', subtitle: 'Subtitle 1', content: <div>LEFT Happy New Year! <br /><br /><br /><br /><br /><br /><br /><br /><br /><input type='text'></input><button>Button</button></div> },
      { date: '2021-02-14 AB lorem ipsum', title: 'Title 2', subtitle: 'Subtitle 2', content: <div>RIGHT Valentine's Day</div> },
      { date: '2021-02-14 AB lorem ipsum', title: 'Title 2a', subtitle: 'Subtitle 2a', content: <div>RIGHT Valentine's Day</div> },
    ],
  },
  {
    items: [
      { date: '2021-03-17 ABC', flag: '2008', title: 'Title 3', subtitle: 'Subtitle 3', content: <div>LEFT St. Patrick's Day</div> },
      { date: '2021-07-04 ABCD', title: 'Title 4', subtitle: 'Subtitle 4' },
      { date: '2021-03-17 a', title: 'Title 5', subtitle: 'Subtitle 3', content: <div>LEFT St. Patrick's Day</div> },
      { date: '2021-03-17 BC', title: 'Title 6', subtitle: 'Subtitle 3', content: <div>LEFT St. Patrick's Day</div> },


    ],
  },
  // Add more groups and items here
];



<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
/>

const regionsData =
  [
    { "id": "0", "start": 0, "end": 3.791, "title": "0", "type": "default", "mergeSection": false, "isVoiceStep": false, "popoverDetails": { "stepNo": 0, "resultTypeId": 0, "resultDetail": "", "responseTime": "3.79", "duration": "3.79" } },
    {
      "id": "1",
      "start": 3.791,
      "end": 6.02,
      "title": "1",
      "type": "default",
      "mergeSection": false,
      "isVoiceStep": false,
      "popoverDetails": {
        "stepNo": 1,
        "resultTypeId": 5,
        "resultDetail": "Matched with confidence: 94.8%",
        "responseTime": "0.29",
        "duration": "2.23"
      }
    },
    {
      "id": "2",
      "start": 6.02,
      "end": 6.02,
      "title": "2",
      "type": "error",
      "mergeSection": false,
      "isVoiceStep": false,
      "popoverDetails": {
        "stepNo": 2,
        "resultTypeId": 0,
        "resultDetail": "Optional step skipped (no match)",
        "responseTime": "0.00",
        "duration": "0.00"
      }
    },
    {
      "id": "3", "start": 6.02, "end": 10.921, "title": "3",
      "type": "default",
      "mergeSection": false, "isVoiceStep": false,
      "popoverDetails": {
        "stepNo": 3,
        "resultTypeId": 1,
        "resultDetail": "No match. Confidence: 0% is less than the required 80%",
        "responseTime": "0.78",
        "duration": "7.90"
      }
    },
    {
      "id": "4",
      "start": 10.922,
      "end": 13.921,
      "title": "4",
      "type": "default",
      "mergeSection": false,
      "isVoiceStep": false,
      "popoverDetails": {
        "stepNo": 4,
        "resultTypeId": 0,
        "resultDetail": "No match. Confidence: 0% is less than the required 80%",
        "responseTime": "0.78",
        "duration": "7.90"
      }
    }
  ]

const regionsData2 = [
  {
    "id": "0",
    "start": 0,
    "end": 3.008,
    "title": "0",
    "type": "default",
    "mergeSection": false,
    "isVoiceStep": false,
    "popoverDetails": {
      "stepNo": 0,
      "resultTypeId": 0,
      "resultDetail": "",
      "responseTime": "3.01",
      "duration": "3.01"
    }
  },
  {
    "id": "1",
    "start": 3.008,
    "end": 10.472,
    "title": "1",
    "type": "default",
    "mergeSection": false,
    "isVoiceStep": false,
    "popoverDetails": {
      "stepNo": 1,
      "resultTypeId": 0,
      "resultDetail": "Matched with confidence: 98.2%",
      "responseTime": "1.81",
      "duration": "7.46"
    }
  },
  {
    "id": "2",
    "start": 10.472,
    "end": 16.811,
    "title": "2",
    "type": "default",
    "mergeSection": false,
    "isVoiceStep": false,
    "popoverDetails": {
      "stepNo": 2,
      "resultTypeId": 0,
      "resultDetail": "Matched with confidence: 97%",
      "responseTime": "1.67",
      "duration": "6.34"
    }
  },
  {
    "id": "3",
    "start": 16.811,
    "end": 25.2930012,
    "title": "3",
    "type": "default",
    "mergeSection": false,
    "isVoiceStep": false,
    "popoverDetails": {
      "stepNo": 3,
      "resultTypeId": 0,
      "resultDetail": "Matched with confidence: 96%",
      "responseTime": "1.94",
      "duration": "8.48"
    }
  },
  {
    "id": "4",
    "start": 25.2930012,
    "end": 25.545002,
    "title": "4",
    "type": "default",
    "mergeSection": false,
    "isVoiceStep": false,
    "popoverDetails": {
      "stepNo": 4,
      "resultTypeId": 0,
      "resultDetail": "",
      "responseTime": "0.25",
      "duration": "0.25"
    }
  },
  {
    "id": "5",
    "start": 25.545002,
    "end": 25.8680019,
    "title": "5",
    "type": "default",
    "mergeSection": false,
    "isVoiceStep": false,
    "popoverDetails": {
      "stepNo": 5,
      "resultTypeId": 0,
      "resultDetail": "",
      "responseTime": "0.32",
      "duration": "0.32"
    }
  },
  {
    "id": "6",
    "start": 25.8680019,
    "end": 29.6860027,
    "title": "6",
    "type": "default",
    "mergeSection": false,
    "isVoiceStep": false,
    "popoverDetails": {
      "stepNo": 6,
      "resultTypeId": 0,
      "resultDetail": "Matched with confidence: 97.2%",
      "responseTime": "1.23",
      "duration": "3.82"
    }
  }
]

const htmlContentLeft = (
  <button>Click Me</button>
);

const htmlContentRight = (
  <>
    <p>This is a paragraph.</p><b>Bold</b>
  </>
);

const timelineData = [
  {
    title: "Step 1",
    description: "This is the first step.",
    date: "2020-01-01",
    content: "<strong>Custom HTML</strong> Here",
    side: "right"
  },
  {
    title: "Step 2",
    description: "This is the second step.",
    date: "2020-01-02",
    content: "<div style='color: red;'>More custom HTML content</div>",
    side: "left"
  }
];


function App() {
  return (
    <div className="App">
      <div>
        {/* <TimeSpanPicker
          placeholder='hour:minute:seconds'
          disabled={false}
          minHours={5}
          maxHours={40}
          minMinutes={6}
          maxMinutes={30}
          minSeconds={7}
          maxSeconds={20}
          id='13' /> */}

        {/* <br /><br /><br /><br /><br /><br /><br />
        <Waveform
          file={wavfile}
          startLabel='Go to Start'
          channelTopLabel='Heard'
          channelBottomLabel='Replied With'
          sections={regionsData}
          onLoaded={() => console.log('Audio file loaded')}
          rightContainer={htmlContentRight}
          leftContainer={htmlContentLeft}
          groupingFactor={20}
        /> */}

        {/* <Icon iconName="user" size='sm' /> */}
        {/* <DropdownMultiSelect></DropdownMultiSelect> */}

        {/* <Timeline items={items} orientation="vertical" groups={groups} /> */}
        <Timeline data={groups} position='alternate' />

      </div>
    </div>
  );
}

export default App;
