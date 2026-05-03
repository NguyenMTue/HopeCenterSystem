using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Application.FunctionalTests;

public class WebApiFactory : WebApplicationFactory<Program>
{
    private readonly string _connectionString;

    // 1. Constructor phải nằm ngoài các hàm, nằm trực tiếp trong class
    public WebApiFactory(string connectionString)
    {
        _connectionString = connectionString;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, conf) =>
        {
            // Cấu hình các thiết lập test nếu cần
            // Ví dụ: conf.AddInMemoryCollection(new Dictionary<string, string> { ... });
        });

        builder.ConfigureServices((context, services) =>
        {
            // 2. Thay thế DB thật bằng DB Test sử dụng _connectionString nếu cần
            // Tại đây bạn có thể cấu hình lại DbContext để dùng SQLite hoặc SQL Server Test
        });
    }
}