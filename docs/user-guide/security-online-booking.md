---
title: Cảnh báo an ninh khi dùng Online Booking
audience: Chủ shop / Admin / Manager
last_updated: 2026-06-30
---

# Cảnh báo an ninh khi dùng Online Booking

Tài liệu này giải thích cách tránh booking giả, email giả và tình trạng nhân viên bị khoá lịch sai.

## 1. Nguyên tắc chống booking giả

Phần mềm không coi một booking là thật chỉ vì khách đã nhập form.

Một booking online phải đi qua các bước sau:

1. Khách dùng email đã đăng ký trong hệ thống.
2. Email tài khoản phải được xác thực trước.
3. Khi đặt lịch, hệ thống gửi thêm link xác nhận booking về email đó.
4. Khách phải bấm link xác nhận booking.
5. Admin hoặc Manager kiểm tra rồi mới bấm Confirm.
6. Sau khi Confirm, booking mới hiện cho Staff.

Nếu khách không bấm email xác nhận, booking vẫn chỉ là yêu cầu chờ xử lý.

## 2. Chủ shop nhìn dấu hiệu phản hồi ở đâu?

Vào Admin > Bookings.

Mỗi booking chờ xử lý sẽ có trạng thái phụ:

- Awaiting email verification: khách chưa bấm link trong email.
- Email verified: khách đã bấm link trong email.

Khi khách bấm link, Admin/Manager cũng nhận notification:

- Customer confirmed by email.

Lưu ý: Email verified chỉ chứng minh khách có quyền truy cập email đó. Nó không có nghĩa là booking đã được shop duyệt. Admin/Manager vẫn phải bấm Confirm.

## 3. Vì sao email ảo có thể gây khoá lịch nếu thiết kế sai?

Nếu hệ thống tự giữ slot ngay khi khách vừa nhập form, người xấu có thể dùng email ảo để tạo nhiều booking giả.

Hậu quả nếu thiết kế sai:

- Staff thấy lịch bị bận dù khách không thật.
- Slot đẹp bị chiếm trong app.
- Nếu có Google Calendar hoặc Apple Calendar sync, lịch ngoài cũng có thể bị chặn sai.
- Chủ shop mất khách thật vì hệ thống báo hết chỗ.

## 4. Rule an toàn đang dùng

Booking chưa xác thực email thì:

- Không hiện trong Staff Portal.
- Không assign cho Staff.
- Không khoá lịch Staff vĩnh viễn.
- Không được sync sang Google Calendar hoặc Apple Calendar nếu sau này tích hợp.
- Không được tính doanh thu.

Booking chỉ bắt đầu ảnh hưởng lịch vận hành sau khi:

1. Khách xác thực email booking.
2. Admin hoặc Manager bấm Confirm.

## 5. Deposit / QR / thanh toán

Không bắt buộc mọi shop lấy deposit.

Vì văn hoá thu phí dịch vụ và quy định từng nước khác nhau, phần mềm không ép shop thu cọc.

Tuỳ từng shop:

- Shop không lấy deposit: chỉ dùng email verification + admin confirm.
- Shop muốn lấy cọc thủ công: chủ shop gửi QR/bank transfer riêng cho khách.
- Shop muốn tích hợp thanh toán online: chỉ tích hợp khi chủ shop yêu cầu rõ.

Không nói với khách rằng hệ thống đã thu tiền nếu app chưa tích hợp provider thanh toán thật.

## 6. Google / Outlook OAuth

Google login hoặc Outlook/Microsoft login là hướng hợp lý cho bản nâng cấp tiếp theo.

Nguyên tắc:

- Nếu Google/Microsoft trả về email đã verified, hệ thống có thể đánh dấu tài khoản là email verified.
- Nếu khách đăng nhập bằng email/password thường, hệ thống vẫn gửi link xác thực email.
- Khi booking, khách vẫn phải xác nhận booking qua email một lần nữa.
- Email nhập trong booking phải trùng email tài khoản đã đăng ký/xác thực.

Không được tự coi một email là thật chỉ vì khách gõ đúng định dạng email.

## 7. Redis lock có hợp lý không?

Có. Redis lock hợp lý khi:

- Có nhiều server/app instance cùng chạy.
- Lượng khách đặt lịch cao.
- Có sync Google Calendar hoặc Apple Calendar.
- Cần giữ slot tạm thời trong vài phút khi khách đang xác thực email.

Rule đề xuất khi bật Redis:

- Lock slot ngắn hạn: 5-10 phút.
- Lock tự hết hạn nếu khách không xác thực email.
- Không biến lock tạm thành lịch Staff thật.
- Chỉ sync calendar ngoài sau khi Admin/Manager Confirm.

Nếu Redis chưa cấu hình, hệ thống phải fallback về DB check và không được làm app lỗi.

## 8. Quyền Admin / Manager / Staff

- Admin: toàn quyền, quản lý tất cả, reset password tất cả, xoá/sửa quyền cao nhất.
- Manager: vận hành thay Admin, nhưng không được xoá/sửa/reset Admin hoặc Manager khác.
- Staff: chỉ xem việc đã được confirm/assign, cập nhật việc của mình, nhập lý do huỷ nếu cần.

Staff không được thấy booking chưa xác thực email.
