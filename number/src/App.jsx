import React, { useState, useEffect } from 'react';
import './App.css';
import { getWeeklyDates } from './utils/dateHelper';
import { fetchWeeklyMeals, fetchWeeklyTimetable, fetchStudentChoices } from './utils/api';
import Timetable from './components/Timetable';
import MealList from './components/MealList';

// PDF 생성 로직 임포트
import { generateClassPDF } from './utils/pdfGenerator'; 
// 학생 선택 과목 데이터
import { studentData } from './constants/studentData'; 

function App() {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false); 
  const [selectedClass, setSelectedClass] = useState('5'); 
  const [data, setData] = useState({ 
    meals: [], 
    timetable: [], 
    choices: null 
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
    const studentNum = id.substring(2, 4).padStart(2, '0');

    try {
      const [m, t, c] = await Promise.all([
        fetchWeeklyMeals(dates[0], dates[4]),
        fetchWeeklyTimetable(grade, classNum, dates[0], dates[4]),
        fetchStudentChoices(classNum, studentNum)
      ]);

      setData({ 
        meals: m, 
        timetable: t || [], 
        choices: c 
      });
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
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

  /**
   * 확장형 PDF 다운로드 함수
   * 이제 하드코딩된 데이터를 사용하므로 API 데이터(data.timetable)가 없어도 
   * studentData만 있으면 동작하도록 설계되었습니다.
   */
  const handleDownloadPDF = async () => {
    setIsPrinting(true);
    try {
      // 확장된 로직: 선택된 반과 전체 학생 데이터를 넘깁니다.
      await generateClassPDF(selectedClass, studentData);
    } catch (error) {
      console.error("PDF 생성 중 에러:", error);
      alert("PDF 생성 중 문제가 발생했습니다.");
    } finally {
      setIsPrinting(false);
    }
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
            choices={data.choices} 
          /> : 
          <MealList mealData={data.meals} weeklyDates={dates} />
        )}
      </main>

      {/* --- 관리자용 PDF 추출 섹션 (확장형) --- */}
      <footer className="admin-footer" style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px', paddingBottom: '40px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '10px', color: '#333' }}>반별 전체 시간표 출력 </h2>
        <div className="input-group" style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          >
            {/* studentData에 정의된 모든 반을 자동으로 옵션으로 생성 */}
            {Object.keys(studentData).sort().map(cNum => (
              <option key={cNum} value={cNum}>{cNum}반 전체</option>
            ))}
          </select>
          <button 
            className="reset-btn" 
            onClick={handleDownloadPDF}
            disabled={isPrinting}
            style={{ minWidth: '100px', backgroundColor: isPrinting ? '#ccc' : '#4a90e2', color: 'white' }}
          >
            {isPrinting ? '생성 중...' : 'PDF 받기'}
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          * PDF에는 선택 과목이 없는 학생은 공란으로 표시됩니다.
        </p>
      </footer>
    </div>
  );
}

export default App;