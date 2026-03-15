import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { TIMETABLE_MAP } from '../constants/timetableMap';
import { COMMON_SCHEDULES } from '../constants/commonSchedules';

export const generateClassPDF = async (classNum, studentData) => {
  const students = studentData[classNum];
  if (!students) return alert(`${classNum}반 데이터가 없습니다.`);

  const doc = new jsPDF('p', 'mm', 'a4');
  const container = document.createElement('div');
  
  // 캡처용 스타일 설정
  container.style.width = '190mm';
  container.style.padding = '10mm';
  container.style.backgroundColor = 'white';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  const studentNums = Object.keys(students).sort();
  const dayKeys = ["mon", "tue", "wed", "thu", "fri"];
  const classCommon = COMMON_SCHEDULES[String(classNum)] || {};

  for (let i = 0; i < studentNums.length; i++) {
    const sNum = studentNums[i];
    const choices = students[sNum];

    if (i > 0) doc.addPage();

    let tableHtml = `
      <div style="font-family: sans-serif; padding: 10px;">
        <h2 style="text-align: center; margin-bottom: 20px;">시간표 (${classNum}반 ${sNum}번)</h2>
        <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 14px; table-layout: fixed;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="border: 1px solid #dee2e6; padding: 12px; width: 50px;">교시</th>
              <th style="border: 1px solid #dee2e6;">월</th>
              <th style="border: 1px solid #dee2e6;">화</th>
              <th style="border: 1px solid #dee2e6;">수</th>
              <th style="border: 1px solid #dee2e6;">목</th>
              <th style="border: 1px solid #dee2e6;">금</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (let pIdx = 0; pIdx < 7; pIdx++) {
      const period = pIdx + 1;
      tableHtml += `<tr><td style="border: 1px solid #dee2e6; padding: 12px; background: #f8f9fa; font-weight: bold;">${period}</td>`;
      
      dayKeys.forEach((day) => {
        const type = TIMETABLE_MAP[day][pIdx];
        let content = "";

        if (type === "BLANK") content = "";
        else if (type === "FREE") content = "공강";
        else if (type.startsWith("C")) {
          const cIdx = type.replace("C", "");
          content = (choices && choices[cIdx]) ? choices[cIdx] : "-";
        } else {
          const dayData = classCommon[day] || {};
          content = dayData[period] || dayData[String(period)] || "-";
        }
        tableHtml += `<td style="border: 1px solid #dee2e6; padding: 12px;">${content}</td>`;
      });
      tableHtml += `</tr>`;
    }

    tableHtml += `</tbody></table></div>`;
    container.innerHTML = tableHtml;

    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 10, 20, 190, (canvas.height * 190) / canvas.width);
  }

  // --- [핵심: 링크 강제 생성 및 다운로드 로직] ---
  try {
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const fileName = `${classNum}_class_timetable.pdf`; // 모바일 안전을 위해 영어 권장

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // 안드로이드 크롬 호환성을 위해 body에 잠시 추가
    document.body.appendChild(link);
    link.click();
    
    // 클릭 후 정리
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);

  } catch (error) {
    console.error("Download failed:", error);
    // 예외 상황 발생 시 기존 save 방식 시도
    doc.save(`${classNum}ban_timetable.pdf`);
  }

  document.body.removeChild(container);
};