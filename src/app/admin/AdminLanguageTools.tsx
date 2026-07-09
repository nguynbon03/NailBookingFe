"use client";

import { useEffect } from "react";

export type AdminLang = "en" | "vi";

export const ADMIN_BILINGUAL_MARKER = "admin-bilingual-v20260709";
export const ADMIN_LANG_STORAGE_KEY = "nail_admin_lang";

export const adminViText: Record<string, string> = {
  // Shell / navigation
  "Dashboard": "Tổng quan",
  "Inbox": "Hộp thư",
  "Bookings": "Booking",
  "Customers": "Khách hàng",
  "Reports": "Báo cáo",
  "Services": "Dịch vụ",
  "Staff": "Nhân viên",
  "Leave": "Nghỉ phép",
  "Accounts": "Tài khoản",
  "Protection": "Bảo vệ",
  "Promo": "Khuyến mãi",
  "Calendar": "Lịch",
  "Calendar & Reports": "Lịch & Báo cáo",
  "Back to Site": "Về trang chính",
  "Loading admin...": "Đang tải trang quản trị...",
  "Admin language": "Ngôn ngữ quản trị",
  "English": "Tiếng Anh",
  "Vietnamese": "Tiếng Việt",

  // Shared actions
  "Refresh": "Tải lại",
  "Search": "Tìm kiếm",
  "Filter": "Lọc",
  "Save": "Lưu",
  "Saving...": "Đang lưu...",
  "Saved": "Đã lưu",
  "Delete": "Xóa",
  "Delete selected": "Xóa mục đã chọn",
  "Delete all": "Xóa tất cả",
  "Cancel": "Hủy",
  "Cancel request": "Hủy yêu cầu",
  "Back": "Quay lại",
  "Submit": "Gửi",
  "Approve": "Duyệt",
  "Reject": "Từ chối",
  "Reset": "Đặt lại",
  "Export": "Xuất file",
  "Download": "Tải xuống",
  "Upload": "Tải lên",
  "Import": "Nhập dữ liệu",
  "Edit": "Sửa",
  "New": "Tạo mới",
  "Create": "Tạo",
  "Update": "Cập nhật",
  "Mark all read": "Đánh dấu đã đọc",
  "Select all": "Chọn tất cả",
  "Select all visible": "Chọn tất cả đang hiển thị",
  "selected": "đã chọn",
  "All": "Tất cả",
  "Any": "Bất kỳ",
  "None": "Không có",
  "Unknown": "Không rõ",
  "Active": "Đang bật",
  "Inactive": "Đã tắt",
  "Ready": "Sẵn sàng",
  "Connected": "Đã kết nối",
  "Ready to connect": "Sẵn sàng kết nối",
  "Setup pending": "Chờ thiết lập",
  "Off": "Tắt",
  "On": "Bật",
  "Unread": "Chưa đọc",
  "Read": "Đã đọc",
  "Status": "Trạng thái",
  "Reason": "Lý do",
  "Optional manager note": "Ghi chú quản lý (không bắt buộc)",
  "Manager note for rejection (optional):": "Ghi chú từ chối của quản lý (không bắt buộc):",

  // Dashboard
  "Active bookings": "Booking đang hoạt động",
  "Confirmed revenue": "Doanh thu đã xác nhận",
  "Pending review": "Chờ xử lý",
  "Still waiting for action/payment": "Đang chờ thao tác/thanh toán",
  "Cancelled": "Đã hủy",
  "Cancelled inside selected date range": "Đã hủy trong khoảng ngày đã chọn",
  "Total Users": "Tổng người dùng",
  "Console Role": "Vai trò quản trị",
  "Could not load dashboard": "Không tải được tổng quan",

  // Bookings
  "Booking management": "Quản lý booking",
  "All bookings": "Tất cả booking",
  "All days": "Tất cả ngày",
  "Today": "Hôm nay",
  "Tomorrow": "Ngày mai",
  "No bookings found for this date/filter. Click All days to see all bookings.": "Không có booking cho ngày/bộ lọc này. Bấm Tất cả ngày để xem toàn bộ booking.",
  "No bookings found for this filter.": "Không có booking phù hợp bộ lọc này.",
  "Showing all active bookings, newest first. Pick a date only when you want a daily view.": "Đang hiển thị tất cả booking đang hoạt động, mới nhất trước. Chỉ chọn ngày khi muốn xem theo ngày.",
  "Customer": "Khách hàng",
  "Customer requested": "Khách yêu cầu",
  "Customer transfer submitted": "Khách đã báo chuyển khoản",
  "Customer marked transfer sent. Verify bank then confirm payment.": "Khách đã đánh dấu đã chuyển khoản. Kiểm tra ngân hàng rồi xác nhận thanh toán.",
  "Email verified. Wait for transfer.": "Email đã xác thực. Chờ chuyển khoản.",
  "Waiting customer email verification.": "Đang chờ khách xác thực email.",
  "Payment received → Confirm": "Đã nhận tiền → Xác nhận",
  "verify email first": "xác thực email trước",
  "Awaiting transfer": "Chờ chuyển khoản",
  "Paid / Confirmed": "Đã thanh toán / xác nhận",
  "Completed": "Hoàn thành",
  "No show": "Không đến",
  "Archived": "Đã lưu trữ",
  "Cancelled with reason": "Đã hủy có lý do",
  "Done / revenue kept": "Hoàn tất / giữ doanh thu",
  "No-show / paid revenue kept": "Không đến / giữ doanh thu đã trả",
  "Email pending": "Chờ email",
  "Awaiting bank transfer": "Chờ chuyển khoản ngân hàng",
  "Paid - assign staff": "Đã thanh toán - phân nhân viên",
  "Staff assigned": "Đã phân nhân viên",
  "No email": "Không có email",
  "Any Staff": "Bất kỳ nhân viên",
  "Ticket": "Phiếu xử lý",
  "Cancel reason": "Lý do hủy",
  "Enter reason": "Nhập lý do",
  "Please enter a cancellation reason": "Vui lòng nhập lý do hủy",
  "Cannot confirm payment before customer email verification.": "Không thể xác nhận thanh toán trước khi khách xác thực email.",
  "Archive this booking from the active list? It will not be permanently deleted.": "Lưu trữ booking khỏi danh sách đang hoạt động? Booking sẽ không bị xóa vĩnh viễn.",
  "Failed to load bookings": "Không tải được booking",
  "Failed to update booking status": "Không cập nhật được trạng thái booking",
  "Failed to archive booking": "Không lưu trữ được booking",
  "Failed to archive selected bookings": "Không lưu trữ được các booking đã chọn",
  "Failed to delete selected bookings": "Không xóa được các booking đã chọn",

  // Customers
  "Customer export is OFF. Turn on Export data before downloading PDF/CSV.": "Xuất dữ liệu khách hàng đang TẮT. Bật Xuất dữ liệu trước khi tải PDF/CSV.",
  "Customer export is ON. Admin can download PDF/CSV.": "Xuất dữ liệu khách hàng đang BẬT. Admin có thể tải PDF/CSV.",
  "Customer export is OFF. PDF/CSV download is blocked until re-enabled.": "Xuất dữ liệu khách hàng đang TẮT. Tải PDF/CSV bị chặn cho đến khi bật lại.",
  "Could not load customers": "Không tải được khách hàng",
  "Could not export customer data": "Không xuất được dữ liệu khách hàng",
  "Could not update export toggle": "Không cập nhật được nút xuất dữ liệu",
  "Search name, email, phone...": "Tìm tên, email, số điện thoại...",

  // Inbox / leave
  "Cancel booking approved": "Đã duyệt hủy booking",
  "Cancellation request reviewed; booking kept active": "Đã xử lý yêu cầu hủy; booking vẫn hoạt động",
  "Leave request approved": "Đã duyệt nghỉ phép",
  "Leave request rejected": "Đã từ chối nghỉ phép",
  "Ticket acknowledged": "Đã ghi nhận phiếu",
  "Ticket processed": "Đã xử lý phiếu",
  "Could not load inbox": "Không tải được hộp thư",
  "Could not update notification": "Không cập nhật được thông báo",
  "Could not mark inbox read": "Không đánh dấu đã đọc được",
  "Could not delete ticket": "Không xóa được phiếu",
  "Could not delete selected tickets": "Không xóa được phiếu đã chọn",
  "Delete ALL inbox tickets for cancellation + staff leave? This cannot be undone.": "Xóa TẤT CẢ phiếu hủy + nghỉ phép? Không thể hoàn tác.",
  "Could not delete all inbox tickets": "Không xóa được toàn bộ hộp thư",
  "Could not load leave requests": "Không tải được yêu cầu nghỉ phép",
  "Could not review leave request": "Không xử lý được yêu cầu nghỉ phép",
  "Could not delete leave request": "Không xóa được yêu cầu nghỉ phép",
  "Could not delete selected leave requests": "Không xóa được yêu cầu nghỉ đã chọn",
  "Delete ALL leave requests from the admin list? This cannot be undone.": "Xóa TẤT CẢ yêu cầu nghỉ khỏi danh sách admin? Không thể hoàn tác.",
  "Could not delete all leave requests": "Không xóa được toàn bộ yêu cầu nghỉ",

  // Services / staff / accounts / promo
  "Search service name/category...": "Tìm tên dịch vụ/danh mục...",
  "Edit Service": "Sửa dịch vụ",
  "New Service": "Tạo dịch vụ mới",
  "Service preview": "Xem trước dịch vụ",
  "Name": "Tên",
  "Price (£)": "Giá (£)",
  "Duration (minutes)": "Thời lượng (phút)",
  "Save Service": "Lưu dịch vụ",
  "Failed to load services": "Không tải được dịch vụ",
  "Failed to save service": "Không lưu được dịch vụ",
  "Delete this service?": "Xóa dịch vụ này?",
  "Edit Staff": "Sửa nhân viên",
  "New Staff": "Tạo nhân viên mới",
  "Staff preview": "Xem trước nhân viên",
  "Leave blank unless resetting": "Để trống nếu không đặt lại",
  "Default: staff123": "Mặc định: staff123",
  "Save Staff": "Lưu nhân viên",
  "Staff Management": "Quản lý nhân viên",
  "Photos and active status sync to public booking staff selection.": "Ảnh và trạng thái hoạt động sẽ đồng bộ ra phần chọn nhân viên khi khách đặt lịch.",
  "Add Staff": "Thêm nhân viên",
  "Staff preview photo": "Ảnh xem trước nhân viên",
  "Upload staff photo": "Tải ảnh nhân viên",
  "Remove photo": "Xóa ảnh",
  "Staff name": "Tên nhân viên",
  "Login email": "Email đăng nhập",
  "Phone number": "Số điện thoại",
  "Login password": "Mật khẩu đăng nhập",
  "Role / service specialty": "Vai trò / chuyên môn dịch vụ",
  "Photo URL": "URL ảnh",
  "Bio / specialties shown on website": "Bio / chuyên môn hiển thị trên website",
  "Active on website and booking page": "Hiển thị trên website và trang đặt lịch",
  "No ratings yet": "Chưa có đánh giá",
  "review": "đánh giá",
  "reviews": "đánh giá",
  "Failed to load staff": "Không tải được nhân viên",
  "Failed to save staff": "Không lưu được nhân viên",
  "Delete this staff member?": "Xóa nhân viên này?",
  "Search name/email/phone...": "Tìm tên/email/số điện thoại...",
  "All roles": "Tất cả vai trò",
  "New password": "Mật khẩu mới",
  "Admin only": "Chỉ admin",
  "Active staff": "Nhân viên đang hoạt động",
  "Inactive staff": "Nhân viên đã tắt",
  "Password must be at least 6 characters": "Mật khẩu phải có ít nhất 6 ký tự",
  "Manager cannot edit ADMIN accounts": "Quản lý không thể sửa tài khoản ADMIN",
  "Only ADMIN can promote accounts to ADMIN": "Chỉ ADMIN được nâng quyền tài khoản lên ADMIN",
  "Manager cannot delete ADMIN accounts": "Quản lý không thể xóa tài khoản ADMIN",
  "You cannot delete your own account": "Bạn không thể xóa chính tài khoản của mình",
  "Failed to load accounts": "Không tải được tài khoản",
  "Failed to reset password": "Không đặt lại được mật khẩu",
  "Failed to update account role": "Không cập nhật được vai trò tài khoản",
  "Failed to delete account": "Không xóa được tài khoản",
  "Edit Promo Code": "Sửa mã khuyến mãi",
  "New Promo Code": "Tạo mã khuyến mãi",
  "Code e.g. NAIL20": "Mã ví dụ NAIL20",
  "Save Promo Code": "Lưu mã khuyến mãi",
  "Discount code": "Mã giảm giá",
  "Unlimited": "Không giới hạn",
  "No date": "Không có ngày",
  "Failed to load promo codes": "Không tải được mã khuyến mãi",
  "Failed to save promo code": "Không lưu được mã khuyến mãi",
  "Delete this promo code?": "Xóa mã khuyến mãi này?",

  // Protection
  "Booking protection settings saved.": "Đã lưu cài đặt bảo vệ booking.",
  "Save protection settings": "Lưu cài đặt bảo vệ",
  "Enter an email, phone, or IP to blacklist.": "Nhập email, số điện thoại hoặc IP để chặn.",
  "Blacklist updated. Future matching bookings will be blocked.": "Đã cập nhật danh sách chặn. Booking khớp trong tương lai sẽ bị chặn.",
  "Remove this blacklist item?": "Xóa mục chặn này?",
  "value to block": "giá trị cần chặn",
  "Reason, e.g. spam/no-show/competitor abuse": "Lý do, ví dụ spam/không đến/đối thủ phá hoại",
  "Could not load protection settings": "Không tải được cài đặt bảo vệ",
  "Could not save settings": "Không lưu được cài đặt",
  "Could not add blacklist item": "Không thêm được mục chặn",

  // Calendar / Google / Reports / WhatsApp
  "Load failed": "Tải thất bại",
  "Gmail Calendar": "Lịch Gmail",
  "Daily Email": "Email hằng ngày",
  "Automatic Report": "Báo cáo tự động",
  "Owner Gmail for alerts & PDF reports": "Gmail chủ shop nhận cảnh báo & báo cáo PDF",
  "Owner Gmail address": "Địa chỉ Gmail chủ shop",
  "owner@gmail.com": "owner@gmail.com",
  "Send daily PDF automatically": "Tự động gửi PDF hằng ngày",
  "The report is emailed to the owner every day at the selected time.": "Báo cáo được gửi email cho chủ shop mỗi ngày vào giờ đã chọn.",
  "Save & enable daily email": "Lưu & bật email hằng ngày",
  "Shop Gmail Calendar": "Lịch Gmail của shop",
  "Keep the shop Gmail calendar updated": "Giữ lịch Gmail của shop luôn cập nhật",
  "Confirmed bookings can be reflected on the connected shop calendar.": "Booking đã xác nhận có thể được đồng bộ lên lịch shop đã kết nối.",
  "Setup is pending. No keys are shown in the admin screen.": "Đang chờ thiết lập. Không hiển thị key kỹ thuật trên màn hình admin.",
  "Recent email reports": "Báo cáo email gần đây",
  "A simple history of owner report delivery. Setup details are hidden from this page.": "Lịch sử gửi báo cáo cho chủ shop. Chi tiết kỹ thuật được ẩn khỏi trang này.",
  "Sent": "Đã gửi",
  "Not sent": "Chưa gửi",
  "Never": "Chưa bao giờ",
  "Settings saved.": "Đã lưu cài đặt.",
  "Calendar file downloaded.": "Đã tải file lịch.",
  "Daily revenue PDF downloaded.": "Đã tải PDF doanh thu hằng ngày.",
  "Could not load settings": "Không tải được cài đặt",
  "Could not download the calendar file": "Không tải được file lịch",
  "Could not download the daily report": "Không tải được báo cáo hằng ngày",
  "Could not send the daily email report": "Không gửi được email báo cáo hằng ngày",
  "Could not load reports": "Không tải được báo cáo",
  "Could not export report": "Không xuất được báo cáo",
  "Enter the owner/admin Gmail first.": "Nhập Gmail chủ shop/admin trước.",
  "Could not send the revenue email": "Không gửi được email doanh thu",
  "Paste or upload CSV bank statement content first.": "Dán hoặc tải nội dung sao kê CSV trước.",
  "Could not import bank statement": "Không nhập được sao kê ngân hàng",
  "Bank connection enabled": "Đã bật kết nối ngân hàng",
  "Manual bank statement import active": "Đang bật nhập sao kê thủ công",
  "Importing...": "Đang nhập...",
  "Import + match": "Nhập & đối soát",
  "Sending...": "Đang gửi...",
  "Email current PDF": "Gửi PDF hiện tại qua email",
  "WhatsApp QR": "QR WhatsApp",
  "Failed to load WhatsApp status": "Không tải được trạng thái WhatsApp",
};

