namespace backend.Domain.Enums;

    public enum TransactionType
    {
        Import = 1, // Nhập kho
        Export = 2, // Xuất kho
        Adjustment = 3 // Điều chỉnh (nếu có)
    }
