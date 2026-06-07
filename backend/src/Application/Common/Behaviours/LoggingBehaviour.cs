using backend.Application.Common.Interfaces;
using MediatR.Pipeline;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using backend.Application.DailyCareTasks.Commands;

namespace backend.Application.Common.Behaviours;

public class LoggingBehaviour<TRequest> : IRequestPreProcessor<TRequest>
    where TRequest : notnull
{
    private readonly ILogger _logger;
    private readonly IUser _user;
    private readonly IIdentityService _identityService;
    private readonly ISystemLogService _systemLogService;
    private readonly IApplicationDbContext _context;

    public LoggingBehaviour(
        ILogger<TRequest> logger, 
        IUser user, 
        IIdentityService identityService,
        ISystemLogService systemLogService,
        IApplicationDbContext context)
    {
        _logger = logger;
        _user = user;
        _identityService = identityService;
        _systemLogService = systemLogService;
        _context = context;
    }

    public async Task Process(TRequest request, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _user.Id ?? string.Empty;
        string? userName = string.Empty;

        if (!string.IsNullOrEmpty(userId))
        {
            userName = await _identityService.GetUserNameAsync(userId);
        }

        _logger.LogInformation("HopeCenterSystem Request: {Name} {@UserId} {@UserName} {@Request}",
            requestName, userId, userName, request);

        // 1. Tự động ghi nhật ký tùy chỉnh cho trường hợp cập nhật công việc chăm sóc hàng ngày
        if (request is UpdateDailyCareTaskCommand updateTaskCmd && !string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out Guid userGuid))
        {
            try
            {
                var task = await _context.DailyCareTasks
                    .Include(t => t.Child)
                    .FirstOrDefaultAsync(t => t.Id == updateTaskCmd.Id, cancellationToken);
                
                if (task != null)
                {
                    var statusStr = updateTaskCmd.IsCompleted ? "Hoàn thành" : "Chưa hoàn thành";
                    var noteStr = string.IsNullOrEmpty(updateTaskCmd.Note) ? "" : $" (Ghi chú: {updateTaskCmd.Note})";
                    var details = $"Cập nhật công việc chăm sóc hàng ngày: {statusStr} nhiệm vụ '{task.TaskName}' (Buổi {task.Session}) cho trẻ {task.Child.FullName}{noteStr}";

                    await _systemLogService.LogAsync(userGuid, "Update", "DailyCareTasks", details);
                    return; // Bỏ qua log dạng JSON thô phía dưới
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi ghi Audit Log tùy chỉnh cho UpdateDailyCareTaskCommand");
            }
        }

        // 2. Tự động ghi nhật ký hệ thống vào database đối với các Command thay đổi trạng thái dữ liệu khác
        var isCommand = requestName.EndsWith("Command") ||
                        requestName.Contains("Create") ||
                        requestName.Contains("Update") ||
                        requestName.Contains("Delete") ||
                        requestName.Contains("Add") ||
                        requestName.Contains("Remove") ||
                        requestName.Contains("Approve") ||
                        requestName.Contains("Reject") ||
                        requestName.Contains("Submit") ||
                        requestName.Contains("Cancel");

        if (isCommand && !string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out Guid userGuidOther))
        {
            try
            {
                // Xác định phân hệ (Module) dựa vào Namespace
                string module = "System";
                var ns = typeof(TRequest).Namespace;
                if (ns != null)
                {
                    var parts = ns.Split('.');
                    if (parts.Length > 2 && parts[1] == "Application")
                    {
                        module = parts[2];
                    }
                }

                // Xác định Hành động (Action)
                string action = "Execute";
                if (requestName.Contains("Create") || requestName.Contains("Add")) action = "Create";
                else if (requestName.Contains("Update") || requestName.Contains("Edit")) action = "Update";
                else if (requestName.Contains("Delete") || requestName.Contains("Remove")) action = "Delete";
                else if (requestName.Contains("Approve")) action = "Approve";
                else if (requestName.Contains("Reject")) action = "Reject";
                else if (requestName.Contains("Submit")) action = "Submit";
                else if (requestName.Contains("Cancel")) action = "Cancel";

                // Chi tiết hóa dữ liệu gửi lên (sẽ tự động được mã hóa ở SystemLogService khi query)
                string details;
                try
                {
                    var options = new JsonSerializerOptions
                    {
                        WriteIndented = false,
                        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                    };
                    details = $"{action} {module}: {JsonSerializer.Serialize(request, typeof(TRequest), options)}";
                }
                catch
                {
                    details = $"{action} {module} (Request: {requestName})";
                }

                // Ghi nhận vào DB
                await _systemLogService.LogAsync(userGuidOther, action, module, details);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi ghi Audit Log vào Database cho request {Name}", requestName);
            }
        }
    }
}
