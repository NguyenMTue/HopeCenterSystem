namespace backend.Domain.Enums;
    public enum ChildStatus
    {
        Active,     // Đang bảo trợ (Mặc định)
        Adopted,    // Đã nhận nuôi
        Hospitalized, // Đang nằm viện
        Transferred, // Đã chuyển tuyến
        PendingApproval // Chờ phê duyệt
    }