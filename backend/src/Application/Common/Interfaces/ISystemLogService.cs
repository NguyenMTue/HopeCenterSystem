using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Application.SystemLogs.Queries.GetSystemLogs;

namespace backend.Application.Common.Interfaces;

public interface ISystemLogService
{
    Task LogAsync(Guid accountId, string action, string module, string details, string? ipAddress = null);
    Task<List<SystemLogDto>> GetLogsAsync();
}