const adminEnText = Object.fromEntries(Object.entries(adminViText).map(([en, vi]) => [vi, en]));

function withWhitespace(original: string, replacement: string) {
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  return leading + replacement + trailing;
}

export function translateAdminText(value: string, lang: AdminLang) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return value;
  const replacement = lang === "vi" ? adminViText[trimmed] : adminEnText[trimmed];
  return replacement ? withWhitespace(value, replacement) : value;
}

export function AdminLanguageToggle({ lang, onChange }: { lang: AdminLang; onChange: (lang: AdminLang) => void }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-pink-100 bg-white/95 p-1 text-xs font-black shadow-sm" data-admin-bilingual={ADMIN_BILINGUAL_MARKER} data-no-admin-translate>
      <span className="hidden px-2 text-[10px] uppercase tracking-wide text-gray-400 sm:inline">{lang === "vi" ? "Ngôn ngữ" : "Language"}</span>
      <button type="button" onClick={() => onChange("en")} className={`rounded-xl px-3 py-1.5 transition ${lang === "en" ? "bg-pink-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>EN</button>
      <button type="button" onClick={() => onChange("vi")} className={`rounded-xl px-3 py-1.5 transition ${lang === "vi" ? "bg-pink-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>VI</button>
    </div>
  );
}

export function AdminI18nBridge({ lang }: { lang: AdminLang }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.querySelector("[data-admin-shell]");
    if (!root) return;

    const translateValue = (value: string) => translateAdminText(value, lang);

    const translateNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (!parent || parent.closest("[data-no-admin-translate]") || ["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT"].includes(parent.tagName)) return;
        const current = node.textContent || "";
        const next = translateValue(current);
        if (next !== current) node.textContent = next;
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as HTMLElement;
      if (element.closest("[data-no-admin-translate]")) return;
      for (const attr of ["placeholder", "title", "aria-label"]) {
        const current = element.getAttribute(attr);
        if (!current) continue;
        const next = translateValue(current);
        if (next !== current) element.setAttribute(attr, next);
      }
    };

    const translateTree = () => {
      translateNode(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      let node = walker.nextNode();
      while (node) {
        translateNode(node);
        node = walker.nextNode();
      }
    };

    let frame = window.requestAnimationFrame(translateTree);
    const observer = new MutationObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(translateTree);
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title", "aria-label"] });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [lang]);

  return null;
}
