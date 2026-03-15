import React, { useState, useEffect } from 'react';
import './App.css';
import { getWeeklyDates } from './utils/dateHelper';
import { fetchWeeklyMeals, fetchWeeklyTimetable, fetchStudentChoices } from './utils/api';
import Timetable from './components/Timetable';
import MealList from './components/MealList';

function App() {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    meals: [], 
    timetable: [], 
    choices: null // 선택 과목 데이터 추가
  });
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
    const studentNum = id.substring(2, 4).padStart(2, '0'); // '05' 처럼 두자리 패딩

    try {
      // 태초의 방식대로 데이터를 한꺼번에 병렬 로드
      const [m, t, c] = await Promise.all([
        fetchWeeklyMeals(dates[0], dates[4]),
        fetchWeeklyTimetable(grade, classNum, dates[0], dates[4]),
        fetchStudentChoices(classNum, studentNum) // 선택 과목 API 호출 추가
      ]);

      setData({ 
        meals: m, 
        timetable: t || [], // 만약 null이 오면 빈 배열로 처리
        choices: c 
      });
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // 숫자만
    setStudentId(val);
    if (val.length === 4) {
      localStorage.setItem('studentId', val);
      loadData(val);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('studentId');
    setStudentId('');
    setData({ meals: [], timetable: [], choices: null });
  };

  return (
    <div className="app">
      <header>
        <h1>부경고등학교</h1>
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
          <Timetable 
            timetableData={data.timetable} 
            dates={dates} 
            choices={data.choices} // choices 전달
          /> : 
          <MealList mealData={data.meals} weeklyDates={dates} />
        )}
      </main>
    </div>
  );
}

export default App;