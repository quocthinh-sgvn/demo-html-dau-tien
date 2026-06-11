/**
 * Hàm sinh đường dẫn ảnh QR code thanh toán chuẩn ngân hàng qua VietQR
 * Giúp học viên thực thi chuyển khoản thanh toán học bổng thực thụ.
 */
export function generateVietQRUrl(params: {
  bankId?: string;
  accountNo?: string;
  accountName?: string;
  amount: number;
  description: string;
}): string {
  const bankId = params.bankId || 'MB'; // Mặc định ngân hàng quân đội MB
  const accountNo = params.accountNo || '160920261993'; // Số tài khoản demo
  const accountName = encodeURIComponent(params.accountName || 'CONG TY GIAO DUC EDUHUB');
  const amount = params.amount;
  const description = encodeURIComponent(params.description);
  
  // Sử dụng API cổng VietQR để sinh ảnh QR tự động điền số tài khoản, số tiền và lời nhắn
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-print.png?amount=${amount}&addInfo=${description}&accountName=${accountName}`;
}
