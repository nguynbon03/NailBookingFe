---
title: Workflow đặt lịch và thanh toán Nail Lounge
audience: Chủ shop / Manager / Staff
last_updated: 2026-06-30
---

# Workflow đặt lịch và thanh toán

Mục tiêu: tránh thất thu, tránh xác nhận nhầm với khách, và để Manager điều hành tiệm khi chủ đi vắng.

## Quy tắc lớn

- Staff không được xác nhận thanh toán với khách.
- Staff không được hủy lịch với khách.
- Owner/Admin và Manager là người kiểm tra chuyển khoản và bấm xác nhận.
- Revenue chỉ được tính khi booking đã chuyển sang trạng thái Paid / Confirmed.
- No-show sau khi đã thanh toán vẫn giữ revenue.
- Cancellation phải có reason.
- Staff reject job là nội bộ, không hủy lịch của khách.

## Vai trò

### Admin / Owner

Toàn quyền:

- quản lý booking
- xác nhận thanh toán
- hủy booking với khách
- xem thống kê/ngày
- archive booking cũ
- quản lý staff/account/promo/service
- tạo hoặc sửa tài khoản Manager/Admin

### Manager

Điều hành tiệm khi chủ đi vắng:

- kiểm tra booking trong Admin
- kiểm tra khách đã xác thực email chưa
- kiểm tra chuyển khoản/bank transfer
- bấm Payment received → Confirm
- hủy booking với reason nếu cần
- quản lý lịch vận hành thường ngày
- không được tạo/sửa/xóa tài khoản Admin/Manager khác

### Staff

Chỉ xử lý job nội bộ:

- xem job đã được Owner/Manager xác nhận thanh toán
- Accept job để nhận việc
- Cannot take job nếu không nhận được, bắt buộc nhập reason
- Complete sau khi làm xong
- No-show nếu khách không đến
- không hủy booking với khách
- không xác nhận thanh toán

## Luồng chuẩn từng bước

### Bước 1 — Khách tạo tài khoản

Khách phải đăng ký bằng email thật.

Hệ thống gửi link xác thực email tài khoản.

Nếu khách chưa xác thực email tài khoản, khách không được đặt lịch online.

### Bước 2 — Khách gửi booking request

Khách chọn service, ngày, giờ và nhập email đã đăng ký.

Hệ thống tạo booking ở trạng thái:

- Awaiting email verification

Booking lúc này:

- chưa hiện trong Staff Portal
- chưa assign staff
- chưa tính revenue
- chưa sync calendar ngoài
- chưa được coi là lịch chắc chắn

### Bước 3 — Khách xác nhận email booking

Khách bấm link xác nhận booking trong email.

Admin/Manager thấy booking chuyển sang bước:

- Awaiting bank transfer

Ý nghĩa: khách có quyền truy cập email đó, nhưng shop vẫn chưa nhận tiền.

### Bước 4 — Khách chuyển khoản

Khách chuyển khoản theo hướng dẫn của shop.

Admin/Manager phải kiểm tra thực tế trong tài khoản ngân hàng hoặc app thanh toán.

Không bấm Confirm nếu chưa thấy tiền.

### Bước 5 — Admin/Manager bấm Payment received → Confirm

Khi tiền đã vào:

1. Vào Admin > Bookings.
2. Tìm booking.
3. Chọn Payment received → Confirm.
4. Hệ thống ghi paymentConfirmedAt và paymentConfirmedBy.
5. Revenue bắt đầu được tính.
6. Job mới hiện ở Staff Portal.
7. Hệ thống tự bắn notification cho toàn bộ Staff: "New paid job available".

Đây là điểm chống thất thu quan trọng nhất. Staff chỉ thấy/nhận job sau bước này.

### Bước 6 — Staff nhận job

Staff vào Staff Portal.

Nếu nhận được việc:

- bấm Accept job

Accept job chỉ assign nội bộ cho staff. Nó không gửi lại xác nhận cho khách.

Nếu không nhận được việc:

- bấm Cannot take job
- chọn/nhập reason

Booking không bị hủy với khách. Booking quay lại Open Paid Jobs để Manager giao cho staff khác.

