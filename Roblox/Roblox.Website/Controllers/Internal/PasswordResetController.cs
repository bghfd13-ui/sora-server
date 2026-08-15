using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Roblox.Exceptions;
using Roblox.Logging;
using Roblox.Models.Staff;
using Roblox.Services.Exceptions;
using Roblox.Website.Filters;

namespace Roblox.Website.Controllers;

[ApiController]
[Route("/admin-api/api/password-reset")]
public class PasswordResetController : ControllerBase
{
    [HttpGet]
    [StaffFilter(Access.CreateUser)]
    public IActionResult GetPage()
    {
        return Content(@"
<!doctype html>
<html>
<head>
<meta charset='utf-8'>
<title>Sora Staff - Password Reset</title>
<style>
body{font-family:Arial,sans-serif;background:#202124;color:#eee;margin:0;padding:40px}
.card{max-width:520px;margin:0 auto;background:#2b2d31;padding:28px;border-radius:10px;box-shadow:0 8px 30px #0005}
h1{margin-top:0;font-size:24px}label{display:block;margin:16px 0 7px;font-weight:bold}
input{box-sizing:border-box;width:100%;padding:11px;border:1px solid #555;border-radius:6px;background:#1f2023;color:#fff;font-size:15px}
button{margin-top:22px;width:100%;padding:12px;border:0;border-radius:6px;background:#18a0fb;color:white;font-weight:bold;cursor:pointer}
#result{margin-top:18px;padding:12px;border-radius:6px;display:none;white-space:pre-wrap}
.ok{background:#173d25}.err{background:#4a2020}.hint{color:#aaa;font-size:13px;margin-top:5px}
</style>
</head>
<body>
<div class='card'>
<h1>Staff Password Reset</h1>
<div class='hint'>The old password is never displayed or read.</div>
<label>User ID</label>
<input id='userId' type='number' min='0' placeholder='Example: 22'>
<label>or Username</label>
<input id='username' type='text' maxlength='64' placeholder='Example: ROBLOX'>
<label>New password</label>
<input id='password' type='password' minlength='3' autocomplete='new-password'>
<button onclick='resetPassword()'>Reset Password</button>
<div id='result'></div>
</div>
<script>
async function resetPassword(){
  const result=document.getElementById('result');
  result.style.display='block'; result.className=''; result.textContent='Working...';
  const userId=document.getElementById('userId').value;
  const username=document.getElementById('username').value.trim();
  const password=document.getElementById('password').value;

  if(!userId && !username){
    result.className='err';
    result.textContent='Enter User ID or Username.';
    return;
  }

  if(password.length<3){
    result.className='err';
    result.textContent='Password must be at least 3 characters.';
    return;
  }

  try{
    const r=await fetch('/admin-api/api/password-reset',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        userId:userId?Number(userId):null,
        username:username||null,
        newPassword:password
      })
    });

    const text=await r.text();

    if(!r.ok){
      result.className='err';
      result.textContent=text||('HTTP '+r.status);
      return;
    }

    result.className='ok';
    result.textContent=text||'Password reset successfully.';
    document.getElementById('password').value='';
  }catch(e){
    result.className='err';
    result.textContent='Request failed: '+e;
  }
}
</script>
</body>
</html>", "text/html; charset=utf-8");
    }

    [HttpPost]
    [StaffFilter(Access.CreateUser)]
    public async Task<IActionResult> ResetPassword(
        [Required, FromBody] PasswordResetRequest request)
    {
        if (request == null)
            throw new BadRequestException(0, "Invalid request");

        if (string.IsNullOrWhiteSpace(request.newPassword))
            throw new BadRequestException(0, "New password is required");

        if (!services.users.IsPasswordValid(request.newPassword))
            throw new BadRequestException(0, "Password must be at least 3 characters");

        if (request.userId == null && string.IsNullOrWhiteSpace(request.username))
            throw new BadRequestException(0, "User ID or username is required");

        long targetUserId;
        string targetUsername;

        try
        {
            if (request.userId.HasValue)
            {
                targetUserId = request.userId.Value;
                var target = await services.users.GetUserById(targetUserId);
                targetUsername = target.username;
            }
            else
            {
                var target = await services.users.GetUserByName(request.username!);
                targetUserId = target.userId;
                targetUsername = target.username;
            }
        }
        catch (RecordNotFoundException)
        {
            throw new BadRequestException(0, "User not found");
        }

        // Never log the new password.
        Writer.Info(
            LogGroup.AbuseDetection,
            "Staff user {0} reset password for user {1} ({2})",
            safeUserSession.userId,
            targetUserId,
            targetUsername);

        // UpdatePassword creates the normal Argon2 password hash.
        await services.users.UpdatePassword(
            targetUserId,
            request.newPassword);

        // Force the target account to authenticate again everywhere.
        await services.users.ExpireAllSessions(targetUserId);

        return Ok(new
        {
            success = true,
            userId = targetUserId,
            username = targetUsername,
            message = "Password reset successfully. All existing sessions were expired."
        });
    }
}

public class PasswordResetRequest
{
    public long? userId { get; set; }
    public string? username { get; set; }

    [Required]
    public string? newPassword { get; set; }
}
