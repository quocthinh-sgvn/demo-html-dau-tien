import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Khởi tạo Gemini AI SDK một cách an toàn
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('CẢNH BÁO: KEY GEMINI_API_KEY chưa được cấu hình. Hệ thống AI Feedback sẽ hoạt động ở chế độ offline/giả lập.');
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Sử dụng Json Body Parser
  app.use(express.json());

  // API Route: Sinh nhận xét thông minh bằng AI Gemini
  app.post('/api/generate-feedback', async (req, res) => {
    try {
      const { studentName, courseTitle, assignmentTitle, score, attendanceStatus, behavior } = req.body;

      if (!studentName || !courseTitle) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (studentName hoặc courseTitle)' });
      }

      const client = getGeminiClient();
      if (!client) {
        // Trả về nhận xét giả lập chất lượng cao nếu không có API Key
        const fallbackFeedback = `Chào ${studentName}, thầy đánh giá cao nỗ lực hoàn thành bài tập "${assignmentTitle}" của em. Với mức điểm ${score}/10, em đã nắm vững các khái niệm cơ bản của bài học. ${attendanceStatus === 'late' ? 'Tuy nhiên, em cần chú ý phân bổ thời gian đi học đúng giờ hơn để không bỏ lỡ phần lý thuyết đầu buổi.' : ''} Thái độ học tập ${behavior || 'tốt'}. Hãy tiếp tục phát huy tinh thần tự học tuyệt vời này nhé!`;
        return res.json({ feedback: fallbackFeedback, isMock: true });
      }

      const prompt = `Bạn là một giảng viên ưu tú, có phong cách sư phạm hiện đại, đầy tính nâng đỡ, động viên tại Học viện Giáo dục LMS EduHub.
Hãy viết một bức thư nhận xét kết quả học tập mang tính cá nhân hóa cao cho học viên sau đây:
- Tên học viên: ${studentName}
- Khóa học: ${courseTitle}
- Tên bài tập/bài kiểm tra: ${assignmentTitle || 'Bài tập thực hành tuần'}
- Điểm số: ${score}/10
- Trạng thái đi học: ${attendanceStatus === 'present' ? 'Đi học đầy đủ, đúng giờ' : attendanceStatus === 'late' ? 'Có đi trễ một vài buổi học' : 'Nghỉ học không phép/đầy đủ'}
- Thái độ/Ghi chú thêm: ${behavior || 'Năng nổ đóng góp ý kiến, học tập có mục tiêu rõ ràng'}

Yêu cầu nhận xét:
1. Độ dài khoảng 3 - 4 câu ngắn gọn, súc tích, bằng Tiếng Việt thân thiện, chân thành và truyền cảm hứng.
2. Tránh các nhận xét chung chung mang tính máy móc. Hãy đề cập cụ thể mức điểm ${score}/10 thể hiện điều gì (Ví dụ: điểm 9-10 là xuất sắc, 7-8 là khá tốt, dưới 7 là cần cố gắng thêm một số phần).
3. Đưa ra 1 lời khuyên thực tế để học tập tốt hơn trong các buổi sau.
4. Kết thư bằng một lời động viên tinh thần thật ấm áp, chúc học viên học tập hiệu quả. Tránh xưng hô quá xa cách, hãy xưng hô "Thầy/Cô" hoặc "Giảng viên" hướng đến "Em" hoặc "Học viên".`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text || '';
      res.json({ feedback: responseText.trim(), isMock: false });
    } catch (error: any) {
      console.error('Lỗi khi gọi Gemini API:', error);
      res.status(500).json({ 
        error: 'Không thể sinh nhận xét từ AI do lỗi máy chủ.',
        details: error.message 
      });
    }
  });

  // API Route: Tự động gửi Email mô phỏng
  app.post('/api/send-simulator-email', (req, res) => {
    const { toEmail, subject, body, type } = req.body;
    if (!toEmail || !subject || !body) {
      return res.status(400).json({ error: 'Thiếu thông tin email nhận, tiêu đề hoặc nội dung' });
    }

    // Mô phỏng lưu nhật ký email gửi đi
    const mockEmailLog = {
      id: `notif-${Date.now()}`,
      toEmail,
      subject,
      body,
      sentAt: new Date().toLocaleString('vi-VN'),
      type: type || 'custom_notification',
      status: 'sent'
    };

    res.json({ success: true, email: mockEmailLog });
  });

  // Tải Vite làm Middleware trong môi trường Dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Phục vụ các file tĩnh trong production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LMS EduHub Server] Server đang chạy mượt mà tại http://localhost:${PORT}`);
  });
}

startServer();
