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
            // Bạn có thể đổi sang UseSqlServer nếu dùng SQL Server
            options.UseSqlServer(connectionString,
                builder => builder.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
            options.ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
        });

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