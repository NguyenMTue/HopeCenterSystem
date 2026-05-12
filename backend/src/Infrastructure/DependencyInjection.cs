using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using backend.Infrastructure.Data.Interceptors;
using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Ardalis.GuardClauses; // Đảm bảo đã cài package này cho lỗi 'Guard'


namespace backend.Infrastructure;

public static class DependencyInjection
{
    public static void AddInfrastructureServices(this IHostApplicationBuilder builder)
    {
        // 1. Sửa lỗi 'Services.Database': Nếu không có class Services, hãy thay bằng chuỗi "DefaultConnection"
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        Guard.Against.Null(connectionString, message: "Connection string 'DefaultConnection' not found.");

        builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        builder.Services.AddScoped<ISaveChangesInterceptor, DispatchDomainEventsInterceptor>();

        builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            // Sử dụng SQL Server với khả năng tự phục hồi lỗi kết nối tạm thời
            options.UseSqlServer(connectionString, builder =>
            {
                builder.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                builder.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(30), errorNumbersToAdd: null);
            });
            options.ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
        });

        builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        // 2. Cấu hình Identity thống nhất sử dụng Account và Role
        builder.Services.AddIdentityApiEndpoints<Account>() // Đã bao gồm AddIdentityCore, AddApiEndpoints và cấu hình Cookies
            .AddRoles<Role>() // Nếu bạn dùng Role, hãy thêm dòng này
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        // Tùy chỉnh Options (Nếu cần)
        builder.Services.Configure<IdentityOptions>(options =>
        {
            options.Password.RequireDigit = false;
            options.Password.RequiredLength = 6;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            
            // Thêm các dòng này để nới lỏng xác thực
            options.SignIn.RequireConfirmedAccount = false;
            options.SignIn.RequireConfirmedEmail = false;
            options.SignIn.RequireConfirmedPhoneNumber = false;
        });

        builder.Services.AddAuthorization(options =>
        {
            // Bạn có thể định nghĩa các Policy ở đây nếu cần mở rộng phân quyền sâu hơn
            options.AddPolicy("CanPurge", policy => policy.RequireRole("Administrator"));
        });

        builder.Services.AddScoped<ApplicationDbContextInitialiser>();

        // builder.Services.AddAuthentication(options =>
        //     {
        //         options.DefaultScheme = IdentityConstants.ApplicationScheme;
        //         options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
        //     })
        //     .AddIdentityCookies();

        builder.Services.AddAuthorizationBuilder();

        // XÓA ĐOẠN AddIdentityCore<ApplicationUser> CŨ Ở ĐÂY VÌ ĐÃ CÓ AddIdentity Ở TRÊN

        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddTransient<IIdentityService, IdentityService>();
    }
}