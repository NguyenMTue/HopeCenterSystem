using backend.Application.Common.Interfaces;
using backend.Application.SystemLogs.Queries.GetSystemLogs;
using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace backend.Infrastructure.Services;

public class SystemLogService(IApplicationDbContext context) : ISystemLogService
{
    public async Task LogAsync(Guid accountId, string action, string module, string details, string? ipAddress = null)
    {
        var log = new SystemLog
        {
            AccountId = accountId,
            Action = action,
            Module = module,
            Details = details,
            IpAddress = ipAddress ?? "127.0.0.1",
            Timestamp = DateTime.UtcNow
        };

        context.SystemLogs.Add(log);
        await context.SaveChangesAsync(default);
    }

    public async Task<List<SystemLogDto>> GetLogsAsync()
    {
        var logs = await context.SystemLogs
            .AsNoTracking()
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();

        var dtos = new List<SystemLogDto>();
        foreach (var log in logs)
        {
            dtos.Add(new SystemLogDto
            {
                Id = log.Id,
                AccountId = log.AccountId,
                Action = log.Action,
                Module = log.Module,
                IpAddress = log.IpAddress,
                Timestamp = log.Timestamp,
                Details = MaskSensitiveDetails(log.Details, log.Module)
            });
        }

        return dtos;
    }

    private string MaskSensitiveDetails(string? details, string? module)
    {
        if (string.IsNullOrEmpty(details)) return string.Empty;

        var mod = module?.ToLower() ?? "";
        if (mod.Contains("child") || mod.Contains("adopter") || mod.Contains("adoption"))
        {
            // Regex matches sequences of capitalized words (potential names)
            var regex = new Regex(@"[A-ZÀ-Ỹ][a-zà-ỹ]*(\s+[A-ZÀ-Ỹ][a-zà-ỹ]*)+");
            return regex.Replace(details, m =>
            {
                var val = m.Value;
                // Preserve common system terms
                if (val == "Hope Center" || val == "Hệ thống" || val == "Ban Giám Đốc" || val == "Quyên Góp" || val == "Tiền mặt" || val == "Hiện vật")
                {
                    return val;
                }
                var words = val.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                var maskedWords = words.Select(w => w[0] + "***");
                return string.Join(" ", maskedWords);
            });
        }

        return details;
    }
}
