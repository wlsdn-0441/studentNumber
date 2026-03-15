import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { TIMETABLE_MAP } from '../constants/timetableMap';
import { COMMON_SCHEDULES } from '../constants/commonSchedules';

export const generateClassPDF = async (classNum, studentData) => {
  const students = studentData[classNum];
  if (!students) {
    alert(`${classNum}반 학생 데이터가 없습니다.`);
    return;
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const container = document.createElement('div');
  
  container.style.width = '90mm';
  container.style.height = '120mm'; 
  container.style.backgroundColor = 'white';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  document.body.appendChild(container);

  const studentNums = Object.keys(students).sort();
  const dayKeys = ["mon", "tue", "wed", "thu", "fri"];
  const dayLabels = ["월", "화", "수", "목", "금"];
  const classCommon = COMMON_SCHEDULES[classNum] || {}; 

  const lightBorder = '1px solid #e0e0e0';

  for (let i = 0; i < studentNums.length; i++) {
    const sNum = studentNums[i];
    const choices = students[sNum];

    if (i > 0 && i % 4 === 0) {
      doc.addPage();
    }

    const position = i % 4;
    const col = position % 2;
    const row = Math.floor(position / 2);

    const posX = 10 + (col * 100); 
    const posY = 15 + (row * 135);

    let tableHtml = `
      <div style="font-family: sans-serif; padding: 5px; border: ${lightBorder}; box-sizing: border-box; height: 100%; display: flex; flex-direction: column;">
        <h3 style="text-align: center; margin: 0 0 5px 0; font-size: 12px; height: 15px;">부경고 (${classNum}반 ${sNum}번)</h3>
        <table style="width: 100%; flex: 1; border-collapse: collapse; text-align: center; font-size: 9px; table-layout: fixed; border: ${lightBorder};">
          <thead>
            <tr style="background: #fcfcfc; height: 25px;">
              <th style="border: ${lightBorder}; width: 25px;">교시</th>
              ${dayLabels.map(d => `<th style="border: ${lightBorder};">${d}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    for (let pIdx = 0; pIdx < 7; pIdx++) {
      const period = pIdx + 1;
      // 줄바꿈 대비 행 높이 유지
      tableHtml += `<tr style="height: 38px;"><td style="border: ${lightBorder}; background: #fcfcfc; font-weight: bold;">${period}</td>`;
      
      dayKeys.forEach((day) => {
        const type = TIMETABLE_MAP[day][pIdx];
        let content = "";
        let cellColor = "#ffffff";

        if (type === "BLANK") {
          content = "";
        } else if (type === "FREE") {
          content = "공강";
          cellColor = "#fffafa";
        } else if (type === "C1" || type === "C2" || type === "C3" || type === "C4" || type === "C5") {
          const cIdx = type.replace("C", "");
          content = (choices && choices[cIdx]) ? choices[cIdx] : "-";
          cellColor = "#f8fbff";
        } else {
          content = (classCommon[day] && classCommon[day][period]) 
                    ? classCommon[day][period] 
                    : "-";
        }
        
        // [수정된 핵심 로직] 괄호 분리 및 줄바꿈 처리
        let displayContent = "";
        if (content.includes("(") && content.includes(")")) {
          const parts = content.split("(");
          const subject = parts[0];
          const teacher = parts[1].replace(")", "");
          displayContent = `<div style="font-weight: bold;">${subject}</div><div style="font-size: 7.5px; color: #666;">${teacher}</div>`;
        } else {
          displayContent = `<div>${content}</div>`;
        }
        
        tableHtml += `<td style="border: ${lightBorder}; background-color: ${cellColor}; padding: 2px; word-break: break-all; overflow: hidden; vertical-align: middle;">${displayContent}</td>`;
      });
      tableHtml += `</tr>`;
    }

    tableHtml += `</tbody></table></div>`;
    container.innerHTML = tableHtml;

    const canvas = await html2canvas(container, { 
      scale: 3,
      width: container.offsetWidth,
      height: container.offsetHeight
    });
    const imgData = canvas.toDataURL('image/png');
    
    doc.addImage(imgData, 'PNG', posX, posY, 90, 120);
  }

  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `${classNum}반 시간표.pdf`;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);

  document.body.removeChild(container);
};