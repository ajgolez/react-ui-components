import TimeSpanPicker from './components/timespan/TimeSpanPicker';

function App() {
  return (
    <div className="App">
      <div>
        <TimeSpanPicker
          placeholder='hour:minute:seconds'
          disabled={false}
          minHours={5}
          maxHours={40}
          minMinutes={6}
          maxMinutes={30}
          minSeconds={7}
          maxSeconds={20}
          id='13' />
      </div>
    </div>
  );
}

export default App;
