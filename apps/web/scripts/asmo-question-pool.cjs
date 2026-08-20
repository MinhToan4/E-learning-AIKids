/**
 * High-Quality Olympiad Question Generator for ASMO Competition
 * Generates authentic, grade-aligned, bilingual Vietnamese-English questions with full step explanations & hints.
 */

const MATH_POOL = [
  {
    gradeMin: 1, gradeMax: 3,
    topicCode: 'MATH_ARITHMETIC_BASIC', topicName: 'Phép Tính & Số Học Cơ Bản',
    title: 'Câu: Tính giá trị biểu thức số học',
    text: 'What is the value of $15 + 28 - 14$?\n(Giá trị của biểu thức $15 + 28 - 14$ là bao nhiêu?)',
    options: [
      { id: 'A', label: 'A', text: '29' },
      { id: 'B', label: 'B', text: '28' },
      { id: 'C', label: 'C', text: '31' },
      { id: 'D', label: 'D', text: '27' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Con hãy thực hiện phép tính từ trái sang phải: $15 + 28 = 43$, sau đó lấy $43 - 14$ nhé!',
    explanation: 'Thực hiện phép tính lần lượt từ trái sang phải:\n15 + 28 = 43\n43 - 14 = 29\n➔ Đáp án đúng là: **A. 29**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Tính tổng', description: 'Thực hiện phép cộng: 15 + 28 = 43.' },
      { stepIndex: 1, title: 'Bước 2: Tính hiệu', description: 'Thực hiện phép trừ: 43 - 14 = 29.' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Giá trị cần tìm là 29. Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 1, gradeMax: 3,
    topicCode: 'MATH_LOGIC_REASONING', topicName: 'Tư Duy Logic & Quy Luật',
    title: 'Câu: Tìm số tiếp theo trong dãy quy luật',
    text: 'Find the next number in the pattern: $2, 5, 8, 11, 14, \\dots$\n(Tìm số tiếp theo trong dãy quy luật: $2, 5, 8, 11, 14, \\dots$)',
    options: [
      { id: 'A', label: 'A', text: '17' },
      { id: 'B', label: 'B', text: '16' },
      { id: 'C', label: 'C', text: '18' },
      { id: 'D', label: 'D', text: '19' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Khoảng cách giữa hai số liên tiếp là bao nhiêu nhỉ? Mỗi số đều tăng thêm 3 đơn vị đó!',
    explanation: 'Quy luật của dãy số: mỗi số sau bằng số liền trước cộng thêm 3.\nSố tiếp theo là: 14 + 3 = 17.\n➔ Đáp án đúng là: **A. 17**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Tìm quy luật', description: 'Nhận xét: 5 - 2 = 3; 8 - 5 = 3; 11 - 8 = 3; 14 - 11 = 3.' },
      { stepIndex: 1, title: 'Bước 2: Tính số tiếp theo', description: 'Lấy 14 + 3 = 17.' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Số tiếp theo là 17. Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 4, gradeMax: 6,
    topicCode: 'MATH_NUMBER_THEORY', topicName: 'Số Học & Dãy Số',
    title: 'Câu: Tìm số nguyên dương thỏa mãn điều kiện chia hết',
    text: 'Find the smallest positive integer $N$ that leaves a remainder of 2 when divided by 3, 4, and 5.\n(Tìm số nguyên dương $N$ nhỏ nhất chia cho 3, 4 và 5 đều dư 2.)',
    options: [
      { id: 'A', label: 'A', text: '62' },
      { id: 'B', label: 'B', text: '32' },
      { id: 'C', label: 'C', text: '122' },
      { id: 'D', label: 'D', text: '58' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Số $N - 2$ sẽ chia hết cho cả 3, 4 và 5. Hãy tìm BCNN của (3, 4, 5) nhé!',
    explanation: 'Vì $N$ chia cho 3, 4, 5 đều dư 2 nên $N - 2$ là bội chung của 3, 4, 5.\nBCNN(3, 4, 5) = $3 \\times 4 \\times 5 = 60$.\nDo đó số nguyên dương $N$ nhỏ nhất là $60 + 2 = 62$.\n➔ Đáp án đúng là: **A. 62**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Chuyển về bài toán chia hết', description: '$N - 2$ chia hết cho 3, 4, 5.' },
      { stepIndex: 1, title: 'Bước 2: Tìm BCNN', description: 'BCNN(3, 4, 5) = 60.' },
      { stepIndex: 2, title: 'Bước 3: Tính N', description: '$N = 60 + 2 = 62$. Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 4, gradeMax: 6,
    topicCode: 'MATH_GEOMETRY_2D', topicName: 'Hình Học Phẳng & Trực Quan',
    title: 'Câu: Tính diện tích phần hình học',
    text: 'A rectangle has a perimeter of 36 cm. The length is twice the width. Find the area of the rectangle.\n(Một hình chữ nhật có chu vi 36 cm. Chiều dài gấp đôi chiều rộng. Tính diện tích hình chữ nhật đó.)',
    options: [
      { id: 'A', label: 'A', text: '72 cm$^2$' },
      { id: 'B', label: 'B', text: '64 cm$^2$' },
      { id: 'C', label: 'C', text: '80 cm$^2$' },
      { id: 'D', label: 'D', text: '54 cm$^2$' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Nửa chu vi là $36 : 2 = 18$ cm. Tìm chiều rộng và chiều dài theo dạng toán tổng - tỉ nhé!',
    explanation: 'Nửa chu vi hình chữ nhật: 36 : 2 = 18 (cm).\nTổng số phần bằng nhau: 1 + 2 = 3 (phần).\nChiều rộng hình chữ nhật: 18 : 3 = 6 (cm).\nChiều dài hình chữ nhật: 6 × 2 = 12 (cm).\nDiện tích hình chữ nhật: 12 × 6 = 72 (cm$^2$).\n➔ Đáp án đúng là: **A. 72 cm$^2$**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Tính nửa chu vi', description: 'Nửa chu vi = 36 : 2 = 18 cm.' },
      { stepIndex: 1, title: 'Bước 2: Tìm chiều dài và chiều rộng', description: 'Chiều rộng = 6 cm, chiều dài = 12 cm.' },
      { stepIndex: 2, title: 'Bước 3: Tính diện tích', description: 'Diện tích = 12 × 6 = 72 cm$^2$. Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 7, gradeMax: 9,
    topicCode: 'MATH_ALGEBRA', topicName: 'Đại Số & Đa Thức',
    title: 'Câu: Rút gọn và tính giá trị biểu thức đại số',
    text: 'If $x + \\frac{1}{x} = 4$, determine the exact value of $x^2 + \\frac{1}{x^2}$.\n(Cho $x + \\frac{1}{x} = 4$, hãy tính giá trị của $x^2 + \\frac{1}{x^2}$.)',
    options: [
      { id: 'A', label: 'A', text: '14' },
      { id: 'B', label: 'B', text: '16' },
      { id: 'C', label: 'C', text: '18' },
      { id: 'D', label: 'D', text: '12' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Hãy bình phương hai vế của đẳng thức $x + \\frac{1}{x} = 4$ để làm xuất hiện $x^2 + \\frac{1}{x^2}$ nhé!',
    explanation: 'Bình phương hai vế đẳng thức đã cho:\n$$\\left(x + \\frac{1}{x}\\right)^2 = 4^2 \\iff x^2 + 2 \\cdot x \\cdot \\frac{1}{x} + \\frac{1}{x^2} = 16$$\n$$x^2 + 2 + \\frac{1}{x^2} = 16 \\iff x^2 + \\frac{1}{x^2} = 14$$\n➔ Đáp án đúng là: **A. 14**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Khai triển bình phương', description: '$(x + 1/x)^2 = x^2 + 2 + 1/x^2$.' },
      { stepIndex: 1, title: 'Bước 2: Thay số và chuyển vế', description: '$16 = x^2 + 2 + 1/x^2 \\Rightarrow x^2 + 1/x^2 = 14$.' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Giá trị biểu thức là 14. Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 7, gradeMax: 9,
    topicCode: 'MATH_COMBINATORICS', topicName: 'Tổ Hợp & Xác Suất',
    title: 'Câu: Bài toán đếm số cách sắp xếp',
    text: 'How many different 4-digit numbers can be formed using the digits 1, 2, 3, 4, 5 without repetition?\n(Có bao nhiêu số tự nhiên có 4 chữ số khác nhau được lập từ các chữ số 1, 2, 3, 4, 5?)',
    options: [
      { id: 'A', label: 'A', text: '120' },
      { id: 'B', label: 'B', text: '60' },
      { id: 'C', label: 'C', text: '24' },
      { id: 'D', label: 'D', text: '125' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Đây là bài toán chỉnh hợp chập 4 của 5 phần tử: $A_5^4 = 5 \\times 4 \\times 3 \\times 2$!',
    explanation: 'Số các số có 4 chữ số khác nhau lập từ 5 chữ số là:\n$A_5^4 = 5 \\times 4 \\times 3 \\times 2 = 120$ (số).\n➔ Đáp án đúng là: **A. 120**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Chọn chữ số thứ nhất', description: 'Có 5 cách chọn.' },
      { stepIndex: 1, title: 'Bước 2: Chọn các chữ số tiếp theo', description: 'Chữ số thứ 2 có 4 cách, thứ 3 có 3 cách, thứ 4 có 2 cách.' },
      { stepIndex: 2, title: 'Bước 3: Nhân quy tắc', description: '$5 \\times 4 \\times 3 \\times 2 = 120$. Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 10, gradeMax: 12,
    topicCode: 'MATH_TRIGONOMETRY', topicName: 'Lượng Giác & Biến Đổi',
    title: 'Câu: Rút gọn biểu thức lượng giác',
    text: 'Simplify the trigonometric expression: $\\sin^4(x) - \\cos^4(x)$.\n(Rút gọn biểu thức lượng giác: $\\sin^4(x) - \\cos^4(x)$.)',
    options: [
      { id: 'A', label: 'A', text: '$-\\cos(2x)$' },
      { id: 'B', label: 'B', text: '$\\cos(2x)$' },
      { id: 'C', label: 'C', text: '$\\sin(2x)$' },
      { id: 'D', label: 'D', text: '$-\\sin(2x)$' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Sử dụng hằng đẳng thức hiệu hai bình phương $a^2 - b^2 = (a-b)(a+b)$ với $\\sin^2(x) + \\cos^2(x) = 1$ nhé!',
    explanation: 'Sử dụng hằng đẳng thức:\n$$\\sin^4(x) - \\cos^4(x) = (\\sin^2(x) - \\cos^2(x))(\\sin^2(x) + \\cos^2(x))$$\nVì $\\sin^2(x) + \\cos^2(x) = 1$ và $\\cos^2(x) - \\sin^2(x) = \\cos(2x)$ nên:\n$$\\sin^4(x) - \\cos^4(x) = -(\\cos^2(x) - \\sin^2(x)) = -\\cos(2x)$$\n➔ Đáp án đúng là: **A. $-\\cos(2x)$**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Phân tích hằng đẳng thức', description: '$\\sin^4(x) - \\cos^4(x) = (\\sin^2(x) - \\cos^2(x))(\\sin^2(x) + \\cos^2(x))$.' },
      { stepIndex: 1, title: 'Bước 2: Rút gọn', description: 'Thay $\\sin^2(x) + \\cos^2(x) = 1$, ta được $-(\\cos^2(x) - \\sin^2(x)) = -\\cos(2x)$.' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Biểu thức rút gọn là $-\\cos(2x)$. Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 10, gradeMax: 12,
    topicCode: 'MATH_CALCULUS', topicName: 'Giải Tích, Giới Hạn & Tích Phân',
    title: 'Câu: Tính giới hạn hàm số',
    text: 'Evaluate the limit: $\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}$.\n(Tính giới hạn: $\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}$.)',
    options: [
      { id: 'A', label: 'A', text: '5' },
      { id: 'B', label: 'B', text: '1' },
      { id: 'C', label: 'C', text: '0' },
      { id: 'D', label: 'D', text: '$\\frac{1}{5}$' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Áp dụng giới hạn cơ bản $\\lim_{u \\to 0} \\frac{\\sin(u)}{u} = 1$ với $u = 5x$ nhé!',
    explanation: 'Biến đổi biểu thức giới hạn:\n$$\\lim_{x \\to 0} \\frac{\\sin(5x)}{x} = \\lim_{x \\to 0} \\left( 5 \\cdot \\frac{\\sin(5x)}{5x} \\right) = 5 \\cdot 1 = 5$$\n➔ Đáp án đúng là: **A. 5**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Biến đổi về giới hạn cơ bản', description: 'Nhân và chia cho 5: $\\frac{\\sin(5x)}{x} = 5 \\cdot \\frac{\\sin(5x)}{5x}$.' },
      { stepIndex: 1, title: 'Bước 2: Áp dụng định lý giới hạn', description: 'Vì $\\lim_{u \\to 0} \\frac{\\sin(u)}{u} = 1$, nên giới hạn bằng $5 \\times 1 = 5$.' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Giới hạn bằng 5. Chọn đáp án A.' }
    ]
  }
];

const SCIENCE_POOL = [
  {
    gradeMin: 3, gradeMax: 6,
    topicCode: 'SCI_BIOLOGY', topicName: 'Sinh Học & Thế Giới Tự Nhiên',
    title: 'Câu: Quá trình quang hợp ở thực vật',
    text: 'During photosynthesis, what gas do green plants absorb from the atmosphere and what gas do they release?\n(Trong quá trình quang hợp, cây xanh hấp thụ khí nào từ khí quyển và thải ra khí nào?)',
    options: [
      { id: 'A', label: 'A', text: 'Absorb carbon dioxide, release oxygen' },
      { id: 'B', label: 'B', text: 'Absorb oxygen, release carbon dioxide' },
      { id: 'C', label: 'C', text: 'Absorb nitrogen, release oxygen' },
      { id: 'D', label: 'D', text: 'Absorb carbon dioxide, release nitrogen' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Nhờ có chất diệp lục và ánh sáng mặt trời, cây lấy khí carbonic và tạo ra khí oxy cho chúng ta thở nhé!',
    explanation: 'Trong quá trình quang hợp, thực vật hấp thụ khí cacbonic ($CO_2$) và nước, dưới tác dụng của ánh sáng mặt trời để tạo ra glucozơ và giải phóng khí oxy ($O_2$).\n➔ Đáp án đúng là: **A. Absorb carbon dioxide, release oxygen**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Bản chất quang hợp', description: 'Thực vật sử dụng $CO_2$ và nước cùng ánh sáng mặt trời.' },
      { stepIndex: 1, title: 'Bước 2: Sản phẩm tạo thành', description: 'Tạo ra chất hữu cơ và giải phóng khí $O_2$.' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Hấp thụ $CO_2$ và thải ra $O_2$. Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 3, gradeMax: 6,
    topicCode: 'SCI_PHYSICS', topicName: 'Vật Lý & Năng Lượng',
    title: 'Câu: Sự truyền nhiệt trong chất lỏng',
    text: 'By which mechanism is thermal energy mainly transferred through liquids and gases?\n(Năng lượng nhiệt được truyền chủ yếu trong chất lỏng và chất khí bằng hình thức nào?)',
    options: [
      { id: 'A', label: 'A', text: 'Convection' },
      { id: 'B', label: 'B', text: 'Conduction' },
      { id: 'C', label: 'C', text: 'Radiation' },
      { id: 'D', label: 'D', text: 'Reflection' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Khi chất lỏng hay chất khí nóng lên, phần nóng nhẹ hơn nổi lên và phần lạnh chìm xuống tạo thành dòng đối lưu!',
    explanation: 'Đối lưu (Convection) là hình thức truyền nhiệt chủ yếu trong chất lỏng và chất khí thông qua sự chuyển động của các dòng vật chất.\n➔ Đáp án đúng là: **A. Convection**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Phân tích cơ chế truyền nhiệt', description: 'Chất lỏng và chất khí truyền nhiệt theo dòng lưu chuyển.' },
      { stepIndex: 1, title: 'Bước 2: Xác định tên gọi', description: 'Hình thức này gọi là đối lưu (Convection).' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 7, gradeMax: 9,
    topicCode: 'SCI_CHEMISTRY', topicName: 'Hóa Học & Vật Liệu',
    title: 'Câu: Phản ứng hóa học và độ pH',
    text: 'What is the pH range of a neutral aqueous solution at 25°C?\n(Độ pH của dung dịch nước trung tính ở nhiệt độ 25°C là bao nhiêu?)',
    options: [
      { id: 'A', label: 'A', text: 'pH = 7' },
      { id: 'B', label: 'B', text: 'pH < 7' },
      { id: 'C', label: 'C', text: 'pH > 7' },
      { id: 'D', label: 'D', text: 'pH = 0' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Thang pH từ 0 đến 14, trong đó dung dịch trung tính có nồng độ ion $H^+$ bằng ion $OH^-$, tức là pH = 7!',
    explanation: 'Ở 25°C, nước nguyên chất hoặc dung dịch trung tính có $[H^+] = [OH^-] = 10^{-7}$ M, do đó pH = 7.\n➔ Đáp án đúng là: **A. pH = 7**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Định nghĩa môi trường trung tính', description: '$[H^+] = [OH^-] = 10^{-7}$ M.' },
      { stepIndex: 1, title: 'Bước 2: Tính pH', description: '$\\text{pH} = -\\log[H^+] = 7$.' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 7, gradeMax: 9,
    topicCode: 'SCI_EARTH_SPACE', topicName: 'Trái Đất & Vũ Trụ',
    title: 'Câu: Cấu trúc hệ Mặt Trời',
    text: 'Which planet in our solar system has the greatest number of confirmed moons and the largest diameter?\n(Hành tinh nào trong hệ Mặt Trời có đường kính lớn nhất?)',
    options: [
      { id: 'A', label: 'A', text: 'Jupiter' },
      { id: 'B', label: 'B', text: 'Saturn' },
      { id: 'C', label: 'C', text: 'Neptune' },
      { id: 'D', label: 'D', text: 'Uranus' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Đây là hành tinh khí khổng lồ lớn nhất hệ Mặt Trời, có vết Đỏ Lớn đặc trưng!',
    explanation: 'Sao Mộc (Jupiter) là hành tinh lớn nhất trong hệ Mặt Trời về cả khối lượng và đường kính.\n➔ Đáp án đúng là: **A. Jupiter**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: So sánh kích thước hành tinh', description: 'Sao Mộc có đường kính khoảng 142.984 km, lớn nhất trong hệ Mặt Trời.' },
      { stepIndex: 1, title: 'Bước 2: Kết luận', description: 'Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 10, gradeMax: 12,
    topicCode: 'SCI_BIOLOGY', topicName: 'Sinh Học & Thế Giới Tự Nhiên',
    title: 'Câu: Cơ chế di truyền và cấu trúc ADN',
    text: 'In a DNA double helix, which nitrogenous base pairs with Adenine (A) via two hydrogen bonds?\n(Trong chuỗi xoắn kép ADN, bazơ nitơ nào liên kết bổ sung với Adenin (A) bằng 2 liên kết hiđro?)',
    options: [
      { id: 'A', label: 'A', text: 'Thymine (T)' },
      { id: 'B', label: 'B', text: 'Cytosine (C)' },
      { id: 'C', label: 'C', text: 'Guanine (G)' },
      { id: 'D', label: 'D', text: 'Uracil (U)' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Theo nguyên tắc bổ sung trong phân tử ADN: A liên kết với T bằng 2 liên kết hiđro, G liên kết với C bằng 3 liên kết hiđro nhé!',
    explanation: 'Theo nguyên tắc bổ sung của Watson - Crick: Adenin (A) liên kết với Timin (T) bằng 2 liên kết hiđro; Guanin (G) liên kết với Xitôzin (C) bằng 3 liên kết hiđro.\n➔ Đáp án đúng là: **A. Thymine (T)**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Nguyên tắc bổ sung trong ADN', description: 'A bắt cặp với T qua 2 liên kết hiđro.' },
      { stepIndex: 1, title: 'Bước 2: Kết luận', description: 'Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 10, gradeMax: 12,
    topicCode: 'SCI_PHYSICS', topicName: 'Vật Lý & Năng Lượng',
    title: 'Câu: Định luật khúc xạ ánh sáng',
    text: 'According to Snell’s Law of Refraction, what is the relation between angle of incidence $i$ and angle of refraction $r$ for media with indices $n_1$ and $n_2$?\n(Theo định luật khúc xạ ánh sáng Snell, hệ thức liên hệ giữa góc tới $i$ và góc khúc xạ $r$ là gì?)',
    options: [
      { id: 'A', label: 'A', text: '$n_1 \\sin(i) = n_2 \\sin(r)$' },
      { id: 'B', label: 'B', text: '$n_1 \\cos(i) = n_2 \\cos(r)$' },
      { id: 'C', label: 'C', text: '$n_1 \\tan(i) = n_2 \\tan(r)$' },
      { id: 'D', label: 'D', text: '$n_1 \\sin(r) = n_2 \\sin(i)$' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Tích của chiết suất môi trường tới với sin của góc tới luôn bằng tích của chiết suất môi trường khúc xạ với sin góc khúc xạ!',
    explanation: 'Định luật khúc xạ ánh sáng (Định luật Snell):\n$$n_1 \\sin(i) = n_2 \\sin(r)$$\nTrong đó $n_1, n_2$ là chiết suất của hai môi trường, $i$ là góc tới, $r$ là góc khúc xạ.\n➔ Đáp án đúng là: **A. $n_1 \\sin(i) = n_2 \\sin(r)$**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Định luật Snell', description: 'Tỉ số $\\frac{\\sin(i)}{\\sin(r)} = \\frac{n_2}{n_1}$.' },
      { stepIndex: 1, title: 'Bước 2: Nhân chéo', description: '$n_1 \\sin(i) = n_2 \\sin(r)$.' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Chọn đáp án A.' }
    ]
  }
];

const ENGLISH_POOL = [
  {
    gradeMin: 1, gradeMax: 3,
    topicCode: 'ENG_VOCABULARY', topicName: 'Từ Vựng & Ngữ Cảnh',
    title: 'Câu: Chọn từ đồng nghĩa thích hợp',
    text: 'Choose the word that has the CLOSEST meaning to the underlined word:\n"The children were very **cheerful** on their trip to the zoo."',
    options: [
      { id: 'A', label: 'A', text: 'happy' },
      { id: 'B', label: 'B', text: 'tired' },
      { id: 'C', label: 'C', text: 'scared' },
      { id: 'D', label: 'D', text: 'angry' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: "cheerful" có nghĩa là vui vẻ, rạng rỡ, đồng nghĩa với "happy" đó con!',
    explanation: '"Cheerful" nghĩa là vui tươi, hân hoan, đồng nghĩa với "happy".\n➔ Đáp án đúng là: **A. happy**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Hiểu nghĩa của từ', description: '"Cheerful" mang nghĩa tích cực (vui vẻ).' },
      { stepIndex: 1, title: 'Bước 2: Đối chiếu các lựa chọn', description: '"Happy" (vui vẻ) là từ đồng nghĩa chính xác nhất.' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 1, gradeMax: 3,
    topicCode: 'ENG_GRAMMAR', topicName: 'Ngữ Pháp & Cấu Trúc Câu',
    title: 'Câu: Điền mạo từ hoặc đại từ thích hợp',
    text: 'Choose the correct word to complete the sentence:\n"She bought _________ apple and two oranges at the supermarket."',
    options: [
      { id: 'A', label: 'A', text: 'an' },
      { id: 'B', label: 'B', text: 'a' },
      { id: 'C', label: 'C', text: 'the' },
      { id: 'D', label: 'D', text: 'some' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Từ "apple" bắt đầu bằng nguyên âm /æ/, nên trước danh từ số ít ta dùng mạo từ "an" nhé!',
    explanation: 'Vì từ "apple" bắt đầu bằng nguyên âm "a" và là danh từ số ít chưa xác định, ta dùng mạo từ "an".\n➔ Đáp án đúng là: **A. an**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Xét chữ cái đầu tiên', description: '"Apple" bắt đầu bằng nguyên âm.' },
      { stepIndex: 1, title: 'Bước 2: Quy tắc mạo từ', description: 'Sử dụng mạo từ "an" trước danh từ đếm được số ít bắt đầu bằng nguyên âm.' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 4, gradeMax: 6,
    topicCode: 'ENG_GRAMMAR', topicName: 'Ngữ Pháp & Cấu Trúc Câu',
    title: 'Câu: Chia thì của động từ trong câu',
    text: 'Choose the correct form of the verb:\n"By the time we arrived at the cinema, the movie _________."',
    options: [
      { id: 'A', label: 'A', text: 'had already started' },
      { id: 'B', label: 'B', text: 'has already started' },
      { id: 'C', label: 'C', text: 'is starting' },
      { id: 'D', label: 'D', text: 'starts' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Hành động phim chiếu xảy ra trước hành động "arrived" trong quá khứ, nên ta chia thì Quá khứ hoàn thành (had + V3/ed) nhé!',
    explanation: 'Cấu trúc "By the time + S + V(quá khứ đơn), S + had + V3/ed (quá khứ hoàn thành)" diễn tả hành động xảy ra trước một thời điểm/hành động trong quá khứ.\n➔ Đáp án đúng là: **A. had already started**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Xác định trật tự thời gian', description: 'Phim bắt đầu trước khi chúng tôi đến rạp.' },
      { stepIndex: 1, title: 'Bước 2: Chọn thì', description: 'Sử dụng Past Perfect: "had already started".' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 7, gradeMax: 9,
    topicCode: 'ENG_VOCABULARY', topicName: 'Từ Vựng & Ngữ Cảnh',
    title: 'Câu: Chọn từ trái nghĩa thích hợp',
    text: 'Choose the word that is OPPOSITE in meaning to the underlined word:\n"The scientist provided a **meticulous** explanation with all the precise details."',
    options: [
      { id: 'A', label: 'A', text: 'careless' },
      { id: 'B', label: 'B', text: 'thorough' },
      { id: 'C', label: 'C', text: 'detailed' },
      { id: 'D', label: 'D', text: 'accurate' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: "Meticulous" nghĩa là tỉ mỉ, cẩn thận. Từ trái nghĩa của nó là cẩu thả, bất cẩn ("careless")!',
    explanation: '"Meticulous" có nghĩa là tỉ mỉ, chu đáo. Trái nghĩa với nó là "careless" (cẩu thả, thiếu cẩn thận).\n➔ Đáp án đúng là: **A. careless**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Hiểu nghĩa gốc', description: '"Meticulous" = cẩn thận, tỉ mỉ.' },
      { stepIndex: 1, title: 'Bước 2: Tìm từ trái nghĩa', description: '"Careless" = cẩu thả, bất cẩn.' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Chọn đáp án A.' }
    ]
  },
  {
    gradeMin: 10, gradeMax: 12,
    topicCode: 'ENG_GRAMMAR', topicName: 'Ngữ Pháp & Cấu Trúc Câu',
    title: 'Câu: Câu điều kiện hỗn hợp và đảo ngữ',
    text: 'Choose the best phrase to complete the conditional sentence:\n"_________ earlier, we would have caught the morning express train."',
    options: [
      { id: 'A', label: 'A', text: 'Had we set off' },
      { id: 'B', label: 'B', text: 'If we set off' },
      { id: 'C', label: 'C', text: 'Should we set off' },
      { id: 'D', label: 'D', text: 'Were we to set off' }
    ],
    correctAnswer: 'A',
    meeHint: 'Mèo Mee gợi ý: Đảo ngữ câu điều kiện loại 3 có cấu trúc: "Had + S + V3/ed, S + would have + V3/ed" nhé!',
    explanation: 'Đảo ngữ câu điều kiện loại 3: "Had + S + V3/ed, S + would have + V3/ed" thay cho "If we had set off".\n➔ Đáp án đúng là: **A. Had we set off**',
    explanationSteps: [
      { stepIndex: 0, title: 'Bước 1: Nhận diện cấu trúc', description: 'Mệnh đề chính dùng "would have caught" (điều kiện loại 3).' },
      { stepIndex: 1, title: 'Bước 2: Áp dụng đảo ngữ loại 3', description: 'Bỏ "If", đưa "Had" lên đầu: "Had we set off".' },
      { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Chọn đáp án A.' }
    ]
  }
];

let counter = 1000;
function getSynthesizedQuestion(subject, grade, topicCode, index) {
  counter++;
  const pool = subject === 'science' ? SCIENCE_POOL : subject === 'english' ? ENGLISH_POOL : MATH_POOL;
  const filtered = pool.filter(p => grade >= p.gradeMin && grade <= p.gradeMax);
  const base = (filtered.length > 0 ? filtered[index % filtered.length] : pool[index % pool.length]);

  return {
    title: `${base.title} #${index + 1}`,
    text: base.text,
    options: JSON.parse(JSON.stringify(base.options)),
    correctAnswer: base.correctAnswer,
    topicCode: base.topicCode,
    topicName: base.topicName,
    meeHint: base.meeHint,
    explanation: base.explanation,
    explanationSteps: JSON.parse(JSON.stringify(base.explanationSteps)),
    domainType: subject === 'math' ? 'FORMULA' : subject === 'science' ? 'REAL_WORLD' : 'LOGIC_PUZZLE'
  };
}

module.exports = {
  getSynthesizedQuestion
};
