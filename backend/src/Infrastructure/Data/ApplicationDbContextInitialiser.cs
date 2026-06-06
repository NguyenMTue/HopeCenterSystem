
using backend.Domain.Entities;
using backend.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.IO;

namespace backend.Infrastructure.Data;

public class ApplicationDbContextInitialiser
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<Account> _userManager;
    private readonly RoleManager<Role> _roleManager;

    public ApplicationDbContextInitialiser(
        ILogger<ApplicationDbContextInitialiser> logger,
        ApplicationDbContext context,
        UserManager<Account> userManager,
        RoleManager<Role> roleManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            _logger.LogWarning("Đang RESET Database... Toàn bộ dữ liệu cũ sẽ bị XÓA SẠCH!");
            
            // Xóa toàn bộ Database (Chỉ áp dụng trong lúc Dev)
            await _context.Database.EnsureDeletedAsync();
            
            // Chạy Migration để tạo lại cấu trúc bảng mới nhất
            await _context.Database.MigrateAsync();
            
            _logger.LogInformation("Đã khởi tạo Database thành công.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Có lỗi xảy ra khi khởi tạo Database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            _logger.LogInformation("Bắt đầu Seed dữ liệu mẫu...");
            await TrySeedAsync();
            _logger.LogInformation("Đã hoàn tất Seed dữ liệu mẫu.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Có lỗi nghiêm trọng xảy ra khi Seed dữ liệu.");
            throw;
        }
    }

    private async Task TrySeedAsync()
    {
        // ==========================================
        // 1. TẠO CÁC ROLE MẶC ĐỊNH
        // ==========================================
        var roles = new List<(string Name, string Description)> 
        { 
            ("Administrator", "Quản trị hệ thống"), 
            ("Director", "Giám đốc trung tâm"), 
            ("Manager", "Quản lý phòng ban"), 
            ("CareGiver", "Nhân viên chăm sóc"), 
            ("Adopter", "Người nhận nuôi") 
        };

        foreach (var roleInfo in roles)
        {
            if (!await _roleManager.RoleExistsAsync(roleInfo.Name))
            {
                _logger.LogInformation("Đang tạo Role: {RoleName}", roleInfo.Name);
                await _roleManager.CreateAsync(new Role 
                { 
                    Name = roleInfo.Name, 
                    Description = roleInfo.Description 
                });
            }
        }

        // ==========================================F
        // 2. TẠO ACCOUNT ADMIN & GIÁM ĐỐC
        // ==========================================
        
        // 2.1 Tạo Admin (1 người)
        var adminEmail = "tue1@gmail.com";
        var adminUser = await _userManager.FindByEmailAsync(adminEmail);
        
        if (adminUser == null)
        {
            _logger.LogInformation("Đang tạo tài khoản Admin mặc định...");
            var adminAccount = new Account { UserName = adminEmail, Email = adminEmail, IsActive = true, EmailConfirmed = true };
            var result = await _userManager.CreateAsync(adminAccount, "Admin@123");
            
            if (result.Succeeded)
            {
                _logger.LogInformation("Đã tạo Admin thành công. Đang gán Role Administrator...");
                await _userManager.AddToRoleAsync(adminAccount, "Administrator");

                _context.Employees.Add(new Employee
                {
                    AccountId = adminAccount.Id,
                    FullName = "Nguyễn Minh Tuệ",
                    Position = "Quản trị hệ thống",
                    Phone = "0988123456",
                    DOB = new DateTime(1980, 5, 15)
                });
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("LỖI khi tạo Admin: {Errors}", errors);
                throw new Exception($"Không thể tạo tài khoản Admin: {errors}");
            }
        }
        else
        {
            _logger.LogInformation("Tài khoản Admin ({Email}) đã tồn tại.", adminEmail);
        }

        // 2.2 Tạo Giám đốc (1 người)
        var directorEmail = "tue2@gmail.com";
        var directorAccount = new Account { UserName = directorEmail, Email = directorEmail, IsActive = true, EmailConfirmed = true };
        if (!await _userManager.Users.AnyAsync(u => u.Email == directorEmail))
        {
            await _userManager.CreateAsync(directorAccount, "Director@123");
            await _userManager.AddToRoleAsync(directorAccount, "Director");

            _context.Employees.Add(new Employee
            {
                AccountId = directorAccount.Id,
                FullName = "Lê Quốc Hùng",
                Position = "Giám đốc Trung tâm",
                Phone = "0912111222",
                DOB = new DateTime(1975, 10, 20)
            });
        }

        // Lưu Admin và Director trước khi tiếp tục
        await _context.SaveChangesAsync();

        // ==========================================
        // 3. TẠO ACCOUNT QUẢN LÝ VÀ NHÂN VIÊN
        // ==========================================

        // 3.1 Tạo Quản lý trung tâm (2 người)
        for (int i = 1; i <= 2; i++)
        {
            var username = i == 1 ? "tue3" : $"manager{i}";
            var managerAccount = new Account { UserName = username, Email = $"{username}@hopecenter.com", IsActive = true, EmailConfirmed = true };
            
            if (!await _userManager.Users.AnyAsync(u => u.UserName == managerAccount.UserName))
            {
                await _userManager.CreateAsync(managerAccount, "Manager@123");
                await _userManager.AddToRoleAsync(managerAccount, "Manager");

                _context.Employees.Add(new Employee
                {
                    AccountId = managerAccount.Id,
                    FullName = i == 1 ? "Quản Lý Tuệ 3" : $"Quản Lý {i}",
                    Position = "Quản lý phòng ban",
                    Phone = $"092200000{i}",
                    DOB = new DateTime(1985, 1, 1).AddYears(i)
                });
            }
        }

        // 3.2 Tạo Nhân viên chăm sóc (10 người)
        var employeeNames = new List<string> 
        { 
            "Nguyễn Thị Hoa", "Trần Văn Bình", "Lê Thị Lan", "Phạm Văn Nam", "Hoàng Thị Mai", 
            "Đỗ Văn Dũng", "Bùi Thị Yến", "Ngô Văn Tú", "Đặng Thị Thảo", "Dương Văn Huy" 
        };
        
        var positions = new List<string> 
        { 
            "Bảo mẫu Khu Mầm non", "Y tá / Điều dưỡng", "Bảo mẫu Khu Nhi đồng", "Giáo viên thể chất", 
            "Bảo mẫu Khu Thiếu niên", "Bảo vệ trung tâm", "Cán bộ Tâm lý xã hội", "Tài xế / Hậu cần", 
            "Giáo viên mầm non", "Bếp trưởng" 
        };

        for (int i = 0; i < 10; i++)
        {
            var username = i == 0 ? "tue4" : $"staff{i + 1}";
            var staffAccount = new Account { UserName = username, Email = $"{username}@hopecenter.com", IsActive = true, EmailConfirmed = true };
            
            if (!await _userManager.Users.AnyAsync(u => u.UserName == staffAccount.UserName))
            {
                await _userManager.CreateAsync(staffAccount, "Staff@123");
                await _userManager.AddToRoleAsync(staffAccount, "CareGiver");

                _context.Employees.Add(new Employee
                {
                    AccountId = staffAccount.Id,
                    FullName = i == 0 ? "Nhân Viên Tuệ 4" : employeeNames[i],
                    Position = positions[i],
                    Phone = $"0933000{i:D3}", // Tạo SĐT giả lập: 0933000000, 0933000001...
                    DOB = new DateTime(1985, 1, 1).AddMonths(i * 15).AddDays(i * 7) // Tạo ngày sinh ngẫu nhiên
                });
            }
        }

        // ==========================================
        // 4. TẠO ACCOUNT NGƯỜI NHẬN NUÔI
        // ==========================================

        // Tạo 10 người nhận nuôi
        var adopterNames = new List<string>
        {
            "Hoàng Văn Bách", "Lý Hải Nam", "Lê Thị Dung", "Phạm Văn Phúc", "Vũ Minh Quân",
            "Đặng Thu Hà", "Trần Quốc Toản", "Bùi Ngọc Ánh", "Ngô Thành Đạt", "Nguyễn Thu Hương"
        };

        for (int i = 0; i < 10; i++)
        {
            var username = i == 0 ? "tue5" : $"adopter{i + 1}";
            var adopterAccount = new Account { UserName = username, Email = i == 0 ? "tue5@gmail.com" : $"{username}@gmail.com", IsActive = true, EmailConfirmed = true };
            
            if (!await _userManager.Users.AnyAsync(u => u.UserName == adopterAccount.UserName))
            {
                await _userManager.CreateAsync(adopterAccount, "Adopter@123");
                await _userManager.AddToRoleAsync(adopterAccount, "Adopter");

                _context.Adopters.Add(new Adopter
                {
                    AccountId = adopterAccount.Id,
                    FullName = i == 0 ? "Người Nhận Nuôi Tuệ 5" : adopterNames[i],
                    IDCard = $"0480900012{i + 1:D2}", // Đảm bảo số CCCD từ 01 đến 10
                    FinancialStatus = i % 2 == 0 ? "Thu nhập ổn định (Mức khá)" : "Thu nhập trung bình",
                    MaritalStatus = i % 3 == 0 ? "Độc thân" : "Đã kết hôn",
                    Address = $"Số {(i + 1) * 15} Đường Nguyễn Văn Linh, Đà Nẵng"
                });
            }
        }

        // Lưu tất cả Employee và Adopter xuống Database
        await _context.SaveChangesAsync();

        // ==========================================
        // 5. TẠO CƠ SỞ VẬT CHẤT (10 PHÒNG)
        // ==========================================
        if (!_context.Rooms.Any())
        {
            var rooms = new List<Room>
            {
                // Khu Mầm Non (Dành cho trẻ sơ sinh - 3 tuổi)
                new Room { RoomName = "Phòng Hoa Hồng", Capacity = 10, CurrentOccupancy = 0, Location = "Khu Mầm Non" },
                new Room { RoomName = "Phòng Hướng Dương", Capacity = 10, CurrentOccupancy = 0, Location = "Khu Mầm Non" },
                new Room { RoomName = "Phòng Sơn Ca", Capacity = 8, CurrentOccupancy = 0, Location = "Khu Mầm Non" },
                
                // Khu Nhi Đồng (Dành cho trẻ 4 - 10 tuổi)
                new Room { RoomName = "Phòng Họa Mi", Capacity = 8, CurrentOccupancy = 0, Location = "Khu Nhi Đồng" },
                new Room { RoomName = "Phòng Vành Khuyên", Capacity = 8, CurrentOccupancy = 0, Location = "Khu Nhi Đồng" },
                new Room { RoomName = "Phòng Hải Âu", Capacity = 8, CurrentOccupancy = 0, Location = "Khu Nhi Đồng" },
                
                // Khu Thiếu Niên (Dành cho trẻ 11 - 16 tuổi)
                new Room { RoomName = "Phòng Ánh Sáng", Capacity = 6, CurrentOccupancy = 0, Location = "Khu Thiếu Niên" },
                new Room { RoomName = "Phòng Hy Vọng", Capacity = 6, CurrentOccupancy = 0, Location = "Khu Thiếu Niên" },
                new Room { RoomName = "Phòng Tình Thương", Capacity = 6, CurrentOccupancy = 0, Location = "Khu Thiếu Niên" },
                
                // Khu Đặc biệt
                new Room { RoomName = "Phòng Cách Ly Y Tế", Capacity = 4, CurrentOccupancy = 0, Location = "Khu Y Tế" }
            };

            _context.Rooms.AddRange(rooms);
            await _context.SaveChangesAsync();
        }

        // ==========================================
        // 6. TẠO HỒ SƠ 30 TRẺ EM & PHÂN BỔ VÀO PHÒNG
        // ==========================================
        if (!_context.Children.Any())
        {
            // Lấy danh sách các phòng đã tạo ở bước trước để xếp trẻ vào
            var mamNonRooms = await _context.Rooms.Where(r => r.Location == "Khu Mầm Non").ToListAsync();
            var nhiDongRooms = await _context.Rooms.Where(r => r.Location == "Khu Nhi Đồng").ToListAsync();
            var thieuNienRooms = await _context.Rooms.Where(r => r.Location == "Khu Thiếu Niên").ToListAsync();
            var yTeRoom = await _context.Rooms.FirstOrDefaultAsync(r => r.Location == "Khu Y Tế");

            // Danh sách tên thực tế (15 Nam, 15 Nữ)
            var boyNames = new List<string> { "Nguyễn Gia Bảo", "Trần Minh Triết", "Lê Hoàng Bách", "Phạm Tấn Phát", "Vũ Hải Đăng", "Đặng Quang Khải", "Bùi Chí Kiên", "Hồ Trọng Nghĩa", "Ngô Phúc Lâm", "Dương Thái Sơn", "Đinh Tuấn Kiệt", "Lý Thiên Ân", "Đoàn Khôi Nguyên", "Vũ Anh Khoa", "Đỗ Đình Phong" };
            var girlNames = new List<string> { "Nguyễn Ngọc Diệp", "Trần Bảo Châu", "Lê Tuệ Mẫn", "Phạm Nhã Uyên", "Vũ Minh Anh", "Đặng Phương Linh", "Bùi Tường Vy", "Hồ Cát Tiên", "Ngô Mai Chi", "Dương An Nhiên", "Đinh Kim Ngân", "Lý Nhã Kỳ", "Đoàn Thảo Ly", "Vũ Khánh Thi", "Đỗ Mộc Miên" };

            var backgrounds = new List<string> 
            { 
                "Bị bỏ rơi tại bệnh viện", "Mồ côi cả cha lẫn mẹ do tai nạn", 
                "Gia đình khó khăn, cha mẹ mất khả năng nuôi dưỡng", 
                "Trẻ đi lạc, không tìm thấy người thân", "Mồ côi mẹ, cha bỏ đi không rõ tung tích" 
            };

            var childrenToSeed = new List<Child>();
            var random = new Random(2026); // Cố định seed để mỗi lần reset DB sinh ra dữ liệu giống hệt nhau (dễ test)

            for (int i = 0; i < 30; i++)
            {
                // Xác định giới tính và tên
                bool isBoy = i % 2 == 0;
                string name = isBoy ? boyNames[i / 2] : girlNames[i / 2];
                
                // Thuật toán chia nhóm tuổi (10 bé Mầm non, 10 Nhi đồng, 10 Thiếu niên)
                int age;
                Room? assignedRoom = null;
                
                if (i < 10) 
                {
                    age = random.Next(1, 4); // 1-3 tuổi
                    assignedRoom = mamNonRooms[i % mamNonRooms.Count]; // Xếp đều vào các phòng Mầm Non
                }
                else if (i < 20)
                {
                    age = random.Next(4, 11); // 4-10 tuổi
                    assignedRoom = nhiDongRooms[i % nhiDongRooms.Count]; // Xếp đều vào các phòng Nhi Đồng
                }
                else
                {
                    age = random.Next(11, 16); // 11-15 tuổi
                    assignedRoom = thieuNienRooms[i % thieuNienRooms.Count]; // Xếp đều vào các phòng Thiếu Niên
                }

                // Xử lý trẻ bị ốm (Khoảng 4-5 trẻ sẽ nằm ở phòng Y Tế)
                ChildStatus status = ChildStatus.Active;
                string health = "Khỏe mạnh, phát triển bình thường";
                
                if (i % 7 == 0) 
                {
                    status = ChildStatus.Hospitalized;
                    assignedRoom = yTeRoom;
                    health = "Đang điều trị bệnh lý đường hô hấp / Suy dinh dưỡng";
                }

                // Tính toán Cân nặng & Chiều cao tương đối theo độ tuổi (Dùng công thức y tế cơ bản + random nhẹ)
                double weight = Math.Round(age * 2.5 + 8 + (random.NextDouble() * 2 - 1), 1);
                double height = Math.Round(age * 6.0 + 75 + (random.NextDouble() * 5 - 2.5), 1);

                var child = new Child
                {
                    FullName = name,
                    Gender = isBoy ? Gender.Male : Gender.Female,
                    DOB = DateTime.UtcNow.AddYears(-age).AddDays(-random.Next(1, 365)), // Ngày sinh ngẫu nhiên trong năm đó
                    HealthStatus = health,
                    Background = backgrounds[random.Next(backgrounds.Count)],
                    Status = status,
                    RoomId = assignedRoom?.Id,
                    Weight = weight,
                    Height = height,
                    AdmissionDate = DateTime.UtcNow.AddMonths(-random.Next(1, 24)) // Ngày vào trung tâm (1 đến 24 tháng trước)
                };

                childrenToSeed.Add(child);

                // Cập nhật số lượng trẻ đang ở của phòng đó lên 1
                if (assignedRoom != null)
                {
                    assignedRoom.CurrentOccupancy++;
                }
            }

            _context.Children.AddRange(childrenToSeed);
            await _context.SaveChangesAsync();
        }

        // ==========================================
        // 7. TẠO DỮ LIỆU KHO VẬT TƯ (INVENTORY ITEMS)
        // ==========================================
        if (!_context.InventoryItems.Any())
        {
            var inventoryItems = new List<InventoryItem>
            {
                // Thực phẩm
                new InventoryItem { ItemName = "Gạo tẻ", Category = "Thực phẩm", Unit = "Kg", CurrentQuantity = 150, MinStockLevel = 50 },
                new InventoryItem { ItemName = "Sữa bột công thức", Category = "Thực phẩm", Unit = "Hộp", CurrentQuantity = 30, MinStockLevel = 10 },
                new InventoryItem { ItemName = "Sữa tươi tiệt trùng", Category = "Thực phẩm", Unit = "Thùng", CurrentQuantity = 20, MinStockLevel = 5 },
                new InventoryItem { ItemName = "Dầu ăn", Category = "Thực phẩm", Unit = "Lít", CurrentQuantity = 20, MinStockLevel = 10 },

                // Y tế
                new InventoryItem { ItemName = "Khẩu trang y tế", Category = "Y tế", Unit = "Hộp", CurrentQuantity = 50, MinStockLevel = 10 },
                new InventoryItem { ItemName = "Nước muối sinh lý", Category = "Y tế", Unit = "Chai", CurrentQuantity = 100, MinStockLevel = 20 },
                new InventoryItem { ItemName = "Băng gạc y tế", Category = "Y tế", Unit = "Cuộn", CurrentQuantity = 40, MinStockLevel = 10 },
                new InventoryItem { ItemName = "Thuốc hạ sốt trẻ em", Category = "Y tế", Unit = "Hộp", CurrentQuantity = 15, MinStockLevel = 5 },

                // Đồ dùng sinh hoạt
                new InventoryItem { ItemName = "Tã giấy/Bỉm (Cỡ M)", Category = "Đồ dùng sinh hoạt", Unit = "Bịch", CurrentQuantity = 40, MinStockLevel = 15 },
                new InventoryItem { ItemName = "Tã giấy/Bỉm (Cỡ L)", Category = "Đồ dùng sinh hoạt", Unit = "Bịch", CurrentQuantity = 35, MinStockLevel = 15 },
                new InventoryItem { ItemName = "Sữa tắm gội trẻ em", Category = "Đồ dùng sinh hoạt", Unit = "Chai", CurrentQuantity = 25, MinStockLevel = 5 },
                new InventoryItem { ItemName = "Bột giặt", Category = "Đồ dùng sinh hoạt", Unit = "Kg", CurrentQuantity = 50, MinStockLevel = 10 },

                // Giáo dục & Học tập
                new InventoryItem { ItemName = "Vở ô ly", Category = "Giáo dục", Unit = "Quyển", CurrentQuantity = 200, MinStockLevel = 50 },
                new InventoryItem { ItemName = "Bút chì", Category = "Giáo dục", Unit = "Hộp", CurrentQuantity = 10, MinStockLevel = 3 }
            };

            _context.InventoryItems.AddRange(inventoryItems);
            await _context.SaveChangesAsync();
        }

        // ==========================================
        // 8. TẠO DỮ LIỆU TÀI TRỢ (DONATIONS)
        // ==========================================
        if (!_context.Donations.Any())
        {
            var random = new Random(2026);
            
            // Danh sách các nhà tài trợ thực tế
            var donors = new List<string> 
            { 
                "Công ty TNHH Vạn Phát", "Quỹ Bảo trợ Trẻ em Việt Nam", "Nhóm Thiện nguyện Tâm Từ", 
                "Nguyễn Văn An", "Trần Thị Cẩm Tú", "Công ty Cổ phần TechViet", 
                "Hội Liên hiệp Phụ nữ Quận", "Trường THPT Lê Quý Đôn", 
                "Gia đình bác Phạm Văn Tài", "Siêu thị Co.opmart chi nhánh Trung tâm"
            };

            var donations = new List<Donation>();

            for (int i = 0; i < donors.Count; i++)
            {
                // Xen kẽ 50% tiền mặt, 50% hiện vật
                bool isCash = i % 2 == 0; 
                
                // Tiền mặt random từ 5,000,000 đến 50,000,000 VNĐ.
                // Hiện vật được ước giá trị từ 1,000,000 đến 10,000,000 VNĐ.
                decimal AllocatedAmount = isCash 
                    ? (decimal)(random.Next(5, 51) * 1000000) 
                    : (decimal)(random.Next(2, 21) * 500000); 

                var donation = new Donation
                {
                    DonorName = donors[i],
                    DonationType = isCash ? DonationType.Cash : DonationType.Item,
                    TotalAllocatedAmount = AllocatedAmount,
                    // Random ngày nhận trong vòng 100 ngày đổ lại
                    ReceiveDate = DateTime.UtcNow.AddDays(-random.Next(1, 100)), 
                    Status = "Đã tiếp nhận"
                };

                donations.Add(donation);
            }

            _context.Donations.AddRange(donations);
            await _context.SaveChangesAsync();
        }

        // ==========================================
        // 9. TẠO DỮ LIỆU HỒ SƠ Y TẾ (MEDICAL RECORDS)
        // ==========================================
        if (!_context.MedicalRecords.Any())
        {
            // Lấy danh sách trẻ em đã có trong DB
            var children = await _context.Children.ToListAsync();
            var medicalRecords = new List<MedicalRecord>();
            var random = new Random(2026);
            
            // Danh sách bác sĩ phụ trách
            var doctors = new List<string> { "BS. Trần Thanh Bình", "BS. Lê Thị Ánh", "BS. Phạm Minh Tuấn" };

            foreach (var child in children)
            {
                // 1. Tạo hồ sơ khám tổng quát lúc mới tiếp nhận cho TẤT CẢ các bé
                medicalRecords.Add(new MedicalRecord
                {
                    ChildId = child.Id,
                    // Khám từ 1 đến 5 ngày sau khi được tiếp nhận vào trung tâm
                    CheckupDate = child.AdmissionDate.AddDays(random.Next(1, 5)), 
                    Diagnosis = "Khám sức khỏe tổng quát ban đầu",
                    Treatment = "Bổ sung vitamin, thiết lập chế độ dinh dưỡng theo độ tuổi.",
                    DoctorName = doctors[random.Next(doctors.Count)],
                    Notes = "Thể trạng cơ bản ổn định lúc tiếp nhận."
                });

                // 2. Tạo thêm hồ sơ bệnh án cho những bé đang nằm viện (Hospitalized)
                if (child.Status == ChildStatus.Hospitalized)
                {
                    medicalRecords.Add(new MedicalRecord
                    {
                        ChildId = child.Id,
                        // Khám trong vòng 30 ngày đổ lại
                        CheckupDate = DateTime.UtcNow.AddDays(-random.Next(1, 30)), 
                        Diagnosis = child.HealthStatus ?? "Viêm đường hô hấp / Suy dinh dưỡng",
                        Treatment = "Sử dụng kháng sinh theo phác đồ, truyền dịch tĩnh mạch và theo dõi tại phòng Y tế.",
                        DoctorName = doctors[random.Next(doctors.Count)],
                        Notes = "Bé có dấu hiệu sốt và lười ăn, cần theo dõi nhiệt độ 4 tiếng/lần."
                    });
                }
            }

            _context.MedicalRecords.AddRange(medicalRecords);
            await _context.SaveChangesAsync();
        }

        // ==========================================
        // 10. TẠO KẾ HOẠCH & NHẬT KÝ CHĂM SÓC 
        // ==========================================
        if (!_context.CarePlans.Any())
        {
            var random = new Random(2026);
            
            // Lấy người phê duyệt (Ưu tiên người có chức vụ Quản lý hoặc Giám đốc)
            var approver = await _context.Employees.FirstOrDefaultAsync(e => e.Position!.Contains("Quản lý") || e.Position!.Contains("Giám đốc"));
            
            // Lấy danh sách nhân viên trực tiếp chăm sóc (Bảo mẫu, Y tá)
            var caregivers = await _context.Employees.Where(e => e.Position!.Contains("Bảo mẫu") || e.Position!.Contains("Y tá")).ToListAsync();
            
            // Lấy bảo mẫu tue4 đặc thù
            var caregiverTue4 = await _context.Employees.FirstOrDefaultAsync(e => e.FullName == "Nhân Viên Tuệ 4");
            
            // Lấy 5 trẻ em để tạo kế hoạch (Ưu tiên đưa các bé đang nằm viện lên đầu)
            var targetChildren = await _context.Children
                .Include(c => c.Room)
                .OrderByDescending(c => c.Status == ChildStatus.Hospitalized)
                .Take(5)
                .ToListAsync();

            // Đảm bảo có ít nhất 1 trẻ thuộc Khu Mầm Non để Bảo mẫu tue4 có dữ liệu kế hoạch kiểm thử
            var mamNonChild = await _context.Children
                .Include(c => c.Room)
                .FirstOrDefaultAsync(c => c.Room != null && c.Room.Location == "Khu Mầm Non");
            if (mamNonChild != null && !targetChildren.Any(c => c.Id == mamNonChild.Id))
            {
                targetChildren.Add(mamNonChild);
            }

            if (approver != null && caregivers.Any())
            {
                var carePlans = new List<CarePlan>();

                // 10.1 TẠO KẾ HOẠCH CHĂM SÓC (CARE PLANS)
                foreach (var child in targetChildren)
                {
                    bool isHospitalized = child.Status == ChildStatus.Hospitalized;
                    
                    // Gán người chịu trách nhiệm trực tiếp
                    Guid? assignedEmployeeId = null;
                    if (child.Room != null && child.Room.Location == "Khu Mầm Non" && caregiverTue4 != null)
                    {
                        assignedEmployeeId = caregiverTue4.Id;
                    }
                    else
                    {
                        assignedEmployeeId = caregivers[random.Next(caregivers.Count)].Id;
                    }

                    var plan = new CarePlan
                    {
                        Id = Guid.NewGuid(), // Khởi tạo ID trước để dùng làm khóa ngoại cho CareLog ở bước dưới
                        ChildId = child.Id,
                        Title = isHospitalized ? $"Kế hoạch điều trị & phục hồi thể trạng cho {child.FullName}" : $"Kế hoạch dinh dưỡng tăng cường cho {child.FullName}",
                        StartDate = DateTime.UtcNow.AddDays(-random.Next(5, 15)), // Bắt đầu từ 5-15 ngày trước
                        EndDate = DateTime.UtcNow.AddDays(random.Next(15, 30)),   // Dự kiến kết thúc trong 15-30 ngày tới
                        ApproverId = approver.Id,
                        EmployeeId = assignedEmployeeId,
                        Status = ApplicationStatus.Approved // Set trạng thái đã duyệt để có thể ghi Log
                    };
                    
                    carePlans.Add(plan);
                }
                
                _context.CarePlans.AddRange(carePlans);

                // 10.2 TẠO NHẬT KÝ CHĂM SÓC BÁM THEO KẾ HOẠCH (CARE LOGS)
                var careLogs = new List<CareLog>();
                
                // Các mẫu nội dung ghi chép hàng ngày
                var activities = new List<string> 
                { 
                    "Cho bé ăn cháo dinh dưỡng và uống thuốc đúng giờ.", 
                    "Tập vật lý trị liệu 30 phút, bé hợp tác tốt, tiến triển khả quan.", 
                    "Vệ sinh cá nhân, thay băng gạc và bôi thuốc sát trùng.", 
                    "Kiểm tra nhiệt độ định kỳ, bé đã cắt sốt, chơi ngoan.", 
                    "Bé uống sữa công thức, massage nhẹ nhàng trước khi ngủ." 
                };

                foreach (var plan in carePlans)
                {
                    // Mỗi kế hoạch sẽ có ngẫu nhiên 3 đến 6 lần ghi log
                    int logCount = random.Next(3, 7);
                    for (int i = 0; i < logCount; i++)
                    {
                        careLogs.Add(new CareLog
                        {
                            PlanId = plan.Id,
                            EmployeeId = caregivers[random.Next(caregivers.Count)].Id, // Chọn random 1 cô bảo mẫu thực hiện
                            // Thời gian ghi log tăng dần từ ngày bắt đầu kế hoạch
                            LogTime = plan.StartDate.AddDays(i).AddHours(random.Next(8, 20)), // Random từ 8h sáng đến 8h tối
                            ActivityDetails = activities[random.Next(activities.Count)],
                            Status = "Hoàn thành"
                        });
                    }
                }

                _context.CareLogs.AddRange(careLogs);
                await _context.SaveChangesAsync();
            }
        }

        // ==========================================
        // 11. TẠO DỮ LIỆU SỰ CỐ (INCIDENTS)
        // ==========================================
        if (!_context.Incidents.Any())
        {
            var random = new Random(2026);
            
            // Lấy danh sách trẻ em hiện có
            var children = await _context.Children.ToListAsync();
            
            // Lấy danh sách nhân viên chăm sóc để làm người báo cáo sự cố
            var staff = await _context.Employees.Where(e => e.Position!.Contains("Bảo mẫu") || e.Position!.Contains("Y tá")).ToListAsync();

            if (children.Any() && staff.Any())
            {
                var incidents = new List<Incident>();

                // Danh sách các loại sự cố thường gặp (Theo mức độ)
                var lowIncidents = new List<string> { "Bé khóc nhẹ, không chịu ăn trưa.", "Bé bị xước nhẹ ở đầu gối do chạy nhảy ở sân chơi.", "Bé làm rơi vỡ đồ chơi trong phòng." };
                var mediumIncidents = new List<string> { "Bé tranh giành đồ chơi và cãi nhau với bạn cùng phòng.", "Bé bị sốt nhẹ về đêm (38 độ), đã cho uống thuốc hạ sốt.", "Bé có dấu hiệu dị ứng nhẹ ngoài da sau khi ăn hải sản." };
                var highIncidents = new List<string> { "Bé bị ngã cầu thang, chấn thương phần mềm, cần đưa đi chụp X-quang.", "Bé có biểu hiện khó thở cấp tính, đã chuyển sang phòng Y tế cách ly khẩn cấp.", "Bé có dấu hiệu tự kỷ, từ chối giao tiếp với mọi người trong thời gian dài." };

                // Tạo ngẫu nhiên khoảng 7-10 sự cố
                int incidentCount = random.Next(7, 11);
                
                for (int i = 0; i < incidentCount; i++)
                {
                    // Random mức độ nghiêm trọng
                    var severityValues = Enum.GetValues(typeof(IncidentSeverity));
                    var severity = (IncidentSeverity)severityValues.GetValue(random.Next(severityValues.Length))!;
                    
                    // Chọn mô tả sự cố phù hợp với mức độ
                    string description = severity switch
                    {
                        IncidentSeverity.High => highIncidents[random.Next(highIncidents.Count)],
                        IncidentSeverity.Medium => mediumIncidents[random.Next(mediumIncidents.Count)],
                        _ => lowIncidents[random.Next(lowIncidents.Count)]
                    };

                    incidents.Add(new Incident
                    {
                        ChildId = children[random.Next(children.Count)].Id,
                        ReporterId = staff[random.Next(staff.Count)].Id,
                        IncidentDate = DateTime.UtcNow.AddDays(-random.Next(1, 60)), // Xảy ra trong vòng 2 tháng qua
                        Description = description,
                        Severity = severity
                    });
                }

                _context.Incidents.AddRange(incidents);
                await _context.SaveChangesAsync();
            }
        }

        // ==========================================
        // 12. TẠO DỮ LIỆU PHÂN CÔNG NHIỆM VỤ (TASK ASSIGNMENTS)
        // ==========================================
        if (!_context.TaskAssignments.Any())
        {
            var random = new Random(2026);

            // Lấy danh sách Quản lý/Giám đốc (Người giao việc)
            var managers = await _context.Employees
                .Where(e => e.Position!.Contains("Quản lý") || e.Position!.Contains("Giám đốc"))
                .ToListAsync();

            // Lấy danh sách Nhân viên (Người nhận việc)
            var staff = await _context.Employees
                .Where(e => !e.Position!.Contains("Quản lý") && !e.Position!.Contains("Giám đốc"))
                .ToListAsync();

            if (managers.Any() && staff.Any())
            {
                var tasks = new List<TaskAssignment>();
                
                // Các nhiệm vụ thực tế tại trung tâm
                var taskNames = new List<string>
                {
                    "Tổng vệ sinh Khu Mầm Non chuẩn bị đón đoàn kiểm tra.",
                    "Sắp xếp lại kho thực phẩm, kiểm kê hạn sử dụng sữa bột.",
                    "Đưa các bé Khu Nhi Đồng đi tiêm chủng định kỳ tại trạm y tế.",
                    "Tổ chức tiệc sinh nhật tháng cho các bé tại Khu Thiếu Niên.",
                    "Cập nhật hồ sơ sức khỏe tháng này cho toàn bộ trẻ.",
                    "Tiếp nhận và phân loại hiện vật tài trợ từ đoàn thiện nguyện.",
                    "Khử khuẩn toàn bộ Khu Y Tế sau đợt dịch cúm mùa.",
                    "Kiểm tra và thay thế các thiết bị điện hỏng tại phòng sinh hoạt chung."
                };

                var statuses = new List<string> { "Mới", "Đang thực hiện", "Hoàn thành", "Quá hạn" };

                // Tạo khoảng 15 nhiệm vụ
                for (int i = 0; i < 15; i++)
                {
                    var assigner = managers[random.Next(managers.Count)];
                    var assignee = staff[random.Next(staff.Count)];
                    var status = statuses[random.Next(statuses.Count)];

                    // Random Due Date: Có nhiệm vụ đã qua (từ 10 ngày trước) và có nhiệm vụ sắp tới (trong 10 ngày tới)
                    var dueDate = DateTime.UtcNow.AddDays(random.Next(-10, 11));

                    // Nếu hạn chót đã qua mà chưa Hoàn thành thì auto set thành Quá hạn cho logic
                    if (dueDate < DateTime.UtcNow && status != "Hoàn thành")
                    {
                        status = "Quá hạn";
                    }

                    tasks.Add(new TaskAssignment
                    {
                        AssignerId = assigner.Id,
                        AssigneeId = assignee.Id,
                        TaskName = taskNames[random.Next(taskNames.Count)] + $" (Lần {i + 1})",
                        DueDate = dueDate,
                        Status = status
                    });
                }

                _context.TaskAssignments.AddRange(tasks);
                await _context.SaveChangesAsync();
            }
        }

        // ==========================================
        // 13. TẠO ĐƠN NHẬN NUÔI & QUY TRÌNH SAU NHẬN NUÔI
        // ==========================================
        if (!_context.AdoptionApplications.Any())
        {
            // Lấy danh sách Người nhận nuôi
            var adopters = await _context.Adopters.ToListAsync();
            
            // Lấy 5 trẻ đang "Active" (không lấy các bé đang nằm viện để làm hồ sơ)
            var children = await _context.Children.Where(c => c.Status == ChildStatus.Active).Take(5).ToListAsync();
            
            // Lấy Giám đốc (người duyệt đơn/đổi trạng thái) và Cán bộ tâm lý (người đi thăm hỏi)
            var director = await _context.Employees.FirstOrDefaultAsync(e => e.Position!.Contains("Giám đốc"));
            var socialWorker = await _context.Employees.FirstOrDefaultAsync(e => e.Position!.Contains("Tâm lý") || e.Position!.Contains("Bảo mẫu"));

            if (adopters.Count >= 5 && children.Count >= 5)
            {
                var random = new Random();
                var applications = new List<AdoptionApplication>();
                var followUps = new List<PostAdoptionFollowUp>();
                var statusHistories = new List<ChildStatusHistory>();

                // --- TRƯỜNG HỢP 1 & 2: ĐƠN ĐÃ PHÊ DUYỆT (THÀNH CÔNG) ---
                for (int i = 0; i < 2; i++)
                {
                    var app = new AdoptionApplication
                    {
                        Id = Guid.NewGuid(),
                        AdopterId = adopters[i].Id,
                        ChildId = children[i].Id,
                        SubmitDate = DateTime.UtcNow.AddMonths(-6).AddDays(i * 10), // Nộp đơn nửa năm trước
                        Status = ApplicationStatus.Approved,
                        Reason = "Gia đình hiếm muộn, có điều kiện kinh tế và môi trường giáo dục tốt.",
                        Notes = "Đã qua 3 vòng phỏng vấn và kiểm tra thực tế."
                    };
                    applications.Add(app);

                    // 1. Cập nhật trạng thái Trẻ em & Rời phòng
                    children[i].Status = ChildStatus.Adopted;
                    if (children[i].RoomId != null)
                    {
                        var room = await _context.Rooms.FindAsync(children[i].RoomId);
                        if (room != null) room.CurrentOccupancy--; // Giảm số lượng người ở của phòng xuống
                    }
                    children[i].RoomId = null;

                    // 2. Ghi log Lịch sử trạng thái
                    statusHistories.Add(new ChildStatusHistory
                    {
                        ChildId = children[i].Id,
                        ChangedById = director?.AccountId, // Giám đốc là người thao tác
                        OldStatus = ChildStatus.Active,
                        NewStatus = ChildStatus.Adopted,
                        ChangeDate = app.SubmitDate.AddMonths(1), // Quyết định duyệt sau 1 tháng nộp đơn
                        Reason = $"Hoàn tất bàn giao trẻ cho gia đình ông/bà {adopters[i].FullName}"
                    });

                    // 3. Tạo báo cáo thăm hỏi sau nhận nuôi (Post-Adoption Follow-ups)
                    // Bé thứ nhất được thăm 2 lần, bé thứ hai thăm 1 lần
                    followUps.Add(new PostAdoptionFollowUp
                    {
                        ApplicationId = app.Id,
                        EvaluatorId = socialWorker?.Id,
                        FollowUpDate = app.SubmitDate.AddMonths(3), // Thăm sau 3 tháng
                        HealthNotes = "Bé tăng cân đều, hòa nhập tốt với môi trường mới.",
                        LivingEnvironmentNotes = "Phòng ngủ riêng sạch sẽ, an toàn.",
                        EducationNotes = "Đã làm quen với trường mầm non gần nhà.",
                        OverallAssessment = AssessmentRating.Good
                    });

                    if (i == 0) // Thêm lần thăm thứ 2 cho bé đầu tiên
                    {
                        followUps.Add(new PostAdoptionFollowUp
                        {
                            ApplicationId = app.Id,
                            EvaluatorId = socialWorker?.Id,
                            FollowUpDate = app.SubmitDate.AddMonths(5), // Thăm sau 5 tháng
                            HealthNotes = "Bé hoàn toàn khỏe mạnh.",
                            OverallAssessment = AssessmentRating.Good
                        });
                    }
                }

                // --- TRƯỜNG HỢP 3 & 4: ĐƠN CHỜ DUYỆT (PENDING) ---
                for (int i = 2; i < 4; i++)
                {
                    applications.Add(new AdoptionApplication
                    {
                        Id = Guid.NewGuid(),
                        AdopterId = adopters[i].Id,
                        ChildId = children[i].Id,
                        SubmitDate = DateTime.UtcNow.AddDays(-random.Next(5, 20)), // Nộp vài ngày trước
                        Status = ApplicationStatus.Pending,
                        Reason = "Muốn nhận thêm con nuôi cho nhà đông vui.",
                        Notes = "Đang chờ xác minh tài chính từ chính quyền địa phương."
                    });
                }

                // --- TRƯỜNG HỢP 5: ĐƠN BỊ TỪ CHỐI (REJECTED) ---
                applications.Add(new AdoptionApplication
                {
                    Id = Guid.NewGuid(),
                    AdopterId = adopters[4].Id,
                    ChildId = children[4].Id,
                    SubmitDate = DateTime.UtcNow.AddMonths(-1),
                    Status = ApplicationStatus.Rejected,
                    Reason = "Tôi muốn nhận nuôi bé để làm bạn với con trai tôi.",
                    Notes = "Từ chối do người nhận nuôi chưa có thu nhập ổn định và phòng ở không đủ tiêu chuẩn."
                });

                _context.AdoptionApplications.AddRange(applications);
                _context.ChildStatusHistories.AddRange(statusHistories);
                _context.PostAdoptionFollowUps.AddRange(followUps);
                
                await _context.SaveChangesAsync();
            }
        }

        // ==========================================
        // 14. TẠO DỮ LIỆU TÀI LIỆU ĐÍNH KÈM (ATTACHMENTS)
        // ==========================================
        if (!_context.Attachments.Any())
        {
            var random = new Random(2026);
            var attachments = new List<Attachment>();

            var maleFallback = new List<string>
            {
                "https://icdn.dantri.com.vn/2017/screen-shot-2017-01-21-at-10-21-23-pm-1485012132149.png",
                "https://kenh14cdn.com/2017/be-trai-2-1485058669494.jpg",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdD_h_WJQT9lL2PJuKBra6n7OGmAsLtPmKNw&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPg5QKftKwrjZz6WXNFskPHwgfuGImL_l9Xg&s",
                "https://sohanews.sohacdn.com/zoom/480_300/160588918557773824/2023/5/4/photo1683169576919-1683169577002830572929.jpg",
                "https://demcanada.com/wp-content/uploads/2025/10/hinh-anh-em-be-trai-de-thuong-1.jpg",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9QOq4iM1PnpNCfHyUUs_pefdnB21rOLx0oQ&s",
                "https://icdn.dantri.com.vn/063efc1ba7/2016/10/14/chan-dung-chau-phuc-bi-mat-tich-khi-di-hoc-vao-ngay-12-10-vua-qua-anh-do-gia-dinh-nan-nhan-cung-cap-1476457613421.jpg",
                "https://nld.mediacdn.vn/thumb_w/698/291774122806476800/2023/5/29/mat-tich-1-1685352618015484942537.jpg",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfks4UUPZAS7-bdbzDrYeZgMeRi3lKFbutUw&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgtE5OGer78nqaDhYwdal-cvwPD4cThlZTMhrIdVy3MQ&s"
            };

            var femaleFallback = new List<string>
            {
                "https://bizweb.dktcdn.net/100/175/849/files/chup-anh-the-dep-cho-hoc-sinh-02.jpg?v=1609569926960",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWBoHQBEH4IYavTJsOR_NffDvUOxaW_mMZnQ&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-r_KOdR1Kq33gLVjE83F_RYro-GC6RllcKg&s",
                "https://img.freepik.com/premium-photo/portrait-asian-child-background_296537-9746.jpg",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPrfF1qzJe_ueItigmcxab34qjVkEn-2ldng&s",
                "https://www.shutterstock.com/image-photo/happy-cute-asian-girl-portrait-260nw-157109024.jpg",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQij-4YygltV261MhC8BZzA6B5MqylfvLwuFw&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjdVEXuAmeyNR674pbEDcSH5YNIE_sAdtp-w&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFZRa0pID0C7egf9uiY6lME0GJensl8jP0zg&s",
                "https://imgs.vietnamnet.vn/Images/2015/09/01/14/20150901143006-5.jpg?width=0&s=D3mYOe_kQpYgGmwRwWzyYw",
                "https://afamilycdn.com/2018/7/7/1-1-1530975935139557582555.jpg"
            };

            var maleImages = ReadImageLinks("male.txt", maleFallback);
            var femaleImages = ReadImageLinks("female.txt", femaleFallback);

            // 1. Đính kèm file cho Trẻ em (Tất cả trẻ)
            var childrenForDocs = await _context.Children.ToListAsync();
            foreach (var child in childrenForDocs)
            {
                // File Giấy khai sinh
                attachments.Add(new Attachment
                {
                    TargetId = child.Id,
                    TargetType = AttachmentTargetType.Child, // (Lưu ý: Đảm bảo Enum của bạn có giá trị Child)
                    FileName = $"Giay_Khai_Sinh_{child.FullName.Replace(" ", "_")}.pdf",
                    FilePath = $"/uploads/children/documents/{Guid.NewGuid()}.pdf",
                    FileType = "application/pdf",
                    FileSize = random.Next(500, 2048) * 1024, // Random từ 500KB đến 2MB
                    UploadedAt = DateTime.UtcNow.AddDays(-random.Next(10, 100))
                });
                
                // File Ảnh đại diện ngẫu nhiên
                string avatarPath;
                if (child.Gender == Gender.Male)
                {
                    avatarPath = maleImages[random.Next(maleImages.Count)];
                }
                else
                {
                    avatarPath = femaleImages[random.Next(femaleImages.Count)];
                }

                attachments.Add(new Attachment
                {
                    TargetId = child.Id,
                    TargetType = AttachmentTargetType.Child,
                    FileName = $"Avatar_{child.FullName.Replace(" ", "_")}.jpg",
                    FilePath = avatarPath,
                    FileType = "image/jpeg",
                    FileSize = random.Next(100, 500) * 1024, // Random từ 100KB đến 500KB
                    UploadedAt = DateTime.UtcNow.AddDays(-random.Next(10, 100))
                });
            }

            // 2. Đính kèm file cho Người nhận nuôi (Lấy 3 người)
            var adoptersForDocs = await _context.Adopters.Take(3).ToListAsync();
            foreach (var adopter in adoptersForDocs)
            {
                attachments.Add(new Attachment
                {
                    TargetId = adopter.Id,
                    TargetType = AttachmentTargetType.Adopter,
                    FileName = $"CCCD_{adopter.IDCard}.pdf",
                    FilePath = $"/uploads/adopters/id_cards/{Guid.NewGuid()}.pdf",
                    FileType = "application/pdf",
                    FileSize = random.Next(800, 3000) * 1024,
                    UploadedAt = DateTime.UtcNow.AddDays(-random.Next(5, 30))
                });
            }

            // 3. Đính kèm file cho Đơn nhận nuôi (Lấy 2 đơn)
            var appsForDocs = await _context.AdoptionApplications.Take(2).ToListAsync();
            foreach (var app in appsForDocs)
            {
                attachments.Add(new Attachment
                {
                    TargetId = app.Id,
                    TargetType = AttachmentTargetType.AdoptionApplication,
                    FileName = $"Ho_So_Xin_Nhan_Nuoi_{app.Id.ToString().Substring(0, 8)}.pdf",
                    FilePath = $"/uploads/applications/{Guid.NewGuid()}.pdf",
                    FileType = "application/pdf",
                    FileSize = random.Next(1000, 5000) * 1024,
                    UploadedAt = app.SubmitDate // Gắn ngày upload bằng với ngày nộp đơn
                });
            }

            _context.Attachments.AddRange(attachments);
            await _context.SaveChangesAsync();
        }

        // ==========================================
        // 15. TẠO DỮ LIỆU GIAO DỊCH KHO (INVENTORY TRANSACTIONS)
        // ==========================================
        if (!_context.InventoryTransactions.Any())
        {
            var random = new Random(2026);
            
            // Lấy danh sách các mặt hàng đã có trong kho
            var items = await _context.InventoryItems.ToListAsync();
            
            // Lấy một nhân viên (Quản lý hoặc nhân viên chăm sóc) làm người thực hiện giao dịch
            var staff = await _context.Employees.FirstOrDefaultAsync();

            if (items.Any() && staff != null)
            {
                var transactions = new List<InventoryTransaction>();

                foreach (var item in items)
                {
                    // 1. Tạo giao dịch NHẬP KHO (Import) - Nhập số lượng lớn từ nhà cung cấp/tài trợ
                    int importCount = random.Next(1, 3);
                    for (int i = 0; i < importCount; i++)
                    {
                        transactions.Add(new InventoryTransaction
                        {
                            ItemId = item.Id, // Hoặc ItemId tùy theo tên Entity của bạn
                            Type = TransactionType.Import, // Đảm bảo Enum của bạn có giá trị Import
                            Quantity = random.Next(50, 150),
                            TransactionDate = DateTime.UtcNow.AddDays(-random.Next(30, 90)), // Nhập từ 1-3 tháng trước
                            Notes = item.Category == "Thực phẩm" ? "Nhập mua từ siêu thị đối tác." : "Tiếp nhận từ nhà tài trợ.",
                            EmployeeId = staff.Id, // Người lập phiếu
                            ReferenceDocument = $"PNK-{random.Next(1000, 9999)}" // Mã phiếu nhập kho giả lập
                        });
                    }

                    // 2. Tạo giao dịch XUẤT KHO (Export) - Xuất lẻ tẻ để sử dụng hàng ngày
                    int exportCount = random.Next(3, 6);
                    for (int i = 0; i < exportCount; i++)
                    {
                        transactions.Add(new InventoryTransaction
                        {
                            ItemId = item.Id,
                            Type = TransactionType.Export, // Đảm bảo Enum của bạn có giá trị Export
                            Quantity = random.Next(5, 20),
                            TransactionDate = DateTime.UtcNow.AddDays(-random.Next(1, 29)), // Xuất rải rác trong tháng này
                            Notes = $"Xuất cấp phát cho sử dụng tại Khu {((i % 2 == 0) ? "Mầm non" : "Nhi đồng")}.",
                            EmployeeId = staff.Id,
                            ReferenceDocument = $"PXK-{random.Next(1000, 9999)}" // Mã phiếu xuất kho giả lập
                        });
                    }
                }

                _context.InventoryTransactions.AddRange(transactions);
                await _context.SaveChangesAsync();
            }
        }

        // ==========================================
        // 16. TẠO DỮ LIỆU PHÂN BỔ TÀI TRỢ (DONATION ALLOCATIONS)
        // ==========================================
        if (!_context.DonationAllocations.Any())
        {
            var random = new Random(2026);
            
            // Lấy toàn bộ danh sách các khoản tài trợ đã tạo ở bước trước
            var donations = await _context.Donations.ToListAsync();
            
            if (donations.Any())
            {
                var allocations = new List<DonationAllocation>();

                var cashPurposes = new List<string> 
                { 
                    "Thanh toán viện phí và mua thuốc đặc trị cho các bé ốm.", 
                    "Mua bỉm, sữa công thức và nhu yếu phẩm tháng này.", 
                    "Đóng học phí và mua sách vở cho các bé Khu Thiếu Niên.",
                    "Cải tạo, sửa chữa lại hệ thống điện nước Khu Mầm Non.",
                    "Tổ chức trung thu / Lễ tết cho toàn bộ trẻ em."
                };

                foreach (var donation in donations)
                {
                    // 1. Nếu là Tiền mặt (Cash): Phân bổ một phần
                    if (donation.DonationType == DonationType.Cash)
                    {
                        // Lấy ngẫu nhiên từ 40% đến 80% tổng số tiền để phân bổ đợt 1
                        decimal allocatePercent = (decimal)(random.Next(40, 81)) / 100m;
                        decimal allocatedAllocatedAmount = donation.TotalAllocatedAmount * allocatePercent;

                        allocations.Add(new DonationAllocation
                        {
                            DonationId = donation.Id,
                            AllocatedAmount = Math.Round(allocatedAllocatedAmount, 2),
                            Purpose = cashPurposes[random.Next(cashPurposes.Count)],
                            AllocationDate = donation.ReceiveDate.AddDays(random.Next(2, 15)), // Phân bổ sau khi nhận 2-15 ngày
                            Notes = "Đã giải ngân và lưu hóa đơn đỏ tại Phòng Kế toán."
                        });
                    }
                    // 2. Nếu là Hiện vật (Item): Phân bổ 100% giá trị
                    else
                    {
                        allocations.Add(new DonationAllocation
                        {
                            DonationId = donation.Id,
                            AllocatedAmount = donation.TotalAllocatedAmount, // Giải ngân toàn bộ giá trị hiện vật ước tính
                            Purpose = "Phân bổ trực tiếp hiện vật xuống các khu sinh hoạt và nhập kho.",
                            AllocationDate = donation.ReceiveDate.AddDays(random.Next(1, 3)), // Xử lý hiện vật nhanh hơn, 1-3 ngày
                            Notes = "Đã bàn giao cho quản lý các khu vực và cập nhật thẻ kho."
                        });
                    }
                }

                _context.DonationAllocations.AddRange(allocations);
                await _context.SaveChangesAsync();
            }
        }

        // ==========================================
        // 17. TẠO DỮ LIỆU NHẬT KÝ HỆ THỐNG (SYSTEM LOGS)
        // ==========================================
        if (!_context.SystemLogs.Any())
        {
            var adminAcc = await _context.Users.FirstOrDefaultAsync(a => a.UserName == "admin");
            var directorAcc = await _context.Users.FirstOrDefaultAsync(a => a.UserName == "director");
            var managerAcc = await _context.Users.FirstOrDefaultAsync(a => a.UserName == "manager1");

            var logs = new List<SystemLog>();

            if (adminAcc != null)
            {
                logs.Add(new SystemLog { AccountId = adminAcc.Id, Action = "Login", Module = "Auth", Details = "Admin đăng nhập hệ thống thành công.", Created = DateTime.UtcNow.AddHours(-2), IpAddress = "192.168.1.10" });
                logs.Add(new SystemLog { AccountId = adminAcc.Id, Action = "Backup", Module = "System", Details = "Hệ thống tự động sao lưu dữ liệu định kỳ.", Created = DateTime.UtcNow.AddDays(-1), IpAddress = "127.0.0.1" });
            }

            if (directorAcc != null)
            {
                logs.Add(new SystemLog { AccountId = directorAcc.Id, Action = "Approve", Module = "Adoption", Details = "Giám đốc phê duyệt đơn nhận nuôi mã #AD-2024.", Created = DateTime.UtcNow.AddDays(-5), IpAddress = "192.168.1.15" });
                logs.Add(new SystemLog { AccountId = directorAcc.Id, Action = "UpdateStatus", Module = "Children", Details = "Cập nhật trạng thái trẻ: Chuyển sang Đã được nhận nuôi.", Created = DateTime.UtcNow.AddDays(-5), IpAddress = "192.168.1.15" });
            }

            if (managerAcc != null)
            {
                logs.Add(new SystemLog { AccountId = managerAcc.Id, Action = "Create", Module = "Inventory", Details = "Lập phiếu xuất kho cho nhu yếu phẩm tuần 2.", Created = DateTime.UtcNow.AddDays(-2), IpAddress = "192.168.1.20" });
                logs.Add(new SystemLog { AccountId = managerAcc.Id, Action = "Assign", Module = "Task", Details = "Phân công nhiệm vụ tổng vệ sinh cho nhân viên.", Created = DateTime.UtcNow.AddDays(-3), IpAddress = "192.168.1.20" });
            }

            _context.SystemLogs.AddRange(logs);
            await _context.SaveChangesAsync();
        }

        // ==========================================
        // 18. TẠO DỮ LIỆU THÔNG BÁO (NOTIFICATIONS)
        // ==========================================
        if (!_context.Notifications.Any())
        {
            var directorAcc = await _context.Users.FirstOrDefaultAsync(a => a.UserName == "director");
            var managerAcc = await _context.Users.FirstOrDefaultAsync(a => a.UserName == "manager1");
            var staffAcc = await _context.Users.FirstOrDefaultAsync(a => a.UserName == "staff1");

            var notifications = new List<Notification>();

            // Thông báo cho Giám đốc
            if (directorAcc != null)
            {
                notifications.Add(new Notification { AccountId = directorAcc.Id, Title = "Đơn nhận nuôi mới", Message = "Có 1 đơn xin nhận nuôi mới đang chờ bạn xem xét và phê duyệt.", IsRead = false, Created = DateTime.UtcNow.AddHours(-1) });
                notifications.Add(new Notification { AccountId = directorAcc.Id, Title = "Báo cáo tháng", Message = "Hệ thống đã tổng hợp xong báo cáo hoạt động tháng vừa qua.", IsRead = true, Created = DateTime.UtcNow.AddDays(-3) });
            }

            // Thông báo cho Quản lý trung tâm
            if (managerAcc != null)
            {
                notifications.Add(new Notification { AccountId = managerAcc.Id, Title = "Cảnh báo tồn kho", Message = "Vật tư 'Sữa bột công thức' đã xuống dưới mức tối thiểu. Vui lòng lên kế hoạch nhập thêm.", IsRead = false, Created = DateTime.UtcNow.AddHours(-5) });
                notifications.Add(new Notification { AccountId = managerAcc.Id, Title = "Sự cố mới", Message = "Có một sự cố y tế vừa được báo cáo. Vui lòng kiểm tra ngay.", IsRead = false, Created = DateTime.UtcNow.AddDays(-1) });
            }

            // Thông báo cho Nhân viên chăm sóc
            if (staffAcc != null)
            {
                notifications.Add(new Notification { AccountId = staffAcc.Id, Title = "Nhiệm vụ mới", Message = "Bạn vừa được phân công một nhiệm vụ mới: Đưa trẻ đi tiêm chủng định kỳ.", IsRead = false, Created = DateTime.UtcNow.AddHours(-10) });
                notifications.Add(new Notification { AccountId = staffAcc.Id, Title = "Nhắc nhở kế hoạch", Message = "Kế hoạch chăm sóc phục hồi thể trạng sắp đến hạn đánh giá.", IsRead = true, Created = DateTime.UtcNow.AddDays(-2) });
            }

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();
        }

        // ==========================================
        // 19. TẠO DỰ LIỆU NHIỆM VỤ SINH HOẠT HÀNG NGÀY (DAILY CARE TASKS)
        // ==========================================
        if (!_context.DailyCareTasks.Any())
        {
            var caregiverTue4 = await _context.Employees.FirstOrDefaultAsync(e => e.FullName == "Nhân Viên Tuệ 4");
            
            // Lấy tất cả trẻ em thuộc Khu Mầm Non để gán việc cho Tuệ 4
            var mamNonChildren = await _context.Children
                .Include(c => c.Room)
                .Where(c => c.Room != null && c.Room.Location == "Khu Mầm Non")
                .ToListAsync();

            if (caregiverTue4 != null && mamNonChildren.Any())
            {
                var dailyTasks = new List<DailyCareTask>();
                var today = DateTime.UtcNow.Date;

                // Các task mẫu
                var morningTasks = new List<(string Name, string Type)>
                {
                    ("Cho trẻ ăn sáng (Cháo yến mạch dinh dưỡng)", "BasicCare"),
                    ("Lau mặt và vệ sinh răng miệng cho trẻ", "BasicCare"),
                    ("Uống thuốc bổ sung Vitamin D hàng ngày", "MedicalCare")
                };

                var noonTasks = new List<(string Name, string Type)>
                {
                    ("Bữa ăn trưa (Súp rau củ thịt băm + Cơm nhão)", "BasicCare"),
                    ("Cho uống sữa bột công thức", "BasicCare"),
                    ("Đo thân nhiệt và ghi nhận sức khỏe", "MedicalCare"),
                    ("Uống thuốc ho (siro ho thảo dược) sau ăn", "MedicalCare")
                };

                var afternoonTasks = new List<(string Name, string Type)>
                {
                    ("Vận động nhẹ nhàng và tắm nắng chiều", "BasicCare"),
                    ("Vệ sinh cơ thể, tắm rửa thay đồ sạch", "BasicCare"),
                    ("Uống sữa chua / Ăn xế bổ sung lợi khuẩn", "BasicCare")
                };

                var nightTasks = new List<(string Name, string Type)>
                {
                    ("Bữa ăn tối (Cháo gà hạt sen)", "BasicCare"),
                    ("Uống thuốc an thần/thuốc bổ trước khi ngủ", "MedicalCare"),
                    ("Đọc truyện/Nghe nhạc nhẹ và dỗ trẻ ngủ ngon", "BasicCare")
                };

                foreach (var child in mamNonChildren)
                {
                    // Thêm các task Buổi Sáng
                    foreach (var t in morningTasks)
                    {
                        dailyTasks.Add(new DailyCareTask
                        {
                            ChildId = child.Id,
                            EmployeeId = caregiverTue4.Id,
                            TaskName = t.Name,
                            Session = "Sáng",
                            CareType = t.Type,
                            IsCompleted = false,
                            TaskDate = today
                        });
                    }

                    // Thêm các task Buổi Trưa
                    foreach (var t in noonTasks)
                    {
                        dailyTasks.Add(new DailyCareTask
                        {
                            ChildId = child.Id,
                            EmployeeId = caregiverTue4.Id,
                            TaskName = t.Name,
                            Session = "Trưa",
                            CareType = t.Type,
                            IsCompleted = false,
                            TaskDate = today
                        });
                    }

                    // Thêm các task Buổi Chiều
                    foreach (var t in afternoonTasks)
                    {
                        dailyTasks.Add(new DailyCareTask
                        {
                            ChildId = child.Id,
                            EmployeeId = caregiverTue4.Id,
                            TaskName = t.Name,
                            Session = "Chiều",
                            CareType = t.Type,
                            IsCompleted = false,
                            TaskDate = today
                        });
                    }

                    // Thêm các task Buổi Tối
                    foreach (var t in nightTasks)
                    {
                        dailyTasks.Add(new DailyCareTask
                        {
                            ChildId = child.Id,
                            EmployeeId = caregiverTue4.Id,
                            TaskName = t.Name,
                            Session = "Tối",
                            CareType = t.Type,
                            IsCompleted = false,
                            TaskDate = today
                        });
                    }
                }

                _context.DailyCareTasks.AddRange(dailyTasks);
                await _context.SaveChangesAsync();
            }
        }

        // ==========================================
        // 20. TẠO LỊCH TIÊM CHỦNG (VACCINATIONS)
        // ==========================================
        if (!_context.Vaccinations.Any())
        {
            var mamNonChildren = await _context.Children
                .Include(c => c.Room)
                .Where(c => c.Room != null && c.Room.Location == "Khu Mầm Non")
                .ToListAsync();

            if (mamNonChildren.Any())
            {
                var vaccinations = new List<Vaccination>();
                var today = DateTime.UtcNow.Date;

                // Chọn bé đầu tiên trong mầm non để gán lịch tiêm chủng hôm nay (khớp ca trực)
                vaccinations.Add(new Vaccination
                {
                    ChildId = mamNonChildren[0].Id,
                    VaccineName = "Lao (BCG) - Tiêm phòng dịch lao",
                    Dose = "Mũi 1",
                    VaccinationDate = today.AddHours(9), // 9h sáng hôm nay
                    Status = "Chờ tiêm"
                });

                // Chọn bé thứ hai
                if (mamNonChildren.Count > 1)
                {
                    vaccinations.Add(new Vaccination
                    {
                        ChildId = mamNonChildren[1].Id,
                        VaccineName = "Bại liệt (IPV) - Sởi",
                        Dose = "Mũi 2",
                        VaccinationDate = today.AddDays(2).AddHours(10), // 2 ngày nữa
                        Status = "Chờ tiêm"
                    });
                }

                // Tiền bối khác
                if (mamNonChildren.Count > 2)
                {
                    vaccinations.Add(new Vaccination
                    {
                        ChildId = mamNonChildren[2].Id,
                        VaccineName = "Sởi - Quai bị - Rubella",
                        Dose = "Mũi 1",
                        VaccinationDate = today.AddDays(-3), // Đã tiêm
                        Status = "Đã tiêm"
                    });
                }

                _context.Vaccinations.AddRange(vaccinations);
                await _context.SaveChangesAsync();
            }
        }
    }

    private List<string> ReadImageLinks(string fileName, List<string> fallbacks)
    {
        try
        {
            var dir = new DirectoryInfo(AppContext.BaseDirectory);
            while (dir != null)
            {
                var picturePath = Path.Combine(dir.FullName, "picture", fileName);
                if (File.Exists(picturePath))
                {
                    var lines = File.ReadAllLines(picturePath)
                        .Select(l => l.Trim())
                        .Where(l => !string.IsNullOrEmpty(l) && (l.StartsWith("http://") || l.StartsWith("https://")))
                        .ToList();
                    if (lines.Any())
                    {
                        return lines;
                    }
                }
                var parentDir = dir.Parent;
                if (parentDir != null)
                {
                    var slnPicturePath = Path.Combine(parentDir.FullName, "picture", fileName);
                    if (File.Exists(slnPicturePath))
                    {
                        var lines = File.ReadAllLines(slnPicturePath)
                            .Select(l => l.Trim())
                            .Where(l => !string.IsNullOrEmpty(l) && (l.StartsWith("http://") || l.StartsWith("https://")))
                            .ToList();
                        if (lines.Any())
                        {
                            return lines;
                        }
                    }
                }
                dir = dir.Parent;
            }
        }
        catch
        {
            // Ignore
        }
        return fallbacks;
    }
}