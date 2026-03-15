// api/get-student.js

// JSON 파일을 import 하지 않고, 데이터를 직접 변수로 관리합니다.
// 이렇게 하면 "import attribute" 에러가 발생하지 않습니다.
const studentData = {
  "5": {
    "01": { "1": "수과탐(6반)", "2": "화학(5반)", "3": "생명A(5반)", "4": "화작F(5반)", "5": "심리A(2반)" },
    "04": { "1": "확통(5반)", "2": "화작A(2반)", "3": "지구(6반)", "4": "생명B(6반)", "5": "보건B(6반)" },
    "05": { "1": "확통(5반)", "2": "화학(5반)", "3": "생명A(5반)", "4": "화작F(5반)", "5": "보건A(5반)" },
    "22": { "1": "확통(5반)", "2": "화학(5반)", "3": "생명A(5반)", "4": "화작F(5반)", "5": "교육(1반)" }
  },
  "2": { // 2반 데이터가 필요하다면 여기에 추가
    "22": { "1": "과목A", "2": "과목B", "3": "과목C", "4": "과목D", "5": "과목E" }
  }
};

export default function handler(req, res) {
  try {
    const { classNum, studentNum } = req.query;

    // 데이터 존재 여부 확인
    const classInfo = studentData[classNum];
    if (!classInfo) {
      return res.status(404).json({ error: "해당 반 정보를 찾을 수 없습니다." });
    }

    const studentInfo = classInfo[studentNum];
    if (!studentInfo) {
      return res.status(404).json({ error: "해당 번호의 학생 정보를 찾을 수 없습니다." });
    }

    // 성공 응답
    res.status(200).json(studentInfo);
  } catch (err) {
    console.error("서버 에러:", err);
    res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
  }
}