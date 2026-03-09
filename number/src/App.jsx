import React, { useState, useEffect } from 'react';
import './App.css';
import { getWeeklyDates } from './utils/dateHelper';
import { fetchWeeklyMeals, fetchWeeklyTimetable } from './utils/api';
import Timetable from './components/Timetable';
import MealList from './components/MealList';

function App() {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ meals: [], timetable: [] });
  const [tab, setTab] = useState('timetable');

  const dates = getWeeklyDates();

  useEffect(() => {
    const savedId = localStorage.getItem('studentId');
    if (savedId) {
      setStudentId(savedId);
      loadData(savedId);
    }
  }, []);

  const loadData = async (id) => {
    setLoading(true);
    const grade = id[0];
    const classNum = id[1];
    const [m, t] = await Promise.all([
      fetchWeeklyMeals(dates[0], dates[4]),
      fetchWeeklyTimetable(grade, classNum, dates[0], dates[4])
    ]);
    setData({ meals: m, timetable: t });
    setLoading(false);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setStudentId(val);
    if (val.length === 4) {
      localStorage.setItem('studentId', val);
      loadData(val);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('studentId');
    setStudentId('');
    setData({ meals: [], timetable: [] });
  };

  return (
    <div className="app">
      <header>
        <h1>학교 정보 포털</h1>
        <div className="input-group">
          <input 
            type="tel" 
            maxLength={4} 
            placeholder="학번 입력 (3522)" 
            value={studentId}
            onChange={handleInput}
          />
          {studentId.length === 4 && (
            <button className="reset-btn" onClick={handleReset}>변경</button>
          )}
        </div>
      </header>
      
      <nav className="tab-menu">
        <button onClick={() => setTab('timetable')} className={tab === 'timetable' ? 'active' : ''}>시간표</button>
        <button onClick={() => setTab('meal')} className={tab === 'meal' ? 'active' : ''}>급식표</button>
      </nav>

      <main>
        {loading ? <div className="status-msg">로딩 중...</div> : (
          tab === 'timetable' ? 
          <Timetable timetableData={data.timetable} dates={dates} /> : 
          <MealList mealData={data.meals} weeklyDates={dates} />
        )}
      </main>
    </div>
  );
}

export default App;