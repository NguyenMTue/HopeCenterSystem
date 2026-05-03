namespace backend.Domain.Enums;

public enum ApplicationStatus
{
    Pending,  // Chờ kiểm tra / Chờ duyệt
    Approved, // Đã phê duyệt
    Rejected  // Từ chối
}