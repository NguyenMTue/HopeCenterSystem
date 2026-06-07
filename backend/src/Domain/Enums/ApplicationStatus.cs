namespace backend.Domain.Enums;

public enum ApplicationStatus
{
    Pending = 0,         // Chờ kiểm tra / Chờ duyệt
    Approved = 1,        // Đã phê duyệt
    Rejected = 2,        // Từ chối
    AwaitingMatching = 3, // Đã xác minh - Chờ ghép đôi
    Completed = 4,       // Hoàn thành
    Overdue = 5,          // Trễ
    MatchingProposed = 6, // Đã đề xuất ghép đôi
    AdopterAccepted = 7,  // Người nhận nuôi đồng ý
    AdopterRejected = 8   // Người nhận nuôi từ chối
}