### Bước 7 — Hoàn tất hoặc No-show

Sau khi làm xong:

- Staff bấm Complete

Nếu khách không đến:

- Staff bấm No-show

No-show sau khi đã thanh toán vẫn giữ revenue để tránh thất thu.

### Bước 8 — Staff xin nghỉ / báo phép nghỉ

Staff không tự xóa lịch rảnh bằng miệng hoặc nhắn riêng nữa. Staff phải tạo leave ticket trong Staff Portal.

Staff làm như sau:

1. Vào Staff Portal.
2. Mở Day Off / Leave Ticket.
3. Chọn From date và To date.
4. Nhập reason, ví dụ: sick, family matter, holiday request.
5. Bấm Submit leave ticket.

Manager/Admin làm như sau:

1. Vào Admin > Leave.
2. Xem ticket PENDING.
3. Nếu đồng ý, bấm Approve.
4. Nếu không đồng ý, bấm Reject và ghi note nếu cần.

Khi leave được approve:

- Staff nhận notification leave approved.
- Ngày nghỉ đã duyệt tự chặn availability của staff.
- Customer booking slot không còn tính staff đó là người rảnh.
- Nếu staff đang có paid confirmed booking trong ngày nghỉ, Manager nhận cảnh báo để đổi người.

### Bước 9 — Hủy booking

Chỉ Admin/Manager được hủy với khách.

Khi hủy:

- phải chọn reason
- hệ thống lưu cancellationReason
- cancellation notice được queue cho khách
- revenue bị gỡ nếu booking bị hủy

Staff không dùng nút Cancel với khách nữa.

### Bước 10 — Archive booking cũ

Booking cancelled/completed/no-show có thể archive để màn hình đỡ loạn.

Archive không xóa dữ liệu vĩnh viễn.

Dùng Include archived nếu cần kiểm tra lại lịch sử.

## Trạng thái nên hiểu như sau

| Trạng thái UI | Ý nghĩa | Ai xử lý tiếp |
|---|---|---|
| Email pending | Khách chưa bấm link email booking | Khách |
| Awaiting transfer | Khách đã xác thực email, chờ chuyển khoản | Admin/Manager |
| Paid / Confirmed | Đã nhận tiền, revenue được tính | Staff nhận job |
| Staff assigned | Staff đã nhận việc | Staff |
| Leave pending | Staff đã xin nghỉ, chờ duyệt | Manager/Admin |
| Leave approved | Ngày nghỉ đã duyệt, staff bị ẩn khỏi availability ngày đó | Hệ thống + Manager |
| Completed | Đã làm xong | Không cần xử lý |
| No-show | Khách không đến sau khi đã xác nhận | Manager theo dõi |
| Cancelled | Shop hủy booking, có reason | Admin/Manager |
| Archived | Ẩn khỏi active list | Dùng để dọn màn hình |

## Khi chủ đi vắng

Manager làm theo thứ tự:

1. Mở Admin > Bookings.
2. Chọn ngày cần xử lý.
3. Xem Email pending trước, nhắc khách nếu cần.
4. Xem Awaiting transfer, kiểm tra ngân hàng.
5. Chỉ khi tiền vào mới bấm Payment received → Confirm.
6. Kiểm tra Open Paid Jobs trong Staff Portal hoặc Admin để đảm bảo staff đã nhận việc.
7. Nếu staff reject, xem reason và giao lại cho người khác.
8. Vào Admin > Leave để duyệt/từ chối đơn nghỉ của staff.
9. Nếu leave được approve mà có booking trùng, reassign booking ngay.
10. Cuối ngày xem Completed / No-show / Cancelled và revenue ngày đó.
11. Archive booking cũ để màn hình sạch.

## Những điều không được làm

- Không confirm chỉ vì khách nói đã chuyển khoản.
- Không để Staff hủy lịch với khách.
- Không tính revenue từ booking chưa thanh toán.
- Không để email chưa xác thực hiện cho Staff.
- Không hard-delete booking nếu còn cần đối soát doanh thu.
- Không nhận nghỉ bằng miệng/tin nhắn riêng rồi quên cập nhật hệ thống.
- Không approve leave mà bỏ qua booking đã assign trùng ngày.
