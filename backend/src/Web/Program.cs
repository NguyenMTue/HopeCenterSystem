using Microsoft.Extensions.DependencyInjection;
using backend.Infrastructure;
using backend.Infrastructure.Data;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Identity;
using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.AddServiceDefaults();

builder.AddKeyVaultIfConfigured();
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// PHẢI ĐẶT Ở ĐẦU TIÊN để tránh lỗi CORS do redirect hoặc middleware khác
app.UseCors(policy => 
    policy.AllowAnyOrigin()
          .AllowAnyMethod()
          .AllowAnyHeader());

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    await app.InitialiseDatabaseAsync();
    
    // Thêm đoạn chẩn đoán này
    using var scope = app.Services.CreateScope();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Account>>();
    var userCount = await userManager.Users.CountAsync();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    logger.LogCritical("CHẨN ĐOÁN: Số lượng User trong Database hiện tại là: {Count}", userCount);
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseFileServer();

app.MapOpenApi();
app.MapScalarApiReference();

app.UseExceptionHandler(options => { });


app.MapDefaultEndpoints();
app.MapEndpoints(typeof(Program).Assembly);

app.MapFallbackToFile("index.html");

app.Run();
